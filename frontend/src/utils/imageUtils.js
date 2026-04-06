/**
 * URL base del backend (sin el sufijo /api).
 * Funciona correctamente ya sea que VITE_API_URL incluya '/api' o no.
 * En desarrollo (sin VITE_API_URL) queda vacío para que el proxy de Vite
 * gestione /uploads → localhost:3000.
 */
function buildBackendBase() {
  const raw = import.meta.env.VITE_API_URL;
  if (!raw) return '';
  const base = raw.replace(/\/+$/, '');                    // quitar barras finales
  return base.endsWith('/api') ? base.slice(0, -4) : base; // quitar /api si está
}

const BACKEND_BASE = buildBackendBase();

/**
 * Convierte una foto_url relativa (/uploads/...) en una URL absoluta
 * apuntando al backend correcto según el entorno.
 *
 * @param {string|null|undefined} fotoUrl
 * @returns {string|null}
 */
export function getImageUrl(fotoUrl) {
  if (!fotoUrl) return null;
  if (fotoUrl.startsWith('http')) return fotoUrl; // ya es absoluta
  return `${BACKEND_BASE}${fotoUrl}`;
}
