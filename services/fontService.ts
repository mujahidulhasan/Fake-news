const FONT_KEY = 'news_custom_fonts';

interface CustomFont {
  name: string;
  data: string; // Base64 url
}

export const FontService = {
  saveFont: (name: string, data: string) => {
    const fonts = FontService.getAll();
    // Avoid duplicates
    if (!fonts.find(f => f.name === name)) {
      fonts.push({ name, data });
      localStorage.setItem(FONT_KEY, JSON.stringify(fonts));
    }
  },

  getAll: (): CustomFont[] => {
    const data = localStorage.getItem(FONT_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Inject fonts into the document head so they are available for Canvas
  loadSavedFonts: async () => {
    const fonts = FontService.getAll();
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