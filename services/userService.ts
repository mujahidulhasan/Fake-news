import { PremiumUser } from '../types';
import { supabase } from './supabaseClient';

export const UserService = {
    getAll: async (): Promise<PremiumUser[]> => {
        const { data, error } = await supabase.from('premium_users').select('*').order('created_at', { ascending: false });
        if (error) {
            console.error('Error fetching users', error);
            return [];
        }
        return data as PremiumUser[];
    },

    create: async (user: Omit<PremiumUser, 'id'>) => {
        const { error } = await supabase.from('premium_users').insert(user);
        if (error) throw error;
    },

    update: async (id: string, updates: Partial<PremiumUser>) => {
        const { error } = await supabase.from('premium_users').update(updates).eq('id', id);
        if (error) throw error;
    },

    incrementQuota: async (id: string) => {
        // First get current
        const { data: user, error: fetchError } = await supabase.from('premium_users').select('quota_used').eq('id', id).single();
        if(fetchError || !user) return;

        const { error } = await supabase.from('premium_users').update({ quota_used: user.quota_used + 1 }).eq('id', id);
        if (error) console.error("Failed to update quota", error);
    },

    delete: async (id: string) => {
        const { error } = await supabase.from('premium_users').delete().eq('id', id);
        if (error) throw error;
    },

    login: async (username: string, password: string): Promise<PremiumUser | null> => {
        const { data, error } = await supabase
            .from('premium_users')
            .select('*')
            .eq('username', username)
            .eq('password', password)
            .single();
        
        if (error || !data) return null;

        // Check active and dates
        const now = new Date();
        const start = new Date(data.start_date);
        const end = new Date(data.end_date);
        
        if (!data.is_active || now < start || now > end) {
            return null; // Expired or inactive
        }

        return data as PremiumUser;
    }
};