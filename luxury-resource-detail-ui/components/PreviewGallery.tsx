import React, { useState } from 'react';
import { PreviewItem } from '../types';
import { Button } from './ui/Button';

interface PreviewGalleryProps {
  items: PreviewItem[];
}

export const PreviewGallery: React.FC<PreviewGalleryProps> = ({ items }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = items[activeIndex];

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-700">
      {/* Main Preview Area */}
      <div className="relative w-full aspect-video bg-black/40 rounded-2xl overflow-hidden border border-slate-800 group shadow-2xl shadow-black/50">
        
        {/* Glow Effect Background */}
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-900/10 via-transparent to-blue-900/10 pointer-events-none" />
        
        {/* Content */}
        <img 
          src={activeItem.url} 
          alt={activeItem.label}
          className="w-full h-full object-cover opacity-90 transition-opacity duration-500 hover:opacity-100"
        />

        {/* Overlay Label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="absolute bottom-8 text-xs font-bold tracking-[0.2em] text-amber-500 uppercase opacity-60">
                {activeItem.label}
            </span>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex flex-wrap gap-4">
        {items.map((item, index) => (
          <button
            key={item.id}
            onClick={() => setActiveIndex(index)}
            className={`
              relative group flex items-center justify-center px-6 py-4 rounded-lg 
              border transition-all duration-300 min-w-[120px]
              ${activeIndex === index 
                ? 'border-amber-500/80 bg-amber-500/5 shadow-[0_0_15px_-3px_rgba(245,158,11,0.2)]' 
                : 'border-slate-800 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-800'}
            `}
          >
            <span className={`
                text-xs font-bold tracking-wider uppercase transition-colors
                ${activeIndex === index ? 'text-amber-500' : 'text-slate-400 group-hover:text-slate-200'}
            `}>
                {item.label}
            </span>
            
            {/* Active Indicator Dot */}
            {activeIndex === index && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};