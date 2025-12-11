import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../../components/GlassCard';

const DEFAULT_USER = "Djkhan@89";
const DEFAULT_PASS = "Djkhan@89";

export const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check localStorage first, then default
    const storedUser = localStorage.getItem('admin_user') || DEFAULT_USER;
    const storedPass = localStorage.getItem('admin_pass') || DEFAULT_PASS;

    if (username === storedUser && password === storedPass) {
        localStorage.setItem('adminToken', 'active');
        navigate('/admin/dashboard');
    } else {
        alert('Invalid credentials.');
    }
  };

  const handleReset = () => {
      // Hidden feature or just for this demo request
      if (window.confirm("Reset admin credentials to default (Djkhan@89)?")) {
          localStorage.removeItem('admin_user');
          localStorage.removeItem('admin_pass');
          alert("Credentials reset to default.");
      }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <GlassCard className="w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Admin Panel</h2>
        <form onSubmit={handleLogin} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input 
                    type="text" 
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary p-2 bg-white/50"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary p-2 bg-white/50"
                    required
                />
            </div>
            <button type="submit" className="w-full bg-primary text-white py-2 rounded-md hover:bg-red-600 transition font-bold">
                Login
            </button>
        </form>
        <button onClick={handleReset} className="mt-4 text-xs text-gray-400 hover:text-gray-600 w-full text-center">Reset Credentials</button>
      </GlassCard>
    </div>
  );
};