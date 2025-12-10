import { Channel } from '../types';

const CHANNEL_KEY = 'news_channels';

// Seed data for Bangladeshi context
const SEED_CHANNELS: Channel[] = [
    { _id: '1', name: 'Jamuna TV', slug: 'jamuna', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/36/Jamuna_Television_logo.svg/1200px-Jamuna_Television_logo.svg.png' },
    { _id: '2', name: 'Somoy TV', slug: 'somoy', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Somoy_TV_Logo.jpg' },
    { _id: '3', name: 'BBC Bangla', slug: 'bbc', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/BBC_Logo_2021.svg/1200px-BBC_Logo_2021.svg.png' },
    { _id: '4', name: 'Prothom Alo', slug: 'palo', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Prothom_Alo_logo.svg/1200px-Prothom_Alo_logo.svg.png' },
    { _id: '5', name: 'Channel 24', slug: 'ch24', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/9/91/Channel_24_BD_logo.svg' },
    { _id: '6', name: 'DBC News', slug: 'dbc', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/8/87/DBC_News_Logo.png' },
];

export const ChannelService = {
  getAll: (): Channel[] => {
    const data = localStorage.getItem(CHANNEL_KEY);
    if (!data) {
        // Initial seed
        localStorage.setItem(CHANNEL_KEY, JSON.stringify(SEED_CHANNELS));
        return SEED_CHANNELS;
    }
    return JSON.parse(data);
  },

  getById: (id: string): Channel | undefined => {
    const all = ChannelService.getAll();
    return all.find(c => c._id === id);
  },

  save: (channel: Channel): void => {
    const all = ChannelService.getAll();
    const index = all.findIndex(c => c._id === channel._id);
    if (index >= 0) {
        all[index] = channel;
    } else {
        all.push(channel);
    }
    localStorage.setItem(CHANNEL_KEY, JSON.stringify(all));
  },

  delete: (id: string): void => {
    const all = ChannelService.getAll();
    const filtered = all.filter(c => c._id !== id);
    localStorage.setItem(CHANNEL_KEY, JSON.stringify(filtered));
  }
};