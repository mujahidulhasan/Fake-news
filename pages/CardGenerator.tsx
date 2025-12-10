import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Template, BoxType, UserFormData, Asset } from '../types';
import { GlassCard } from '../components/GlassCard';
import { renderCard } from '../utils/canvasRender';
import { TemplateService } from '../services/templateService';
import { AssetService } from '../services/assetService';

export const CardGenerator: React.FC = () => {
  const { channelId } = useParams();
  const [template, setTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState<UserFormData>({});
  const [assets, setAssets] = useState<{ logos: Asset[], ads: Asset[] }>({ logos: [], ads: [] });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generating, setGenerating] = useState(false);

  // Load Template and Assets
  useEffect(() => {
    // Load Global Assets
    const logos = AssetService.getByType('LOGO');
    const ads = AssetService.getByType('ADS');
    setAssets({ logos, ads });

    if (channelId) {
        const templates = TemplateService.getByChannel(channelId);
        if (templates && templates.length > 0) {
            setTemplate(templates[0]);
        } else {
            const defaults = TemplateService.getByChannel('1');
            if (defaults.length > 0) setTemplate(defaults[0]);
        }
    }
  }, [channelId]);

  // Live Render
  useEffect(() => {
    if (template && canvasRef.current) {
        // Create an asset map for the renderer
        const assetMap: { [key: string]: string } = {};
        [...assets.logos, ...assets.ads].forEach(a => assetMap[a.id] = a.url);

        renderCard(canvasRef.current, template, formData, assetMap);
    }
  }, [template, formData, assets]);

  const handleInputChange = (key: string, value: string | File) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    setGenerating(true);
    
    setTimeout(() => {
        const link = document.createElement('a');
        link.download = `news-card-${Date.now()}.png`;
        link.href = canvasRef.current!.toDataURL('image/png', 1.0);
        link.click();
        setGenerating(false);
    }, 500);
  };

  if (!template) return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-500">
          <p className="mb-4">No template found for this channel.</p>
          <Link to="/" className="text-primary hover:underline">Go Back</Link>
      </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Link to="/" className="text-gray-500 hover:text-primary mr-4">
            &larr; Back
        </Link>
        <h2 className="text-2xl font-bold text-gray-800">Create {template.name}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Preview */}
        <div className="lg:col-span-2 space-y-4">
           <GlassCard className="p-2 flex flex-col items-center justify-center bg-gray-900/10 overflow-hidden">
             {/* Dynamic Aspect Ratio Box */}
             <div className="relative w-full" style={{ aspectRatio: `${template.width} / ${template.height}` }}>
                <canvas 
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full shadow-2xl rounded-lg"
                />
             </div>
           </GlassCard>
           <div className="text-center text-sm text-gray-500">Live Preview</div>
        </div>

        {/* Right: Form */}
        <div className="lg:col-span-1">
          <GlassCard className="sticky top-6">
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-200 pb-2">Content Details</h3>
            
            <div className="space-y-4">
              {template.boxes.map(box => {
                if (box.type === BoxType.WATERMARK) return null;
                if (box.type === BoxType.LOGO && box.staticUrl) return null;

                return (
                  <div key={box.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                        {box.key.replace(/_/g, ' ')}
                    </label>
                    
                    {box.type === BoxType.TEXT && (
                        <input 
                            type="text" 
                            className="w-full p-2 rounded bg-white/50 border border-gray-300 focus:ring-2 focus:ring-primary/50 outline-none"
                            placeholder={`Enter ${box.key}`}
                            onChange={(e) => handleInputChange(box.key, e.target.value)}
                        />
                    )}

                    {box.type === BoxType.IMAGE && (
                        <input 
                            type="file" 
                            accept="image/*"
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                            onChange={(e) => {
                                if (e.target.files?.[0]) {
                                    handleInputChange(box.key, e.target.files[0]);
                                }
                            }}
                        />
                    )}
                    
                    {/* DROPDOWN FOR LOGO OR ADS */}
                    {(box.type === BoxType.LOGO || box.type === BoxType.ADS) && !box.staticUrl && (
                        <select 
                            className="w-full p-2 rounded bg-white/50 border border-gray-300 outline-none focus:border-primary"
                            onChange={(e) => handleInputChange(box.key, e.target.value)}
                        >
                            <option value="">Select {box.type === BoxType.LOGO ? 'Logo' : 'Ad'}...</option>
                            {box.type === BoxType.LOGO && assets.logos.map(a => (
                                <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                            {box.type === BoxType.ADS && assets.ads.map(a => (
                                <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                        </select>
                    )}
                  </div>
                );
              })}

              <button 
                onClick={handleDownload}
                disabled={generating}
                className={`w-full py-3 mt-6 rounded-lg font-bold text-white shadow-lg transform transition active:scale-95 ${generating ? 'bg-gray-400' : 'bg-gradient-to-r from-primary to-red-600 hover:shadow-red-500/30'}`}
              >
                {generating ? 'Generating...' : 'Download Image'}
              </button>
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
};