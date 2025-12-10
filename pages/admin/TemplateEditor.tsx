import React, { useState, useRef, useEffect } from 'react';
import { BoxConfig, BoxType, Template, Channel, Asset } from '../../types';
import { Link, useNavigate } from 'react-router-dom';
import { TemplateService } from '../../services/templateService';
import { AssetService } from '../../services/assetService';

// --- ICONS ---
const Icons = {
  Text: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>,
  Image: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  Star: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Ads: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>,
  Lock: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Unlock: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Save: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  Back: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  Close: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Font: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
  AlignLeft: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="17" y1="18" x2="3" y2="18"/></svg>,
  AlignCenter: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="6" x2="3" y2="6"/><line x1="17" y1="12" x2="7" y2="12"/><line x1="19" y1="18" x2="5" y2="18"/></svg>,
  AlignRight: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="9" y2="12"/><line x1="21" y1="18" x2="7" y2="18"/></svg>,
  PosLeft: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/><line x1="21" y1="5" x2="21" y2="19"/></svg>, 
  PosCenter: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="3"/></svg>,
  PosRight: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/><line x1="3" y1="5" x2="3" y2="19"/></svg>,
  Reload: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
  Minus: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Settings: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Layers: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  ArrowUp: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>,
  ArrowDown: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>,
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Upload: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
};

// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const CHANNELS: Channel[] = [
    { _id: '1', name: 'Jamuna TV', slug: 'jamuna', logoUrl: '' },
    { _id: '2', name: 'Somoy TV', slug: 'somoy', logoUrl: '' },
    { _id: '3', name: 'BBC Bangla', slug: 'bbc', logoUrl: '' },
    { _id: '4', name: 'Prothom Alo', slug: 'palo', logoUrl: '' },
];

