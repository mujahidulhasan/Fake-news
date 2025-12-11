import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AssetService } from '../../services/assetService';

export const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
      // Security: Clear token when landing on login page
      localStorage.removeItem('adminToken');
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
        const settings = await AssetService.getSystemSettings();
        // Fallback to default if DB is empty or connection fails
        const validUser = settings.adminUser || "Djkhan@89";
        const validPass = settings.adminPass || "Djkhan@89";

        if (username === validUser && password === validPass) {
            localStorage.setItem('adminToken', 'active');
            navigate('/admin/dashboard', { replace: true });
        } else {
            alert('Invalid credentials.');
        }
    } catch (err) {
        alert('Login failed. Please check connection.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white font-bold text-2xl shadow-lg shadow-red-500/30">N</div>
            <h2 className="text-2xl font-bold text-gray-800">Admin Portal</h2>
            <p className="text-sm text-gray-500">Please authenticate to continue</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-5">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Username</label>
                <input 
                    type="text" 
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                    required
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label>
                <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                    required
                />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-red-500/30 hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-70">
                {loading ? 'Verifying...' : 'Access Dashboard'}
            </button>
        </form>
      </div>
    </div>
  );
};