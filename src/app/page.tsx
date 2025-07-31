'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import HeroSection from "@/components/sections/HeroSection";
import WordSliderSection from "@/components/sections/WordSliderSection";
import GalleryPictureSection from "@/components/sections/GalleryPictureSection";
import YourAdviceSection from "@/components/sections/YourAdviceSection";
import StatsSection from "@/components/sections/StatsSection";
import ServicesSection from "@/components/sections/ServicesSection";
import WhyChooseUsSection from "@/components/sections/WhyChooseUsSection";
import Why3DVisualsSection from "@/components/sections/Why3DVisualsSection";
import TurningSection from "@/components/sections/TurningSection";
import WeWorkSection from "@/components/sections/WeWorkSection";
import StayControlSection from "@/components/sections/StayControlSection";
import ContactFormSection from "@/components/sections/ContactFormSection";

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
