export enum BoxType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE', // User uploaded photo
  LOGO = 'LOGO',   // Fixed or selectable logo
  ADS = 'ADS',     // Fixed or selectable ad
  WATERMARK = 'WATERMARK'
}

export interface BoxConfig {
  id: string;
  key: string; // Internal key for form mapping (e.g., "headline", "main_photo")
  type: BoxType;
  x: number; // Percentage 0-100 relative to canvas width
  y: number; // Percentage 0-100 relative to canvas height
  w: number; // Percentage width
  h: number; // Percentage height
  
  // Editor state
  locked?: boolean;

  // Text specific
  fontFamily?: string;
  fontSize?: number; // Base size, might need scaling
  fontWeight?: string;
  color?: string;
  lineHeight?: number; // Multiplier (e.g., 1.2)
  align?: 'left' | 'center' | 'right'; // Horizontal Text alignment
  verticalAlign?: 'top' | 'middle' | 'bottom'; // Vertical Text alignment
  
  // Image specific
  fitMode?: 'cover' | 'contain' | 'fill';
  opacity?: number;
  
  // Fixed content (for watermarks/logos defined in template)
  staticUrl?: string; 
}

export interface Template {
  _id: string;
  channelId: string;
  name: string;
  backgroundUrl: string; 
  watermarkUrl?: string | null; // Template specific watermark (legacy/static)
  width: number; 
  height: number; 
  boxes: BoxConfig[];
  createdAt: string;
}

export interface Asset {
  id: string;
  channelId?: string; 
  type: 'LOGO' | 'ADS';
  name: string;
  url: string;
}

export interface Channel {
  _id: string;
  name: string;
  slug: string;
  logoUrl: string;
  description?: string;
}

export interface UserFormData {
  [key: string]: string | File | null;
}

export interface PremiumUser {
    id: string;
    username: string;
    password?: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    quota_limit: number;
    quota_used: number;
}

export interface DeveloperInfo {
    name: string;
    description: string;
    photoUrl: string;
    socials: {
        facebook: string;
        whatsapp: string;
        email: string;
        youtube: string;
    }
}

export type DownloadQuality = 'SD' | 'HD' | '2K' | '4K';