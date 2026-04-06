import { useState } from 'react';

/* ── Avatar root ── */
export function Avatar({ className = '', children }) {
  return (
    <span className={`relative inline-flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}>
      {children}
    </span>
  );
}

/* ── Avatar image: posición absoluta sobre el fallback ── */
export function AvatarImage({ src, alt = '', className = '' }) {
  const [status, setStatus] = useState('loading');

  // Sin src o si falló → no renderizar nada (muestra el fallback)
  if (!src || status === 'error') return null;

  return (
    <img
      src={src}
      alt={alt}
      onLoad={() => setStatus('loaded')}
      onError={() => setStatus('error')}
      className={`absolute inset-0 h-full w-full object-cover rounded-full transition-opacity duration-200 ${
        status === 'loaded' ? 'opacity-100' : 'opacity-0'
      } ${className}`}
    />
  );
}

/* ── Avatar fallback: siempre visible como capa base ── */
export function AvatarFallback({ children, className = '' }) {
  return (
    <span
      className={`flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-blue-600 text-white text-sm font-semibold ${className}`}
    >
      {children}
    </span>
  );
}

/* ── Avatar badge (indicador de estado) ── */
export function AvatarBadge({ className = '' }) {
  return (
    <span
      className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white ${className}`}
    />
  );
}
