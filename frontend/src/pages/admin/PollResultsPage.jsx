import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pollService } from '../../services/pollService.js';
import ResultChart from '../../components/ResultChart.jsx';
import { getImageUrl } from '../../utils/imageUtils.js';

/* ─── Icono de refresco animado ─── */
function RefreshIcon({ spinning }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
         className={spinning ? 'animate-spin' : ''}>
      <polyline points="23 4 23 10 17 10"/>
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>
  );
}

/* ─── Tarjeta pequeña de estadística ─── */
function MiniStat({ label, value, accent }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-3xl font-extrabold ${accent}`}>{value}</p>
    </div>
  );
}

export default function PollResultsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);

  /* ─── Carga de resultados desde la API ─── */
  const load = useCallback(async (manual = false) => {
    if (manual) setSpinning(true);
    try {
      const res = await pollService.getResultados(id);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      if (manual) setTimeout(() => setSpinning(false), 600);
    }
  }, [id]);

  /* ─── Polling automático cada 10 s ─── */
  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  /* ─── Estados de carga / error ─── */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }
  if (!data) {
    return (
      <div className="max-w-2xl">
        <p className="text-red-500 font-medium">Error al cargar los resultados.</p>
      </div>
    );
  }

  /* ─── Ganador actual ─── */
  const sorted  = [...data.resultados].sort((a, b) => b.votos - a.votos);
  const ganador = sorted[0];

  return (
    <div className="max-w-4xl animate-fade-in">

      {/* ══════════════ ENCABEZADO ══════════════ */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resultados</h1>
          <p className="text-gray-500 mt-1 text-sm">{data.encuesta.titulo}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/admin/encuestas/${id}`)}
            className="btn btn-ghost text-sm"
          >
            ← Editar
          </button>
          <button
            onClick={() => load(true)}
            className="flex items-center gap-2 btn btn-secondary text-sm"
          >
            <RefreshIcon spinning={spinning} />
            Actualizar
          </button>
        </div>
      </div>

      {/* ══════════════ TARJETAS MINI ══════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <MiniStat
          label="Total de votos"
          value={data.total_votos.toLocaleString()}
          accent="text-blue-600"
        />
        <MiniStat
          label="Candidatos"
          value={data.resultados.length}
          accent="text-slate-700"
        />
        <MiniStat
          label="Estado"
          value={data.encuesta.estado.charAt(0).toUpperCase() + data.encuesta.estado.slice(1)}
          accent={data.encuesta.estado === 'activa' ? 'text-green-600' : 'text-gray-500'}
        />
      </div>

      {/* ══════════════ GANADOR ACTUAL ══════════════ */}
      {ganador && data.total_votos > 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-8
                        flex items-center gap-5 text-white shadow-md">
          {/* Avatar del ganador */}
          {ganador.foto_url ? (
            <img src={getImageUrl(ganador.foto_url)} alt={ganador.nombre}
                 className="w-16 h-16 rounded-2xl object-cover border-2 border-white/30 flex-shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center
                            text-2xl font-bold flex-shrink-0">
              {ganador.nombre[0].toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest">🏆 Líder actual</p>
            <p className="text-xl font-bold mt-1">{ganador.nombre}</p>
            <p className="text-blue-200 text-sm mt-0.5">
              {ganador.votos} votos ·{' '}
              {Math.round((ganador.votos / data.total_votos) * 100)}% del total
            </p>
          </div>
        </div>
      )}

      {/* ══════════════ GRÁFICO CON TOGGLE ══════════════ */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
        <h2 className="font-semibold text-gray-900 text-base mb-6">
          Resultados por candidato
        </h2>

        {data.resultados.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🗳️</p>
            <p className="text-gray-500 text-sm">Aún no hay votos registrados.</p>
          </div>
        ) : (
          <ResultChart resultados={data.resultados} totalVotos={data.total_votos} />
        )}
      </div>

      {/* ── Nota de actualización ── */}
      <p className="text-center text-xs text-gray-400">
        ↺ Los resultados se actualizan automáticamente cada 10 segundos.
      </p>
    </div>
  );
}
