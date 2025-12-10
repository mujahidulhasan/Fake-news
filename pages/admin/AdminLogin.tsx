import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../../components/GlassCard';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login logic
    if (email === 'admin@admin.com' && password === 'admin') {
        localStorage.setItem('adminToken', 'mock-jwt-token');
        navigate('/admin/dashboard');
    } else {
        alert('Invalid credentials. Use admin@admin.com / admin');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <GlassCard className="w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Admin Panel</h2>
        <form onSubmit={handleLogin} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 bg-white/50"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 bg-white/50"
                    required
                />
            </div>
            <button type="submit" className="w-full bg-primary text-white py-2 rounded-md hover:bg-red-600 transition">
                Login
            </button>
        </form>
      </GlassCard>
    </div>
  );
};