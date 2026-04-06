import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import { CardSpotlight } from '../../components/CardSpotlight.jsx';
import { StatefulVoteButton } from '../../components/StatefulVoteButton.jsx';
import { WavyBackground } from '../../components/WavyBackground.jsx';
import { getImageUrl } from '../../utils/imageUtils.js';

/* Logo con imagen real (public/images/logo.png) y fallback gradient */
function LogoImg() {
  const [failed, setFailed] = useState(false);
  return (
    <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
      {!failed ? (
        <img
          src="/images/logo.png"
          alt="VotaYa"
          className="w-full h-full object-contain"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600
                        flex items-center justify-center text-white font-bold text-base">
          V
        </div>
      )}
    </div>
  );
}

/* â”€â”€â”€ Paleta de colores para las cards por índice â”€â”€â”€ */
const PALETTES = [
  { from: '#3b82f6', to: '#6366f1', bg: '#eff6ff', text: '#2563eb' },
  { from: '#8b5cf6', to: '#a855f7', bg: '#f5f3ff', text: '#7c3aed' },
  { from: '#10b981', to: '#059669', bg: '#ecfdf5', text: '#059669' },
  { from: '#f59e0b', to: '#f97316', bg: '#fffbeb', text: '#d97706' },
  { from: '#ef4444', to: '#ec4899', bg: '#fff1f2', text: '#dc2626' },
  { from: '#06b6d4', to: '#0284c7', bg: '#ecfeff', text: '#0891b2' },
];

function getPalette(i) { return PALETTES[i % PALETTES.length]; }

/* â”€â”€â”€ Badge "En vivo" con punto parpadeante â”€â”€â”€ */
function LiveBadge() {
  return (
    <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600
                     bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
      En vivo
    </span>
  );
}

