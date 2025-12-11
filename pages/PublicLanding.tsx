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
  const [siteLogo, setSiteLogo] = useState('');
  const [siteLogoWidth, setSiteLogoWidth] = useState('150');
  
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
    };
    fetchChannels();
    fetchSettings();
  }, []);

  const filteredChannels = channels.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 font-sans flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
            {siteLogo ? (
                <img src={siteLogo} style={{ width: `${siteLogoWidth}px` }} className="object-contain max-h-12" alt="Logo" />
            ) : (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">N</div>
                    <span className="font-bold text-xl text-gray-800 tracking-tight">NewsCard<span className="text-primary">Pro</span></span>
                </div>
            )}
            <div></div>
        </div>
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

        <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 px-2 border-l-4 border-primary pl-3">জনপ্রিয় চ্যানেলসমূহ</h2>
            
            {/* 2 Column Vertical Grid for Mobile, 4 for Desktop */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredChannels.map((channel) => (
                <div 
                    key={channel._id} 
                    onClick={() => navigate(`/create/${channel._id}`)}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all duration-300 group flex flex-col"
                >
                    {/* Rectangle Logo Container */}
                    <div className="aspect-video w-full bg-gray-50 flex items-center justify-center p-6 border-b border-gray-100 group-hover:bg-gray-100 transition-colors">
                         {channel.logoUrl ? (
                             <img src={channel.logoUrl} alt={channel.name} className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-300" />
                         ) : (
                             <span className="text-gray-300 font-bold text-xl">{channel.name[0]}</span>
                         )}
                    </div>
                    
                    {/* Channel Name Text Below */}
                    <div className="p-4 text-center">
                        <h3 className="text-lg font-bold text-gray-800 group-hover:text-primary transition-colors">{channel.name}</h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{channel.description || 'সংবাদ দেখুন'}</p>
                    </div>
                </div>
                ))}
            </div>
            
            {filteredChannels.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                    কোন চ্যানেল পাওয়া যায়নি
                </div>
            )}
        </div>
      </div>

      {/* Developer Footer */}
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
                      {/* Social Icons */}
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