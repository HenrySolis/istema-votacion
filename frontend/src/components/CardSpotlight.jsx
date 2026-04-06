import { useRef, useState } from 'react';

/**
 * CardSpotlight — efecto spotlight que sigue el cursor.
 * Fondo oscuro (#111827) con gradiente radial coloreado al hacer hover.
 */
export function CardSpotlight({ children, className = '', spotlightColor = '#3b82f640' }) {
  const divRef = useRef(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);

  const handleMouseMove = (e) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className={`relative rounded-2xl border border-white/10 overflow-hidden ${className}`}
      style={{
        background: hovering
          ? `radial-gradient(350px circle at ${mouse.x}px ${mouse.y}px, ${spotlightColor}, transparent 70%), #111827`
          : '#111827',
        transition: 'background 0.1s ease',
      }}
    >
      {children}
    </div>
  );
}
