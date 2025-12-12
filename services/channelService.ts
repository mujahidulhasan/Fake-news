import { Channel } from '../types';
import { supabase } from './supabaseClient';

export const ChannelService = {
  getAll: async (): Promise<Channel[]> => {
    // 1. Try fetching with new columns sorting
    let { data, error } = await supabase
      .from('channels')
      .select('*')
      .order('is_pinned', { ascending: false }) 
      .order('created_at', { ascending: false });
    
    // 2. If that fails (likely due to missing columns), fallback to basic fetch
    if (error) {
        // console.warn("Primary fetch failed (likely schema mismatch). Retrying basic fetch...");
        const result = await supabase.from('channels').select('*');
        data = result.data;
        error = result.error;
    }
    
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
        description: c.description,
        category: c.category || 'General',
        isPinned: !!c.is_pinned, // Handles undefined
        usageCount: c.usage_count || 0,
        createdAt: c.created_at || new Date().toISOString()
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
        description: c.description,
        category: c.category || 'General',
        isPinned: !!c.is_pinned,
        usageCount: c.usage_count || 0,
        createdAt: c.created_at || new Date().toISOString()
    };
  },

  save: async (channel: Channel): Promise<void> => {
    // Construct payload with potential new columns
    const payload: any = {
        _id: channel._id,
        name: channel.name,
        slug: channel.slug,
        logo_url: channel.logoUrl,
        description: channel.description,
        category: channel.category,
        is_pinned: channel.isPinned,
    };

    // Try saving with all fields
    const { error } = await supabase
      .from('channels')
      .upsert(payload);

    if (error) {
        // If it fails (likely missing column), try saving only legacy fields
        // We blindly retry without 'category' and 'is_pinned' to ensure basic data is saved
        if (error.code === '42703' || error.message?.includes('column')) {
             delete payload.category;
             delete payload.is_pinned;
             
             const retry = await supabase.from('channels').upsert(payload);
             if (retry.error) console.error('Error saving channel (legacy fallback):', retry.error.message);
        } else {
             console.error('Error saving channel:', error.message);
        }
    }
  },
  
  incrementUsage: async (id: string) => {
      // 1. Try RPC
      const { error: rpcError } = await supabase.rpc('increment_channel_usage', { row_id: id });
      
      if (rpcError) {
          // 2. Try Manual Update
          // We first check if the column 'usage_count' exists by doing a select. 
          // If select fails on column, we abort to prevent errors.
          const { data: curr, error: fetchError } = await supabase.from('channels').select('usage_count').eq('_id', id).single();
          
          if (!fetchError && curr) {
              await supabase.from('channels').update({ usage_count: (curr.usage_count || 0) + 1 }).eq('_id', id);
          }
      }
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('channels')
      .delete()
      .eq('_id', id);

    if (error) console.error('Error deleting channel:', error.message);
  }
};