import { Asset } from '../types';

const ASSET_KEY = 'news_assets';

export const AssetService = {
  // Get all assets
  getAll: (): Asset[] => {
    const data = localStorage.getItem(ASSET_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Get assets by type
  getByType: (type: 'LOGO' | 'ADS'): Asset[] => {
    const all = AssetService.getAll();
    return all.filter(a => a.type === type);
  },

  // Add new asset
  add: (asset: Asset): void => {
    const all = AssetService.getAll();
    all.push(asset);
    localStorage.setItem(ASSET_KEY, JSON.stringify(all));
  },

  // Delete asset
  delete: (id: string): void => {
    const all = AssetService.getAll();
    const filtered = all.filter(a => a.id !== id);
    localStorage.setItem(ASSET_KEY, JSON.stringify(filtered));
  }
};