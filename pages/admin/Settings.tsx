import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../components/GlassCard';
import { Link } from 'react-router-dom';
import { AssetService } from '../../services/assetService';

export const Settings: React.FC = () => {
    const [adminUser, setAdminUser] = useState(localStorage.getItem('admin_user') || 'Djkhan@89');
    const [adminPass, setAdminPass] = useState(localStorage.getItem('admin_pass') || 'Djkhan@89');
    const [watermarkUrl, setWatermarkUrl] = useState<string | null>(null);

    useEffect(() => {
        const loadWm = async () => {
            const wm = await AssetService.getSystemWatermark();
            setWatermarkUrl(wm);
        };
        loadWm();
    }, []);

    const saveCredentials = () => {
        localStorage.setItem('admin_user', adminUser);
        localStorage.setItem('admin_pass', adminPass);
        alert('Credentials updated!');
    };

    const resetCredentials = () => {
        setAdminUser('Djkhan@89');
        setAdminPass('Djkhan@89');
        localStorage.removeItem('admin_user');
        localStorage.removeItem('admin_pass');
        alert('Reset to defaults.');
    };

    const handleWmUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (ev) => {
                const url = ev.target?.result as string;
                await AssetService.setSystemWatermark(url);
                setWatermarkUrl(url);
                alert("Watermark uploaded successfully.");
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-6">
                <Link to="/admin/dashboard" className="text-gray-500 hover:text-gray-800">&larr; Back</Link>
                <h1 className="text-2xl font-bold text-gray-800">System Settings</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Admin Credentials */}
                <GlassCard className="p-6">
                    <h3 className="text-lg font-bold mb-4 text-gray-700">Admin Security</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500">Admin Username</label>
                            <input className="w-full p-2 border rounded" value={adminUser} onChange={e => setAdminUser(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500">Admin Password</label>
                            <input className="w-full p-2 border rounded" type="text" value={adminPass} onChange={e => setAdminPass(e.target.value)} />
                        </div>
                        <div className="flex gap-2">
                            <button onClick={saveCredentials} className="bg-primary text-white px-4 py-2 rounded flex-1">Update</button>
                            <button onClick={resetCredentials} className="bg-gray-200 text-gray-700 px-4 py-2 rounded flex-1">Reset Default</button>
                        </div>
                    </div>
                </GlassCard>

                {/* Watermark Settings */}
                <GlassCard className="p-6">
                    <h3 className="text-lg font-bold mb-4 text-gray-700">Global Watermark Overlay</h3>
                    <p className="text-xs text-gray-500 mb-4">This image will be overlaid on all generated cards for free users.</p>
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center min-h-[150px]">
                        {watermarkUrl ? (
                            <img src={watermarkUrl} alt="Current Watermark" className="h-24 object-contain mb-2" />
                        ) : (
                            <span className="text-gray-400 text-sm mb-2">No watermark set</span>
                        )}
                        <input type="file" accept="image/*" onChange={handleWmUpload} className="text-sm text-gray-500" />
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};