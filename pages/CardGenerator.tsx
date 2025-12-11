import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Template, BoxType, UserFormData, Asset, PremiumUser, DownloadQuality } from '../types';
import { GlassCard } from '../components/GlassCard';
import { VisualSelect } from '../components/VisualSelect';
import { renderCard } from '../utils/canvasRender';
import { TemplateService } from '../services/templateService';
import { AssetService } from '../services/assetService';
import { FontService } from '../services/fontService';
import { UserService } from '../services/userService';

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

export const CardGenerator: React.FC = () => {
  const { channelId } = useParams();
  const [template, setTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState<UserFormData>({});
  const [assets, setAssets] = useState<{ logos: Asset[], ads: Asset[] }>({ logos: [], ads: [] });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Premium & Watermark State
  const [premiumUser, setPremiumUser] = useState<PremiumUser | null>(null);
  const [watermarkUrl, setWatermarkUrl] = useState<string | null>(null);
  const [showWatermark, setShowWatermark] = useState(true);
  
  // Download Modal State
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Login Modal State
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Initialization
  useEffect(() => {
    FontService.loadSavedFonts();
    const storedUser = localStorage.getItem('premiumUser');
    if (storedUser) {
        setPremiumUser(JSON.parse(storedUser));
        setShowWatermark(false); // Default off for premium
    }
  }, []);

  // Load Template and Channel Specific Assets
  useEffect(() => {
    const loadAssetsAndTemplate = async () => {
        // Get System Watermark
        const wm = await AssetService.getSystemWatermark();
        setWatermarkUrl(wm);

        if (channelId) {
            // Load Channel Specific Assets
            const logos = await AssetService.getByChannelAndType(channelId, 'LOGO');
            const ads = await AssetService.getByChannelAndType(channelId, 'ADS');
            setAssets({ logos, ads });

            const templates = await TemplateService.getByChannel(channelId);
            if (templates && templates.length > 0) {
                setTemplate(templates[0]);
            } else {
                const defaults = await TemplateService.getByChannel('1'); // Fallback logic
                if (defaults.length > 0) setTemplate(defaults[0]);
            }
        }
    };
    loadAssetsAndTemplate();
  }, [channelId]);

  // Live Render
  useEffect(() => {
    if (template && canvasRef.current) {
        const assetMap: { [key: string]: string } = {};
        [...assets.logos, ...assets.ads].forEach(a => assetMap[a.id] = a.url);

        renderCard(
            canvasRef.current, 
            template, 
            formData, 
            assetMap, 
            1, // Preview scale
            watermarkUrl, 
            showWatermark
        );
    }
  }, [template, formData, assets, showWatermark, watermarkUrl, premiumUser]);

  const handleInputChange = (key: string, value: string | File) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      const user = await UserService.login(loginUser, loginPass);
      if (user) {
          localStorage.setItem('premiumUser', JSON.stringify(user));
          setPremiumUser(user);
          setShowLoginModal(false);
          setShowWatermark(false);
          alert(`Welcome back, ${user.username}!`);
      } else {
          alert("Invalid credentials or expired subscription.");
      }
  };

  const handleLogout = () => {
      localStorage.removeItem('premiumUser');
      setPremiumUser(null);
      setShowWatermark(true);
  };

  const processDownload = (quality: DownloadQuality) => {
      if (!canvasRef.current || !template) return;
      setGenerating(true);
      setShowDownloadModal(false);

      let scale = 1;
      let suffix = 'HD';

      switch(quality) {
          case 'SD': scale = 0.7; suffix='SD'; break;
          case 'HD': scale = 1.0; suffix='HD'; break;
          case '2K': scale = 2.0; suffix='2K'; break;
          case '4K': scale = 4.0; suffix='4K'; break;
      }

      // Create a temporary hidden canvas for high-res rendering
      const tempCanvas = document.createElement('canvas');
      const assetMap: { [key: string]: string } = {};
      [...assets.logos, ...assets.ads].forEach(a => assetMap[a.id] = a.url);

      renderCard(tempCanvas, template, formData, assetMap, scale, watermarkUrl, showWatermark).then(() => {
         const link = document.createElement('a');
         link.download = `newscard-${template.name}-${suffix}-${Date.now()}.png`;
         link.href = tempCanvas.toDataURL('image/png', 0.9);
         link.click();
         setGenerating(false);
      });
  };

  if (!template) return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-500">
          <p className="mb-4">No template found for this channel.</p>
          <Link to="/" className="text-primary hover:underline">Go Back</Link>
      </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Login Modal */}
      {showLoginModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <GlassCard className="w-full max-w-sm p-6 relative">
                  <button onClick={() => setShowLoginModal(false)} className="absolute top-2 right-2 text-gray-500 hover:text-red-500">✕</button>
                  <h2 className="text-xl font-bold mb-4 text-center">Premium Login</h2>
                  <form onSubmit={handleLogin} className="space-y-4">
                      <input type="text" placeholder="Username" className="w-full p-2 border rounded bg-white/50" value={loginUser} onChange={e => setLoginUser(e.target.value)} />
                      <input type="password" placeholder="Password" className="w-full p-2 border rounded bg-white/50" value={loginPass} onChange={e => setLoginPass(e.target.value)} />
                      <button type="submit" className="w-full py-2 bg-primary text-white rounded font-bold hover:bg-red-600">Login</button>
                  </form>
              </GlassCard>
          </div>
      )}

      {/* Download Options Modal */}
      {showDownloadModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <GlassCard className="w-full max-w-md p-6 relative animate-in zoom-in-95">
                   <button onClick={() => setShowDownloadModal(false)} className="absolute top-2 right-2 text-gray-500 hover:text-red-500">✕</button>
                   <h3 className="text-xl font-bold mb-6 text-center text-gray-800">Select Image Quality</h3>
                   <div className="grid grid-cols-1 gap-3">
                       <button onClick={() => processDownload('SD')} className="p-3 border rounded-lg hover:bg-gray-50 flex justify-between items-center group">
                           <div className="text-left"><span className="font-bold block text-gray-700">Standard (SD)</span><span className="text-xs text-gray-500">Fast, Lower Quality (~500KB)</span></div>
                           <span className="text-green-500 font-bold text-sm">FREE</span>
                       </button>
                       <button onClick={() => processDownload('HD')} className="p-3 border rounded-lg hover:bg-gray-50 flex justify-between items-center group">
                           <div className="text-left"><span className="font-bold block text-gray-700">High Definition (HD)</span><span className="text-xs text-gray-500">Good for Social Media (~1.5MB)</span></div>
                           <span className="text-green-500 font-bold text-sm">FREE</span>
                       </button>
                       
                       {/* Premium Options */}
                       <button onClick={() => premiumUser ? processDownload('2K') : null} className={`p-3 border rounded-lg flex justify-between items-center ${premiumUser ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-60 bg-gray-50 cursor-not-allowed'}`}>
                           <div className="text-left"><span className="font-bold block text-gray-700">2K Resolution</span><span className="text-xs text-gray-500">Sharp (~3MB)</span></div>
                           {premiumUser ? <span className="text-blue-500 font-bold text-sm">PRO</span> : <div className="text-xs font-bold text-gray-500 flex items-center">PREMIUM <LockIcon/></div>}
                       </button>

                       <button onClick={() => premiumUser ? processDownload('4K') : null} className={`p-3 border rounded-lg flex justify-between items-center ${premiumUser ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-60 bg-gray-50 cursor-not-allowed'}`}>
                           <div className="text-left"><span className="font-bold block text-gray-700">4K Ultra HD</span><span className="text-xs text-gray-500">Professional Print (~8MB)</span></div>
                           {premiumUser ? <span className="text-blue-500 font-bold text-sm">PRO</span> : <div className="text-xs font-bold text-gray-500 flex items-center">PREMIUM <LockIcon/></div>}
                       </button>
                   </div>
                   {!premiumUser && <p onClick={() => {setShowDownloadModal(false); setShowLoginModal(true);}} className="text-center text-xs text-primary mt-4 cursor-pointer hover:underline">Already a premium member? Login here</p>}
              </GlassCard>
          </div>
      )}

      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
            <Link to="/" className="text-gray-500 hover:text-primary mr-4">&larr; Back</Link>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Create {template.name}</h2>
        </div>
        <div>
            {premiumUser ? (
                <div className="flex items-center gap-2">
                     <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">PRO: {premiumUser.username}</span>
                     <button onClick={handleLogout} className="text-xs text-red-500 hover:underline">Logout</button>
                </div>
            ) : (
                <button onClick={() => setShowLoginModal(true)} className="text-sm font-bold text-primary hover:text-red-700 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                    Premium Login
                </button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Preview */}
        <div className="lg:col-span-2 space-y-4">
           <GlassCard className="p-2 flex flex-col items-center justify-center bg-gray-900/10 overflow-hidden">
             {/* Dynamic Aspect Ratio Box */}
             <div className="relative w-full" style={{ aspectRatio: `${template.width} / ${template.height}` }}>
                <canvas 
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full shadow-2xl rounded-lg"
                />
             </div>
           </GlassCard>
           
           {/* Watermark Toggle */}
           <div className="flex items-center justify-center gap-2 text-sm">
                <label className="flex items-center cursor-pointer select-none">
                    <div className="relative">
                        <input type="checkbox" className="sr-only" checked={showWatermark} onChange={() => {
                            if(!premiumUser) {
                                alert("Watermark removal is for Premium members only.");
                                setShowLoginModal(true);
                            } else {
                                setShowWatermark(!showWatermark);
                            }
                        }} />
                        <div className={`block w-10 h-6 rounded-full transition-colors ${showWatermark ? 'bg-red-400' : 'bg-gray-300'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showWatermark ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                    <div className="ml-3 text-gray-700 font-medium">
                        Watermark {showWatermark ? 'ON' : 'OFF'} 
                        {!premiumUser && <span className="ml-1 text-xs text-gray-400">(Premium Only)</span>}
                    </div>
                </label>
           </div>
        </div>

        {/* Right: Form */}
        <div className="lg:col-span-1">
          <GlassCard className="sticky top-6">
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-200 pb-2">Customize Content</h3>
            
            <div className="space-y-4">
              {template.boxes.map(box => {
                if (box.type === BoxType.WATERMARK) return null;
                if (box.type === BoxType.LOGO && box.staticUrl) return null;

                return (
                  <div key={box.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                        {box.key.replace(/_/g, ' ')}
                    </label>
                    
                    {box.type === BoxType.TEXT && (
                        <textarea
                            className="w-full p-2 rounded bg-white/50 border border-gray-300 focus:ring-2 focus:ring-primary/50 outline-none resize-y min-h-[80px]"
                            placeholder={`Enter ${box.key}`}
                            onChange={(e) => handleInputChange(box.key, e.target.value)}
                            rows={3}
                        />
                    )}

                    {box.type === BoxType.IMAGE && (
                        <input 
                            type="file" 
                            accept="image/*"
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                            onChange={(e) => {
                                if (e.target.files?.[0]) {
                                    handleInputChange(box.key, e.target.files[0]);
                                }
                            }}
                        />
                    )}
                    
                    {/* VISUAL SELECT FOR LOGO OR ADS */}
                    {(box.type === BoxType.LOGO || box.type === BoxType.ADS) && !box.staticUrl && (
                        <VisualSelect 
                            placeholder={`Select ${box.type === BoxType.LOGO ? 'Logo' : 'Ad'}...`}
                            assets={box.type === BoxType.LOGO ? assets.logos : assets.ads}
                            selectedId={formData[box.key] as string}
                            onChange={(id) => handleInputChange(box.key, id)}
                        />
                    )}
                  </div>
                );
              })}

              <button 
                onClick={() => setShowDownloadModal(true)}
                disabled={generating}
                className={`w-full py-3 mt-6 rounded-lg font-bold text-white shadow-lg transform transition active:scale-95 flex items-center justify-center gap-2 ${generating ? 'bg-gray-400' : 'bg-gradient-to-r from-primary to-red-600 hover:shadow-red-500/30'}`}
              >
                {generating ? 'Processing...' : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        Download Image
                    </>
                )}
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};