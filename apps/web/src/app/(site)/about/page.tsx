'use client';

import { useQuery } from 'convex/react';
import { api } from '@dohy/backend/convex/_generated/api';
import dynamic from 'next/dynamic';
import { StudioLoader } from '@/components/ui/studio-loader';

const HeroAbout = dynamic(() => import('@/components/sections/about/HeroAbout'), {
  ssr: false,
  loading: () => <div className="h-screen bg-black" />,
});

const StoryAbout = dynamic(() => import('@/components/sections/about/StoryAbout'), {
  ssr: false,
  loading: () => <div className="h-96 bg-black" />,
});

const ValuesAbout = dynamic(() => import('@/components/sections/about/ValuesAbout'), {
  ssr: false,
  loading: () => <div className="h-96 bg-black" />,
});

const AchievementsAbout = dynamic(() => import('@/components/sections/about/AchievementsAbout'), {
  ssr: false,
  loading: () => <div className="h-96 bg-black" />,
});

const ContactCTAAbout = dynamic(() => import('@/components/sections/about/ContactCTAAbout'), {
  ssr: false,
  loading: () => <div className="h-96 bg-black" />,
});

export default function AboutPage() {
  const siteSettings = useQuery(api.settings.getByKey, { key: 'site' });

  if (!siteSettings) {
    return <StudioLoader variant="fullscreen" text="Đang tải trang" />;
  }

  const settings = siteSettings?.value as any;

  return (
    <div className="min-h-screen bg-black">
      <HeroAbout siteName={settings?.siteName} logoUrl={settings?.logoUrl} />
      <StoryAbout />
      <ValuesAbout />
      <AchievementsAbout />
      <ContactCTAAbout settings={settings} />
    </div>
  );
}
