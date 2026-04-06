import { useEffect, useRef } from 'react';

/**
 * SparklesCore - animacion de particulas brillantes sobre canvas.
 * Inspirado en Aceternity UI SparklesCore.
 * Props:
 *   background      - color de fondo del canvas (default: 'transparent')
 *   minSize         - tamano minimo de particula en px (default: 0.4)
 *   maxSize         - tamano maximo de particula en px (default: 1)
 *   particleDensity - densidad: particulas por millon de px (default: 100)
 *   particleColor   - color CSS de las particulas (default: '#FFFFFF')
 *   className       - clases Tailwind para el canvas
 */
export function SparklesCore({
  background = 'transparent',
  minSize = 0.4,
  maxSize = 1,
  particleDensity = 100,
  className = '',
  particleColor = '#FFFFFF',
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let particles = [];

    // Ajusta el tamano del canvas al tamano real del elemento
    const setSize = () => {
      canvas.width  = canvas.offsetWidth  || 640;
      canvas.height = canvas.offsetHeight || 160;
      buildParticles();
    };

    const buildParticles = () => {
      const count = Math.max(
        Math.floor(canvas.width * canvas.height * particleDensity / 1_000_000),
        30
      );
      particles = Array.from({ length: count }, () => ({
        x:       Math.random() * canvas.width,
        y:       Math.random() * canvas.height,
        radius:  Math.random() * (maxSize - minSize) + minSize,
        opacity: Math.random(),
        delta:   (Math.random() - 0.5) * 0.015,   // velocidad de parpadeo
      }));
    };

    setSize();

    // Observa cambios de tamano del contenedor
    const ro = new ResizeObserver(setSize);
    ro.observe(canvas);

    // Bucle de animacion
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.opacity += p.delta;
        if (p.opacity <= 0.05 || p.opacity >= 0.95) p.delta = -p.delta;
        ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = particleColor;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [minSize, maxSize, particleDensity, particleColor]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ background, display: 'block' }}
    />
  );
}
