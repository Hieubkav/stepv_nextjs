'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import components with lazy loading
const HeroSection = dynamic(() => import("@/components/sections/HeroSection"), {
  ssr: false,
  loading: () => <div className="h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center"><div className="text-white">Đang tải...</div></div>
});

const WordSliderSection = dynamic(() => import("@/components/sections/WordSliderSection"), {
  ssr: false,
  loading: () => <div className="h-32 bg-gray-900 flex items-center justify-center"><div className="text-white">Đang tải...</div></div>
});

const GalleryPictureSection = dynamic(() => import("@/components/sections/GalleryPictureSection"), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-900 flex items-center justify-center"><div className="text-white">Đang tải...</div></div>
});

const YourAdviceSection = dynamic(() => import("@/components/sections/YourAdviceSection"), {
  ssr: false,
  loading: () => <div className="h-96 bg-black flex items-center justify-center"><div className="text-white">Đang tải...</div></div>
});

const StatsSection = dynamic(() => import("@/components/sections/StatsSection"), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-900 flex items-center justify-center"><div className="text-white">Đang tải...</div></div>
});

const ServicesSection = dynamic(() => import("@/components/sections/ServicesSection"), {
  ssr: false,
  loading: () => <div className="h-screen bg-black flex items-center justify-center"><div className="text-white">Đang tải...</div></div>
});

const WhyChooseUsSection = dynamic(() => import("@/components/sections/WhyChooseUsSection"), {
  ssr: false,
  loading: () => <div className="h-screen bg-black flex items-center justify-center"><div className="text-white">Đang tải...</div></div>
});

const Why3DVisualsSection = dynamic(() => import("@/components/sections/Why3DVisualsSection"), {
  ssr: false,
  loading: () => <div className="h-screen bg-black flex items-center justify-center"><div className="text-white">Đang tải...</div></div>
});

const TurningSection = dynamic(() => import("@/components/sections/TurningSection"), {
  ssr: false,
  loading: () => <div className="h-screen bg-black flex items-center justify-center"><div className="text-white">Đang tải...</div></div>
});

const WeWorkSection = dynamic(() => import("@/components/sections/WeWorkSection"), {
  ssr: false,
  loading: () => <div className="h-screen bg-black flex items-center justify-center"><div className="text-white">Đang tải...</div></div>
});

const StayControlSection = dynamic(() => import("@/components/sections/StayControlSection"), {
  ssr: false,
  loading: () => <div className="h-screen bg-black flex items-center justify-center"><div className="text-white">Đang tải...</div></div>
});

const ContactFormSection = dynamic(() => import("@/components/sections/ContactFormSection"), {
  ssr: false,
  loading: () => <div className="h-screen bg-black flex items-center justify-center"><div className="text-white">Đang tải...</div></div>
});

export default function Home() {
  // Xử lý scroll đến section khi có hash trong URL
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      // Delay để đảm bảo DOM đã render xong
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, []);
  
  return (
    <main className="min-h-screen">
      {/* Hero Section với video background */}
      <HeroSection />

      {/* Word Slider Section */}
      <WordSliderSection />

      {/* Gallery Picture Section */}
      <GalleryPictureSection />

      {/* Your Advice Section */}
      <YourAdviceSection />

      {/* Stats Section */}
      <StatsSection />

      {/* Services Section */}
      <ServicesSection />

      {/* Why Choose Us Section */}
      <WhyChooseUsSection />

      {/* Why 3D Visuals Section */}
      <Why3DVisualsSection />

      {/* Turning Section */}
      <TurningSection />

      {/* We Work Section */}
      <WeWorkSection />

      {/* Stay Control Section */}
      <StayControlSection />

      {/* Contact Form Section */}
      <ContactFormSection />
    </main>
  );
}