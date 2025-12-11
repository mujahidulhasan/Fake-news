import { Template } from '../types';
import { supabase } from './supabaseClient';

export const TemplateService = {
  getAll: async (): Promise<Template[]> => {
    const { data, error } = await supabase.from('templates').select('*');
    if (error) {
        console.error('Error fetching templates:', error.message);
        return [];
    }
    
    return (data || []).map((t: any) => ({
        _id: t._id,
        channelId: t.channel_id,
        name: t.name,
        backgroundUrl: t.background_url,
        watermarkUrl: t.watermark_url,
        width: t.width,
        height: t.height,
        boxes: t.boxes,
        createdAt: t.created_at
    }));
  },

  getByChannel: async (channelId: string, limit: number = 0): Promise<Template[]> => {
    let query = supabase
        .from('templates')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: false });

    // Optimization: Apply limit if provided (e.g., limit 1 for generator)
    if (limit > 0) {
        query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching templates by channel:', error.message);
        return [];
    }

    return (data || []).map((t: any) => ({
        _id: t._id,
        channelId: t.channel_id,
        name: t.name,
        backgroundUrl: t.background_url,
        watermarkUrl: t.watermark_url,
        width: t.width,
        height: t.height,
        boxes: t.boxes,
        createdAt: t.created_at
    }));
  },

  save: async (template: Template): Promise<void> => {
    const { error } = await supabase
        .from('templates')
        .upsert({
            _id: template._id,
            channel_id: template.channelId,
            name: template.name,
            background_url: template.backgroundUrl,
            watermark_url: template.watermarkUrl || null,
            width: template.width,
            height: template.height,
            boxes: template.boxes,
            created_at: template.createdAt
        });

    if (error) console.error('Error saving template:', error.message);
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from('templates').delete().eq('_id', id);
    if (error) console.error('Error deleting template:', error.message);
  }
};