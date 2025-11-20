'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Box, Layers, MonitorPlay } from 'lucide-react';

const BentoGridAbout: React.FC = () => {
  const services = [
    {
      id: 'academy',
      label: 'EDUCATION',
      title: 'Dohy Academy',
      description: 'Hệ thống đào tạo tư duy mỹ thuật và kỹ năng 3D/VFX bài bản. Lộ trình từ cơ bản đến chuyên sâu.',
      features: ['Tư duy hình ảnh', 'Kỹ năng 3D', 'Quy trình Studio'],
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop',
      ctaText: 'Xem Lộ Trình'
    },
    {
      id: 'store',
      label: 'RESOURCES',
      title: 'Dohy Store',
      description: 'Hệ sinh thái tài nguyên số tối ưu hóa quy trình: Plugin độc quyền, Model và Texture chất lượng cao.',
      features: ['Plugins', '3D Assets', 'Textures'],
      image: 'https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?q=80&w=1964&auto=format&fit=crop',
      ctaText: 'Kho Tài Nguyên'
    },
    {
      id: 'production',
      label: 'PRODUCTION',
      title: 'Dohy VFX',
      description: 'Studio sản xuất CGI & VFX. Hiện thực hóa ý tưởng phức tạp cho các chiến dịch quảng cáo toàn cầu.',
      features: ['CGI/3D', 'Visual Effects', 'Animation'],
      image: 'https://images.unsplash.com/photo-1558655146-d09347e0d766?q=80&w=1964&auto=format&fit=crop',
      ctaText: 'Liên Hệ Booking'
    }
  ];

  const icons = [MonitorPlay, Box, Layers];

  return (
    <section className="py-20 md:py-32 px-6 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-16 md:text-center max-w-3xl mx-auto">
          <span className="text-[#D4AF37] text-[10px] tracking-[0.3em] uppercase block mb-4 font-bold">
            Dohy Ecosystem
          </span>
          <h2 className="text-3xl md:text-5xl font-serif text-white leading-tight mb-6">
            Giải Pháp <span className="italic text-[#D4AF37]">Toàn Diện</span>
          </h2>
          <p className="text-white/50 text-sm md:text-base font-light leading-relaxed text-balance">
            Ba trụ cột vững chắc kiến tạo nên thành công của một Digital Artist: Tư duy - Công cụ - Thực chiến.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = icons[index] || Box;
            return (
              <motion.div 
                key={service.id}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
                className="group relative flex flex-col bg-[#0F0F0F] border border-white/5 hover:border-[#D4AF37]/40 h-full transition-colors duration-300"
              >
                {/* Image Area */}
                <div className="aspect-[16/9] lg:aspect-[4/3] overflow-hidden relative">
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-all duration-500 z-10"></div>
                  <img 
                    src={service.image} 
                    alt={service.title} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-90 group-hover:opacity-100 grayscale group-hover:grayscale-0" 
                  />
                  
                  {/* Icon Badge */}
                  <div className="absolute top-0 left-0 z-20 p-4 bg-[#0F0F0F] border-r border-b border-white/10 group-hover:border-[#D4AF37]/40 transition-colors">
                    <Icon size={20} strokeWidth={1.5} className="text-[#D4AF37]" />
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-8 flex flex-col flex-grow relative">
                  {/* Vertical Gold Line on Hover */}
                  <div className="absolute left-0 top-8 bottom-8 w-[2px] bg-[#D4AF37] transform scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top"></div>

                  <div className="text-[10px] text-[#D4AF37]/70 uppercase tracking-[0.2em] mb-3 font-bold">
                    {service.label}
                  </div>
                  
                  <h3 className="text-2xl font-serif text-white mb-4 group-hover:text-[#D4AF37] transition-colors duration-300">
                    {service.title}
                  </h3>
                  
                  <p className="text-white/50 text-sm leading-relaxed mb-8 flex-grow border-b border-white/5 pb-6 group-hover:border-white/10 transition-colors">
                    {service.description}
                  </p>

                  <div className="mt-auto">
                    <ul className="flex flex-wrap gap-2 mb-6">
                      {service.features.map((feature, i) => (
                        <li key={i} className="text-[10px] text-white/40 bg-white/5 px-3 py-1.5 border border-white/5 uppercase tracking-wide">
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    <div className="text-white text-[10px] md:text-xs uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all duration-300 font-bold group-hover:text-[#D4AF37]">
                      {service.ctaText} <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default BentoGridAbout;
