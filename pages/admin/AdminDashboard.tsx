import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GlassCard } from '../../components/GlassCard';
import { AssetService } from '../../services/assetService';

export const AdminDashboard: React.FC = () => {
  const [assetCount, setAssetCount] = useState(0);

  useEffect(() => {
      const loadStats = async () => {
          const assets = await AssetService.getAll();
          setAssetCount(assets.length);
      };
      loadStats();
  }, []);

  // Mock Storage calculation: Assumes 500KB per asset average. Max 500MB (Supabase free tier varies but just visual)
  const usedMB = (assetCount * 0.5);
  const totalMB = 500; 
  const usedPercent = Math.min((usedMB / totalMB) * 100, 100);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <div className="flex gap-4">
            <Link to="/" className="px-4 py-2 bg-white text-gray-700 font-semibold rounded shadow hover:bg-gray-50 transition flex items-center gap-2">
                <span>View Live Site</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </Link>
            <button className="text-white bg-gray-800 px-4 py-2 rounded font-semibold hover:bg-gray-700" onClick={() => {
                localStorage.removeItem('adminToken');
                window.location.href = '/admin/login';
            }}>Logout</button>
        </div>
      </div>
      
      {/* Storage Slider */}
      <div className="mb-8">
          <GlassCard className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex justify-between items-end mb-2">
                  <div>
                      <h4 className="font-bold text-gray-700">Storage Usage</h4>
                      <p className="text-xs text-gray-500">Based on asset count estimation ({assetCount} assets)</p>
                  </div>
                  <span className="text-sm font-bold text-indigo-600">{usedMB.toFixed(1)} MB / {totalMB} MB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden border border-gray-300">
                  <div 
                    className="bg-indigo-500 h-4 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${usedPercent}%` }}
                  ></div>
              </div>
          </GlassCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="p-6 flex flex-col items-center text-center group cursor-pointer hover:bg-white/60">
            <div className="text-4xl mb-4 p-4 bg-blue-100 rounded-full text-blue-500 group-hover:scale-110 transition-transform">📺</div>
            <h3 className="text-xl font-bold mb-2">Channels</h3>
            <p className="text-gray-500 mb-4 text-sm">Manage news channels, logos and descriptions.</p>
            <Link to="/admin/channels" className="bg-gray-100 text-gray-600 px-4 py-2 rounded hover:bg-blue-500 hover:text-white transition w-full text-sm font-medium inline-block">Manage Channels</Link>
        </GlassCard>

        <GlassCard className="p-6 flex flex-col items-center text-center group cursor-pointer hover:bg-white/60">
            <div className="text-4xl mb-4 p-4 bg-primary/10 rounded-full text-primary group-hover:scale-110 transition-transform">🎨</div>
            <h3 className="text-xl font-bold mb-2">Templates</h3>
            <p className="text-gray-500 mb-4 text-sm">Create and edit drag-drop layouts for news cards.</p>
            <Link to="/admin/editor" className="bg-primary text-white px-4 py-2 rounded hover:bg-red-600 transition w-full text-sm font-medium inline-block">
                Open Editor
            </Link>
        </GlassCard>

        <GlassCard className="p-6 flex flex-col items-center text-center group cursor-pointer hover:bg-white/60">
            <div className="text-4xl mb-4 p-4 bg-purple-100 rounded-full text-purple-600 group-hover:scale-110 transition-transform">👥</div>
            <h3 className="text-xl font-bold mb-2">User Control</h3>
            <p className="text-gray-500 mb-4 text-sm">Manage Premium members, passwords and access.</p>
            <Link to="/admin/users" className="bg-gray-100 text-gray-600 px-4 py-2 rounded hover:bg-purple-500 hover:text-white transition w-full text-sm font-medium">Manage Users</Link>
        </GlassCard>

        <GlassCard className="p-6 flex flex-col items-center text-center group cursor-pointer hover:bg-white/60">
            <div className="text-4xl mb-4 p-4 bg-gray-100 rounded-full text-gray-600 group-hover:scale-110 transition-transform">⚙️</div>
            <h3 className="text-xl font-bold mb-2">Settings</h3>
            <p className="text-gray-500 mb-4 text-sm">Admin Password, Watermark Overlay, etc.</p>
            <Link to="/admin/settings" className="bg-gray-100 text-gray-600 px-4 py-2 rounded hover:bg-gray-800 hover:text-white transition w-full text-sm font-medium">Open Settings</Link>
        </GlassCard>
      </div>
    </div>
  );
};