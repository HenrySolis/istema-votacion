import { useRef, useState } from 'react';
import { getImageUrl } from '../utils/imageUtils.js';

const GRAD = [
  ['#60a5fa', '#818cf8'],
  ['#a78bfa', '#c084fc'],
  ['#34d399', '#06b6d4'],
  ['#fbbf24', '#f97316'],
  ['#f472b6', '#ec4899'],
  ['#22d3ee', '#3b82f6'],
];

export default function CometCandidateCard({
  candidato,
  selected = false,
  onSelect,
  disabled = false,
  showResults = false,
  votos = 0,
  totalVotos = 0,
  isWinner = false,
  myVote = false,
}) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, op: 0 });

  const gradIdx = candidato.nombre.charCodeAt(0) % GRAD.length;
  const [from, to] = GRAD[gradIdx];
  const pct = totalVotos > 0 ? (votos / totalVotos) * 100 : 0;
  const clickable = !disabled && !showResults;

  function onMove(e) {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const xp = (e.clientX - r.left) / r.width - 0.5;
    const yp = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ rx: -yp * 12, ry: xp * 12 });
    setGlare({ x: (xp + 0.5) * 100, y: (yp + 0.5) * 100, op: 0.35 });
  }

  function onLeave() {
    setTilt({ rx: 0, ry: 0 });
    setGlare(g => ({ ...g, op: 0 }));
  }

  const borderColor = isWinner
    ? '#eab308'
    : selected && !showResults
    ? from
    : myVote && showResults
    ? '#22d3ee'
    : '#e5e7eb';

  return (
    <div style={{ perspective: '900px' }}>
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        onClick={() => clickable && onSelect && onSelect(candidato.id)}
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : -1}
        onKeyDown={e => clickable && e.key === 'Enter' && onSelect && onSelect(candidato.id)}
        style={{
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) ${selected && !showResults ? 'translateY(-4px) scale(1.03)' : 'scale(1)'}`,
          transition: 'transform 0.18s ease-out, box-shadow 0.2s ease',
          transformStyle: 'preserve-3d',
          boxShadow: isWinner
            ? '0 16px 40px rgba(234,179,8,0.25), 0 4px 12px rgba(0,0,0,0.08)'
            : selected && !showResults
            ? `0 16px 40px rgba(99,102,241,0.2), 0 4px 12px rgba(0,0,0,0.08)`
            : '0 2px 12px rgba(0,0,0,0.07)',
          cursor: clickable ? 'pointer' : 'default',
          border: `2px solid ${borderColor}`,
          borderRadius: '20px',
          background: '#ffffff',
          overflow: 'hidden',
        }}
        className="relative select-none outline-none"
      >
        {/* ── Franja de color superior ── */}
        <div
          style={{
            height: '6px',
            background: isWinner
              ? 'linear-gradient(90deg, #fbbf24, #f59e0b)'
              : `linear-gradient(90deg, ${from}, ${to})`,
          }}
        />

        {/* ── Foto / Avatar ── */}
        <div className="flex flex-col items-center px-4 pt-6 pb-4">
          <div
            style={{
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: `3px solid ${isWinner ? '#fbbf24' : selected && !showResults ? from : '#e5e7eb'}`,
              boxShadow: selected && !showResults
                ? `0 0 0 4px ${from}22`
                : isWinner
                ? '0 0 0 4px rgba(234,179,8,0.18)'
                : 'none',
              flexShrink: 0,
              position: 'relative',
            }}
          >
            {candidato.foto_url ? (
              <img
                src={getImageUrl(candidato.foto_url)}
                alt={candidato.nombre}
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${from}, ${to})`,
                  color: '#fff',
                  fontSize: '2.2rem',
                  fontWeight: 800,
                }}
              >
                {candidato.nombre.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Badges sobre el avatar */}
          <div className="relative w-full flex justify-center" style={{ marginTop: '-14px', marginBottom: '6px', zIndex: 10 }}>
            {isWinner && (
              <span
                style={{
                  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                  color: '#78350f',
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '2px 10px',
                  borderRadius: '9999px',
                  boxShadow: '0 2px 8px rgba(234,179,8,0.4)',
                  letterSpacing: '0.04em',
                }}
              >
                &#x1F3C6; GANADOR
              </span>
            )}
            {myVote && showResults && !isWinner && (
              <span
                style={{
                  background: 'linear-gradient(135deg, #22d3ee, #3b82f6)',
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 10px',
                  borderRadius: '9999px',
                }}
              >
                Mi voto
              </span>
            )}
          </div>

          {/* Nombre */}
          <h3
            className="font-bold text-center leading-tight truncate w-full"
            style={{
              fontSize: '0.9rem',
              color: isWinner ? '#92400e' : '#111827',
              marginBottom: '2px',
            }}
          >
            {candidato.nombre}
          </h3>
          {candidato.descripcion && !showResults && (
            <p className="text-center truncate w-full" style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
              {candidato.descripcion}
            </p>
          )}

          {/* Badge seleccionado */}
          {selected && !showResults && (
            <span
              style={{
                marginTop: '10px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: 700,
                background: `linear-gradient(135deg, ${from}, ${to})`,
                color: '#fff',
                padding: '3px 12px',
                borderRadius: '9999px',
              }}
            >
              &#x2713; Seleccionado
            </span>
          )}
        </div>

        {/* ── Footer con resultados ── */}
        {showResults && (
          <div
            style={{
              padding: '8px 16px 14px',
              background: '#f9fafb',
              borderTop: '1px solid #f3f4f6',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: isWinner ? '#d97706' : from }}>
                {pct.toFixed(1)}%
              </span>
              <span style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'monospace' }}>
                {votos.toLocaleString()} votos
              </span>
            </div>
            <div style={{ width: '100%', background: '#e5e7eb', borderRadius: '9999px', height: '8px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  borderRadius: '9999px',
                  width: `${pct}%`,
                  background: isWinner
                    ? 'linear-gradient(90deg, #fbbf24, #f59e0b)'
                    : `linear-gradient(90deg, ${from}, ${to})`,
                  transition: 'width 1.2s ease-out',
                }}
              />
            </div>
          </div>
        )}

        {/* ── Glare overlay ── */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.4) 25%, transparent 65%)`,
            opacity: glare.op,
            transition: 'opacity 0.22s ease',
            borderRadius: '20px',
            mixBlendMode: 'overlay',
          }}
        />
      </div>
    </div>
  );
}