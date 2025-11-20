'use client';

import React from 'react';
import { motion } from 'framer-motion';

const StatsAbout: React.FC = () => {
  const stats = [
    { value: "03", label: "Hệ Sinh Thái" },
    { value: "5K+", label: "Học Viên" },
    { value: "100%", label: "Chất Lượng" }
  ];

  return (
    <section className="py-2 md:py-4 bg-[#080808] border-b border-[#D4AF37]/10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-3 gap-3 md:gap-12 divide-x divide-white/5">
          {stats.map((stat, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="text-center px-2 md:px-4"
            >
              <h3 style={{ fontFamily: "'Noto Sans', 'Inter', sans-serif" }} className="text-2xl sm:text-3xl md:text-5xl text-white mb-2 tracking-tighter font-bold">
                {stat.value}
              </h3>
              <div className="w-6 sm:w-8 h-[1px] bg-[#D4AF37]/50 mx-auto mb-3"></div>
              <p className="text-[#D4AF37]/80 text-[9px] sm:text-[10px] md:text-xs uppercase tracking-[0.2em] font-semibold">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsAbout;