export const TemplateEditor: React.FC = () => {
  const navigate = useNavigate();
  const [templateName, setTemplateName] = useState('My Custom Template');
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [channelId, setChannelId] = useState('1'); // Default to Jamuna
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);
  const [boxes, setBoxes] = useState<BoxConfig[]>([]);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const [imgDimensions, setImgDimensions] = useState({ w: 800, h: 450 });
  const [customFonts, setCustomFonts] = useState<string[]>(['Hind Siliguri', 'Inter', 'Arial', 'Times New Roman']);
  const [loading, setLoading] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [isPanelMinimized, setIsPanelMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<'properties' | 'layers'>('properties');
  const [hitBoundary, setHitBoundary] = useState(false);
  
  // Asset Management State
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  
  // Dragging State
  const dragRef = useRef<{ 
    id: string; 
    mode: 'drag' | 'resize'; 
    startX: number; 
    startY: number; 
    startXVal: number; 
    startYVal: number; 
    containerW: number;
    containerH: number;
  } | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load assets on mount
    setAssets(AssetService.getAll());
    const all = TemplateService.getAll();
    if (all.length > 0) setHasSaved(true);
  }, []);

  // Load last saved
  const loadLastSaved = () => {
    const all = TemplateService.getAll();
    if (all.length > 0) {
        const latest = all[0];
        setTemplateId(latest._id);
        setTemplateName(latest.name);
        setChannelId(latest.channelId);
        setBackgroundUrl(latest.backgroundUrl);
        setImgDimensions({ w: latest.width, h: latest.height });
        setBoxes(latest.boxes);
        setHasSaved(true);
    }
  };

  useEffect(() => {
      if (selectedBoxId) {
          setIsPanelMinimized(false);
          setActiveTab('properties');
      }
  }, [selectedBoxId]);

  // Load image
  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = '';
    setLoading(true);

    try {
      const base64 = await fileToBase64(file);
      const img = new Image();
      img.onload = () => {
        setImgDimensions({ w: img.width, h: img.height });
        setBackgroundUrl(base64);
        setLoading(false);
      };
      img.src = base64;
    } catch (err) {
      alert('Error reading image file.');
      setLoading(false);
    }
  };

  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
        try {
            const file = e.target.files[0];
            const fontName = file.name.split('.')[0];
            const base64 = await fileToBase64(file);
            const fontFace = new FontFace(fontName, `url("${base64}")`);
            await fontFace.load();
            document.fonts.add(fontFace);
            setCustomFonts(prev => [...prev, fontName]);
        } catch (err) {
            alert('Failed to load font.');
        }
    }
  };

  const handleAssetUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'LOGO' | 'ADS') => {
      if (e.target.files?.[0]) {
          try {
              const file = e.target.files[0];
              const base64 = await fileToBase64(file);
              const newAsset: Asset = {
                  id: Date.now().toString(),
                  type,
                  name: file.name.split('.')[0],
                  url: base64
              };
              AssetService.add(newAsset);
              setAssets(AssetService.getAll());
          } catch (err) {
              alert('Failed to upload asset.');
          }
      }
  };

  const deleteAsset = (id: string) => {
      AssetService.delete(id);
      setAssets(AssetService.getAll());
  };

  const handleSave = () => {
    if (!backgroundUrl) {
      alert("Please upload a background image first.");
      return;
    }

    const currentId = templateId || 'custom_' + Date.now();

    const newTemplate: Template = {
      _id: currentId,
      channelId: channelId, // Use selected channel
      name: templateName,
      backgroundUrl: backgroundUrl,
      width: imgDimensions.w,
      height: imgDimensions.h,
      boxes: boxes,
      createdAt: new Date().toISOString()
    };

    TemplateService.save(newTemplate);
    setTemplateId(currentId);
    setHasSaved(true);
    alert("Template Saved Successfully!");
  };

  const addBox = (type: BoxType) => {
    const newBox: BoxConfig = {
      id: Date.now().toString(),
      key: `field_${boxes.length + 1}`,
      type,
      x: 35, y: 35, w: 30, h: 15,
      color: '#000000',
      fontSize: 24,
      fontFamily: 'Hind Siliguri',
      align: 'left',
      fitMode: 'cover',
      locked: false,
      opacity: 1
    };
    if (type === BoxType.IMAGE) { newBox.w = 30; newBox.h = 30; }
    if (type === BoxType.LOGO || type === BoxType.ADS) { newBox.w = 15; newBox.h = 15; }
    
    setBoxes([...boxes, newBox]);
    setSelectedBoxId(newBox.id);
  };

  const updateBox = (id: string, updates: Partial<BoxConfig>) => {
    setBoxes(boxes.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const deleteBox = (id: string) => {
    setBoxes(boxes.filter(b => b.id !== id));
    if (selectedBoxId === id) setSelectedBoxId(null);
  };

  const moveLayer = (index: number, direction: 'up' | 'down') => {
      const newBoxes = [...boxes];
      const targetIndex = direction === 'up' ? index + 1 : index - 1;
      if (targetIndex >= 0 && targetIndex < newBoxes.length) {
          [newBoxes[index], newBoxes[targetIndex]] = [newBoxes[targetIndex], newBoxes[index]];
          setBoxes(newBoxes);
      }
  };

  const toggleLock = (id: string) => {
      const box = boxes.find(b => b.id === id);
      if (box) updateBox(id, { locked: !box.locked });
  };

  // Position Alignment (Moves the box)
  const alignBox = (id: string, alignType: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
      const box = boxes.find(b => b.id === id);
      if (!box) return;
      let updates: Partial<BoxConfig> = {};
      switch(alignType) {
          case 'left': updates.x = 0; break;
          case 'center': updates.x = 50 - (box.w / 2); break;
          case 'right': updates.x = 100 - box.w; break;
          case 'top': updates.y = 0; break;
          case 'middle': updates.y = 50 - (box.h / 2); break;
          case 'bottom': updates.y = 100 - box.h; break;
      }
      updateBox(id, updates);
  };

  // Text Alignment (Justify text inside box)
  const alignText = (id: string, align: 'left' | 'center' | 'right') => {
      updateBox(id, { align });
  };

  const getClientCoords = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
      if ('touches' in e) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      return { x: (e as React.MouseEvent).clientX, y: (e as React.MouseEvent).clientY };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent, id: string, mode: 'drag' | 'resize') => {
    const box = boxes.find(b => b.id === id);
    if (!box || box.locked) return;
    
    e.stopPropagation(); 
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const coords = getClientCoords(e);

    dragRef.current = {
      id, mode,
      startX: coords.x, startY: coords.y,
      startXVal: mode === 'drag' ? box.x : box.w,
      startYVal: mode === 'drag' ? box.y : box.h,
      containerW: rect.width, containerH: rect.height
    };
    setSelectedBoxId(id);
    setHitBoundary(false);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragRef.current) return;
    const box = boxes.find(b => b.id === dragRef.current?.id);
    if (!box) return;

    const coords = getClientCoords(e);
    const { id, mode, startX, startY, startXVal, startYVal, containerW, containerH } = dragRef.current;
    
    const dxPx = coords.x - startX;
    const dyPx = coords.y - startY;
    const dxPct = (dxPx / containerW) * 100;
    const dyPct = (dyPx / containerH) * 100;

    let hit = false;

    if (mode === 'drag') {
      let newX = startXVal + dxPct;
      let newY = startYVal + dyPct;

      // CONSTRAINT: Strict bounds
      if (newX < 0) { newX = 0; hit = true; }
      if (newX + box.w > 100) { newX = 100 - box.w; hit = true; }
      if (newY < 0) { newY = 0; hit = true; }
      if (newY + box.h > 100) { newY = 100 - box.h; hit = true; }

      updateBox(id, { x: newX, y: newY });
    } else {
      let newW = startXVal + dxPct;
      let newH = startYVal + dyPct;

      // Min size
      if (newW < 2) newW = 2;
      if (newH < 2) newH = 2;

      // CONSTRAINT: Resize bounds
      if (box.x + newW > 100) { newW = 100 - box.x; hit = true; }
      if (box.y + newH > 100) { newH = 100 - box.y; hit = true; }

      updateBox(id, { w: newW, h: newH });
    }
    setHitBoundary(hit);
  };

  const handleEnd = () => {
    dragRef.current = null;
    setHitBoundary(false);
  };

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => { if (dragRef.current) handleMove(e as any); };
    const onEnd = () => handleEnd();
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
    return () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onEnd);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onEnd);
    };
  }, [boxes]);

  const selectedBox = boxes.find(b => b.id === selectedBoxId);

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      {/* --- ASSET MODAL --- */}
      {showAssetModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-bold">Assets Library</h3>
                    <button onClick={() => setShowAssetModal(false)}><Icons.Close /></button>
                </div>
                <div className="p-4 bg-gray-50 flex gap-4">
                     <label className="flex items-center gap-2 px-4 py-2 bg-white border rounded cursor-pointer hover:bg-gray-100">
                         <Icons.Star /> Upload Logo
                         <input type="file" accept="image/*" className="hidden" onChange={(e) => handleAssetUpload(e, 'LOGO')} />
                     </label>
                     <label className="flex items-center gap-2 px-4 py-2 bg-white border rounded cursor-pointer hover:bg-gray-100">
                         <Icons.Ads /> Upload Ad
                         <input type="file" accept="image/*" className="hidden" onChange={(e) => handleAssetUpload(e, 'ADS')} />
                     </label>
                </div>
                <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {assets.length === 0 ? <p className="text-gray-400 text-center col-span-3 py-10">No assets uploaded yet.</p> : assets.map(asset => (
                        <div key={asset.id} className="relative group border rounded-lg p-2 bg-white">
                            <div className="h-24 flex items-center justify-center bg-gray-100 rounded mb-2 overflow-hidden">
                                <img src={asset.url} className="max-w-full max-h-full object-contain" />
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold bg-gray-200 px-1.5 py-0.5 rounded text-gray-600">{asset.type}</span>
                                <span className="text-xs text-gray-500 truncate max-w-[80px]">{asset.name}</span>
                            </div>
                            <button onClick={() => deleteAsset(asset.id)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"><Icons.Trash /></button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="bg-white shadow-sm px-4 py-3 flex justify-between items-center z-20 shrink-0 h-16 border-b border-gray-200">
        <div className="flex items-center gap-3">
             <Link to="/admin/dashboard" className="text-gray-500 hover:text-gray-800"><Icons.Back /></Link>
             <div className="flex flex-col">
                 <input 
                     className="bg-transparent font-bold text-gray-800 border-b border-transparent focus:border-primary outline-none max-w-[150px] md:max-w-xs transition-all text-sm" 
                     value={templateName} 
                     onChange={e => setTemplateName(e.target.value)} 
                 />
                 <select 
                    value={channelId} 
                    onChange={e => setChannelId(e.target.value)}
                    className="text-xs text-gray-500 bg-transparent outline-none cursor-pointer hover:text-primary mt-0.5"
                 >
                    {CHANNELS.map(c => <option key={c._id} value={c._id}>for {c.name}</option>)}
                 </select>
             </div>
             {hasSaved && !templateId && (
                 <button onClick={loadLastSaved} className="ml-2 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded flex items-center gap-1 hover:bg-blue-100"><Icons.Reload /> Load Last</button>
             )}
        </div>
        <div className="flex items-center gap-3">
            <button onClick={() => setShowAssetModal(true)} className="text-xs font-semibold text-gray-600 hover:text-primary flex items-center gap-1">
                <Icons.Upload /> Manage Assets
            </button>
            <button 
            className="flex items-center gap-2 bg-primary text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full shadow hover:bg-red-600 active:scale-95 transition-all text-xs md:text-sm font-bold"
            onClick={handleSave}
            >
            <Icons.Save /> <span>Save</span>
            </button>
        </div>
      </div>

      {/* --- CANVAS AREA --- */}
      <div className="flex-1 relative bg-gray-200/50 overflow-hidden flex items-center justify-center p-8">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            </div>

            {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 z-50">
                    <span className="text-sm font-bold text-gray-600">Processing...</span>
                </div>
            )}

            {!backgroundUrl ? (
                <label className="flex flex-col items-center justify-center w-full max-w-lg h-64 border-4 border-dashed border-gray-300 rounded-3xl cursor-pointer hover:bg-white/50 transition-colors pointer-events-auto z-10">
                    <Icons.Image />
                    <span className="mt-4 text-gray-500 font-medium">Upload Background Image</span>
                    <input type="file" accept="image/*" onChange={handleBgUpload} className="hidden" />
                </label>
            ) : (
                <div 
                    ref={containerRef}
                    className={`relative shadow-2xl bg-white select-none transition-all duration-75 ${hitBoundary ? 'ring-4 ring-red-500/50' : ''}`}
                    style={{ 
                        aspectRatio: `${imgDimensions.w} / ${imgDimensions.h}`,
                        width: 'auto',
                        height: 'auto',
                        maxWidth: '100%', 
                        maxHeight: '100%',
                        touchAction: 'none'
                    }}
                    onMouseDown={(e) => { if(e.target === e.currentTarget) setSelectedBoxId(null); }}
                    onTouchStart={(e) => { if(e.target === e.currentTarget) setSelectedBoxId(null); }}
                >
                    <img src={backgroundUrl} alt="Template Background" className="w-full h-full object-contain pointer-events-none block" draggable={false} />

                    <div className="absolute inset-0">
                    {boxes.map(box => (
                        <div
                            key={box.id}
                            style={{
                                position: 'absolute',
                                left: `${box.x}%`,
                                top: `${box.y}%`,
                                width: `${box.w}%`,
                                height: `${box.h}%`,
                                cursor: box.locked ? 'not-allowed' : 'move',
                                touchAction: 'none',
                                opacity: typeof box.opacity === 'number' ? box.opacity : 1,
                                zIndex: selectedBoxId === box.id ? 50 : 10
                            }}
                            className={`group ${selectedBoxId === box.id ? 'ring-2 ring-primary ring-offset-1' : 'hover:ring-1 hover:ring-blue-300'} ${box.locked ? 'pointer-events-none' : ''}`}
                            onMouseDown={(e) => handleStart(e, box.id, 'drag')}
                            onTouchStart={(e) => handleStart(e, box.id, 'drag')}
                        >
                            <div className={`w-full h-full flex items-center justify-center overflow-hidden border ${box.locked ? 'border-red-400 bg-red-500/10' : 'border-dashed border-gray-400 bg-black/10'}`}>
                                {box.type === BoxType.TEXT ? (
                                    <span 
                                        style={{ 
                                            fontFamily: box.fontFamily, 
                                            color: box.color, 
                                            fontSize: '100%', 
                                            whiteSpace: 'nowrap',
                                            textAlign: box.align || 'left',
                                            width: '100%'
                                        }} 
                                        className="text-xs md:text-sm px-1"
                                    >
                                        {box.key}
                                    </span>
                                ) : (
                                    <span className="text-[10px] uppercase font-bold text-white bg-black/50 px-1 rounded">{box.type}</span>
                                )}
                            </div>

                            {box.locked && (
                                <div className="absolute top-0 right-0 p-0.5 bg-red-500 text-white rounded-bl shadow pointer-events-auto" onClick={(e) => {e.stopPropagation(); toggleLock(box.id);}}>
                                    <Icons.Lock />
                                </div>
                            )}

                            {selectedBoxId === box.id && !box.locked && (
                                <div 
                                    className="absolute -bottom-2 -right-2 w-6 h-6 bg-white border-2 border-primary rounded-full shadow-md z-50 flex items-center justify-center cursor-se-resize touch-none"
                                    onMouseDown={(e) => handleStart(e, box.id, 'resize')}
                                    onTouchStart={(e) => handleStart(e, box.id, 'resize')}
                                >
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                                </div>
                            )}
                        </div>
                    ))}
                    </div>
                </div>
            )}

            {/* FLOATING PANEL */}
            {!isPanelMinimized && (selectedBox || activeTab === 'layers') && (
                <div className="absolute right-4 top-4 bottom-20 w-80 bg-white shadow-2xl rounded-2xl z-50 flex flex-col border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-2 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-2 px-2 pt-2">
                             <div className="flex gap-2">
                                <button onClick={() => setActiveTab('properties')} className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'properties' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}>Properties</button>
                                <button onClick={() => setActiveTab('layers')} className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${activeTab === 'layers' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}><Icons.Layers /> Layers</button>
                             </div>
                             <button onClick={() => setIsPanelMinimized(true)} className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent"><Icons.Minus /></button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 space-y-6">
                        {/* --- PROPERTIES --- */}
                        {activeTab === 'properties' && selectedBox && (
                            <>
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Edit {selectedBox.type}</h3>
                                    <div className="flex gap-1">
                                        <button onClick={() => toggleLock(selectedBox.id)} className={`p-1.5 rounded-lg transition-colors ${selectedBox.locked ? 'bg-red-100 text-red-600' : 'bg-white border border-gray-200 text-gray-500'}`}>{selectedBox.locked ? <Icons.Lock /> : <Icons.Unlock />}</button>
                                        <button onClick={() => deleteBox(selectedBox.id)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 border border-transparent hover:border-red-200"><Icons.Trash /></button>
                                    </div>
                                </div>
                                
                                {/* Opacity & ID */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">ID Name</label>
                                        <input className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm font-mono" value={selectedBox.key} onChange={e => updateBox(selectedBox.id, { key: e.target.value })} />
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Opacity</label>
                                            <span className="text-xs text-primary font-mono">{Math.round((selectedBox.opacity ?? 1) * 100)}%</span>
                                        </div>
                                        <input type="range" min="0" max="1" step="0.1" value={selectedBox.opacity ?? 1} onChange={e => updateBox(selectedBox.id, { opacity: parseFloat(e.target.value) })} className="w-full h-2 bg-gray-200 rounded-lg accent-primary" />
                                    </div>
                                </div>

                                {/* Text Specific Properties */}
                                {selectedBox.type === BoxType.TEXT && (
                                    <div className="space-y-5 pt-4 border-t border-dashed border-gray-200">
                                        {/* Font Family */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Font Family</label>
                                            <select 
                                                className="w-full p-2 bg-white border border-gray-200 rounded text-sm outline-none focus:border-primary"
                                                value={selectedBox.fontFamily}
                                                onChange={e => updateBox(selectedBox.id, { fontFamily: e.target.value })}
                                            >
                                                {customFonts.map(f => <option key={f} value={f}>{f}</option>)}
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Font Size Input */}
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Font Size (px)</label>
                                                <input 
                                                    type="number" 
                                                    min="1"
                                                    value={selectedBox.fontSize}
                                                    onChange={e => updateBox(selectedBox.id, { fontSize: parseInt(e.target.value) })}
                                                    className="w-full p-2 bg-white border border-gray-200 rounded text-sm outline-none focus:border-primary"
                                                />
                                            </div>

                                            {/* Color Code Input */}
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Color Code</label>
                                                <div className="flex items-center gap-2">
                                                    <input 
                                                        type="text" 
                                                        value={selectedBox.color}
                                                        onChange={e => updateBox(selectedBox.id, { color: e.target.value })}
                                                        className="w-full p-2 bg-white border border-gray-200 rounded text-sm outline-none focus:border-primary font-mono uppercase"
                                                        placeholder="#000000"
                                                    />
                                                    <div 
                                                        className="w-9 h-9 rounded border border-gray-200 shadow-sm shrink-0" 
                                                        style={{ backgroundColor: selectedBox.color }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Text Alignment */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Text Alignment</label>
                                            <div className="flex bg-gray-50 border border-gray-200 rounded p-1">
                                                {['left', 'center', 'right'].map((align) => (
                                                    <button
                                                        key={align}
                                                        onClick={() => alignText(selectedBox.id, align as 'left')}
                                                        className={`flex-1 py-1.5 rounded flex justify-center ${selectedBox.align === align ? 'bg-white shadow-sm text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                                                    >
                                                        {align === 'left' ? <Icons.AlignLeft /> : align === 'center' ? <Icons.AlignCenter /> : <Icons.AlignRight />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Position Tools */}
                                <div className="border-t border-dashed border-gray-200 pt-4 mt-2">
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Box Position</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button onClick={() => alignBox(selectedBox.id, 'left')} className="p-2 bg-gray-50 border rounded hover:bg-white flex justify-center"><Icons.PosLeft /></button>
                                        <button onClick={() => alignBox(selectedBox.id, 'center')} className="p-2 bg-gray-50 border rounded hover:bg-white flex justify-center"><Icons.PosCenter /></button>
                                        <button onClick={() => alignBox(selectedBox.id, 'right')} className="p-2 bg-gray-50 border rounded hover:bg-white flex justify-center"><Icons.PosRight /></button>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* --- LAYERS --- */}
                        {activeTab === 'layers' && (
                            <div>
                                <div className="flex gap-2 mb-4">
                                    <button onClick={() => addBox(BoxType.TEXT)} className="flex-1 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-white hover:text-primary flex items-center justify-center gap-1"><Icons.Plus /> Text</button>
                                    <button onClick={() => addBox(BoxType.IMAGE)} className="flex-1 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-white hover:text-primary flex items-center justify-center gap-1"><Icons.Plus /> Image</button>
                                </div>
                                <div className="space-y-2">
                                    {[...boxes].reverse().map((box, reverseIndex) => {
                                        const actualIndex = boxes.length - 1 - reverseIndex;
                                        return (
                                            <div key={box.id} onClick={() => setSelectedBoxId(box.id)} className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${selectedBoxId === box.id ? 'bg-blue-50 border-primary shadow-sm' : 'bg-white border-gray-200 hover:border-blue-300'}`}>
                                                <div className="flex items-center gap-3">
                                                    <span className="p-1.5 bg-gray-100 rounded text-gray-600">{box.type === 'TEXT' ? <Icons.Text /> : <Icons.Image />}</span>
                                                    <div className="overflow-hidden">
                                                        <p className="text-xs font-bold text-gray-700 truncate w-24">{box.key}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                     <button onClick={(e) => { e.stopPropagation(); moveLayer(actualIndex, 'up'); }} disabled={actualIndex === boxes.length - 1} className="p-1 hover:bg-gray-200 rounded text-gray-500 disabled:opacity-30"><Icons.ArrowUp /></button>
                                                     <button onClick={(e) => { e.stopPropagation(); moveLayer(actualIndex, 'down'); }} disabled={actualIndex === 0} className="p-1 hover:bg-gray-200 rounded text-gray-500 disabled:opacity-30"><Icons.ArrowDown /></button>
                                                     <button onClick={(e) => { e.stopPropagation(); deleteBox(box.id); }} className="p-1 hover:bg-red-100 rounded text-red-500 ml-1"><Icons.Trash /></button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {boxes.length === 0 && <p className="text-center text-xs text-gray-400 mt-10">No layers added.</p>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {isPanelMinimized && (
                 <button onClick={() => setIsPanelMinimized(false)} className="absolute right-4 top-4 w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 z-50 flex items-center justify-center text-gray-600 hover:text-primary animate-in fade-in transition-transform hover:scale-105"><Icons.Settings /></button>
            )}
      </div>

      {/* --- BOTTOM TOOLBAR --- */}
      <div className="bg-white border-t border-gray-200 p-2 shrink-0 z-30 pb-safe">
        <div className="flex justify-around items-center max-w-2xl mx-auto">
            {[{ icon: Icons.Text, label: 'Text', type: BoxType.TEXT }, { icon: Icons.Image, label: 'Image', type: BoxType.IMAGE }, { icon: Icons.Star, label: 'Logo', type: BoxType.LOGO }, { icon: Icons.Ads, label: 'Ads', type: BoxType.ADS }].map((tool, idx) => (
                <button key={idx} onClick={() => addBox(tool.type)} className="flex flex-col items-center justify-center w-14 h-14 text-gray-600 hover:text-primary active:scale-90 transition-transform">
                    <div className="p-2 bg-gray-100 rounded-xl mb-1"><tool.icon /></div>
                    <span className="text-[10px] font-medium">{tool.label}</span>
                </button>
            ))}
            <label className="flex flex-col items-center justify-center w-14 h-14 text-gray-600 hover:text-primary active:scale-90 transition-transform cursor-pointer">
                <div className="p-2 bg-gray-100 rounded-xl mb-1"><Icons.Font /></div>
                <span className="text-[10px] font-medium">Font</span>
                <input type="file" accept=".ttf,.otf,.woff" onChange={handleFontUpload} className="hidden" />
            </label>
        </div>
      </div>
    </div>
  );
};