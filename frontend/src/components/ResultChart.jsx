import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts';
import { getImageUrl } from '../utils/imageUtils.js';

/* ─── Paleta de colores para candidatos ─── */
const COLORS = [
  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b',
  '#ef4444', '#06b6d4', '#ec4899', '#84cc16',
];

/* ─── Tooltip personalizado ─── */
function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-gray-100 rounded-xl px-4 py-2.5 shadow-lg text-sm">
      <p className="font-semibold text-gray-800">{d.nombre}</p>
      <p className="text-blue-600 font-bold mt-0.5">{d.votos} votos · {d.pct}%</p>
    </div>
  );
}

/* ─── Label personalizado para la dona ─── */
function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, pct, nombre }) {
  if (pct < 5) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
          fontSize={12} fontWeight="700">
      {pct}%
    </text>
  );
}

export default function ResultChart({ resultados, totalVotos }) {
  /* ─── Estado: modo del gráfico (barra o dona) ─── */
  const [modo, setModo] = useState('barra');

  /* ─── Prepara los datos normalizados ─── */
  const data = resultados.map((r, i) => ({
    nombre: r.nombre,
    votos:  parseInt(r.votos) || 0,
    pct:    totalVotos > 0 ? Math.round(((parseInt(r.votos) || 0) / totalVotos) * 100) : 0,
    foto:   getImageUrl(r.foto_url),
    color:  COLORS[i % COLORS.length],
  }));

  return (
    <div>
      {/* ── Selector de vista ── */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setModo('barra')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            modo === 'barra'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          📊 Barras
        </button>
        <button
          onClick={() => setModo('dona')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            modo === 'dona'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          🍩 Dona
        </button>
      </div>

      {/* ══ GRÁFICO DE BARRAS HORIZONTAL ══ */}
      {modo === 'barra' && (
        <div className="animate-fade-in">
          {/* Barras manuales (más control visual que Recharts para horizontal) */}
          <div className="flex flex-col gap-4">
            {[...data].sort((a, b) => b.votos - a.votos).map((d, i) => (
              <div key={d.nombre} className="animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
                {/* Candidato + % */}
                <div className="flex items-center gap-3 mb-1.5">
                  {/* Avatar */}
                  {d.foto ? (
                    <img src={d.foto} alt={d.nombre}
                         className="w-8 h-8 rounded-full object-cover flex-shrink-0 border-2 border-white shadow-sm" />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center
                                 text-white text-xs font-bold shadow-sm"
                      style={{ background: d.color }}
                    >
                      {d.nombre[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-semibold text-gray-800 flex-1 truncate">{d.nombre}</span>
                  <span className="text-sm font-bold" style={{ color: d.color }}>{d.pct}%</span>
                  <span className="text-xs text-gray-400">{d.votos} votos</span>
                </div>

                {/* Barra de progreso */}
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${d.pct}%`, background: d.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Gráfico de barras verticales de Recharts */}
          {data.length > 1 && (
            <div className="mt-8">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data} barSize={28} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="nombre"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false} tickLine={false}
                    tickFormatter={(v) => v.length > 12 ? v.slice(0, 10) + '…' : v}
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc', radius: 4 }} />
                  <Bar dataKey="votos" radius={[6, 6, 0, 0]}>
                    {data.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* ══ GRÁFICO DE DONA (Pie) ══ */}
      {modo === 'dona' && (
        <div className="animate-fade-in flex flex-col items-center">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={130}
                dataKey="votos"
                nameKey="nombre"
                labelLine={false}
                label={<PieLabel />}
                paddingAngle={3}
              >
                {data.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span className="text-xs text-gray-600">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* ─── Texto central: ganador ─── */}
          {data.length > 0 && totalVotos > 0 && (
            <div className="mt-2 text-center">
              <p className="text-xs text-gray-400">Líder actual</p>
              <p className="font-bold text-gray-900 text-lg">
                {[...data].sort((a, b) => b.votos - a.votos)[0].nombre}
              </p>
              <p className="text-blue-600 text-sm font-semibold">
                {[...data].sort((a, b) => b.votos - a.votos)[0].pct}% de los votos
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

