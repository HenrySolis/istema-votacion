import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import { pollService } from '../../services/pollService.js';
import { useAuth } from '../../hooks/useAuth.js';

/* ─── Paleta de colores para las barras del gráfico ─── */
const BAR_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

/* ─── Tooltip personalizado del gráfico ─── */
function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl px-4 py-2 shadow-lg text-sm">
      <p className="font-semibold text-gray-800">{payload[0].payload.titulo}</p>
      <p className="text-blue-600 font-bold mt-0.5">{payload[0].value} votos</p>
    </div>
  );
}

/* ─── Tarjeta de estadística individual ─── */
function StatCard({ label, value, color, icon, sub }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5 animate-slide-up">
      {/* Icono con fondo de color */}
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-extrabold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { admin } = useAuth();
  const navigate = useNavigate();
  const [encuestas, setEncuestas] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ─── Carga de encuestas desde la API ─── */
  useEffect(() => {
    pollService.getAll()
      .then((data) => setEncuestas(data.encuestas || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  /* ─── Métricas calculadas ─── */
  const activas    = encuestas.filter((e) => e.estado === 'activa').length;
  const borradores = encuestas.filter((e) => e.estado === 'borrador').length;
  const cerradas   = encuestas.filter((e) => e.estado === 'cerrada').length;
  const totalVotos = encuestas.reduce((acc, e) => acc + (parseInt(e.total_votos) || 0), 0);

  /* ─── Datos para el gráfico: top 8 encuestas por votos ─── */
  const chartData = [...encuestas]
    .sort((a, b) => (parseInt(b.total_votos) || 0) - (parseInt(a.total_votos) || 0))
    .slice(0, 8)
    .map((e) => ({
      titulo: e.titulo.length > 18 ? e.titulo.slice(0, 16) + '…' : e.titulo,
      votos:  parseInt(e.total_votos) || 0,
      estado: e.estado,
    }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl animate-fade-in">

      {/* ══════════════ ENCABEZADO ══════════════ */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        {admin && (
          <p className="text-gray-500 mt-1 text-sm">
            Bienvenido de nuevo, <span className="font-semibold text-gray-700">{admin.nombre}</span> 👋
          </p>
        )}
      </div>

      {/* ══════════════ TARJETAS DE ESTADÍSTICAS ══════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Votaciones activas"
          value={activas}
          icon="🟢"
          color="bg-green-50"
          sub="En vivo ahora"
        />
        <StatCard
          label="Borradores"
          value={borradores}
          icon="📝"
          color="bg-yellow-50"
          sub="Sin publicar"
        />
        <StatCard
          label="Cerradas"
          value={cerradas}
          icon="🔒"
          color="bg-slate-50"
          sub="Finalizadas"
        />
        <StatCard
          label="Total de votos"
          value={totalVotos.toLocaleString()}
          icon="🗳️"
          color="bg-blue-50"
          sub="Todos los tiempos"
        />
      </div>

      {/* ══════════════ GRÁFICO DE VOTOS ══════════════ */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">

          {/* Encabezado del gráfico */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Votos por encuesta</h2>
              <p className="text-xs text-gray-400 mt-0.5">Top {chartData.length} encuestas con más participación</p>
            </div>
            {/* Selector de periodo (visual) */}
            <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full font-medium">
              Todos los tiempos
            </span>
          </div>

          {/* ─── Gráfico de barras verticales (Recharts) ─── */}
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={32} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="titulo"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc', radius: 6 }} />
              <Bar dataKey="votos" radius={[6, 6, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ══════════════ ACCIONES RÁPIDAS ══════════════ */}
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-700 mb-4">Acciones rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* ─── Crear nueva encuesta ─── */}
          <button
            onClick={() => navigate('/admin/encuestas/nueva')}
            className="group bg-blue-600 hover:bg-blue-700 text-white rounded-2xl p-6 text-left
                       transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 shadow-sm"
          >
            <div className="text-3xl mb-3">➕</div>
            <h3 className="font-semibold text-base">Crear encuesta</h3>
            <p className="text-blue-200 text-sm mt-1">Configura título, candidatos y fechas</p>
          </button>

          {/* ─── Ver todas las encuestas ─── */}
          <button
            onClick={() => navigate('/admin/encuestas')}
            className="group bg-white hover:bg-gray-50 text-gray-700 rounded-2xl p-6 text-left
                       border border-gray-100 transition-all duration-200 hover:shadow-md
                       hover:-translate-y-0.5 shadow-sm"
          >
            <div className="text-3xl mb-3">📋</div>
            <h3 className="font-semibold text-base">Ver encuestas</h3>
            <p className="text-gray-400 text-sm mt-1">Administra y revisa todas tus encuestas</p>
          </button>
        </div>
      </div>

      {/* ══════════════ LISTA RECIENTE ══════════════ */}
      {encuestas.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 text-base">Encuestas recientes</h2>
            <button
              onClick={() => navigate('/admin/encuestas')}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Ver todas →
            </button>
          </div>
          <ul className="divide-y divide-gray-50">
            {encuestas.slice(0, 5).map((e) => (
              <li
                key={e.id}
                onClick={() => navigate(`/admin/encuestas/${e.id}`)}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 cursor-pointer transition"
              >
                {/* Indicador de estado */}
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  e.estado === 'activa'    ? 'bg-green-400' :
                  e.estado === 'borrador'  ? 'bg-yellow-400' : 'bg-gray-300'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{e.titulo}</p>
                  <p className="text-xs text-gray-400 mt-0.5 capitalize">{e.estado}</p>
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {parseInt(e.total_votos) || 0}
                  <span className="text-xs text-gray-400 font-normal ml-1">votos</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

