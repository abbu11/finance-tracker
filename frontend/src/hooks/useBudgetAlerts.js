import { useEffect } from 'react';
import { io }        from 'socket.io-client';
import toast         from 'react-hot-toast';

let socket;

export function useBudgetAlerts() {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    socket = io(
      import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000',
      { auth: { token } }
    );

    socket.on('budget_alert', (data) => {
      const icon = data.severity === 'exceeded' ? '🚨' : '⚠️';
      toast(
        `${icon} ${data.category} budget at ${data.percentage}% — ${data.message}`,
        {
          duration: 6000,
          style: {
            background: data.severity === 'exceeded' ? '#fef2f2' : '#fffbeb',
            color: '#1f2937',
            borderLeft: `4px solid ${data.severity === 'exceeded' ? '#ef4444' : '#f59e0b'}`,
          },
        }
      );
    });

    return () => socket?.disconnect();
  }, []);
}