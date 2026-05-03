import { useEffect, useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, Percent } from 'lucide-react';
import api from '../api/axios';
import StatCard      from '../components/StatCard';
import SpendingChart from '../components/SpendingChart';
import InsightCard   from '../components/InsightCard';
import TransactionItem from '../components/TransactionItem';

const fmt  = (n) => `$${Number(n || 0).toFixed(2)}`;
const month = () => new Date().toISOString().slice(0, 7);

export default function Dashboard() {
  const [summary,  setSummary]  = useState(null);
  const [insights, setInsights] = useState([]);
  const [recent,   setRecent]   = useState([]);

  useEffect(() => {
    api.get(`/transactions/summary?month=${month()}`).then(r => setSummary(r.data));
    api.get('/insights').then(r => setInsights(r.data)).catch(() => {});
    api.get(`/transactions?month=${month()}`).then(r => setRecent(r.data.slice(0, 5)));
  }, []);

  const savingsRate = summary?.income > 0
    ? Math.round((1 - summary.expenses / summary.income) * 100)
    : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Balance"      value={fmt(summary?.balance)}  icon={<Wallet size={18}/>}       color="blue"   />
        <StatCard title="Income"       value={fmt(summary?.income)}   icon={<TrendingUp size={18}/>}   color="green"  />
        <StatCard title="Expenses"     value={fmt(summary?.expenses)} icon={<TrendingDown size={18}/>} color="red"    />
        <StatCard title="Savings Rate" value={`${savingsRate}%`}      icon={<Percent size={18}/>}      color="purple" />
      </div>

      {/* Charts + Insights */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <SpendingChart data={summary?.byCategory} />

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-600 mb-4">🤖 AI Insights</h3>
          {insights.length === 0
            ? <p className="text-sm text-gray-400">Add more transactions to unlock insights.</p>
            : insights.map((ins, i) => <InsightCard key={i} insight={ins} />)
          }
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-600 mb-4">Recent Transactions</h3>
        {recent.length === 0
          ? <p className="text-sm text-gray-400">No transactions this month yet.</p>
          : recent.map(tx => <TransactionItem key={tx._id} tx={tx} onDelete={() => {}} onEdit={() => {}} />)
        }
      </div>
    </div>
  );
}