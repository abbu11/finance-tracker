export default function BudgetBar({ category, limit, spent, percentage }) {
  const color = percentage >= 100
    ? 'bg-red-500'
    : percentage >= 80
    ? 'bg-amber-400'
    : 'bg-green-500';

  return (
    <div className="mb-5">
      <div className="flex justify-between text-sm mb-1.5">
        <span className="font-medium capitalize text-gray-700">{category}</span>
        <span className="text-gray-400">${spent?.toFixed(2)} / ${limit}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(percentage, 100)}%` }} />
      </div>
      {percentage >= 90 && (
        <p className="text-xs mt-1 text-red-500">
          {percentage >= 100 ? '🚨 Budget exceeded!' : `⚠️ ${percentage}% used`}
        </p>
      )}
    </div>
  );
}