'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Package, Film, type LucideIcon } from 'lucide-react';
import { getLucideIcon } from '@/lib/lucide-icons';

interface ServiceItem {
  icon?: string;
  title: string;
  desc: string;
}

interface HeroAboutProps {
  siteName?: string;
  logoUrl?: string;
  badge?: string;
  titleLine1?: string;
  titleLine2?: string;
  description?: string;
  services?: ServiceItem[];
}

const DEFAULT_SERVICES: ServiceItem[] = [
  { icon: 'BookOpen', title: 'Khóa Học', desc: 'Đầy đủ các khóa học về thiết kế và 3D' },
  { icon: 'Package', title: 'Tài Nguyên', desc: 'Kho plugin và asset premium' },
  { icon: 'Film', title: 'VFX', desc: 'Kho VFX phong phú' }
];

const HeroAbout: React.FC<HeroAboutProps> = ({
  siteName,
  logoUrl,
  badge,
  titleLine1,
  titleLine2,
  description,
  services
}) => {
  const displayServices = services && services.length > 0 ? services : DEFAULT_SERVICES;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.4 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section className="relative  flex items-center bg-[#050505] overflow-hidden py-20 md:py-16 border-b border-[#D4AF37]/10">
      {/* Ambient Background - Gold Glow */}
      <div className="absolute top-0 right-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-[#D4AF37]/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-8 md:pt-16">
        
        {/* Text Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="lg:col-span-7 z-10"
        >
          <div className="inline-flex items-center gap-3 border-l-2 border-[#D4AF37] pl-4 mb-6 md:mb-8">
            <span className="text-[10px] md:text-xs font-sans text-[#D4AF37] tracking-[0.3em] uppercase font-bold">
              {badge || `${siteName || 'Dohy Studio'} Official`}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl text-white leading-[1.1] mb-6 md:mb-8 tracking-tight font-bold" style={{ fontFamily: "'Noto Sans', 'Inter', sans-serif", fontWeight: 700 }}>
            {titleLine1 || 'Kiến Tạo'} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#D4AF37]/80 to-[#D4AF37]/50 italic pr-2">
              {titleLine2 || 'Digital World'}
            </span>
          </h1>

          <p className="text-white/70 text-sm md:text-lg font-light max-w-xl leading-relaxed mb-8 md:mb-12 text-balance">
            {description || 'Hệ sinh thái sáng tạo toàn diện dành cho Creators chuyên nghiệp: Đào tạo 3D, Kho tài nguyên & Sản xuất VFX.'}
          </p>
        </motion.div>

        {/* Service Showcase Cards */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="lg:col-span-5 space-y-2 pt-0 md:pt-0"
        >
          {displayServices.map((service, index) => {
            const IconComponent = service.icon ? getLucideIcon(service.icon) : null;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -4, borderColor: '#D4AF37' }}
                className="group bg-[#0F0F0F] border border-[#D4AF37]/20 p-6 rounded-lg transition-all duration-300 cursor-pointer hover:border-[#D4AF37]/50"
              >
                <div className="flex items-start gap-4">
                  <div className="text-[#D4AF37] group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    {IconComponent ? <IconComponent size={32} /> : <BookOpen size={32} />}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-serif text-white mb-2 group-hover:text-[#D4AF37] transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-sm text-white/50 leading-relaxed">
                      {service.desc}
                    </p>
                  </div>
                </div>
                
                {/* Hover Line */}
                <div className="absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-[#D4AF37] to-transparent w-0 group-hover:w-full transition-all duration-500"></div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
};

export default HeroAbout;
