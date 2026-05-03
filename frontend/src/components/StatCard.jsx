export default function StatCard({ title, value, icon, color = 'blue' }) {
  const colors = {
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-green-50 text-green-600',
    red:    'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  };
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className={`inline-flex p-2 rounded-xl mb-3 ${colors[color]}`}>{icon}</div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className="text-2xl font-semibold text-gray-800 mt-1">{value}</p>
    </div>
  );
}