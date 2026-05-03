import { Trash2, Pencil } from 'lucide-react';

const categoryColors = {
  food:'bg-orange-100 text-orange-700', travel:'bg-blue-100 text-blue-700',
  bills:'bg-red-100 text-red-700', shopping:'bg-pink-100 text-pink-700',
  entertainment:'bg-purple-100 text-purple-700', health:'bg-green-100 text-green-700',
  education:'bg-yellow-100 text-yellow-700', salary:'bg-emerald-100 text-emerald-700',
  other:'bg-gray-100 text-gray-700',
};

export default function TransactionItem({ tx, onDelete, onEdit }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-3">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${categoryColors[tx.category] || categoryColors.other}`}>
          {tx.category}
        </span>
        <div>
          <p className="text-sm font-medium text-gray-700">{tx.description || tx.category}</p>
          <p className="text-xs text-gray-400">{new Date(tx.date).toLocaleDateString()}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-sm font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
          {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
        </span>
        <button onClick={() => onEdit(tx)} className="text-gray-300 hover:text-indigo-500 transition">
          <Pencil size={14}/>
        </button>
        <button onClick={() => onDelete(tx._id)} className="text-gray-300 hover:text-red-500 transition">
          <Trash2 size={14}/>
        </button>
      </div>
    </div>
  );
}