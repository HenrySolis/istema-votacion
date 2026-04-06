import { Link } from 'react-router-dom';

export default function ThanksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white
                    flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-sm w-full text-center animate-slide-up">

        {/* ── Ícono de éxito ── */}
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center
                        mx-auto mb-6 text-4xl">
          ✅
        </div>

        <h1 className="text-2xl font-extrabold text-gray-900 mb-3">¡Voto registrado!</h1>
        <p className="text-gray-500 mb-2">Tu voto ha sido contabilizado correctamente.</p>
        <p className="text-gray-400 text-sm mb-8">Gracias por participar en esta votación.</p>

        {/* Línea divisora */}
        <div className="w-12 h-1 bg-green-400 rounded-full mx-auto mb-8" />

        {/* ─── Link de vuelta a inicio ─── */}
        <Link
          to="/"
          className="inline-block text-sm font-semibold text-blue-600 hover:text-blue-800
                     transition px-6 py-2.5 rounded-xl border border-blue-200
                     hover:bg-blue-50"
        >
          ← Ver más votaciones
        </Link>
      </div>
    </div>
  );
}
