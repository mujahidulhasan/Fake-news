import { BoxConfig, BoxType, Template, UserFormData } from '../types';

export const renderCard = async (
  canvas: HTMLCanvasElement,
  template: Template,
  formData: UserFormData,
  assets: { [key: string]: string } // Map of asset keys to URLs (logos/ads)
): Promise<void> => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1. Setup Canvas Dimensions
  canvas.width = template.width;
  canvas.height = template.height;

  // 2. Draw Background
  try {
    const bgImage = await loadImage(template.backgroundUrl);
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
  } catch (e) {
    console.error("Failed to load background", e);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // 3. Draw Boxes
  // We draw in the order of the array (0 is bottom, length-1 is top)
  // We do NOT sort by type anymore, we rely on the layer order defined in the editor.
  const sortedBoxes = template.boxes;

  for (const box of sortedBoxes) {
    await drawBox(ctx, box, template.width, template.height, formData, assets);
  }
};

const drawBox = async (
  ctx: CanvasRenderingContext2D,
  box: BoxConfig,
  canvasW: number,
  canvasH: number,
  formData: UserFormData,
  assets: { [key: string]: string }
) => {
  const x = (box.x / 100) * canvasW;
  const y = (box.y / 100) * canvasH;
  const w = (box.w / 100) * canvasW;
  const h = (box.h / 100) * canvasH;

  // Apply Opacity
  ctx.save();
  ctx.globalAlpha = typeof box.opacity === 'number' ? box.opacity : 1;

  if (box.type === BoxType.TEXT) {
    const textValue = (formData[box.key] as string) || box.key || ''; // Use key as placeholder in editor
    
    if (textValue) {
        // Font setup
        const fontSize = (box.fontSize || 24) * (canvasW / 1000); // Scale font relative to canvas width assumption
        ctx.font = `${box.fontWeight || 'normal'} ${fontSize}px ${box.fontFamily || 'Hind Siliguri'}`;
        ctx.fillStyle = box.color || '#000000';
        ctx.textBaseline = 'top';
        
        // Alignment
        let drawX = x;
        if (box.align === 'center') {
        ctx.textAlign = 'center';
        drawX = x + w / 2;
        } else if (box.align === 'right') {
        ctx.textAlign = 'right';
        drawX = x + w;
        } else {
        ctx.textAlign = 'left';
        }

        // Simple text wrapping could go here, for now just fillText
        // Basic wrapping:
        const words = textValue.split(' ');
        let line = '';
        let lineY = y;
        const lineHeight = fontSize * 1.4;

        for(let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > w && n > 0) {
            ctx.fillText(line, drawX, lineY);
            line = words[n] + ' ';
            lineY += lineHeight;
        } else {
            line = testLine;
        }
        }
        ctx.fillText(line, drawX, lineY);
    }

  } else if (box.type === BoxType.IMAGE || box.type === BoxType.LOGO || box.type === BoxType.ADS || box.type === BoxType.WATERMARK) {
    let imgUrl = '';
    
    // Determine source
    if (box.type === BoxType.IMAGE) {
        // User uploaded file
        const file = formData[box.key];
        if (file instanceof File) {
            imgUrl = URL.createObjectURL(file);
        } else if (typeof file === 'string') {
            imgUrl = file;
        }
    } else if (box.type === BoxType.WATERMARK) {
        imgUrl = box.staticUrl || '';
    } else {
        // Logo or Ads selected from dropdown (stored in assets map passed to render)
        const selectedAssetId = formData[box.key] as string;
        if (selectedAssetId && assets[selectedAssetId]) {
            imgUrl = assets[selectedAssetId];
        } else if (box.staticUrl) {
            imgUrl = box.staticUrl;
        }
    }

    if (imgUrl) {
        try {
            const img = await loadImage(imgUrl);
            
            // Clipping region to keep image inside box
            ctx.beginPath();
            ctx.rect(x, y, w, h);
            ctx.clip();

            // Fit mode logic
            if (box.fitMode === 'contain') {
                // Keep aspect ratio, fit inside
                const scale = Math.min(w / img.width, h / img.height);
                const rw = img.width * scale;
                const rh = img.height * scale;
                const rx = x + (w - rw) / 2;
                const ry = y + (h - rh) / 2;
                ctx.drawImage(img, rx, ry, rw, rh);
            } else {
                // Cover (default)
                const scale = Math.max(w / img.width, h / img.height);
                const rw = img.width * scale;
                const rh = img.height * scale;
                const rx = x + (w - rw) / 2;
                const ry = y + (h - rh) / 2;
                ctx.drawImage(img, rx, ry, rw, rh);
            }
        } catch (err) {
            console.warn("Could not load image for box", box.key);
        }
    } else {
        // Draw placeholder rect in editor if no image
        // Only if we are in editor context (implied if we are passing empty formData but rendering templates)
        // For now, we just skip drawing.
    }
  }
  
  ctx.restore();
};

const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
};