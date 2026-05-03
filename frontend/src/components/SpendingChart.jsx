import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#6366f1','#22c55e','#f59e0b','#ef4444','#8b5cf6','#14b8a6','#f97316','#ec4899'];

export default function SpendingChart({ data }) {
  const chartData = Object.entries(data || {})
    .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
    .filter(d => d.value > 0);

  if (!chartData.length) return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-center h-64 text-gray-400 text-sm">
      No spending data yet
    </div>
  );

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <h3 className="text-sm font-semibold text-gray-600 mb-4">Spending by Category</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" outerRadius={75} dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}>
            {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip formatter={(v) => `$${v}`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}