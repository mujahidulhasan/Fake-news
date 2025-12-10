import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Channel } from '../types';
import { ChannelService } from '../services/channelService';
import { useNavigate, Link } from 'react-router-dom';

export const PublicLanding: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Load channels from service
    const fetchChannels = async () => {
        const data = await ChannelService.getAll();
        setChannels(data);
    };
    fetchChannels();
  }, []);

  const filteredChannels = channels.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 font-sans">
      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">N</div>
                <span className="font-bold text-xl text-gray-800 tracking-tight">NewsCard<span className="text-primary">Pro</span></span>
            </div>
            {/* Admin Login button removed as requested */}
            <div></div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
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
        
        {/* Footer */}
        <div className="mt-20 border-t border-gray-200 pt-8 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} NewsCard Pro. সর্বস্বত্ব সংরক্ষিত।
        </div>
      </div>
    </div>
  );
};