import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../components/GlassCard';
import { Link } from 'react-router-dom';
import { AssetService } from '../../services/assetService';
import { DeveloperInfo } from '../../types';

export const Settings: React.FC = () => {
    const [adminUser, setAdminUser] = useState('');
    const [adminPass, setAdminPass] = useState('');
    
    // Site Logo
    const [siteLogo, setSiteLogo] = useState('');
    const [siteLogoWidth, setSiteLogoWidth] = useState('150');
    const [siteLogoPos, setSiteLogoPos] = useState('0'); // 0 to 100 percentage

    // Dev Info
    const [devInfo, setDevInfo] = useState<DeveloperInfo>({
        name: '', description: '', photoUrl: '', 
        socials: { facebook: '', whatsapp: '', email: '', youtube: '' }
    });
    
    // Backup
    const [restoring, setRestoring] = useState(false);

    useEffect(() => {
        const load = async () => {
            const settings = await AssetService.getSystemSettings();
            
            // Load Admin Creds
            setAdminUser(settings.adminUser || 'Djkhan@89');
            setAdminPass(settings.adminPass || 'Djkhan@89');

            // Load Site Logo
            setSiteLogo(settings.siteLogo || '');
            setSiteLogoWidth(settings.siteLogoWidth || '150');
            setSiteLogoPos(settings.siteLogoPos || '0');

            // Load Dev Info
            setDevInfo({
                name: settings.name || '',
                description: settings.description || '',
                photoUrl: settings.photoUrl || '',
                socials: settings.socials || {}
            });
        };
        load();
    }, []);

    const saveCredentials = async () => {
        await AssetService.saveAdminCreds(adminUser, adminPass);
        alert('Admin Credentials updated in Database!');
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setSiteLogo(ev.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const saveSiteConfig = async () => {
        await AssetService.saveSiteLogo(siteLogo, siteLogoWidth, siteLogoPos);
        alert('Site Configuration Saved!');
    };

    const handleDevPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setDevInfo(prev => ({ ...prev, photoUrl: ev.target?.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const saveDevInfo = async () => {
        await AssetService.saveDeveloperInfo(devInfo);
        alert("Developer info saved!");
    }
    
    const handleBackup = () => {
        AssetService.createBackup();
    }

    const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        if (!window.confirm("Restoring will overwrite existing data with the same IDs. Continue?")) return;
        
        setRestoring(true);
        try {
            await AssetService.restoreBackup(file);
            alert("System Restored Successfully! Please refresh.");
            window.location.reload();
        } catch (err) {
            alert("Restore Failed: " + err);
        } finally {
            setRestoring(false);
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-6">
                <Link to="/admin/dashboard" className="text-gray-500 hover:text-gray-800">&larr; Back</Link>
                <h1 className="text-2xl font-bold text-gray-800">System Settings</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                        <button onClick={saveCredentials} className="bg-red-500 text-white px-4 py-2 rounded w-full font-bold">Update Login</button>
                    </div>
                </GlassCard>

                {/* Site Configuration (Logo) */}
                <GlassCard className="p-6">
                    <h3 className="text-lg font-bold mb-4 text-gray-700">Site Branding</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2">Header Logo</label>
                            <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-center mb-2 border border-dashed border-gray-300 relative h-24 overflow-hidden">
                                {siteLogo ? (
                                    <div className="absolute top-1/2 transition-all duration-300 transform -translate-y-1/2" 
                                         style={{ 
                                             width: `${siteLogoWidth}px`, 
                                             left: `${siteLogoPos}%`, 
                                             transform: `translate(-${siteLogoPos}%, -50%)` 
                                         }}>
                                        <img src={siteLogo} className="w-full object-contain" />
                                    </div>
                                ) : (
                                    <span className="text-gray-400 text-sm">No Logo Uploaded</span>
                                )}
                            </div>
                            <input type="file" accept="image/*" onChange={handleLogoUpload} className="w-full text-xs" />
                        </div>
                        
                        <div>
                            <div className="flex justify-between">
                                <label className="block text-xs font-bold text-gray-500">Logo Width (px)</label>
                                <span className="text-xs font-mono">{siteLogoWidth}px</span>
                            </div>
                            <input 
                                type="range" min="30" max="300" 
                                value={siteLogoWidth} 
                                onChange={e => setSiteLogoWidth(e.target.value)} 
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between">
                                <label className="block text-xs font-bold text-gray-500">Horizontal Position</label>
                                <span className="text-xs font-mono">{siteLogoPos === '0' ? 'Left' : siteLogoPos === '100' ? 'Right' : siteLogoPos + '%'}</span>
                            </div>
                            <input 
                                type="range" min="0" max="100" 
                                value={siteLogoPos} 
                                onChange={e => setSiteLogoPos(e.target.value)} 
                                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                                <span>Left</span>
                                <span>Right</span>
                            </div>
                        </div>

                        <button onClick={saveSiteConfig} className="bg-blue-600 text-white px-4 py-2 rounded w-full font-bold">Save Branding</button>
                    </div>
                </GlassCard>

                {/* System Tools (Backup) */}
                <GlassCard className="p-6">
                     <h3 className="text-lg font-bold mb-4 text-gray-700">Backup & Restore</h3>
                     <p className="text-xs text-gray-500 mb-4">Export your entire database (Templates, Users, Assets) to a JSON file to prevent data loss.</p>
                     
                     <button onClick={handleBackup} className="w-full py-3 bg-green-600 text-white rounded font-bold hover:bg-green-700 mb-4 flex items-center justify-center gap-2">
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                         Download Backup
                     </button>
                     
                     <div className="border-t pt-4">
                         <label className="block text-xs font-bold text-gray-500 mb-2">Restore from File</label>
                         <input 
                            type="file" 
                            accept=".json" 
                            onChange={handleRestore}
                            disabled={restoring}
                            className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                        />
                        {restoring && <p className="text-xs text-blue-500 mt-2 text-center animate-pulse">Restoring data, please wait...</p>}
                     </div>
                </GlassCard>

                {/* Developer Info */}
                <GlassCard className="p-6">
                    <h3 className="text-lg font-bold mb-4 text-gray-700">Developer Profile</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-full overflow-hidden border">
                                {devInfo.photoUrl && <img src={devInfo.photoUrl} className="w-full h-full object-cover" />}
                            </div>
                            <input type="file" accept="image/*" onChange={handleDevPhotoUpload} className="text-xs" />
                        </div>
                        <input className="w-full p-2 border rounded text-sm" placeholder="Name" value={devInfo.name} onChange={e => setDevInfo({...devInfo, name: e.target.value})} />
                        <textarea className="w-full p-2 border rounded text-sm" placeholder="Short Description" rows={2} value={devInfo.description} onChange={e => setDevInfo({...devInfo, description: e.target.value})} />
                        
                        <h4 className="text-xs font-bold text-gray-500 mt-2">Social Links</h4>
                        <input className="w-full p-2 border rounded text-xs" placeholder="Facebook URL" value={devInfo.socials.facebook} onChange={e => setDevInfo({...devInfo, socials: {...devInfo.socials, facebook: e.target.value}})} />
                        <input className="w-full p-2 border rounded text-xs" placeholder="WhatsApp Link" value={devInfo.socials.whatsapp} onChange={e => setDevInfo({...devInfo, socials: {...devInfo.socials, whatsapp: e.target.value}})} />
                        <input className="w-full p-2 border rounded text-xs" placeholder="Email Address" value={devInfo.socials.email} onChange={e => setDevInfo({...devInfo, socials: {...devInfo.socials, email: e.target.value}})} />
                        <input className="w-full p-2 border rounded text-xs" placeholder="YouTube URL" value={devInfo.socials.youtube} onChange={e => setDevInfo({...devInfo, socials: {...devInfo.socials, youtube: e.target.value}})} />

                        <button onClick={saveDevInfo} className="bg-gray-800 text-white px-4 py-2 rounded w-full mt-2">Save Profile</button>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};