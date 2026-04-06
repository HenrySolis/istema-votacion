import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService.js';
import Button from '../../components/Button.jsx';
import Input from '../../components/Input.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  /* ─── Manejo del inicio de sesión ─── */
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authService.login(form.email, form.password);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Correo o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ══════════════ PANEL IZQUIERDO — decorativo ══════════════ */}
      <div className="hidden lg:flex flex-col justify-between w-1/2
                      bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900
                      p-12 relative overflow-hidden">
        {/* Círculos decorativos de fondo */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xl shadow-lg">
            🗳️
          </div>
          <span className="text-white font-bold text-xl">VotaYa</span>
        </div>

        {/* Texto central */}
        <div className="relative z-10">
          <h2 className="text-white text-4xl font-extrabold leading-tight mb-4">
            Gestiona tus<br />
            <span className="text-blue-400">votaciones</span><br />
            con facilidad
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            Crea encuestas, administra candidatos y visualiza
            resultados en tiempo real desde un solo panel.
          </p>

          {/* Avatares "testimoniales" decorativos */}
          <div className="flex items-center gap-3 mt-8">
            <div className="flex -space-x-2">
              {['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444'].map((c, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 flex items-center
                                        justify-center text-white text-xs font-bold"
                     style={{ background: c }}>
                  {['A','B','C','D','E'][i]}
                </div>
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-700
                              flex items-center justify-center text-white text-xs font-bold">
                +5
              </div>
            </div>
            <p className="text-slate-400 text-sm">Utilizado por administradores</p>
          </div>
        </div>

        {/* Footer decorativo */}
        <p className="text-slate-600 text-xs relative z-10">© 2026 VotaYa. Todos los derechos reservados.</p>
      </div>

      {/* ══════════════ PANEL DERECHO — formulario ══════════════ */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm animate-slide-up">

          {/* Logo móvil */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-base">
              🗳️
            </div>
            <span className="font-bold text-gray-900">VotaYa</span>
          </div>

          {/* Encabezado del formulario */}
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Bienvenido</h1>
          <p className="text-gray-500 text-sm mb-8">Ingresa tus credenciales de administrador</p>

          {/* ─── Formulario de inicio de sesión ─── */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Correo electrónico"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="email"
              placeholder="admin@ejemplo.com"
            />
            <Input
              label="Contraseña"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />

            {/* Alerta de error */}
            {error && (
              <div className="alert alert-error animate-fade-in">
                ⚠️ {error}
              </div>
            )}

            {/* Botón de submit */}
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              style={{ width: '100%', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
            >
              Iniciar sesión
            </Button>
          </form>

          {/* ─── Link a página pública ─── */}
          <p className="mt-8 text-center text-sm text-gray-400">
            ¿No eres admin?{' '}
            <a href="/" className="text-blue-600 hover:text-blue-800 font-medium">
              Ver votaciones públicas
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

