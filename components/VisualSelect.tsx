import React, { useState, useRef, useEffect } from 'react';
import { Asset } from '../types';

interface VisualSelectProps {
    assets: Asset[];
    selectedId: string | null;
    onChange: (id: string) => void;
    placeholder: string;
}

export const VisualSelect: React.FC<VisualSelectProps> = ({ assets, selectedId, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedAsset = assets.find(a => a.id === selectedId);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative w-full" ref={containerRef}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-2 rounded bg-white/50 border border-gray-300 cursor-pointer flex items-center justify-between hover:border-primary transition-colors"
            >
                {selectedAsset ? (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center p-0.5 border">
                            <img src={selectedAsset.url} className="max-w-full max-h-full object-contain" alt="" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 truncate">{selectedAsset.name}</span>
                    </div>
                ) : (
                    <span className="text-sm text-gray-500">{placeholder}</span>
                )}
                <svg className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                    {assets.length === 0 ? (
                        <div className="p-3 text-sm text-gray-400 text-center">No options available</div>
                    ) : (
                        <div className="grid grid-cols-1 divide-y divide-gray-100">
                            {assets.map(asset => (
                                <div 
                                    key={asset.id} 
                                    onClick={() => { onChange(asset.id); setIsOpen(false); }}
                                    className={`p-2 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors ${selectedId === asset.id ? 'bg-blue-50' : ''}`}
                                >
                                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center p-1 border shrink-0">
                                        <img src={asset.url} className="max-w-full max-h-full object-contain" alt={asset.name} />
                                    </div>
                                    <span className="text-sm text-gray-700 font-medium">{asset.name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};