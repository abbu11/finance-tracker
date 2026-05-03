const styles = {
  high:   'border-l-red-500 bg-red-50 text-red-800',
  medium: 'border-l-amber-400 bg-amber-50 text-amber-800',
  low:    'border-l-green-400 bg-green-50 text-green-800',
};

export default function InsightCard({ insight }) {
  const s = styles[insight.severity] || styles.low;
  return (
    <div className={`border-l-4 rounded-r-xl px-4 py-3 mb-3 ${s}`}>
      <p className="text-sm font-semibold">{insight.title}</p>
      <p className="text-xs mt-0.5 opacity-80">{insight.message}</p>
    </div>
  );
}