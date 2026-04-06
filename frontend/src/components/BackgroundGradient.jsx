/**
 * BackgroundGradient - borde con gradiente animado giratorio.
 * Inspirado en Aceternity UI BackgroundGradient.
 *
 * Uso:
 *   <BackgroundGradient containerClassName="..." className="...">
 *     <div>contenido</div>
 *   </BackgroundGradient>
 *
 * Props:
 *   children           - contenido interior
 *   className          - clases del div interior (fondo blanco por defecto)
 *   containerClassName - clases del div exterior (contenedor)
 */
export function BackgroundGradient({ children, className = '', containerClassName = '' }) {
  return (
    <div
      className={`relative p-[3px] rounded-[22px] overflow-hidden group
                  transition-transform duration-200 hover:-translate-y-1 ${containerClassName}`}
    >
      {/* Gradiente conico giratorio - crea el efecto de borde brillante */}
      <div
        className="absolute animate-conic-spin opacity-60 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          inset: '-100%',
          background: 'conic-gradient(from 0deg at 50% 50%, #0ea5e9, #8b5cf6, #ec4899, #f59e0b, #10b981, #0ea5e9)',
        }}
      />
      {/* Area de contenido - capa por encima del gradiente */}
      <div className={`relative z-10 rounded-[20px] overflow-hidden h-full bg-white ${className}`}>
        {children}
      </div>
    </div>
  );
}
