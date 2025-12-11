import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Template, BoxType, UserFormData, Asset, PremiumUser, DownloadQuality, DeveloperInfo } from '../types';
import { GlassCard } from '../components/GlassCard';
import { VisualSelect } from '../components/VisualSelect';
import { renderCard } from '../utils/canvasRender';
import { TemplateService } from '../services/templateService';
import { AssetService } from '../services/assetService';
import { FontService } from '../services/fontService';
import { UserService } from '../services/userService';

// Icons
const Icons = {
    Back: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
    Premium: () => <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M3 7l3 9h12l3-9-6 4-3-4-3 4-6-4z" fill="#f4c64f"/></svg>,
    Lock: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
    Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><polyline points="20 6 9 17 4 12"/></svg>,
};

export const CardGenerator: React.FC = () => {
  const { channelId } = useParams();
  const [template, setTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState<UserFormData>({});
  const [assets, setAssets] = useState<{ logos: Asset[], ads: Asset[] }>({ logos: [], ads: [] });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  
  // Premium & Watermark State
  const [premiumUser, setPremiumUser] = useState<PremiumUser | null>(null);
  const [showWatermark, setShowWatermark] = useState(true);
  
  // Modals
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  
  // Auth Form
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Dev Info for purchase
  const [devInfo, setDevInfo] = useState<DeveloperInfo | null>(null);

  // Initialization
  useEffect(() => {
    FontService.loadSavedFonts();
    const storedUser = localStorage.getItem('premiumUser');
    if (storedUser) {
        setPremiumUser(JSON.parse(storedUser));
        setShowWatermark(false);
    }
    const fetchDev = async () => {
        const info = await AssetService.getDeveloperInfo();
        setDevInfo(info);
    }
    fetchDev();
  }, []);

  // Load Template and Channel Specific Assets
  useEffect(() => {
    setLoading(true);
    const loadAssetsAndTemplate = async () => {
        if (channelId) {
            const logos = await AssetService.getByChannelAndType(channelId, 'LOGO');
            const ads = await AssetService.getByChannelAndType(channelId, 'ADS');
            setAssets({ logos, ads });

            const templates = await TemplateService.getByChannel(channelId);
            if (templates && templates.length > 0) {
                setTemplate(templates[0]);
            } else {
                const defaults = await TemplateService.getByChannel('1'); 
                if (defaults.length > 0) setTemplate(defaults[0]);
            }
        }
        setLoading(false);
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
            template.watermarkUrl || null, // Use Template Specific Watermark
            showWatermark
        );
    }
  }, [template, formData, assets, showWatermark, premiumUser]);

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
      } else {
          alert("Invalid credentials or expired subscription.");
      }
  };

  const handleLogout = () => {
      localStorage.removeItem('premiumUser');
      setPremiumUser(null);
      setShowWatermark(true);
  };

  const processDownload = async (quality: DownloadQuality) => {
      if (!canvasRef.current || !template) return;
      
      // Check Quota for premium users
      if (premiumUser) {
          if (premiumUser.quota_limit && premiumUser.quota_used >= premiumUser.quota_limit) {
              alert("You have reached your download quota limit. Please contact admin.");
              return;
          }
          await UserService.incrementQuota(premiumUser.id);
      }

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

      const tempCanvas = document.createElement('canvas');
      const assetMap: { [key: string]: string } = {};
      [...assets.logos, ...assets.ads].forEach(a => assetMap[a.id] = a.url);

      renderCard(tempCanvas, template, formData, assetMap, scale, template.watermarkUrl || null, showWatermark).then(() => {
         const link = document.createElement('a');
         link.download = `newscard-${template.name}-${suffix}-${Date.now()}.png`;
         link.href = tempCanvas.toDataURL('image/png', 0.9);
         link.click();
         setGenerating(false);
      });
  };

  const triggerSubscription = () => {
      setShowSubscriptionModal(true);
      setShowContactInfo(false);
  };

  // Skeleton Loading Animation
  if (loading) {
      return (
        <div className="container mx-auto px-4 py-6 animate-pulse">
            <div className="flex justify-between items-center mb-6">
                 <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                     <div className="h-8 w-48 bg-gray-200 rounded"></div>
                 </div>
                 <div className="h-10 w-32 bg-gray-200 rounded-xl"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <div className="w-full aspect-video bg-gray-200 rounded-2xl"></div>
                    <div className="h-6 w-32 bg-gray-200 rounded mx-auto mt-4"></div>
                </div>
                <div className="lg:col-span-1">
                    <div className="h-[500px] bg-white border border-gray-100 rounded-2xl p-6 space-y-6">
                         <div className="h-6 w-40 bg-gray-200 rounded mb-6"></div>
                         <div className="space-y-4">
                            <div className="h-10 w-full bg-gray-100 rounded"></div>
                            <div className="h-20 w-full bg-gray-100 rounded"></div>
                            <div className="h-10 w-full bg-gray-100 rounded"></div>
                         </div>
                         <div className="h-12 w-full bg-gray-200 rounded mt-12"></div>
                    </div>
                </div>
            </div>
        </div>
      );
  }

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
                  <h2 className="text-xl font-bold mb-4 text-center text-gray-800">Premium Login</h2>
                  <form onSubmit={handleLogin} className="space-y-4">
                      <input type="text" placeholder="Username" className="w-full p-2 border rounded bg-white/50 text-gray-800" value={loginUser} onChange={e => setLoginUser(e.target.value)} />
                      <input type="password" placeholder="Password" className="w-full p-2 border rounded bg-white/50 text-gray-800" value={loginPass} onChange={e => setLoginPass(e.target.value)} />
                      <button type="submit" className="w-full py-2 bg-primary text-white rounded font-bold hover:bg-red-600">Login</button>
                  </form>
              </GlassCard>
          </div>
      )}

      {/* Subscription/Purchase Modal (Bangla) */}
      {showSubscriptionModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <GlassCard className="w-full max-w-md p-0 relative overflow-hidden flex flex-col max-h-[90vh]">
                   <button onClick={() => setShowSubscriptionModal(false)} className="absolute top-3 right-3 text-white z-10 bg-black/20 rounded-full p-1 hover:bg-red-500">✕</button>
                   
                   {!showContactInfo ? (
                     <>
                        {/* Header */}
                        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-6 text-center text-white relative overflow-hidden">
                             <div className="absolute top-0 left-0 w-full h-full bg-white/10 animate-shine skew-x-12"></div>
                             <h2 className="text-2xl font-bold relative z-10">Premium Membership</h2>
                             <p className="opacity-90 relative z-10 text-sm">আনলিমিটেড অ্যাক্সেস উপভোগ করুন</p>
                             <div className="mt-4 bg-white text-orange-600 font-extrabold text-3xl inline-block px-4 py-1 rounded-full shadow-lg relative z-10">
                                ৳৯৯ <span className="text-sm font-medium text-gray-500">/মাস</span>
                             </div>
                        </div>
                        
                        {/* Benefits */}
                        <div className="p-6 bg-white space-y-4 flex-1 overflow-y-auto">
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3 text-gray-700 font-medium"><Icons.Check /> আনলিমিটেড টেমপ্লেট ব্যবহার</li>
                                <li className="flex items-center gap-3 text-gray-700 font-medium"><Icons.Check /> কোন ওয়াটারমার্ক থাকবে না</li>
                                <li className="flex items-center gap-3 text-gray-700 font-medium"><Icons.Check /> কোন অ্যাডের ঝামেলা নেই</li>
                                <li className="flex items-center gap-3 text-gray-700 font-medium"><Icons.Check /> ফাস্ট সার্ভার স্পিড</li>
                                <li className="flex items-center gap-3 text-gray-700 font-medium"><Icons.Check /> 4K হাই কোয়ালিটি ডাউনলোড</li>
                            </ul>
                        </div>
                        
                        {/* Action */}
                        <div className="p-4 bg-gray-50 border-t">
                             <button 
                                onClick={() => setShowContactInfo(true)}
                                className="w-full py-3 bg-gradient-to-r from-primary to-red-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform transition active:scale-95"
                             >
                                এখনই কিনুন
                             </button>
                        </div>
                     </>
                   ) : (
                     /* Contact Info View */
                     <div className="flex flex-col h-full">
                         <div className="bg-gray-800 text-white p-6 text-center">
                             <h3 className="text-xl font-bold">অ্যাডমিনের সাথে যোগাযোগ করুন</h3>
                             <p className="text-sm text-gray-400">সাবস্ক্রিপশন চালু করতে নিচে যোগাযোগ করুন</p>
                         </div>
                         <div className="p-6 bg-white flex flex-col items-center justify-center flex-1 space-y-6">
                              {devInfo?.photoUrl && (
                                  <img src={devInfo.photoUrl} className="w-24 h-24 rounded-full border-4 border-gray-200 object-cover" />
                              )}
                              <div className="text-center">
                                  <h4 className="text-xl font-bold text-gray-800">{devInfo?.name || 'Admin'}</h4>
                                  <p className="text-gray-500">{devInfo?.description}</p>
                              </div>
                              <div className="flex gap-4">
                                  {devInfo?.socials?.whatsapp && <a href={devInfo.socials.whatsapp} target="_blank" className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.897.001-6.621 5.413-12.015 12.009-12.015 3.209 0 6.231 1.25 8.502 3.522 2.269 2.273 3.518 5.295 3.516 8.504 0 6.62-5.412 12.015-12.01 12.015-2.045-.002-4.049-.556-5.836-1.637l-6.279 1.672zm9.738-18.107c-3.551 0-6.44 2.889-6.44 6.44 0 3.55 2.889 6.44 6.44 6.44 3.55 0 6.44-2.89 6.44-6.44 0-3.551-2.889-6.44-6.44-6.44z"/></svg></a>}
                                  {devInfo?.socials?.facebook && <a href={devInfo.socials.facebook} target="_blank" className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>}
                                  {devInfo?.socials?.email && <a href={`mailto:${devInfo.socials.email}`} className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></a>}
                              </div>
                              <button onClick={() => setShowContactInfo(false)} className="text-gray-400 hover:text-gray-600 text-sm underline">Back to details</button>
                         </div>
                     </div>
                   )}
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
                       <button onClick={() => premiumUser ? processDownload('2K') : triggerSubscription()} className={`p-3 border rounded-lg flex justify-between items-center ${premiumUser ? 'hover:bg-gray-50 cursor-pointer' : 'bg-gray-50 opacity-90'}`}>
                           <div className="text-left"><span className="font-bold block text-gray-700">2K Resolution</span><span className="text-xs text-gray-500">Sharp (~3MB)</span></div>
                           {premiumUser ? <span className="text-blue-500 font-bold text-sm">PRO</span> : <div className="text-xs font-bold text-yellow-600 flex items-center bg-yellow-100 px-2 py-1 rounded"><Icons.Lock/> PREMIUM</div>}
                       </button>

                       <button onClick={() => premiumUser ? processDownload('4K') : triggerSubscription()} className={`p-3 border rounded-lg flex justify-between items-center ${premiumUser ? 'hover:bg-gray-50 cursor-pointer' : 'bg-gray-50 opacity-90'}`}>
                           <div className="text-left"><span className="font-bold block text-gray-700">4K Ultra HD</span><span className="text-xs text-gray-500">Professional Print (~8MB)</span></div>
                           {premiumUser ? <span className="text-blue-500 font-bold text-sm">PRO</span> : <div className="text-xs font-bold text-yellow-600 flex items-center bg-yellow-100 px-2 py-1 rounded"><Icons.Lock/> PREMIUM</div>}
                       </button>
                   </div>
                   {!premiumUser && <p onClick={() => {setShowDownloadModal(false); setShowLoginModal(true);}} className="text-center text-xs text-primary mt-4 cursor-pointer hover:underline">Already a premium member? Login here</p>}
              </GlassCard>
          </div>
      )}

      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
            <Link to="/" className="text-gray-500 hover:text-primary mr-4 p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all">
                <Icons.Back />
            </Link>
            <h2 className="text-lg md:text-2xl font-bold text-gray-800 line-clamp-1">Create {template.name}</h2>
        </div>
        <div>
            {premiumUser ? (
                <div className="flex items-center gap-2">
                     <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">PRO: {premiumUser.username}</span>
                     <button onClick={handleLogout} className="text-xs text-red-500 hover:underline">Logout</button>
                </div>
            ) : (
                <button 
                    onClick={() => setShowLoginModal(true)} 
                    className="premium-btn"
                    title="Premium Login"
                >
                    <span className="premium-ico"><Icons.Premium /></span>
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
                                triggerSubscription();
                            } else {
                                setShowWatermark(!showWatermark);
                            }
                        }} />
                        <div className={`block w-10 h-6 rounded-full transition-colors ${showWatermark ? 'bg-red-400' : 'bg-gray-300'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showWatermark ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                    <div className="ml-3 text-gray-700 font-medium flex items-center gap-1">
                        Watermark {showWatermark ? 'ON' : 'OFF'} 
                        {!premiumUser && <Icons.Lock />}
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
                // If it's a watermark box but using a static URL provided by template editor, hide it from user form
                // Unless we decide watermarks should be user-editable (usually they aren't, they are fixed branding)
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