import { BoxConfig, BoxType, Template, UserFormData } from '../types';

export const renderCard = async (
  canvas: HTMLCanvasElement,
  template: Template,
  formData: UserFormData,
  assets: { [key: string]: string }, // Map of asset keys to URLs (logos/ads)
  scaleFactor: number = 1,
  watermarkUrl: string | null = null,
  showWatermark: boolean = true
): Promise<void> => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1. Setup Canvas Dimensions based on scale
  const originalW = template.width;
  const originalH = template.height;
  canvas.width = originalW * scaleFactor;
  canvas.height = originalH * scaleFactor;

  // Scale context
  ctx.scale(scaleFactor, scaleFactor);

  // 2. Draw Background
  try {
    const bgImage = await loadImage(template.backgroundUrl);
    ctx.drawImage(bgImage, 0, 0, originalW, originalH);
  } catch (e) {
    console.error("Failed to load background", e);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, originalW, originalH);
  }

  // 3. Draw Boxes
  const sortedBoxes = template.boxes;

  for (const box of sortedBoxes) {
    // CRITICAL FIX: If box is a Watermark type and showWatermark is false, skip drawing entirely
    if (box.type === BoxType.WATERMARK && !showWatermark) {
        continue;
    }
    await drawBox(ctx, box, originalW, originalH, formData, assets);
  }

  // 4. Draw System Watermark (Overlay - Legacy)
  // Only draw if showWatermark is true AND a url exists
  if (showWatermark && watermarkUrl) {
      try {
          const wmImg = await loadImage(watermarkUrl);
          ctx.save();
          ctx.globalAlpha = 0.5; // Semi-transparent
          const wmW = originalW * 0.4; // 40% width
          const wmH = (wmW / wmImg.width) * wmImg.height;
          const wmX = (originalW - wmW) / 2;
          const wmY = (originalH - wmH) / 2;
          ctx.drawImage(wmImg, wmX, wmY, wmW, wmH);
          ctx.restore();
      } catch (e) {
          // console.warn("Failed to load watermark");
      }
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
    const textValue = (formData[box.key] as string) || box.key || ''; 
    
    if (textValue) {
        // Font setup
        const fontSize = (box.fontSize || 24) * (canvasW / 1000); 
        ctx.font = `${box.fontWeight || 'normal'} ${fontSize}px ${box.fontFamily || 'Hind Siliguri'}`;
        ctx.fillStyle = box.color || '#000000';
        
        // Horizontal Alignment Calculation
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

        // Vertical Alignment Calculation
        let startY = y;
        ctx.textBaseline = 'top'; 

        if (box.verticalAlign === 'middle') {
             ctx.textBaseline = 'middle';
             startY = y + h / 2;
        } else if (box.verticalAlign === 'bottom') {
             ctx.textBaseline = 'bottom';
             startY = y + h;
        }

        const lhMultiplier = box.lineHeight || 1.2;
        const lineHeight = fontSize * lhMultiplier;

        const allLines: string[] = [];

        // Split by manual new lines first (The "Enter" key)
        const paragraphs = textValue.split('\n');

        paragraphs.forEach(paragraph => {
            const words = paragraph.split(' ');
            let line = '';
            
            if (words.length === 0) {
                 allLines.push(''); 
                 return;
            }

            for(let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const metrics = ctx.measureText(testLine);
                const testWidth = metrics.width;
                if (testWidth > w && n > 0) {
                    allLines.push(line);
                    line = words[n] + ' ';
                } else {
                    line = testLine;
                }
            }
            allLines.push(line);
        });

        // Calculate Block Offset for Vertical Alignment
        let blockOffset = 0;
        if (allLines.length > 1) {
            const totalH = allLines.length * lineHeight;
            if (box.verticalAlign === 'middle') {
                 blockOffset = -(totalH / 2) + (lineHeight / 2); 
            } else if (box.verticalAlign === 'bottom') {
                 blockOffset = -totalH + lineHeight;
            }
        }

        allLines.forEach((l, i) => {
            ctx.fillText(l, drawX, startY + blockOffset + (i * lineHeight));
        });
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
                const scale = Math.min(w / img.width, h / img.height);
                const rw = img.width * scale;
                const rh = img.height * scale;
                const rx = x + (w - rw) / 2;
                const ry = y + (h - rh) / 2;
                ctx.drawImage(img, rx, ry, rw, rh);
            } else {
                const scale = Math.max(w / img.width, h / img.height);
                const rw = img.width * scale;
                const rh = img.height * scale;
                const rx = x + (w - rw) / 2;
                const ry = y + (h - rh) / 2;
                ctx.drawImage(img, rx, ry, rw, rh);
            }
        } catch (err) {
            // console.warn("Could not load image for box", box.key);
        }
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