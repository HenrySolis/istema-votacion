/**
 * URL base del backend (sin el sufijo /api).
 * En desarrollo es cadena vacía para que el proxy de Vite gestione /uploads.
 * En producción, VITE_API_URL debe ser "https://tu-backend.onrender.com/api".
 */
const BACKEND_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
  : '';

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
