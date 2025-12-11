import { Asset, DeveloperInfo } from '../types';
import { supabase } from './supabaseClient';

export const AssetService = {
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

  getByChannelAndType: async (channelId: string, type: 'LOGO' | 'ADS'): Promise<Asset[]> => {
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
  
  getByType: async (type: 'LOGO' | 'ADS'): Promise<Asset[]> => {
      return AssetService.getByChannelAndType('', type); 
  },

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

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from('assets').delete().eq('id', id);
    if (error) console.error('Error deleting asset:', error.message);
  },

  // --- DEVELOPER INFO ---
  getDeveloperInfo: async (): Promise<DeveloperInfo> => {
      const { data } = await supabase.from('system_settings').select('*').in('key', ['dev_name', 'dev_desc', 'dev_photo', 'dev_socials']);
      
      const info: any = { socials: {} };
      data?.forEach(item => {
          if (item.key === 'dev_socials') {
              try { info.socials = JSON.parse(item.value); } catch(e) { info.socials = {}; }
          } else if(item.key === 'dev_name') info.name = item.value;
          else if(item.key === 'dev_desc') info.description = item.value;
          else if(item.key === 'dev_photo') info.photoUrl = item.value;
      });

      return info as DeveloperInfo;
  },

  saveDeveloperInfo: async (info: DeveloperInfo) => {
      const updates = [
          { key: 'dev_name', value: info.name },
          { key: 'dev_desc', value: info.description },
          { key: 'dev_photo', value: info.photoUrl },
          { key: 'dev_socials', value: JSON.stringify(info.socials) }
      ];
      
      const { error } = await supabase.from('system_settings').upsert(updates);
      if (error) console.error("Error saving dev info", error);
  }
};