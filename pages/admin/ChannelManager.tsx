import React, { useState, useEffect } from 'react';
import { Channel } from '../../types';
import { ChannelService } from '../../services/channelService';
import { GlassCard } from '../../components/GlassCard';
import { Link } from 'react-router-dom';

const Icons = {
  Back: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
};

export const ChannelManager: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
      const data = await ChannelService.getAll();
      setChannels(data);
  };

  const handleEdit = (channel: Channel) => {
    setEditingId(channel._id);
    setName(channel.name);
    setSlug(channel.slug);
    setLogoUrl(channel.logoUrl);
    setDescription(channel.description || '');
  };

  const handleCancel = () => {
    setEditingId(null);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setSlug('');
    setLogoUrl('');
    setDescription('');
    setEditingId(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const newChannel: Channel = {
        _id: editingId || Date.now().toString(),
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        logoUrl,
        description
    };
    await ChannelService.save(newChannel);
    loadChannels();
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this channel?')) {
        await ChannelService.delete(id);
        loadChannels();
    }
  };

  // Helper for image upload to base64
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            setLogoUrl(ev.target?.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/dashboard" className="text-gray-500 hover:text-gray-800"><Icons.Back /></Link>
        <h1 className="text-2xl font-bold text-gray-800">Manage Channels</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Form */}
        <div className="md:col-span-1">
            <GlassCard>
                <h3 className="text-lg font-bold mb-4">{editingId ? 'Edit Channel' : 'Add New Channel'}</h3>
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Channel Name</label>
                        <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded bg-white/50" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Logo</label>
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="w-full text-xs mb-2" />
                        {logoUrl && <img src={logoUrl} alt="Preview" className="h-16 w-auto object-contain border p-1 rounded bg-white" />}
                        <input type="text" placeholder="Or Image URL" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} className="w-full p-2 border rounded bg-white/50 text-xs mt-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border rounded bg-white/50" rows={3} />
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className="flex-1 bg-primary text-white py-2 rounded hover:bg-red-600 font-medium">Save Channel</button>
                        {editingId && <button type="button" onClick={handleCancel} className="px-4 py-2 bg-gray-200 rounded text-gray-700">Cancel</button>}
                    </div>
                </form>
            </GlassCard>
        </div>

        {/* List */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {channels.map(channel => (
                <div key={channel._id} className="bg-white p-4 rounded-lg shadow border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center p-1 border">
                            {channel.logoUrl ? <img src={channel.logoUrl} className="w-full h-full object-contain" /> : <span className="text-xs text-gray-400">No Logo</span>}
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800">{channel.name}</h4>
                            <p className="text-xs text-gray-500 truncate max-w-[150px]">{channel.description || 'No description'}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => handleEdit(channel)} className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100">Edit</button>
                        <button onClick={() => handleDelete(channel._id)} className="text-red-500 p-1.5 hover:bg-red-50 rounded"><Icons.Trash /></button>
                    </div>
                </div>
            ))}
            {channels.length === 0 && <p className="col-span-2 text-center text-gray-400 py-10">No channels found. Add one to get started.</p>}
        </div>
      </div>
    </div>
  );
};