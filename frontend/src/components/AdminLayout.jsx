import { NavLink, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService.js';
import { useAuth } from '../hooks/useAuth.js';
import { Avatar, AvatarFallback, AvatarImage, AvatarBadge } from './ui/avatar.jsx';

/* ─── Iconos SVG inline para el sidebar ─── */
const Icons = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  polls: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
      <rect x="9" y="3" width="6" height="4" rx="1"/>
      <line x1="9" y1="12" x2="15" y2="12"/>
      <line x1="9" y1="16" x2="13" y2="16"/>
    </svg>
  ),
  plus: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <line x1="12" y1="8" x2="12" y2="16"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  ),
  logout: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
};

/* ─── Clases para los links del sidebar ─── */
function sidebarLink({ isActive }) {
  return [
    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
    isActive
      ? 'bg-indigo-50 text-indigo-700 font-semibold'
      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900',
  ].join(' ');
}

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const { admin } = useAuth();

  /* ─── Cierre de sesión ─── */
  async function handleLogout() {
    await authService.logout();
    navigate('/admin/login');
  }

  /* ─── Iniciales del admin para el avatar ─── */
  const initials = admin?.nombre
    ? admin.nombre.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'A';

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* ══════════════ SIDEBAR ══════════════ */}
      <aside className="w-64 bg-white flex flex-col flex-shrink-0 fixed h-screen overflow-y-auto z-40 border-r border-gray-200 shadow-sm">

        {/* ── Logo / marca ── */}
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <img
              src="/images/logo.png"
              alt="Logo"
              className="h-10 w-auto object-contain"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
        </div>

        {/* ── Perfil del admin ── */}
        {admin && (
          <div className="px-4 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
              <Avatar className="h-9 w-9 flex-shrink-0">
                <AvatarImage
                  src={admin.foto_url || '/images/Avatar.jpg'}
                  alt={admin.nombre}
                />
                <AvatarFallback>{initials}</AvatarFallback>
                <AvatarBadge className="bg-green-500 ring-white" />
              </Avatar>
              <div className="min-w-0">
                <p className="text-gray-800 text-sm font-semibold truncate">{admin.nombre}</p>
                <p className="text-gray-400 text-xs">Administrador</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Navegación principal ── */}
        <nav className="flex-1 py-4 flex flex-col gap-0.5 px-3">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
            Menú
          </p>

          <NavLink to="/admin" end className={sidebarLink}>
            {Icons.dashboard}
            Dashboard
          </NavLink>

          <NavLink to="/admin/encuestas" className={sidebarLink}>
            {Icons.polls}
            Encuestas
          </NavLink>

          <NavLink to="/admin/encuestas/nueva" className={sidebarLink}>
            {Icons.plus}
            Nueva encuesta
            <span className="ml-auto text-xs bg-indigo-50 text-indigo-600 font-medium px-2 py-0.5 rounded-full">
              New
            </span>
          </NavLink>
        </nav>

        {/* ── Footer: cerrar sesión ── */}
        <div className="px-3 py-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium
                       text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150"
          >
            {Icons.logout}
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ══════════════ CONTENIDO PRINCIPAL ══════════════ */}
      <main className="flex-1 ml-64 min-h-screen">
        {/* ── Topbar superior ── */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-100 px-8 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">
              Sistema de Votaciones
            </p>
            <p className="text-xs text-gray-400">
              {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* ── Página ── */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

