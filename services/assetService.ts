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

  // --- SYSTEM SETTINGS (Dev Info, Site Logo, Admin Creds) ---
  
  // Simplified getter for all system settings
  getSystemSettings: async () => {
      const { data } = await supabase.from('system_settings').select('*');
      const settings: any = { socials: {} };
      
      data?.forEach(item => {
          if (item.key === 'dev_socials') {
              try { settings.socials = JSON.parse(item.value); } catch(e) { settings.socials = {}; }
          } else if(item.key === 'dev_name') settings.name = item.value;
          else if(item.key === 'dev_desc') settings.description = item.value;
          else if(item.key === 'dev_photo') settings.photoUrl = item.value;
          else if(item.key === 'admin_user') settings.adminUser = item.value;
          else if(item.key === 'admin_pass') settings.adminPass = item.value;
          else if(item.key === 'site_logo') settings.siteLogo = item.value;
          else if(item.key === 'site_logo_width') settings.siteLogoWidth = item.value;
      });
      return settings;
  },

  // Kept for backward compatibility with existing components
  getDeveloperInfo: async (): Promise<DeveloperInfo> => {
      const settings = await AssetService.getSystemSettings();
      return {
          name: settings.name,
          description: settings.description,
          photoUrl: settings.photoUrl,
          socials: settings.socials
      } as DeveloperInfo;
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
  },

  saveAdminCreds: async (user: string, pass: string) => {
      const updates = [
          { key: 'admin_user', value: user },
          { key: 'admin_pass', value: pass }
      ];
      const { error } = await supabase.from('system_settings').upsert(updates);
      if (error) console.error("Error saving admin creds", error);
  },

  saveSiteLogo: async (url: string, width: string) => {
      const updates = [
          { key: 'site_logo', value: url },
          { key: 'site_logo_width', value: width }
      ];
      const { error } = await supabase.from('system_settings').upsert(updates);
      if (error) console.error("Error saving site logo", error);
  }
};