import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Channel, DeveloperInfo } from '../types';
import { ChannelService } from '../services/channelService';
import { AssetService } from '../services/assetService';
import { useNavigate, Link } from 'react-router-dom';

export const PublicLanding: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [devInfo, setDevInfo] = useState<DeveloperInfo | null>(null);
  
  // Site Logo Config
  const [siteLogo, setSiteLogo] = useState('');
  const [siteLogoWidth, setSiteLogoWidth] = useState('150');
  const [siteLogoPos, setSiteLogoPos] = useState('0'); // 0-100
  
  // Notices
  const [tickerActive, setTickerActive] = useState(false);
  const [tickerText, setTickerText] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [popupContent, setPopupContent] = useState('');
  const [popupType, setPopupType] = useState('TEXT');

  const navigate = useNavigate();

  useEffect(() => {
    // Load channels from service
    const fetchChannels = async () => {
        const data = await ChannelService.getAll();
        setChannels(data);
    };
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
        
        // Notices
        setTickerActive(settings.newsTickerActive);
        setTickerText(settings.newsTickerText);
        
        if (settings.popupActive) {
            // Show popup logic - basic implementation shows on load
            setPopupContent(settings.popupContent);
            setPopupType(settings.popupType);
            setShowPopup(true);
        }
    };
    fetchChannels();
    fetchSettings();
  }, []);

  const filteredChannels = channels.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group by Category
  const groupedChannels: { [key: string]: Channel[] } = {};
  filteredChannels.forEach(c => {
      const cat = c.category || 'Popular Channels';
      if (!groupedChannels[cat]) groupedChannels[cat] = [];
      groupedChannels[cat].push(c);
  });

  // Check badges logic
  const isNew = (dateStr?: string) => {
      if (!dateStr) return false;
      const created = new Date(dateStr).getTime();
      const threeDays = 3 * 24 * 60 * 60 * 1000;
      return (Date.now() - created) < threeDays;
  };

  const isHot = (usage?: number) => {
      return (usage || 0) > 50; // Threshold for hot badge
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 font-sans flex flex-col relative overflow-x-hidden">
      
      {/* Popup Modal */}
      {showPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative overflow-hidden">
                  <button onClick={() => setShowPopup(false)} className="absolute top-2 right-2 bg-gray-100 hover:bg-red-500 hover:text-white rounded-full p-1.5 transition-colors z-10">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                  <div className="p-6">
                      <h3 className="text-xl font-bold text-center mb-4 text-gray-800">Notice</h3>
                      {popupType === 'IMAGE' ? (
                          <img src={popupContent} alt="Notice" className="w-full rounded-lg" />
                      ) : (
                          <p className="text-gray-600 text-center whitespace-pre-wrap">{popupContent}</p>
                      )}
                      <button onClick={() => setShowPopup(false)} className="w-full mt-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-red-600">Close</button>
                  </div>
              </div>
          </div>
      )}

      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200 shadow-sm relative">
        <div className="h-16 container mx-auto px-4 relative flex items-center">
            {siteLogo && (
                <div 
                    className="absolute top-1/2 transition-all duration-300 transform -translate-y-1/2"
                    style={{ 
                        width: `${siteLogoWidth}px`, 
                        left: `max(16px, min(calc(100% - ${siteLogoWidth}px - 16px), ${siteLogoPos}%))`, 
                        transform: `translate(-${siteLogoPos}%, -50%)`
                    }}
                >
                    <img src={siteLogo} className="w-full object-contain max-h-12" alt="Logo" />
                </div>
            )}
        </div>
        
        {/* Scrolling Ticker */}
        {tickerActive && tickerText && (
            <div className="bg-red-600 text-white h-8 flex items-center overflow-hidden relative border-t border-red-700">
                <div className="absolute whitespace-nowrap animate-marquee left-full pl-4 font-bold text-sm tracking-wide">
                    {tickerText}
                </div>
                {/* CSS Animation defined in index.html or tailwind config usually. Using inline style/hack for standard CSS injection if needed, but 'animate-marquee' is standard tailwind extension often used, or we define it below */}
                <style dangerouslySetInnerHTML={{__html: `
                    @keyframes marquee {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-100%); }
                    }
                    .animate-marquee {
                        animation: marquee 20s linear infinite;
                    }
                `}} />
            </div>
        )}
      </nav>

      <div className="container mx-auto px-4 py-12 flex-1">
        <div className="flex flex-col items-center mb-16 text-center">
          <span className="text-primary font-bold tracking-wider text-xs uppercase mb-2 bg-red-100 px-3 py-1 rounded-full">কোন ডিজাইন স্কিল প্রয়োজন নেই</span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
             ব্রেকিং নিউজ কার্ড <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">তৈরি করুন মুহূর্তেই</span>
          </h1>
          <p className="text-gray-600 text-lg md:text-xl mb-10 max-w-2xl leading-relaxed">
            আপনার পছন্দের নিউজ চ্যানেল টেমপ্লেট নির্বাচন করুন, আপনার শিরোনাম লিখুন, একটি ছবি আপলোড করুন এবং সেকেন্ডের মধ্যে একটি প্রফেশনাল মানের ছবি ডাউনলোড করুন।
          </p>
          
          {/* Search Bar */}
          <div className="w-full max-w-lg relative group">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
                <input
                    type="text"
                    placeholder="চ্যানেল খুঁজুন..."
                    className="w-full py-4 px-8 rounded-full bg-white shadow-xl border border-gray-100 focus:outline-none focus:ring-4 focus:ring-primary/20 text-gray-800 placeholder-gray-400 text-lg transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
          </div>
        </div>

        {/* Categories Sections */}
        {Object.keys(groupedChannels).length > 0 ? (
            Object.entries(groupedChannels).map(([category, catChannels]) => (
                <div key={category} className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 px-2 border-l-4 border-primary pl-3 flex items-center gap-2">
                        {category}
                        <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{catChannels.length}</span>
                    </h2>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {catChannels.map((channel) => (
                        <div 
                            key={channel._id} 
                            onClick={() => navigate(`/create/${channel._id}`)}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all duration-300 group flex flex-col relative"
                        >
                            {/* Pin Badge */}
                            {channel.isPinned && (
                                <div className="absolute top-2 right-2 z-10 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/></svg>
                                    PIN
                                </div>
                            )}

                            {/* New Badge */}
                            {!channel.isPinned && isNew(channel.createdAt) && (
                                <div className="absolute top-2 right-2 z-10 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">NEW</div>
                            )}

                            {/* Hot Badge */}
                            {!channel.isPinned && !isNew(channel.createdAt) && isHot(channel.usageCount) && (
                                <div className="absolute top-2 right-2 z-10 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.207-4.009.022-4.95a.5.5 0 00-.59-.592C8.983 3.561 7.054 4.088 6.096 6.331a6.345 6.345 0 00-.337 1.282c-.225 1.78.502 2.893 1.241 3.887l.006.009V14.5z"/><path d="M12 21a6.005 6.005 0 01-3.699-10.716 5.864 5.864 0 011.666-1.579.5.5 0 01.766.425c0 .037-.001.074-.002.111a4.5 4.5 0 106.848 1.487.5.5 0 01.892-.373A5.996 5.996 0 0112 21z"/></svg>
                                    HOT
                                </div>
                            )}

                            <div className="aspect-video w-full bg-gray-50 flex items-center justify-center p-6 border-b border-gray-100 group-hover:bg-gray-100 transition-colors">
                                 {channel.logoUrl ? (
                                     <img src={channel.logoUrl} alt={channel.name} className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-300" />
                                 ) : (
                                     <span className="text-gray-300 font-bold text-xl">{channel.name[0]}</span>
                                 )}
                            </div>
                            <div className="p-4 text-center">
                                <h3 className="text-lg font-bold text-gray-800 group-hover:text-primary transition-colors">{channel.name}</h3>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{channel.description || 'সংবাদ দেখুন'}</p>
                            </div>
                        </div>
                        ))}
                    </div>
                </div>
            ))
        ) : (
            <div className="text-center py-10 text-gray-500">
                কোন চ্যানেল পাওয়া যায়নি
            </div>
        )}
      </div>

      <footer className="bg-white border-t border-gray-200 mt-10">
          <div className="container mx-auto px-4 py-8">
              <div className="flex flex-col items-center text-center">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Developed By</h3>
                  {devInfo?.photoUrl && (
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary p-0.5 mb-3 shadow-md">
                          <img src={devInfo.photoUrl} alt="Developer" className="w-full h-full object-cover rounded-full" />
                      </div>
                  )}
                  <h4 className="text-lg font-bold text-gray-800">{devInfo?.name || 'Developer Name'}</h4>
                  <p className="text-sm text-gray-500 mb-4 max-w-sm">{devInfo?.description}</p>
                  
                  <div className="flex gap-4 mb-6">
                      {devInfo?.socials?.facebook && <a href={devInfo.socials.facebook} target="_blank" className="text-gray-400 hover:text-blue-600"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>}
                      {devInfo?.socials?.whatsapp && <a href={devInfo.socials.whatsapp} target="_blank" className="text-gray-400 hover:text-green-500"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.897.001-6.621 5.413-12.015 12.009-12.015 3.209 0 6.231 1.25 8.502 3.522 2.269 2.273 3.518 5.295 3.516 8.504 0 6.62-5.412 12.015-12.01 12.015-2.045-.002-4.049-.556-5.836-1.637l-6.279 1.672zm9.738-18.107c-3.551 0-6.44 2.889-6.44 6.44 0 3.55 2.889 6.44 6.44 6.44 3.55 0 6.44-2.89 6.44-6.44 0-3.551-2.889-6.44-6.44-6.44z"/></svg></a>}
                      {devInfo?.socials?.youtube && <a href={devInfo.socials.youtube} target="_blank" className="text-gray-400 hover:text-red-600"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>}
                      {devInfo?.socials?.email && <a href={`mailto:${devInfo.socials.email}`} className="text-gray-400 hover:text-gray-800"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></a>}
                  </div>
                  
                  <div className="text-xs text-gray-400">
                    &copy; {new Date().getFullYear()} NewsCard Pro. All rights reserved.
                  </div>
              </div>
          </div>
      </footer>
    </div>
  );
};