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

  // --- SYSTEM SETTINGS ---
  
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
          else if(item.key === 'site_logo_pos') settings.siteLogoPos = item.value;
          else if(item.key === 'news_ticker_active') settings.newsTickerActive = item.value === 'true';
          else if(item.key === 'news_ticker_text') settings.newsTickerText = item.value;
          else if(item.key === 'popup_active') settings.popupActive = item.value === 'true';
          else if(item.key === 'popup_content') settings.popupContent = item.value;
          else if(item.key === 'popup_type') settings.popupType = item.value;
      });
      return settings;
  },

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

  saveSiteLogo: async (url: string, width: string, pos: string) => {
      const updates = [
          { key: 'site_logo', value: url },
          { key: 'site_logo_width', value: width },
          { key: 'site_logo_pos', value: pos }
      ];
      const { error } = await supabase.from('system_settings').upsert(updates);
      if (error) console.error("Error saving site logo", error);
  },
  
  saveNotices: async (tickerActive: boolean, tickerText: string, popupActive: boolean, popupContent: string, popupType: 'TEXT'|'IMAGE') => {
      const updates = [
          { key: 'news_ticker_active', value: String(tickerActive) },
          { key: 'news_ticker_text', value: tickerText },
          { key: 'popup_active', value: String(popupActive) },
          { key: 'popup_content', value: popupContent },
          { key: 'popup_type', value: popupType }
      ];
      const { error } = await supabase.from('system_settings').upsert(updates);
      if(error) console.error("Error saving notices", error);
  },

  // --- BACKUP & RECOVERY ---

  createBackup: async () => {
      try {
          const [channels, assets, templates, users, settings, fonts] = await Promise.all([
              supabase.from('channels').select('*'),
              supabase.from('assets').select('*'),
              supabase.from('templates').select('*'),
              supabase.from('premium_users').select('*'),
              supabase.from('system_settings').select('*'),
              supabase.from('fonts').select('*')
          ]);

          const backupData = {
              version: 1,
              timestamp: new Date().toISOString(),
              data: {
                  channels: channels.data || [],
                  assets: assets.data || [],
                  templates: templates.data || [],
                  premium_users: users.data || [],
                  system_settings: settings.data || [],
                  fonts: fonts.data || []
              }
          };

          const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `newscard_backup_${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
      } catch (e) {
          console.error("Backup failed", e);
          alert("Backup failed to generate.");
      }
  },

  restoreBackup: async (file: File) => {
      return new Promise<void>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = async (e) => {
              try {
                  const content = e.target?.result as string;
                  const json = JSON.parse(content);
                  
                  if (!json.data) throw new Error("Invalid backup file format");

                  const { channels, assets, templates, premium_users, system_settings, fonts } = json.data;

                  if (channels?.length) await supabase.from('channels').upsert(channels);
                  if (assets?.length) await supabase.from('assets').upsert(assets);
                  if (templates?.length) await supabase.from('templates').upsert(templates);
                  if (premium_users?.length) await supabase.from('premium_users').upsert(premium_users);
                  if (system_settings?.length) await supabase.from('system_settings').upsert(system_settings);
                  if (fonts?.length) await supabase.from('fonts').upsert(fonts);

                  resolve();
              } catch (err) {
                  reject(err);
              }
          };
          reader.onerror = reject;
          reader.readAsText(file);
      });
  }
};