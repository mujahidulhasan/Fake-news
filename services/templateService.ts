import { Template } from '../types';
import { supabase } from './supabaseClient';

export const TemplateService = {
  // Load all templates
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
        width: t.width,
        height: t.height,
        boxes: t.boxes,
        createdAt: t.created_at
    }));
  },

  // Get templates for a specific channel
  getByChannel: async (channelId: string): Promise<Template[]> => {
    const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching templates by channel:', error.message);
        return [];
    }

    return (data || []).map((t: any) => ({
        _id: t._id,
        channelId: t.channel_id,
        name: t.name,
        backgroundUrl: t.background_url,
        width: t.width,
        height: t.height,
        boxes: t.boxes,
        createdAt: t.created_at
    }));
  },

  // Save or Update a template
  save: async (template: Template): Promise<void> => {
    const { error } = await supabase
        .from('templates')
        .upsert({
            _id: template._id,
            channel_id: template.channelId,
            name: template.name,
            background_url: template.backgroundUrl,
            width: template.width,
            height: template.height,
            boxes: template.boxes,
            created_at: template.createdAt
        });

    if (error) console.error('Error saving template:', error.message);
  },

  // Delete a template
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from('templates').delete().eq('_id', id);
    if (error) console.error('Error deleting template:', error.message);
  }
};