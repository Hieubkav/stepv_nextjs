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
    <section className="py-12 md:py-16 bg-[#080808] border-b border-[#D4AF37]/10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 divide-y md:divide-y-0 md:divide-x divide-white/5">
          {stats.map((stat, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="text-center px-4 pt-8 md:pt-0"
            >
              <h3 className="text-4xl md:text-5xl font-serif text-white mb-2 tracking-tighter">
                {stat.value}
              </h3>
              <div className="w-8 h-[1px] bg-[#D4AF37]/50 mx-auto mb-3"></div>
              <p className="text-[#D4AF37]/80 text-[10px] md:text-xs uppercase tracking-[0.2em] font-semibold">
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
