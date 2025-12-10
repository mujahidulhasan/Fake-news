import { supabase } from './supabaseClient';

interface CustomFont {
  name: string;
  data: string; // Base64 url
}

export const FontService = {
  saveFont: async (name: string, data: string) => {
    // Check if exists using select instead of single() to avoid PGRST116 error on empty
    const { data: existing, error: fetchError } = await supabase.from('fonts').select('name').eq('name', name);
    
    if (fetchError) {
        console.error('Error checking font existence:', fetchError.message);
        return;
    }

    if (!existing || existing.length === 0) {
        const { error } = await supabase.from('fonts').insert({ name, data });
        if (error) console.error('Error saving font:', error.message);
    }
  },

  getAll: async (): Promise<CustomFont[]> => {
    const { data, error } = await supabase.from('fonts').select('*');
    if (error) {
        console.error('Error fetching fonts:', error.message);
        return [];
    }
    return (data || []) as CustomFont[];
  },

  // Inject fonts into the document head so they are available for Canvas
  loadSavedFonts: async () => {
    const fonts = await FontService.getAll();
    const loadedFonts: string[] = [];
    
    for (const font of fonts) {
      try {
        const fontFace = new FontFace(font.name, `url("${font.data}")`);
        await fontFace.load();
        document.fonts.add(fontFace);
        loadedFonts.push(font.name);
      } catch (e) {
        console.error(`Failed to load saved font: ${font.name}`, e);
      }
    }
    return loadedFonts;
  }
};