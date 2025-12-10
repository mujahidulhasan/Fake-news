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
    return (data || []) as Asset[];
  },

  // Get assets by type
  getByType: async (type: 'LOGO' | 'ADS'): Promise<Asset[]> => {
    const { data, error } = await supabase.from('assets').select('*').eq('type', type);
    if (error) {
        console.error('Error fetching assets by type:', error.message);
        return [];
    }
    return (data || []) as Asset[];
  },

  // Add new asset
  add: async (asset: Asset): Promise<void> => {
    const { error } = await supabase.from('assets').insert(asset);
    if (error) console.error('Error adding asset:', error.message);
  },

  // Delete asset
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from('assets').delete().eq('id', id);
    if (error) console.error('Error deleting asset:', error.message);
  }
};