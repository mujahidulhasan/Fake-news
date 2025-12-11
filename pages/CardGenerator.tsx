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
    Premium: () => <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M3 7l3 9h12l3-9-6 4-3-4-3 4-6-4z" fill="url(#g1)"/><defs><linearGradient id="g1" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#fff6d6"/><stop offset="1" stopColor="#f4c64f"/></linearGradient></defs></svg>,
    Lock: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
    Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><polyline points="20 6 9 17 4 12"/></svg>,
    Search: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.7 }}><path d="M21 21l-4.35-4.35" stroke="#6b7280" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><circle cx="11" cy="11" r="6" stroke="#6b7280" strokeWidth="1.6"/></svg>,
    Caret: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.7, marginLeft: 6 }}><path d="M6 9l6 6 6-6" stroke="#374151" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
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
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  
  // Auth Form
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Dev Info & Site Config
  const [devInfo, setDevInfo] = useState<DeveloperInfo | null>(null);
  const [siteLogo, setSiteLogo] = useState('');
  const [siteLogoWidth, setSiteLogoWidth] = useState('150');
  const [siteLogoPos, setSiteLogoPos] = useState('0');

  // Initialization
  useEffect(() => {
    // Optimization: Load fonts non-blocking or early
    FontService.loadSavedFonts(); 
    
    const storedUser = localStorage.getItem('premiumUser');
    if (storedUser) {
        const user = JSON.parse(storedUser);
        setPremiumUser(user);
        setShowWatermark(false); 
    }
    const fetchSettings = async () => {
        const settings = await AssetService.getSystemSettings();
        setDevInfo({
            name: settings.name,
            description: settings.description,
            photoUrl: settings.photoUrl,
            socials: settings.socials
        } as DeveloperInfo);
        setSiteLogo(settings.siteLogo || '');
        setSiteLogoWidth(settings.siteLogoWidth || '150');
        setSiteLogoPos(settings.siteLogoPos || '0');
    }
    fetchSettings();
  }, []);

  // Load Template and Channel Specific Assets
  useEffect(() => {
    setLoading(true);
    const loadAssetsAndTemplate = async () => {
        if (channelId) {
            // Optimization: Parallel fetching
            const [logos, ads, templates] = await Promise.all([
                AssetService.getByChannelAndType(channelId, 'LOGO'),
                AssetService.getByChannelAndType(channelId, 'ADS'),
                TemplateService.getByChannel(channelId, 1) // Optimization: Limit to 1
            ]);
            
            setAssets({ logos, ads });

            if (templates && templates.length > 0) {
                setTemplate(templates[0]);
            } else {
                // Fallback
                const defaults = await TemplateService.getByChannel('1', 1); 
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
            // If showWatermark is TRUE, pass URL. If FALSE, pass null.
            showWatermark ? (template.watermarkUrl || null) : null, 
            showWatermark // Pass boolean to force hide boxes if false
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
          setShowWatermark(false); // Turn off watermark immediately on login
      } else {
          alert("Invalid credentials or expired subscription.");
      }
  };

  const handleLogout = () => {
      localStorage.removeItem('premiumUser');
      setPremiumUser(null);
      setShowWatermark(true);
      setShowUserDropdown(false);
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
          setPremiumUser({...premiumUser, quota_used: premiumUser.quota_used + 1});
          localStorage.setItem('premiumUser', JSON.stringify({...premiumUser, quota_used: premiumUser.quota_used + 1}));
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

      renderCard(tempCanvas, template, formData, assetMap, scale, showWatermark ? (template.watermarkUrl || null) : null, showWatermark).then(() => {
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

  // Close dropdown on click outside
  useEffect(() => {
      const closeDrop = (e: MouseEvent) => {
          if (showUserDropdown && !(e.target as Element).closest('#userWrap')) {
              setShowUserDropdown(false);
          }
      };
      document.addEventListener('click', closeDrop);
      return () => document.removeEventListener('click', closeDrop);
  }, [showUserDropdown]);

  const formatDate = (dateStr: string) => {
      const d = new Date(dateStr);
      return d.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (loading) {
      return (
        <div className="container mx-auto px-4 py-6 animate-pulse">
             <div className="h-16 bg-gray-200 rounded mb-4"></div>
             <div className="h-96 bg-gray-200 rounded"></div>
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
    <div className="min-h-screen bg-gray-50">
      {/* Login Modal */}
      {showLoginModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              <div className="w-full max-w-sm p-8 bg-white rounded-2xl shadow-2xl relative animate-in zoom-in-95">
                  <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors">✕</button>
                  <div className="text-center mb-6">
                      <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3"><Icons.Lock /></div>
                      <h2 className="text-2xl font-bold text-gray-900">Premium Login</h2>
                      <p className="text-sm text-gray-500">Access exclusive features</p>
                  </div>
                  <form onSubmit={handleLogin} className="space-y-4">
                      <input type="text" placeholder="Username" className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none bg-gray-50 focus:bg-white focus:ring-2 focus:ring-yellow-400" value={loginUser} onChange={e => setLoginUser(e.target.value)} />
                      <input type="password" placeholder="Password" className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none bg-gray-50 focus:bg-white focus:ring-2 focus:ring-yellow-400" value={loginPass} onChange={e => setLoginPass(e.target.value)} />
                      <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl font-bold hover:shadow-lg transform active:scale-95 transition-all text-sm uppercase tracking-wide">Unlock Premium</button>
                  </form>
              </div>
          </div>
      )}

      {/* Subscription Modal */}
      {showSubscriptionModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh] animate-in zoom-in-95">
                   <button onClick={() => setShowSubscriptionModal(false)} className="absolute top-3 right-3 text-white z-20 bg-black/20 rounded-full p-1 hover:bg-red-500 transition-colors">✕</button>
                   {!showContactInfo ? (
                     <>
                        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-8 text-center text-white relative overflow-hidden">
                             <div className="absolute top-0 left-0 w-full h-full bg-white/10 animate-shine skew-x-12"></div>
                             <h2 className="text-2xl font-bold relative z-10 font-sans">Premium Membership</h2>
                             <p className="opacity-90 relative z-10 text-sm mt-1">আনলিমিটেড অ্যাক্সেস উপভোগ করুন</p>
                             <div className="mt-5 bg-white text-orange-600 font-extrabold text-3xl inline-block px-6 py-2 rounded-full shadow-xl relative z-10">৳৯৯ <span className="text-sm font-medium text-gray-500">/মাস</span></div>
                        </div>
                        <div className="p-8 bg-white space-y-4 flex-1 overflow-y-auto">
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3 text-gray-700 font-medium"><div className="p-1 bg-green-100 rounded-full text-green-600"><Icons.Check /></div> আনলিমিটেড টেমপ্লেট ব্যবহার</li>
                                <li className="flex items-center gap-3 text-gray-700 font-medium"><div className="p-1 bg-green-100 rounded-full text-green-600"><Icons.Check /></div> কোন ওয়াটারমার্ক থাকবে না</li>
                                <li className="flex items-center gap-3 text-gray-700 font-medium"><div className="p-1 bg-green-100 rounded-full text-green-600"><Icons.Check /></div> কোন অ্যাডের ঝামেলা নেই</li>
                                <li className="flex items-center gap-3 text-gray-700 font-medium"><div className="p-1 bg-green-100 rounded-full text-green-600"><Icons.Check /></div> ফাস্ট সার্ভার স্পিড</li>
                                <li className="flex items-center gap-3 text-gray-700 font-medium"><div className="p-1 bg-green-100 rounded-full text-green-600"><Icons.Check /></div> 4K হাই কোয়ালিটি ডাউনলোড</li>
                            </ul>
                        </div>
                        <div className="p-6 bg-gray-50 border-t border-gray-100">
                             <button onClick={() => setShowContactInfo(true)} className="w-full py-3.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-red-500/30 hover:scale-[1.02] transform transition-all">এখনই কিনুন</button>
                        </div>
                     </>
                   ) : (
                     <div className="flex flex-col h-full">
                         <div className="bg-gray-900 text-white p-8 text-center">
                             <h3 className="text-xl font-bold">অ্যাডমিনের সাথে যোগাযোগ করুন</h3>
                             <p className="text-sm text-gray-400 mt-1">সাবস্ক্রিপশন চালু করতে নিচে যোগাযোগ করুন</p>
                         </div>
                         <div className="p-8 bg-white flex flex-col items-center justify-center flex-1 space-y-6">
                              {devInfo?.photoUrl && <img src={devInfo.photoUrl} className="w-24 h-24 rounded-full border-4 border-white shadow-xl object-cover" />}
                              <div className="text-center">
                                  <h4 className="text-xl font-bold text-gray-900">{devInfo?.name || 'Admin'}</h4>
                                  <p className="text-gray-500">{devInfo?.description}</p>
                              </div>
                              <div className="flex gap-4">
                                  {devInfo?.socials?.whatsapp && <a href={devInfo.socials.whatsapp} target="_blank" className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 shadow-lg"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.897.001-6.621 5.413-12.015 12.009-12.015 3.209 0 6.231 1.25 8.502 3.522 2.269 2.273 3.518 5.295 3.516 8.504 0 6.62-5.412 12.015-12.01 12.015-2.045-.002-4.049-.556-5.836-1.637l-6.279 1.672zm9.738-18.107c-3.551 0-6.44 2.889-6.44 6.44 0 3.55 2.889 6.44 6.44 6.44 3.55 0 6.44-2.89 6.44-6.44 0-3.551-2.889-6.44-6.44-6.44z"/></svg></a>}
                                  {devInfo?.socials?.facebook && <a href={devInfo.socials.facebook} target="_blank" className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-lg"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>}
                              </div>
                              <button onClick={() => setShowContactInfo(false)} className="text-gray-400 hover:text-gray-600 text-sm underline">Back to details</button>
                         </div>
                     </div>
                   )}
              </div>
          </div>
      )}

      {/* Download Options Modal */}
      {showDownloadModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl relative p-6 animate-in zoom-in-95">
                   <button onClick={() => setShowDownloadModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors">✕</button>
                   <h3 className="text-xl font-bold mb-1 text-center text-gray-800">Select Quality</h3>
                   <p className="text-center text-sm text-gray-500 mb-6">Choose resolution for your news card</p>
                   <div className="grid grid-cols-1 gap-3">
                       <button onClick={() => processDownload('SD')} className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 flex justify-between items-center group"><div className="text-left"><span className="font-bold block text-gray-800">Standard (SD)</span><span className="text-xs text-gray-500">Fast, Lower Quality (~500KB)</span></div><span className="text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded">FREE</span></button>
                       <button onClick={() => processDownload('HD')} className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 flex justify-between items-center group"><div className="text-left"><span className="font-bold block text-gray-800">High Definition (HD)</span><span className="text-xs text-gray-500">Good for Social Media (~1.5MB)</span></div><span className="text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded">FREE</span></button>
                       <button onClick={() => premiumUser ? processDownload('2K') : triggerSubscription()} className={`p-4 border rounded-xl flex justify-between items-center transition-all ${premiumUser ? 'hover:bg-blue-50 border-blue-100 hover:border-blue-300 cursor-pointer' : 'bg-gray-50 border-gray-100 opacity-80'}`}><div className="text-left"><span className="font-bold block text-gray-800">2K Resolution</span><span className="text-xs text-gray-500">Sharp Details (~3MB)</span></div>{premiumUser ? <span className="text-blue-600 font-bold text-xs bg-blue-50 px-2 py-1 rounded">PRO</span> : <div className="text-[10px] font-bold text-yellow-700 flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded"><Icons.Lock/> PREMIUM</div>}</button>
                       <button onClick={() => premiumUser ? processDownload('4K') : triggerSubscription()} className={`p-4 border rounded-xl flex justify-between items-center transition-all ${premiumUser ? 'hover:bg-blue-50 border-blue-100 hover:border-blue-300 cursor-pointer' : 'bg-gray-50 border-gray-100 opacity-80'}`}><div className="text-left"><span className="font-bold block text-gray-800">4K Ultra HD</span><span className="text-xs text-gray-500">Professional Print (~8MB)</span></div>{premiumUser ? <span className="text-blue-600 font-bold text-xs bg-blue-50 px-2 py-1 rounded">PRO</span> : <div className="text-[10px] font-bold text-yellow-700 flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded"><Icons.Lock/> PREMIUM</div>}</button>
                   </div>
                   {!premiumUser && <p onClick={() => {setShowDownloadModal(false); setShowLoginModal(true);}} className="text-center text-xs text-blue-500 mt-6 cursor-pointer hover:underline font-medium">Already a premium member? Login here</p>}
              </div>
          </div>
      )}

      {/* HEADER */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between h-16 relative">
              {/* Logo Area */}
              <div className="absolute inset-0 flex items-center px-4 pointer-events-none">
                <div 
                    className="relative transition-all duration-300 pointer-events-auto"
                    style={{ 
                        left: `max(0px, min(calc(100% - ${siteLogoWidth}px), ${siteLogoPos}%))`, 
                        transform: `translateX(-${siteLogoPos}%)`
                    }}
                >
                    {siteLogo ? (
                       <img src={siteLogo} style={{ width: `${Number(siteLogoWidth) * 0.6}px` }} className="object-contain max-h-12" alt="Logo" />
                    ) : (
                        /* Default Branding removed as requested */
                        <div />
                    )}
                </div>
              </div>

              {/* Left Controls (Back) - Z-Index higher to be clickable over logo area */}
              <div className="relative z-10 flex items-center">
                  <Link to="/" className="text-gray-400 hover:text-gray-600 transition-colors p-2 bg-gray-50 rounded-full hover:bg-gray-100 shadow-sm"><Icons.Back /></Link>
              </div>

              {/* Right: User Menu */}
              <div className="relative z-10 flex items-center gap-4">
                  <div className="relative" id="userWrap">
                      {premiumUser ? (
                          // LOGGED IN STATE
                          <div>
                              <div 
                                onClick={() => setShowUserDropdown(!showUserDropdown)}
                                className="flex items-center gap-2 p-1.5 pr-3 bg-white border border-gray-100 rounded-xl cursor-pointer hover:shadow-md transition-shadow select-none"
                              >
                                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold shadow-sm">
                                      {premiumUser.username.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="hidden sm:flex flex-col items-start">
                                      <span className="text-xs font-bold text-gray-800 leading-none">{premiumUser.username}</span>
                                      <span className="text-[10px] text-yellow-600 font-bold bg-yellow-50 px-1.5 py-0.5 rounded mt-0.5 border border-yellow-100">PREMIUM</span>
                                  </div>
                                  <Icons.Caret />
                              </div>

                              {/* Dropdown Panel */}
                              {showUserDropdown && (
                                  <div className="absolute right-0 top-14 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 z-50 animate-in fade-in slide-in-from-top-2">
                                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl mb-2">
                                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold text-lg">
                                              {premiumUser.username.charAt(0).toUpperCase()}
                                          </div>
                                          <div className="overflow-hidden">
                                              <h4 className="font-bold text-gray-800 text-sm truncate">{premiumUser.username}</h4>
                                              <p className="text-xs text-gray-500">Premium Member</p>
                                          </div>
                                      </div>
                                      <div className="p-2 mb-2">
                                          <div className="flex justify-between text-xs mb-1">
                                              <span className="text-gray-500">Quota Used</span>
                                              <span className="font-bold text-gray-800">{premiumUser.quota_used} / {premiumUser.quota_limit}</span>
                                          </div>
                                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                              <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min((premiumUser.quota_used / premiumUser.quota_limit) * 100, 100)}%` }}></div>
                                          </div>
                                      </div>
                                      <div className="flex items-center justify-between p-2 rounded-lg bg-orange-50/50 border border-orange-100 mb-2">
                                          <div className="text-xs">
                                              <span className="block text-gray-500">Expires On</span>
                                              <span className="font-bold text-gray-800">{formatDate(premiumUser.end_date)}</span>
                                          </div>
                                      </div>
                                      <button onClick={handleLogout} className="w-full py-2 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition-colors">Log Out</button>
                                  </div>
                              )}
                          </div>
                      ) : (
                          // LOGGED OUT STATE
                          <button onClick={() => setShowLoginModal(true)} className="premium-btn group" title="Premium Login">
                              <span className="premium-ico group-hover:scale-110 transition-transform duration-200"><Icons.Premium /></span>
                          </button>
                      )}
                  </div>
              </div>
          </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Preview */}
            <div className="lg:col-span-2 space-y-4">
            <GlassCard className="p-2 flex flex-col items-center justify-center bg-gray-200 overflow-hidden relative group">
                <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>
                <div className="relative w-full z-10 transition-transform duration-300" style={{ aspectRatio: `${template.width} / ${template.height}` }}>
                    <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full shadow-2xl rounded-lg bg-white" />
                </div>
            </GlassCard>
            
            {/* Watermark Toggle */}
            <div className="flex items-center justify-center gap-3 text-sm bg-white p-3 rounded-full shadow-sm border border-gray-100 w-fit mx-auto">
                    <span className="text-gray-500 font-medium">Watermark</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={!showWatermark} 
                            onChange={() => {
                                if(!premiumUser) {
                                    triggerSubscription();
                                } else {
                                    setShowWatermark(!showWatermark);
                                }
                            }} 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                    <div className="flex items-center gap-1">
                        <span className={`text-xs font-bold ${!showWatermark ? 'text-green-600' : 'text-gray-400'}`}>
                            {!showWatermark ? 'REMOVED' : 'ACTIVE'}
                        </span>
                        {!premiumUser && <div className="text-yellow-500"><Icons.Lock /></div>}
                    </div>
            </div>
            </div>

            {/* Right: Form */}
            <div className="lg:col-span-1">
            <GlassCard className="sticky top-24 border-t-4 border-t-red-500">
                <h3 className="text-lg font-bold mb-6 pb-2 border-b border-gray-100 flex items-center gap-2">
                    <span className="w-1 h-6 bg-red-500 rounded-full"></span>
                    Customize Content
                </h3>
                <div className="space-y-5">
                {template.boxes.map(box => {
                    if (box.type === BoxType.WATERMARK) return null; 
                    if (box.type === BoxType.LOGO && box.staticUrl) return null;

                    return (
                    <div key={box.id} className="group">
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
                            {box.key.replace(/_/g, ' ')}
                        </label>
                        {box.type === BoxType.TEXT && (
                            <textarea
                                className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none resize-y min-h-[80px] text-sm transition-all shadow-sm"
                                placeholder={`Enter ${box.key}...`}
                                onChange={(e) => handleInputChange(box.key, e.target.value)}
                                rows={3}
                            />
                        )}
                        {box.type === BoxType.IMAGE && (
                            <label className="flex items-center gap-3 p-3 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-red-300 transition-all bg-white">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 group-hover:text-red-500 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                </div>
                                <span className="text-sm text-gray-600 font-medium">Click to upload image</span>
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleInputChange(box.key, e.target.files[0]); }} />
                            </label>
                        )}
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
                    className={`w-full py-4 mt-4 rounded-xl font-bold text-white shadow-lg transform transition active:scale-[0.98] flex items-center justify-center gap-2 text-lg ${generating ? 'bg-gray-400' : 'bg-gradient-to-r from-red-500 to-red-700 hover:shadow-red-500/40'}`}
                >
                    {generating ? 'Processing...' : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            Download Card
                        </>
                    )}
                </button>
                </div>
            </GlassCard>
            </div>
        </div>
      </div>
    </div>
  );
};