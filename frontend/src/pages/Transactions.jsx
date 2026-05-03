import { useEffect, useState } from 'react';
import api   from '../api/axios';
import toast from 'react-hot-toast';
import TransactionItem from '../components/TransactionItem';
import { Plus, X } from 'lucide-react';

const CATEGORIES = ['food','travel','bills','shopping','entertainment','health','education','salary','other'];
const EMPTY = { type: 'expense', amount: '', category: 'food', description: '', date: new Date().toISOString().slice(0,10) };

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [showForm, setShowForm]         = useState(false);
  const [form, setForm]                 = useState(EMPTY);
  const [editing, setEditing]           = useState(null);
  const [filter, setFilter]             = useState({ month: new Date().toISOString().slice(0,7), type: '' });

  const load = () => {
    const params = new URLSearchParams(filter).toString();
    api.get(`/transactions?${params}`).then(r => setTransactions(r.data));
  };

  useEffect(() => { load(); }, [filter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/transactions/${editing}`, form);
        toast.success('Transaction updated');
      } else {
        await api.post('/transactions', form);
        toast.success('Transaction added');
      }
      setForm(EMPTY); setEditing(null); setShowForm(false); load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving transaction');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return;
    await api.delete(`/transactions/${id}`);
    toast.success('Deleted');
    load();
  };

  const handleEdit = (tx) => {
    setForm({ type: tx.type, amount: tx.amount, category: tx.category, description: tx.description, date: tx.date.slice(0,10) });
    setEditing(tx._id);
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm(EMPTY); }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
          <Plus size={16}/> Add New
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <input type="month" value={filter.month}
          onChange={e => setFilter({ ...filter, month: e.target.value })}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        <select value={filter.type} onChange={e => setFilter({ ...filter, type: e.target.value })}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
          <option value="">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700">{editing ? 'Edit' : 'Add'} Transaction</h3>
            <button onClick={() => setShowForm(false)}><X size={18} className="text-gray-400"/></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <input type="number" placeholder="Amount" value={form.amount} min="0" step="0.01"
              onChange={e => setForm({ ...form, amount: e.target.value })}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" required />
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="date" value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            <input type="text" placeholder="Description (optional)" value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="col-span-2 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            <button type="submit"
              className="col-span-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 text-sm font-medium transition">
              {editing ? 'Update Transaction' : 'Add Transaction'}
            </button>
          </form>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        {transactions.length === 0
          ? <p className="text-sm text-gray-400 text-center py-8">No transactions found.</p>
          : transactions.map(tx => (
              <TransactionItem key={tx._id} tx={tx} onDelete={handleDelete} onEdit={handleEdit} />
            ))
        }
      </div>
    </div>
  );
}