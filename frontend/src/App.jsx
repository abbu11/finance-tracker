import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster }    from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useBudgetAlerts }       from './hooks/useBudgetAlerts';
import Navbar       from './components/Navbar';
import Dashboard    from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets      from './pages/Budgets';
import Login        from './pages/Login';
import Register     from './pages/Register';

function AppShell() {
  useBudgetAlerts();
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/"             element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/budgets"      element={<Budgets />} />
        </Routes>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"/>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}