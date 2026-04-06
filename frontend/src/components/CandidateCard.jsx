/* ─── Colores de gradiente para avatares sin foto ─── */
const GRAD = [
  'from-blue-400 to-indigo-500',
  'from-violet-400 to-purple-600',
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
  'from-rose-400 to-pink-500',
  'from-cyan-400 to-blue-500',
];

export default function CandidateCard({ candidato, selected, onSelect, disabled = false }) {
  /* ─── Índice estable por nombre para el gradiente ─── */
  const gradIdx = candidato.nombre.charCodeAt(0) % GRAD.length;

  return (
    <div
      onClick={() => !disabled && onSelect && onSelect(candidato.id)}
      role={disabled ? undefined : 'button'}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => !disabled && e.key === 'Enter' && onSelect && onSelect(candidato.id)}
      className={[
        'relative rounded-2xl border-2 p-5 text-center cursor-pointer transition-all duration-200',
        'flex flex-col items-center gap-3 select-none outline-none',
        selected
          ? 'border-blue-500 bg-blue-50 shadow-md ring-4 ring-blue-100'
          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm hover:-translate-y-0.5',
        disabled ? 'opacity-60 cursor-default' : '',
      ].join(' ')}
    >
      {/* ── Foto o avatar con gradiente ── */}
      <div className={`w-20 h-20 rounded-2xl overflow-hidden border-4 ${
        selected ? 'border-blue-400/40' : 'border-gray-100'
      } flex-shrink-0`}>
        {candidato.foto_url ? (
          <img src={candidato.foto_url} alt={candidato.nombre}
               className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full flex items-center justify-center
                           bg-gradient-to-br ${GRAD[gradIdx]} text-white text-3xl font-bold`}>
            {candidato.nombre.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* ── Nombre ── */}
      <h3 className={`font-semibold text-sm leading-tight ${
        selected ? 'text-blue-700' : 'text-gray-900'
      }`}>
        {candidato.nombre}
      </h3>

      {/* ── Descripción ── */}
      {candidato.descripcion && (
        <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{candidato.descripcion}</p>
      )}

      {/* ── Badge de seleccionado ── */}
      {selected && (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600
                         bg-blue-100 px-3 py-1 rounded-full">
          ✓ Seleccionado
        </span>
      )}

      {/* ── Borde animado cuando está seleccionado ── */}
      {selected && (
        <div className="absolute inset-0 rounded-2xl ring-2 ring-blue-400/30 pointer-events-none" />
      )}
    </div>
  );
}
