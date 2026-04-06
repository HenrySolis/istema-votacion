/**
 * LampContainer - efecto de lampara con cono de luz y linea brillante.
 * Inspirado en Aceternity UI LampContainer.
 * Implementado con CSS puro (sin framer-motion).
 * Colores adaptados a la paleta del logo VotaQR (azul marino + cyan).
 */
export function LampContainer({ children, className = '' }) {
  return (
    <div
      className={`relative flex flex-col items-center justify-center overflow-hidden w-full ${className}`}
      style={{ background: '#0f1f45', minHeight: '420px' }}
    >
      {/* ── Cono de luz (beam) ── */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{ zIndex: 1 }}
      >
        {/* Beam principal izquierdo */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: '50%',
            width: '420px',
            height: '280px',
            background: 'conic-gradient(from 70deg at right top, transparent 0deg, #06b6d4 90deg)',
            opacity: 0.3,
            filter: 'blur(2px)',
            transformOrigin: 'right top',
          }}
        />
        {/* Beam principal derecho */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            width: '420px',
            height: '280px',
            background: 'conic-gradient(from -70deg at left top, transparent 0deg, #06b6d4 90deg)',
            opacity: 0.3,
            filter: 'blur(2px)',
            transformOrigin: 'left top',
          }}
        />

        {/* Resplandor central difuso */}
        <div
          style={{
            position: 'absolute',
            top: '-60px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at 50% 0%, #06b6d4 0%, transparent 65%)',
            opacity: 0.55,
            filter: 'blur(8px)',
          }}
        />

        {/* Linea horizontal superior con brillo */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '380px',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, #06b6d4 35%, #06b6d4 65%, transparent)',
          }}
        />
        {/* Glow de la linea */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '240px',
            height: '4px',
            background: 'linear-gradient(90deg, transparent, #22d3ee, transparent)',
            filter: 'blur(3px)',
          }}
        />
      </div>

      {/* ── Contenido ── */}
      <div className="relative z-10 w-full flex flex-col items-center px-5 pt-20 pb-10 animate-fade-in">
        {children}
      </div>
    </div>
  );
}
