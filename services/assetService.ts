import { Asset } from '../types';
import { supabase } from './supabaseClient';

export const AssetService = {
  // Get all assets
  getAll: async (): Promise<Asset[]> => {
    const { data, error } = await supabase.from('assets').select('*');
    if (error) {
        console.error('Error fetching assets:', error.message);
        return [];
    }
    return (data || []).map((a: any) => ({
        id: a.id,
        channelId: a.channel_id,
        type: a.type,
        name: a.name,
        url: a.url
    }));
  },

  // Get assets by type and specific channel (or global)
  getByChannelAndType: async (channelId: string, type: 'LOGO' | 'ADS'): Promise<Asset[]> => {
    // Fetch global assets (channel_id is null) OR specific channel assets
    const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('type', type)
        .or(`channel_id.eq.${channelId},channel_id.is.null`);

    if (error) {
        console.error('Error fetching filtered assets:', error.message);
        return [];
    }
    return (data || []).map((a: any) => ({
        id: a.id,
        channelId: a.channel_id,
        type: a.type,
        name: a.name,
        url: a.url
    }));
  },
  
  // Backward compatibility
  getByType: async (type: 'LOGO' | 'ADS'): Promise<Asset[]> => {
      return AssetService.getByChannelAndType('', type); // Likely fails to filter correctly if ID empty, mainly used in admin now
  },

  // Add new asset
  add: async (asset: Asset): Promise<void> => {
    const { error } = await supabase.from('assets').insert({
        id: asset.id,
        channel_id: asset.channelId || null,
        type: asset.type,
        name: asset.name,
        url: asset.url
    });
    if (error) console.error('Error adding asset:', error.message);
  },

  // Delete asset
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from('assets').delete().eq('id', id);
    if (error) console.error('Error deleting asset:', error.message);
  },

  // --- SYSTEM SETTINGS (Watermark) ---
  
  getSystemWatermark: async (): Promise<string | null> => {
      const { data } = await supabase.from('system_settings').select('value').eq('key', 'watermark_url').single();
      return data ? data.value : null;
  },

  setSystemWatermark: async (url: string) => {
      const { error } = await supabase.from('system_settings').upsert({ key: 'watermark_url', value: url });
      if (error) console.error("Error setting watermark", error);
  }
};