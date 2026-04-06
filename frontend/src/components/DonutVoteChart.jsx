import { useState, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = [
  '#6366f1', '#22d3ee', '#f59e0b', '#10b981',
  '#ef4444', '#a78bfa', '#f472b6', '#34d399',
];

function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.04) return null;
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      fontSize={13} fontWeight={700} style={{ pointerEvents: 'none' }}>
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  );
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb',
      borderRadius: '12px', padding: '10px 16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      fontSize: '13px',
    }}>
      <p style={{ fontWeight: 700, color: '#111827', marginBottom: 2 }}>{d.name}</p>
      <p style={{ color: '#6b7280' }}>
        {d.value.toLocaleString()} votos &mdash;{' '}
        <strong style={{ color: d.payload.fill }}>{(d.payload.percent * 100).toFixed(1)}%</strong>
      </p>
    </div>
  );
}

export default function DonutVoteChart({ candidatos = [], totalVotos = 0 }) {
  const isFirst = useRef(true);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    // En actualizaciones posteriores no re-animar
    setAnimate(false);
  }, [candidatos, totalVotos]);

  const data = candidatos.map((c, i) => ({
    name: c.nombre,
    value: c.votos,
    fill: COLORS[i % COLORS.length],
    percent: totalVotos > 0 ? c.votos / totalVotos : 0,
  }));

  if (totalVotos === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-gray-400 text-sm">
        <span className="text-3xl mb-2">📊</span>
        Aún no hay votos registrados
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      {/* Total */}
      <p className="text-center text-sm text-gray-500 mb-4">
        Total de votos: <strong className="text-gray-900">{totalVotos.toLocaleString()}</strong>
      </p>

      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="48%"
            outerRadius="72%"
            paddingAngle={3}
            dataKey="value"
            labelLine={false}
            label={CustomLabel}
            isAnimationActive={animate}
            animationBegin={0}
            animationDuration={600}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} stroke="none" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (
              <span style={{ fontSize: '13px', color: '#374151', fontWeight: 500 }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Lista de candidatos debajo */}
      <div className="mt-4 space-y-2">
        {data
          .slice()
          .sort((a, b) => b.value - a.value)
          .map((c, i) => (
            <div key={i} className="flex items-center gap-3 px-2">
              <span
                style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: c.fill, flexShrink: 0,
                }}
              />
              <span className="text-sm font-medium text-gray-800 flex-1 truncate">{c.name}</span>
              <span className="text-sm text-gray-500 font-mono">{c.value.toLocaleString()}</span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: c.fill + '18', color: c.fill }}
              >
                {(c.percent * 100).toFixed(1)}%
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
