import { Channel } from '../types';
import { supabase } from './supabaseClient';

export const ChannelService = {
  getAll: async (): Promise<Channel[]> => {
    const { data, error } = await supabase
      .from('channels')
      .select('*');
    
    if (error) {
      console.error('Error fetching channels:', error.message);
      return [];
    }
    
    // Map database snake_case to application camelCase
    return (data || []).map((c: any) => ({
        _id: c._id,
        name: c.name,
        slug: c.slug,
        logoUrl: c.logo_url,
        description: c.description
    }));
  },

  getById: async (id: string): Promise<Channel | undefined> => {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .eq('_id', id)
      .single();
    
    if (error) {
        console.error(`Error fetching channel ${id}:`, error.message);
        return undefined;
    }
    
    const c = data as any;
    return {
        _id: c._id,
        name: c.name,
        slug: c.slug,
        logoUrl: c.logo_url,
        description: c.description
    };
  },

  save: async (channel: Channel): Promise<void> => {
    const { error } = await supabase
      .from('channels')
      .upsert({
        _id: channel._id,
        name: channel.name,
        slug: channel.slug,
        logo_url: channel.logoUrl,
        description: channel.description
      });

    if (error) console.error('Error saving channel:', error.message);
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('channels')
      .delete()
      .eq('_id', id);

    if (error) console.error('Error deleting channel:', error.message);
  }
};