'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface HeroAboutProps {
  siteName?: string;
  logoUrl?: string;
}

const HeroAbout: React.FC<HeroAboutProps> = ({ siteName, logoUrl }) => {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-[#050505] overflow-hidden py-16 md:py-24 border-b border-[#D4AF37]/10">
      {/* Ambient Background - Gold Glow */}
      <div className="absolute top-0 right-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-[#D4AF37]/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Text Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="lg:col-span-7 z-10 mt-8 lg:mt-0"
        >
          <div className="inline-flex items-center gap-3 border-l-2 border-[#D4AF37] pl-4 mb-6 md:mb-8">
            <span className="text-[10px] md:text-xs font-sans text-[#D4AF37] tracking-[0.3em] uppercase font-bold">
              {siteName || 'Dohy Studio'} Official
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl text-white leading-[1.1] mb-6 md:mb-8 tracking-tight">
            Kiến Tạo <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#D4AF37]/80 to-[#D4AF37]/50 italic pr-2">
              Digital World
            </span>
          </h1>

          <p className="text-white/70 text-sm md:text-lg font-light max-w-xl leading-relaxed mb-8 md:mb-12 text-balance">
            Hệ sinh thái sáng tạo toàn diện dành cho Creators chuyên nghiệp: Đào tạo 3D, Kho tài nguyên & Sản xuất VFX.
          </p>

          {/* Status Line */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 text-white/50 text-[10px] md:text-xs uppercase tracking-widest font-medium">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full shadow-[0_0_10px_#D4AF37]"></span> 
              Academy
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full shadow-[0_0_10px_#D4AF37]"></span> 
              Plugins & Assets
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full shadow-[0_0_10px_#D4AF37]"></span> 
              Production
            </span>
          </div>
        </motion.div>

        {/* Hero Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="lg:col-span-5 relative mt-8 lg:mt-0"
        >
          <div className="aspect-[4/5] lg:aspect-[3/4] w-full bg-[#111] border border-[#D4AF37]/20 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10"></div>
            <img 
              src="https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2070&auto=format&fit=crop" 
              alt="3D Abstract Art" 
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000"
            />
            {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#D4AF37] z-20"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#D4AF37] z-20"></div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default HeroAbout;
