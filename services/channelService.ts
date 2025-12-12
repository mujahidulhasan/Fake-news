import { Channel } from '../types';
import { supabase } from './supabaseClient';

export const ChannelService = {
  getAll: async (): Promise<Channel[]> => {
    // Attempt to fetch with sorting on new columns
    let { data, error } = await supabase
      .from('channels')
      .select('*')
      .order('is_pinned', { ascending: false }) 
      .order('created_at', { ascending: false });
    
    // Fallback: If is_pinned or created_at doesn't exist, fetch without specific sorting
    // Error code 42703 is undefined_column in Postgres
    if (error && (error.message?.includes('is_pinned') || error.code === '42703')) {
        console.warn("Schema mismatch: Missing columns. Falling back to basic fetch.");
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
        isPinned: !!c.is_pinned,
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
    const payload: any = {
        _id: channel._id,
        name: channel.name,
        slug: channel.slug,
        logo_url: channel.logoUrl,
        description: channel.description,
        category: channel.category,
        is_pinned: channel.isPinned,
    };

    const { error } = await supabase
      .from('channels')
      .upsert(payload);

    if (error) {
        // Fallback: If update fails due to missing column, try saving legacy fields only
        if (error.message?.includes('column') || error.code === '42703') {
            console.warn("Schema mismatch during save. Retrying with legacy fields.");
            delete payload.category;
            delete payload.is_pinned;
            // usage_count is usually not updated here, but if we had it, we'd delete it too
            const retry = await supabase.from('channels').upsert(payload);
            if (retry.error) console.error('Error saving channel (fallback):', retry.error.message);
        } else {
            console.error('Error saving channel:', error.message);
        }
    }
  },
  
  incrementUsage: async (id: string) => {
      // Try RPC
      const { error: rpcError } = await supabase.rpc('increment_channel_usage', { row_id: id });
      
      if (rpcError) {
          // Fallback: Manual update check
          const { data: curr, error: fetchError } = await supabase.from('channels').select('usage_count').eq('_id', id).single();
          // Only update if no error fetching (implies column exists) and record found
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