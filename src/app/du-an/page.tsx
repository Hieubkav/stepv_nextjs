import React from 'react';
import type { Metadata } from 'next';
import ProjectHeroSection from '@/components/sections/projects/ProjectHeroSection';
import DynamicTextTickers from '@/components/sections/projects/DynamicTextTickers';
import ServicesShowcase from '@/components/sections/projects/ServicesShowcase';
import ProjectPortfolio from '@/components/sections/projects/ProjectPortfolio';
import MoreThanJust3D from '@/components/sections/projects/MoreThanJust3D';

export const metadata: Metadata = {
  title: 'Dự Án - Step V Studio',
  description: 'Khám phá portfolio đầy đủ các dự án trực quan hóa 3D, hoạt hình và sản xuất quảng cáo của Step V Studio. Chúng tôi tạo ra nhiều hơn chỉ là hình ảnh 3D.',
  keywords: 'dự án 3D, portfolio, trực quan hóa 3D, hoạt hình sản phẩm, sản xuất quảng cáo, Step V Studio, thiết kế 3D Việt Nam',
};

export default function DuAnPage() {
  return (
    <main className="min-h-screen">
      {/* 1. Hero Section: Slider Ảnh Nền Toàn Màn Hình */}
      <ProjectHeroSection />

      {/* 2. Dynamic Text Tickers (Dải chữ chạy) */}
      <DynamicTextTickers />

      {/* 3. Section Giới thiệu Các Dịch Vụ (Bố cục xen kẽ) */}
      <ServicesShowcase />

      {/* 4. Section "Our Work" (Portfolio) */}
      <ProjectPortfolio />

      {/* 5. Section "More Than Just 3D" */}
      <MoreThanJust3D />
    </main>
  );
}
