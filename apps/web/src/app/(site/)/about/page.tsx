'use client';

import { useQuery } from 'convex/react';
import { api } from '@dohy/backend/convex/_generated/api';
import dynamic from 'next/dynamic';
import { StudioLoader } from '@/components/ui/studio-loader';

const HeroAbout = dynamic(() => import('@/components/sections/about/HeroAbout'), {
  ssr: false,
  loading: () => <div className="h-screen bg-[#050505]" />,
});

const BentoGridAbout = dynamic(() => import('@/components/sections/about/BentoGridAbout'), {
  ssr: false,
  loading: () => <div className="h-96 bg-[#0A0A0A]" />,
});

const VisionAbout = dynamic(() => import('@/components/sections/about/VisionAbout'), {
  ssr: false,
  loading: () => <div className="h-96 bg-[#050505]" />,
});

const CTAAbout = dynamic(() => import('@/components/sections/about/CTAAbout'), {
  ssr: false,
  loading: () => <div className="h-96 bg-[#020202]" />,
});

export default function AboutPage() {
  const siteSettings = useQuery(api.settings.getByKey, { key: 'site' });

  if (!siteSettings) {
    return <StudioLoader variant="fullscreen" text="?ang t?i trang" />;
  }

  const settings = siteSettings?.value as any;

  return (
    <div className="min-h-screen bg-[#050505]">
      <HeroAbout siteName={settings?.siteName} logoUrl={settings?.logoUrl} />
      <BentoGridAbout />
      <VisionAbout />
      <CTAAbout
        contactEmail={settings?.contactEmail}
        address={settings?.address}
        zaloUrl={settings?.zaloUrl}
        facebookUrl={settings?.facebookUrl}
        instagramUrl={settings?.instagramUrl}
        youtubeUrl={settings?.youtubeUrl}
        tiktokUrl={settings?.tiktokUrl}
        bankAccountNumber={settings?.bankAccountNumber}
        bankAccountName={settings?.bankAccountName}
        bankCode={settings?.bankCode}
        siteName={settings?.siteName}
      />
    </div>
  );
}
