import { Link } from 'react-router-dom';

export default function ClosedPollPage({ message }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100
                    flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-sm w-full text-center animate-slide-up">

        {/* ── Ícono de cerrado ── */}
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center
                        mx-auto mb-6 text-4xl">
          🔒
        </div>

        <h1 className="text-2xl font-extrabold text-gray-900 mb-3">No disponible</h1>
        <p className="text-gray-500 text-sm">
          {message || 'Esta encuesta ya cerró o no está activa en este momento.'}
        </p>

        <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto my-8" />

        {/* ─── Botón de regreso ─── */}
        <Link
          to="/"
          className="inline-block text-sm font-semibold text-gray-600 hover:text-gray-900
                     transition px-6 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50"
        >
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}
