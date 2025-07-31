'use client';

import React from 'react';

const DynamicTextTickers = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Dải thứ nhất: Chữ trắng trên nền đen */}
      <div className="bg-black py-4 md:py-6 overflow-hidden">
        <div className="animate-scroll-right whitespace-nowrap">
          <span className="text-white text-2xl sm:text-4xl md:text-6xl lg:text-8xl font-bold uppercase tracking-wider">
            TẠO CHUYỂN ĐỘNG TẠO CHUYỂN ĐỘNG TẠO CHUYỂN ĐỘNG TẠO CHUYỂN ĐỘNG TẠO CHUYỂN ĐỘNG TẠO CHUYỂN ĐỘNG
          </span>
        </div>
      </div>

      {/* Dải thứ hai: Chữ đen trên nền trắng */}
      <div className="bg-white py-4 md:py-6 overflow-hidden">
        <div className="animate-scroll-left whitespace-nowrap">
          <span className="text-black text-2xl sm:text-4xl md:text-6xl lg:text-8xl font-bold uppercase tracking-wider">
            BIẾN THÀNH HIỆN THỰC BIẾN THÀNH HIỆN THỰC BIẾN THÀNH HIỆN THỰC BIẾN THÀNH HIỆN THỰC BIẾN THÀNH HIỆN THỰC
          </span>
        </div>
      </div>
    </section>
  );
};

export default DynamicTextTickers;
