import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, ArrowLeftRight, Target, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const { pathname }     = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  const links = [
    { to: '/',             label: 'Dashboard',    icon: <LayoutDashboard size={16}/> },
    { to: '/transactions', label: 'Transactions', icon: <ArrowLeftRight size={16}/> },
    { to: '/budgets',      label: 'Budgets',      icon: <Target size={16}/> },
  ];

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <span className="font-bold text-indigo-600 text-lg">💰 FinTrack</span>

        <div className="flex items-center gap-1">
          {links.map(l => (
            <Link key={l.to} to={l.to}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition
                ${pathname === l.to
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}>
              {l.icon}{l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{user?.name}</span>
          <button onClick={handleLogout}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition">
            <LogOut size={15}/> Logout
          </button>
        </div>
      </div>
    </nav>
  );
}