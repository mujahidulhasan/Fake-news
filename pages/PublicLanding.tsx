import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Channel } from '../types';
import { useNavigate, Link } from 'react-router-dom';

// Mock data fetcher
const fetchChannels = async (): Promise<Channel[]> => {
  return [
    { _id: '1', name: 'Jamuna TV', slug: 'jamuna', logoUrl: 'https://picsum.photos/100/100?random=1', description: '24/7 News Channel' },
    { _id: '2', name: 'Somoy TV', slug: 'somoy', logoUrl: 'https://picsum.photos/100/100?random=2', description: 'Breaking News First' },
    { _id: '3', name: 'BBC Bangla', slug: 'bbc', logoUrl: 'https://picsum.photos/100/100?random=3', description: 'International Standards' },
    { _id: '4', name: 'Prothom Alo', slug: 'palo', logoUrl: 'https://picsum.photos/100/100?random=4', description: 'Leading Daily' },
  ];
};

export const PublicLanding: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchChannels().then(setChannels);
  }, []);

  const filteredChannels = channels.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">N</div>
                <span className="font-bold text-xl text-gray-800 tracking-tight">NewsCard<span className="text-primary">Pro</span></span>
            </div>
            <div>
                <Link 
                    to="/admin/login" 
                    className="text-sm font-medium text-gray-600 hover:text-primary transition px-4 py-2 rounded-full hover:bg-gray-100"
                >
                    Admin Login
                </Link>
            </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center mb-16 text-center">
          <span className="text-primary font-bold tracking-wider text-xs uppercase mb-2 bg-red-100 px-3 py-1 rounded-full">No Design Skills Needed</span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
            Create Breaking News <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">Cards Instantly</span>
          </h1>
          <p className="text-gray-600 text-lg md:text-xl mb-10 max-w-2xl leading-relaxed">
            Select your favorite news channel template, enter your headline, upload a photo, and download a professional quality image in seconds.
          </p>
          
          {/* Search Bar */}
          <div className="w-full max-w-lg relative group">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search for a channel..."
                    className="w-full py-4 px-8 rounded-full bg-white shadow-xl border border-gray-100 focus:outline-none focus:ring-4 focus:ring-primary/20 text-gray-800 placeholder-gray-400 text-lg transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="absolute right-3 top-2 bottom-2 bg-primary text-white rounded-full px-6 font-medium hover:bg-red-600 transition shadow-md">
                    Search
                </button>
            </div>
          </div>
        </div>

        <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6 px-2">Featured Channels</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredChannels.map((channel) => (
                <GlassCard 
                    key={channel._id} 
                    hoverEffect={true} 
                    onClick={() => navigate(`/create/${channel._id}`)}
                    className="flex flex-col items-center text-center p-8 group border-t-4 border-t-transparent hover:border-t-primary"
                >
                    <div className="w-24 h-24 rounded-full bg-white mb-6 p-1 shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                         <img src={channel.logoUrl} alt={channel.name} className="w-full h-full object-cover rounded-full" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-primary transition-colors">{channel.name}</h3>
                    <p className="text-sm text-gray-500 mt-3 leading-relaxed">{channel.description}</p>
                    <div className="mt-6 w-full">
                        <span className="block w-full py-2 rounded-lg bg-gray-50 text-gray-600 text-sm font-semibold group-hover:bg-primary group-hover:text-white transition-colors">Create Card &rarr;</span>
                    </div>
                </GlassCard>
                ))}
            </div>
        </div>
        
        {/* Footer */}
        <div className="mt-20 border-t border-gray-200 pt-8 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} NewsCard Pro. All rights reserved.
        </div>
      </div>
    </div>
  );
};