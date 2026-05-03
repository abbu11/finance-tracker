import { useEffect, useState } from 'react';
import api   from '../api/axios';
import toast from 'react-hot-toast';
import BudgetBar from '../components/BudgetBar';
import { Plus, X } from 'lucide-react';

const CATEGORIES = ['food','travel','bills','shopping','entertainment','health','education','other'];

export default function Budgets() {
  const [budgets,  setBudgets]  = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ category: 'food', limit: '', period: 'monthly' });

  const load = () => api.get('/budgets').then(r => setBudgets(r.data));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/budgets', form);
      toast.success('Budget saved');
      setShowForm(false);
      setForm({ category: 'food', limit: '', period: 'monthly' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving budget');
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/budgets/${id}`);
    toast.success('Budget removed');
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Budgets</h1>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
          <Plus size={16}/> Set Budget
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700">New Budget</h3>
            <button onClick={() => setShowForm(false)}><X size={18} className="text-gray-400"/></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-3">
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="number" placeholder="Limit ($)" value={form.limit} min="0"
              onChange={e => setForm({ ...form, limit: e.target.value })}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" required />
            <select value={form.period} onChange={e => setForm({ ...form, period: e.target.value })}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
            </select>
            <button type="submit"
              className="col-span-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 text-sm font-medium transition">
              Save Budget
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        {budgets.length === 0
          ? <p className="text-sm text-gray-400 text-center py-8">No budgets set yet. Add one to start tracking.</p>
          : budgets.map(b => (
              <div key={b._id} className="group relative">
                <BudgetBar category={b.category} limit={b.limit} spent={b.spent} percentage={b.percentage} />
                <button onClick={() => handleDelete(b._id)}
                  className="absolute top-0 right-0 text-xs text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">
                  remove
                </button>
              </div>
            ))
        }
      </div>
    </div>
  );
}