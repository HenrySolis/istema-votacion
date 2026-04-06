import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePoll } from '../../hooks/usePoll.js';
import { pollService } from '../../services/pollService.js';
import { getOrCreateToken } from '../../utils/tokenVotante.js';
import CometCandidateCard from '../../components/CometCandidateCard.jsx';
import DonutVoteChart from '../../components/DonutVoteChart.jsx';
import Modal from '../../components/Modal.jsx';
import Button from '../../components/Button.jsx';

function Spinner({ size = 20, color = 'currentColor' }) {
  return (
    <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" aria-label="Cargando">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

function useCountdown(endTime) {
  const [remaining, setRemaining] = useState(null);
  useEffect(() => {
    if (!endTime) return;
    function calc() { setRemaining(Math.max(0, new Date(endTime).getTime() - Date.now())); }
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [endTime]);
  return remaining;
}

function formatMs(ms) {
  if (ms === null || ms <= 0) return null;
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function LiveIndicator({ lastSync }) {
  const [label, setLabel] = useState('Actualizando...');
  useEffect(() => {
    if (!lastSync) return;
    setLabel('Actualizado ahora');
    const t = setTimeout(() => setLabel('Se actualiza cada 5 s'), 2500);
    return () => clearTimeout(t);
  }, [lastSync]);
  return (
    <span className="flex items-center gap-1.5 text-xs text-gray-400">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
      {label}
    </span>
  );
}

function SiteHeader({ badge }) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="max-w-4xl mx-auto px-5 py-3 flex items-center gap-3">
        <img
          src="/images/logo.png"
          alt="VotaYa"
          className="h-9 w-auto object-contain"
          onError={e => { e.currentTarget.style.display = 'none'; }}
        />
        <span className="font-bold text-gray-900 text-sm">VotaYa</span>
        {badge}
      </div>
    </header>
  );
}

export default function VotePage() {
  const { slug }  = useParams();
  const navigate  = useNavigate();
  const { poll, loading, error } = usePoll(slug);

  const [selected,  setSelected]  = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [voting,    setVoting]    = useState(false);
  const [voteError, setVoteError] = useState(null);
  const [votado,    setVotado]    = useState(null);
  /* Datos en vivo para el auto-refresh */
  const [liveData,  setLiveData]  = useState(null); // { candidatos, total }
  const [lastSync,  setLastSync]  = useState(null);
  const msLeft   = useCountdown(poll?.fecha_fin);
  const timeLabel = formatMs(msLeft);

  useEffect(() => {
    if (!poll) return;
    if (poll.estado === 'cerrada')  navigate('/encuesta-cerrada', { replace: true });
    else if (!poll.puede_votar)     navigate('/no-disponible',    { replace: true });
  }, [poll, navigate]);

  useEffect(() => {
    if (votado) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [votado]);

  /* ── Auto-refresh cada 5 s cuando se muestran resultados ── */
  const enResultados = !!(poll?.ya_voto || votado);
  useEffect(() => {
    if (!enResultados || !slug) return;
    const token = getOrCreateToken();
    async function fetchLive() {
      try {
        const data = await pollService.getPublic(slug, token);
        setLiveData({
          candidatos: data.candidatos || [],
          total: data.total_votos || 0,
        });
        setLastSync(new Date());
      } catch (_) { /* silencioso */ }
    }
    fetchLive(); // inmediato al montar
    const id = setInterval(fetchLive, 5000);
    return () => clearInterval(id);
  }, [enResultados, slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner size={36} color="#6366f1" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow">
          <p className="text-4xl mb-4">&#x274C;</p>
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!poll || poll.estado === 'cerrada' || !poll.puede_votar) return null;

  if (poll.ya_voto && !votado) {
    const candidatos = liveData?.candidatos ?? poll.candidatos;
    const totalVotos = liveData?.total ?? (poll.total_votos || 0);
    return (
      <div className="min-h-screen bg-gray-50">
        <SiteHeader badge={
          <span className="ml-auto text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            &#x1F5F3;&#xFE0F; Ya votaste
          </span>
        } />

        <main className="max-w-2xl mx-auto px-5 py-10">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1">
              {poll.titulo}
            </h1>
            <p className="text-gray-400 text-sm mt-2">
              Ya registraste tu voto. Resultados actualizándose automáticamente:
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-800">Resultados en vivo</h2>
              <LiveIndicator lastSync={lastSync} />
            </div>
            <DonutVoteChart candidatos={candidatos} totalVotos={totalVotos} />
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2.5 rounded-full text-sm font-semibold text-white transition-all hover:scale-[1.03]"
              style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)', boxShadow: '0 6px 20px rgba(99,102,241,0.35)' }}
            >
              Volver al inicio
            </button>
          </div>
        </main>
      </div>
    );
  }

  async function handleVote() {
    setVoting(true);
    setVoteError(null);
    const token = getOrCreateToken();
    try {
      const res = await pollService.votar(slug, selected, token);
      setVotado({
        resultados:  res.resultados  || [],
        total:       res.total_votos || 0,
        candidatoId: res.candidato_id_votado || selected,
      });
      setShowModal(false);
    } catch (err) {
      setVoteError(err.response?.data?.message || 'Error al registrar el voto. Intenta de nuevo.');
    } finally {
      setVoting(false);
      setShowModal(false);
    }
  }

  const candidatoSeleccionado = poll.candidatos.find(c => c.id === selected);

  /* ── RESULTADOS (tras votar ahora) ── */
  if (votado) {
    const resultados = liveData?.candidatos ?? votado.resultados;
    const total      = liveData?.total ?? votado.total;
    const maxVotos   = Math.max(...resultados.map(c => c.votos), 1);
    const winner     = resultados.find(c => c.votos === maxVotos);
    const empate     = resultados.filter(c => c.votos === maxVotos).length > 1;

    return (
      <div className="min-h-screen bg-gray-50">
        <SiteHeader badge={
          <span className="ml-auto text-xs font-semibold px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
            &#x2714;&#xFE0F; Voto registrado
          </span>
        } />

        <main className="max-w-4xl mx-auto px-5 py-12">
          <div className="text-center mb-10">
            <div className="text-5xl mb-3">&#x1F389;</div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1">
              &#x00A1;Tu voto fue registrado!
            </h1>
            <p className="text-gray-500 text-sm mt-1">{poll.titulo}</p>
            <span className="inline-flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full text-sm font-medium bg-white border border-gray-200 text-gray-600 shadow-sm">
              Total de votos:&nbsp;<strong className="text-gray-900">{total.toLocaleString()}</strong>
            </span>
          </div>

          {/* Gráfico donut en vivo */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-800">Resultados en vivo</h2>
              <LiveIndicator lastSync={lastSync} />
            </div>
            <DonutVoteChart candidatos={resultados} totalVotos={total} />
          </div>

          {/* Banner ganador / empate */}
          {!empate && winner && (
            <div className="text-center mb-8 px-5 py-3 rounded-2xl text-sm font-medium"
              style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.3)', color: '#92400e' }}>
              &#x1F3C6; <strong>{winner.nombre}</strong> va ganando con{' '}
              {total > 0 ? ((winner.votos / total) * 100).toFixed(1) : 0}% de los votos
            </div>
          )}
          {empate && (
            <div className="text-center mb-8 px-5 py-3 rounded-2xl text-sm font-medium"
              style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)', color: '#4338ca' }}>
              &#x2696;&#xFE0F; &#x00A1;Empate t&#xe9;cnico!
            </div>
          )}

          {/* Cards de candidatos */}
          <div className={[
            'grid gap-5 mb-10',
            resultados.length === 2 ? 'grid-cols-2 max-w-lg mx-auto'
            : resultados.length === 3 ? 'grid-cols-3 max-w-2xl mx-auto'
            : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
          ].join(' ')}>
            {resultados.map(c => {
              const isWin = !empate && c.votos === maxVotos;
              return (
                <CometCandidateCard key={c.id} candidato={c}
                  showResults votos={c.votos} totalVotos={total}
                  isWinner={isWin} myVote={c.id === votado.candidatoId} />
              );
            })}
          </div>

          <div className="flex justify-center">
            <button onClick={() => navigate('/')}
              className="px-8 py-3 rounded-full font-semibold text-sm text-white transition-all hover:scale-[1.03]"
              style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)', boxShadow: '0 8px 24px rgba(99,102,241,0.3)' }}>
              Volver al inicio
            </button>
          </div>
        </main>
      </div>
    );
  }

  /* ── VOTACI&#xd3;N ── */
  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader badge={
        <span className={`ml-auto flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${
          timeLabel
            ? 'bg-orange-50 text-orange-700 border-orange-200'
            : 'bg-green-50 text-green-700 border-green-200'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
            timeLabel ? 'bg-orange-500' : 'bg-green-500'
          }`} />
          {timeLabel ? `⏱️ ${timeLabel}` : 'Votación abierta'}
        </span>
      } />

      <main className="max-w-4xl mx-auto px-5 py-10">
        {/* T&#xed;tulo */}
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
            {poll.titulo}
          </h1>
          {poll.descripcion && (
            <p className="text-gray-500 text-sm max-w-lg mx-auto mt-2">{poll.descripcion}</p>
          )}
          <p className="text-gray-400 text-sm mt-4">
            &#x1F447; Selecciona un candidato y confirma tu voto
          </p>
        </div>

        {/* Grid de candidatos */}
        <div className={[
          'grid gap-5 mb-10',
          poll.candidatos.length === 2 ? 'grid-cols-2 max-w-lg mx-auto'
          : poll.candidatos.length === 3 ? 'grid-cols-3 max-w-2xl mx-auto'
          : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
        ].join(' ')}>
          {poll.candidatos.map(c => (
            <CometCandidateCard key={c.id} candidato={c}
              selected={selected === c.id} onSelect={setSelected} disabled={voting} />
          ))}
        </div>

        {/* Error */}
        {voteError && (
          <div className="max-w-md mx-auto mb-6 flex items-center gap-2 px-4 py-3 rounded-xl text-sm bg-red-50 border border-red-200 text-red-700">
            &#x26A0;&#xFE0F; {voteError}
          </div>
        )}

        {/* Bot&#xf3;n */}
        <div className="flex justify-center">
          <button
            disabled={!selected || voting}
            onClick={() => setShowModal(true)}
            className="relative px-12 py-3.5 rounded-full font-semibold text-sm transition-all duration-200 overflow-hidden focus:outline-none"
            style={selected ? {
              background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
              color: '#fff',
              boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
            } : {
              background: '#e5e7eb',
              color: '#9ca3af',
              cursor: 'not-allowed',
            }}
          >
            <span style={{ opacity: voting ? 0 : 1, transition: 'opacity 0.15s' }}>
              Confirmar voto &#x2192;
            </span>
            {voting && (
              <span className="absolute inset-0 flex items-center justify-center">
                <Spinner size={18} color="#fff" />
              </span>
            )}
          </button>
        </div>
      </main>

      <Modal open={showModal} onClose={() => !voting && setShowModal(false)} title="Confirmar tu voto">
        {candidatoSeleccionado && (
          <p className="text-gray-600 text-sm mb-4">
            Est&#xe1;s a punto de votar por{' '}
            <strong className="text-gray-900">{candidatoSeleccionado.nombre}</strong>.
            Esta acci&#xf3;n no puede deshacerse.
          </p>
        )}
        <div className="modal-actions">
          <Button variant="secondary" onClick={() => setShowModal(false)} disabled={voting}>
            Cancelar
          </Button>
          <Button variant="primary" loading={voting} onClick={handleVote}>
            S&#xed;, confirmar
          </Button>
        </div>
      </Modal>
    </div>
  );
}