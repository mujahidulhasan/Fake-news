import React, { useState, useEffect } from 'react';
import { Channel, Asset } from '../../types';
import { ChannelService } from '../../services/channelService';
import { AssetService } from '../../services/assetService';
import { GlassCard } from '../../components/GlassCard';
import { Link } from 'react-router-dom';

const Icons = {
  Back: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Edit: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Image: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
};

export const ChannelManager: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeAssetChannel, setActiveAssetChannel] = useState<string | null>(null);
  const [channelAssets, setChannelAssets] = useState<Asset[]>([]);
  
  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => { loadChannels(); }, []);

  const loadChannels = async () => {
      const data = await ChannelService.getAll();
      setChannels(data);
  };

  const loadAssets = async (channelId: string) => {
      const logos = await AssetService.getByChannelAndType(channelId, 'LOGO');
      const ads = await AssetService.getByChannelAndType(channelId, 'ADS');
      setChannelAssets([...logos, ...ads]);
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
    setName(''); setSlug(''); setLogoUrl(''); setDescription('');
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
    handleCancel();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete channel?')) {
        await ChannelService.delete(id);
        loadChannels();
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => { setLogoUrl(ev.target?.result as string); };
        reader.readAsDataURL(file);
    }
  };

  const handleAssetUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'LOGO' | 'ADS') => {
      const file = e.target.files?.[0];
      if (file && activeAssetChannel) {
          const reader = new FileReader();
          reader.onload = async (ev) => {
             const base64 = ev.target?.result as string;
             await AssetService.add({
                 id: Date.now().toString(),
                 channelId: activeAssetChannel,
                 type,
                 name: file.name,
                 url: base64
             });
             loadAssets(activeAssetChannel);
          };
          reader.readAsDataURL(file);
      }
  };

  const deleteAsset = async (id: string) => {
      await AssetService.delete(id);
      if(activeAssetChannel) loadAssets(activeAssetChannel);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/dashboard" className="text-gray-500 hover:text-gray-800"><Icons.Back /></Link>
        <h1 className="text-xl font-bold text-gray-800">Channels</h1>
      </div>

      {/* Asset Manager Modal */}
      {activeAssetChannel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <GlassCard className="w-full max-w-2xl max-h-[80vh] flex flex-col">
                  <div className="flex justify-between items-center mb-4 border-b pb-2">
                      <h3 className="font-bold">Manage Assets</h3>
                      <button onClick={() => setActiveAssetChannel(null)} className="text-gray-500 hover:text-red-500 font-bold">✕</button>
                  </div>
                  <div className="flex gap-4 mb-4">
                      <label className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded cursor-pointer border border-blue-100 font-bold text-sm">
                          + Upload Logo
                          <input type="file" accept="image/*" className="hidden" onChange={e => handleAssetUpload(e, 'LOGO')} />
                      </label>
                      <label className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded cursor-pointer border border-green-100 font-bold text-sm">
                          + Upload Ad
                          <input type="file" accept="image/*" className="hidden" onChange={e => handleAssetUpload(e, 'ADS')} />
                      </label>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 overflow-y-auto p-2">
                      {channelAssets.map(asset => (
                          <div key={asset.id} className="relative group border rounded p-1">
                              <img src={asset.url} className="h-20 w-full object-contain bg-gray-50" />
                              <div className="absolute top-0 right-0 p-1">
                                  <button onClick={() => deleteAsset(asset.id)} className="bg-red-500 text-white p-1 rounded-full"><Icons.Trash /></button>
                              </div>
                              <span className="block text-center text-xs font-bold mt-1">{asset.type}</span>
                          </div>
                      ))}
                      {channelAssets.length === 0 && <p className="col-span-4 text-center text-gray-400 py-4">No assets found.</p>}
                  </div>
              </GlassCard>
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
            <GlassCard>
                <h3 className="text-sm font-bold mb-4 uppercase text-gray-500">{editingId ? 'Edit' : 'Create'} Channel</h3>
                <form onSubmit={handleSave} className="space-y-3">
                    <input required type="text" placeholder="Channel Name" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded bg-white/50 text-sm" />
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Logo</label>
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="w-full text-xs" />
                        {logoUrl && <img src={logoUrl} className="h-10 mt-2 object-contain" />}
                    </div>
                    <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border rounded bg-white/50 text-sm" rows={2} />
                    <div className="flex gap-2">
                        <button type="submit" className="flex-1 bg-primary text-white py-2 rounded text-sm font-bold">Save</button>
                        {editingId && <button type="button" onClick={handleCancel} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded text-sm font-bold">Cancel</button>}
                    </div>
                </form>
            </GlassCard>
        </div>

        <div className="md:col-span-2 grid grid-cols-1 gap-3">
            {channels.map(channel => (
                <div key={channel._id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src={channel.logoUrl || "https://placehold.co/40"} className="w-10 h-10 object-contain bg-gray-50 rounded" />
                        <span className="font-bold text-gray-800 text-sm">{channel.name}</span>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => { setActiveAssetChannel(channel._id); loadAssets(channel._id); }} className="p-2 bg-purple-50 text-purple-600 rounded hover:bg-purple-100" title="Manage Assets"><Icons.Image /></button>
                        <button onClick={() => handleEdit(channel)} className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"><Icons.Edit /></button>
                        <button onClick={() => handleDelete(channel._id)} className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100"><Icons.Trash /></button>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};