/* â”€â”€â”€ Barra de progreso horizontal mini â”€â”€â”€ */
function MiniBar({ candidato, total, color }) {
  const pct = total > 0 ? Math.round((candidato.votos / total) * 100) : 0;
  return (
    <div className="mb-2 last:mb-0">
      <div className="flex items-center gap-2 mb-1">
        {/* Avatar del candidato */}
        {candidato.foto_url ? (
          <img src={getImageUrl(candidato.foto_url)} alt={candidato.nombre}
               className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center
                          text-white text-[9px] font-bold"
               style={{ background: color }}>
            {candidato.nombre[0].toUpperCase()}
          </div>
        )}
        <span className="text-xs text-zinc-200 font-medium flex-1 truncate">{candidato.nombre}</span>
        <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
      </div>
      {/* Track de la barra */}
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
             style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

/* ─── Card individual de encuesta ─── */
function PollCard({ encuesta, index }) {
  const palette    = getPalette(index);
  const activa     = encuesta.estado === 'activa';
  const sorted     = [...encuesta.candidatos].sort((a, b) => b.votos - a.votos);
  const lider      = sorted[0];
  const challenger = sorted[1];

  return (
    <CardSpotlight spotlightColor={palette.from + '35'} className="animate-slide-up h-full">
      <article className="flex flex-col h-full">

        {/* ── Banner VS con romboides ── */}
        <div
          className="h-36 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${palette.from}25 0%, #0d0d14 40%, #0d0d14 60%, ${palette.to}25 100%)`,
          }}
        >
          {/* Glow izquierdo */}
          <div
            className="absolute left-0 top-0 w-28 h-full pointer-events-none"
            style={{ background: `radial-gradient(ellipse at 0% 50%, ${palette.from}55, transparent 70%)` }}
          />
          {/* Glow derecho */}
          <div
            className="absolute right-0 top-0 w-28 h-full pointer-events-none"
            style={{ background: `radial-gradient(ellipse at 100% 50%, ${palette.to}55, transparent 70%)` }}
          />
          {/* Divisor diagonal */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="h-full w-px bg-gradient-to-b from-transparent via-white/15 to-transparent"
              style={{ transform: 'rotate(10deg) scaleY(1.3)' }}
            />
          </div>

          {/* Candidato izquierdo */}
          <div className="absolute left-4 top-0 bottom-0 flex flex-col items-center justify-center gap-1.5">
            <div
              className="flex items-center justify-center text-white font-bold text-xl overflow-hidden flex-shrink-0"
              style={{
                clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                width: 68,
                height: 68,
                background: `linear-gradient(135deg, ${palette.from}, ${palette.from}88)`,
              }}
            >
              {lider?.foto_url ? (
                <img src={getImageUrl(lider.foto_url)} alt={lider.nombre} className="w-full h-full object-cover" />
              ) : (
                lider ? lider.nombre[0].toUpperCase() : '?'
              )}
            </div>
            {lider && (
              <p className="text-[9px] text-white/60 font-medium text-center max-w-[72px] truncate">
                {lider.nombre}
              </p>
            )}
          </div>

          {/* VS central con glow */}
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <span
              className="text-2xl font-black tracking-widest select-none"
              style={{ color: 'white', textShadow: `0 0 18px ${palette.from}, 0 0 36px ${palette.to}` }}
            >
              VS
            </span>
          </div>

          {/* Candidato derecho */}
          <div className="absolute right-4 top-0 bottom-0 flex flex-col items-center justify-center gap-1.5">
            <div
              className="flex items-center justify-center text-white font-bold text-xl overflow-hidden flex-shrink-0"
              style={{
                clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                width: 68,
                height: 68,
                background: `linear-gradient(135deg, ${palette.to}88, ${palette.to})`,
              }}
            >
              {challenger?.foto_url ? (
                <img src={getImageUrl(challenger.foto_url)} alt={challenger.nombre} className="w-full h-full object-cover" />
              ) : (
                challenger ? challenger.nombre[0].toUpperCase() : '?'
              )}
            </div>
            {challenger && (
              <p className="text-[9px] text-white/60 font-medium text-center max-w-[72px] truncate">
                {challenger.nombre}
              </p>
            )}
          </div>

          {/* Badge estado */}
          <div className="absolute top-2.5 right-2.5 z-20">
            {activa ? (
              <LiveBadge />
            ) : (
              <span className="text-xs font-semibold text-white/70 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/10">
                Cerrada
              </span>
            )}
          </div>
        </div>

        {/* ── Cuerpo oscuro de la card ── */}
        <div className="flex-1 flex flex-col p-5">

          {/* Título + total de votos */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <h2 className="font-bold text-white text-base leading-snug">{encuesta.titulo}</h2>
            <div className="text-right flex-shrink-0">
              <p className="text-xl font-extrabold" style={{ color: palette.from }}>
                {parseInt(encuesta.total_votos) || 0}
              </p>
              <p className="text-xs text-zinc-500">votos</p>
            </div>
          </div>

          {/* Descripción opcional */}
          {encuesta.descripcion && (
            <p className="text-xs text-zinc-400 mb-3 line-clamp-2">{encuesta.descripcion}</p>
          )}

          {/* Barras de candidatos */}
          {encuesta.candidatos.length > 0 && (
            <div className="flex-1 mb-4">
              {sorted.slice(0, 3).map((c) => (
                <MiniBar
                  key={c.id}
                  candidato={c}
                  total={parseInt(encuesta.total_votos) || 0}
                  color={palette.from}
                />
              ))}
            </div>
          )}

          {/* ── Footer: botón o ganador ── */}
          {activa ? (
            <StatefulVoteButton
              href={`/votar/${encuesta.slug}`}
              colorFrom={palette.from}
              colorTo={palette.to}
            />
          ) : (
            lider && parseInt(encuesta.total_votos) > 0 && (
              <div className="mt-auto flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-xl">🏆</span>
                <div className="min-w-0">
                  <p className="text-xs text-zinc-500">Ganador</p>
                  <p className="text-sm font-semibold truncate" style={{ color: palette.from }}>
                    {lider.nombre}
                  </p>
                </div>
                {lider.foto_url && (
                  <img src={getImageUrl(lider.foto_url)} alt={lider.nombre}
                       className="w-8 h-8 rounded-full object-cover border-2 ml-auto"
                       style={{ borderColor: palette.from + '44' }} />
                )}
              </div>
            )
          )}
        </div>
      </article>
    </CardSpotlight>
  );
}

/* PAGINA PRINCIPAL */
/* PAGINA PRINCIPAL */
export default function HomePage() {
  const [encuestas, setEncuestas] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  /* â”€â”€â”€ Carga de encuestas públicas â”€â”€â”€ */
  useEffect(() => {
    api.get('/public/encuestas')
      .then((res) => setEncuestas(res.data.encuestas))
      .catch(() => setError('No se pudo cargar la información. Intenta más tarde.'))
      .finally(() => setLoading(false));
  }, []);

  const activas  = encuestas.filter((e) => e.estado === 'activa');
  const cerradas = encuestas.filter((e) => e.estado === 'cerrada');

  return (
    <div className="min-h-screen bg-slate-50">

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â• HEADER â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 backdrop-blur">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          {/* Logo + nombre */}
          <div className="flex items-center gap-3">
            <LogoImg />
            <div>
              <p className="font-bold text-gray-900 leading-none">VotaYa</p>
              <p className="text-xs text-gray-400">Resultados en tiempo real</p>
            </div>
          </div>

          {/* Chips de estadísticas rápidas */}
          {!loading && !error && (
            <div className="hidden sm:flex items-center gap-2">
              {activas.length > 0 && (
                <span className="flex items-center gap-1.5 text-xs bg-green-50 text-green-700
                                 border border-green-200 px-3 py-1 rounded-full font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  {activas.length} en vivo
                </span>
              )}
              {cerradas.length > 0 && (
                <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">
                  ✓ {cerradas.length} cerrada{cerradas.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}

          {/* Link al admin */}
          <Link
            to="/admin/login"
            className="flex items-center gap-1.5 text-xs font-medium text-gray-500
                       hover:text-gray-800 transition px-3 py-1.5 rounded-lg hover:bg-gray-100"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
            Admin
          </Link>
        </div>
      </header>

      {/* HERO con efecto Wavy */}
      <WavyBackground
        backgroundFill="white"
        colors={['#38bdf8', '#818cf8', '#c084fc', '#e879f9', '#22d3ee']}
        waveWidth={50}
        waveOpacity={0.3}
        blur={10}
        speed="slow"
        containerClassName="relative"
        className="flex flex-col items-center"
      >
        {/* Titulo */}
        <h1
          className="text-4xl sm:text-5xl md:text-7xl font-bold text-center tracking-tight animate-slide-up"
          style={{
            background: 'linear-gradient(to bottom right, #0f2855, #0284c7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          VotaQR
        </h1>

        {/* Subtitulo */}
        <p className="text-slate-600 text-sm sm:text-base mt-4 max-w-sm text-center font-medium">
          Votaciones en tiempo real
        </p>

        {/* Estadisticas cuando se carguen las encuestas */}
        {!loading && encuestas.length > 0 && (
          <div className="flex gap-8 mt-10 animate-fade-in">
            <div className="text-center">
              <p className="text-3xl font-extrabold text-gray-900">{encuestas.length}</p>
              <p className="text-slate-500 text-xs mt-0.5">Encuestas</p>
            </div>
            <div className="w-px bg-gray-300" />
            <div className="text-center">
              <p className="text-3xl font-extrabold text-gray-900">
                {encuestas.reduce((s, e) => s + (parseInt(e.total_votos) || 0), 0).toLocaleString()}
              </p>
              <p className="text-slate-500 text-xs mt-0.5">Votos totales</p>
            </div>
            <div className="w-px bg-gray-300" />
            <div className="text-center">
              <p className="text-3xl font-extrabold text-gray-900">{activas.length}</p>
              <p className="text-slate-500 text-xs mt-0.5">En vivo</p>
            </div>
          </div>
        )}
      </WavyBackground>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-5xl mx-auto px-5 py-10">

        {/* Spinner de carga */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="spinner" />
            <p className="text-gray-400 text-sm">Cargando votaciones...</p>
          </div>
        )}

        {/* Error de conexion */}
        {error && (
          <div className="alert alert-error max-w-md mx-auto text-center">
            ⚠️ {error}
          </div>
        )}

        {/* Sin encuestas disponibles */}
        {!loading && !error && encuestas.length === 0 && (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🗳️</div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">Sin votaciones disponibles</h2>
            <p className="text-gray-400 text-sm">Vuelve más tarde o contacta al administrador.</p>
          </div>
        )}

        {/* Encuestas activas */}
        {activas.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <h2 className="text-lg font-bold text-gray-900">En vivo ahora</h2>
              </div>
              <span className="text-sm text-gray-400">({activas.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {activas.map((e, i) => <PollCard key={e.id} encuesta={e} index={i} />)}
            </div>
          </section>
        )}

        {/* Encuestas cerradas con resultados */}
        {cerradas.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-lg font-bold text-gray-900">Resultados finales</h2>
              <span className="text-sm text-gray-400">({cerradas.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {cerradas.map((e, i) => <PollCard key={e.id} encuesta={e} index={activas.length + i} />)}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 text-center py-6 text-xs text-gray-400">
        VotaYa &copy; {new Date().getFullYear()} &middot; Sistema de Votación
      </footer>
    </div>
  );
}
