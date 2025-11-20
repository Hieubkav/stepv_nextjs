'use client';

import React from 'react';
import { motion } from 'framer-motion';

const VisionAbout: React.FC = () => {
  return (
    <section className="py-12 md:py-16 px-6 bg-[#050505] border-t border-[#D4AF37]/10 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Content: Philosophy */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="order-2 lg:order-1"
          >
            <span className="text-[#D4AF37] text-[10px] tracking-[0.3em] uppercase block mb-6 font-bold">
              Dohy Vision
            </span>
            <h2 style={{ fontFamily: "'Noto Sans', 'Inter', sans-serif" }} className="text-3xl md:text-5xl text-white leading-tight mb-8 font-bold">
              Chất Lượng Là <br />
              <span className="text-white/30 italic">Tiêu Chuẩn Duy Nhất</span>
            </h2>
            
            <div className="space-y-6 text-white/60 font-light text-sm md:text-base leading-relaxed border-l-2 border-white/5 pl-6">
              <p>
                Mỗi sản phẩm được tinh chỉnh bởi những tiêu chuẩn khắt khe nhất - từ khóa học, plugin đến từng khung hình.
              </p>
              <p>
                <span className="text-white">Art Direction</span> + <span className="text-white">Advanced Tech</span> = DNA của Dohy.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="bg-[#0A0A0A] p-6 border border-white/5 hover:border-[#D4AF37]/20 transition-colors">
                <h4 style={{ fontFamily: "'Noto Sans', 'Inter', sans-serif" }} className="text-white text-lg mb-2 font-bold">Sáng Tạo</h4>
                <p className="text-xs text-white/40 leading-relaxed">
                  Tư duy thiết kế & phương pháp giảng dạy mới.
                </p>
              </div>
              <div className="bg-[#0A0A0A] p-6 border border-white/5 hover:border-[#D4AF37]/20 transition-colors">
                <h4 style={{ fontFamily: "'Noto Sans', 'Inter', sans-serif" }} className="text-white text-lg mb-2 font-bold">Hiệu Suất</h4>
                <p className="text-xs text-white/40 leading-relaxed">
                  Tăng tốc độ làm việc gấp 2 lần.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Visual: Abstract Art */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="order-1 lg:order-2 relative w-full aspect-square md:aspect-[4/3]"
          >
            {/* Decorative Glows */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="w-full h-full bg-[#111] border border-[#D4AF37]/20 relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-transparent z-10"></div>
              
              <img 
                src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1974&auto=format&fit=crop" 
                alt="Abstract Texture" 
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-[1.5s]"
              />
              
              {/* Decorative Overlay Text */}
              <div className="absolute bottom-6 left-6 z-20">
                <p className="text-[#D4AF37] text-xs font-serif italic tracking-wider">Est. 2019</p>
                <p className="text-white text-xs uppercase tracking-widest mt-1 font-bold">Premium Standard</p>
              </div>
              
              {/* Border Corners */}
              <div className="absolute top-4 right-4 w-8 h-8 border-t border-r border-white/20 group-hover:border-[#D4AF37] transition-colors"></div>
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b border-l border-white/20 group-hover:border-[#D4AF37] transition-colors"></div>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
};

export default VisionAbout;
