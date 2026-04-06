/**
 * Formatea una fecha ISO a texto legible en español.
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Verifica si la fecha actual está dentro del rango dado.
 */
export function isDateInRange(fechaInicio, fechaFin) {
  const now = new Date();
  if (fechaInicio && new Date(fechaInicio) > now) return false;
  if (fechaFin && new Date(fechaFin) < now) return false;
  return true;
}
