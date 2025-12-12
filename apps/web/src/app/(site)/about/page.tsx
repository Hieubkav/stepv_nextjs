'use client';

import { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@dohy/backend/convex/_generated/api';
import dynamic from 'next/dynamic';
import { StudioLoader } from '@/components/ui/studio-loader';
import type { BlockData, HomeBlock } from '@/lib/site-layout';

const HeroAbout = dynamic(() => import('@/components/sections/about/HeroAbout'), {
  ssr: false,
  loading: () => <div className="h-screen bg-[#050505]" />,
});

const StatsAbout = dynamic(() => import('@/components/sections/about/StatsAbout'), {
  ssr: false,
  loading: () => <div className="h-32 bg-[#080808]" />,
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

const toString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim().length > 0 ? value : undefined;

const toArray = <T,>(value: unknown): T[] | undefined =>
  Array.isArray(value) && value.length > 0 ? value as T[] : undefined;

function cleanProps<T extends Record<string, unknown>>(input: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined && value !== null)
  ) as Partial<T>;
}

// Map props cho HeroAbout
function mapHeroAboutProps(data?: BlockData | null, settings?: any): any {
  if (!data || Object.keys(data).length === 0) {
    return { siteName: settings?.siteName, logoUrl: settings?.logoUrl };
  }
  return cleanProps({
    siteName: toString(data.siteName) ?? settings?.siteName,
    logoUrl: toString(data.logoUrl) ?? settings?.logoUrl,
    badge: toString(data.badge),
    titleLine1: toString(data.titleLine1),
    titleLine2: toString(data.titleLine2),
    description: toString(data.description),
    services: toArray(data.services),
  });
}

// Map props cho StatsAbout
function mapStatsAboutProps(data?: BlockData | null): any {
  if (!data || Object.keys(data).length === 0) return {};
  return cleanProps({
    stats: toArray(data.stats),
  });
}

// Map props cho BentoGridAbout
function mapBentoGridAboutProps(data?: BlockData | null): any {
  if (!data || Object.keys(data).length === 0) return {};
  return cleanProps({
    badge: toString(data.badge),
    title: toString(data.title),
    titleHighlight: toString(data.titleHighlight),
    subtitle: toString(data.subtitle),
    services: toArray(data.services),
  });
}

// Map props cho VisionAbout
function mapVisionAboutProps(data?: BlockData | null): any {
  if (!data || Object.keys(data).length === 0) return {};
  return cleanProps({
    badge: toString(data.badge),
    titleLine1: toString(data.titleLine1),
    titleLine2: toString(data.titleLine2),
    description: toString(data.description),
    features: toArray(data.features),
    image: toString(data.image),
    imageAlt: toString(data.imageAlt),
    yearEstablished: toString(data.yearEstablished),
    tagline: toString(data.tagline),
  });
}

// Map props cho CTAAbout
function mapCTAAboutProps(data?: BlockData | null, settings?: any): any {
  if (!data || Object.keys(data).length === 0) {
    return {
      contactEmail: settings?.contactEmail,
      address: settings?.address,
      zaloUrl: settings?.zaloUrl,
      facebookUrl: settings?.facebookUrl,
      instagramUrl: settings?.instagramUrl,
      youtubeUrl: settings?.youtubeUrl,
      tiktokUrl: settings?.tiktokUrl,
      bankAccountNumber: settings?.bankAccountNumber,
      bankAccountName: settings?.bankAccountName,
      bankCode: settings?.bankCode,
      siteName: settings?.siteName,
    };
  }
  return cleanProps({
    contactEmail: toString(data.contactEmail) ?? settings?.contactEmail,
    address: toString(data.address) ?? settings?.address,
    zaloUrl: toString(data.zaloUrl) ?? settings?.zaloUrl,
    facebookUrl: toString(data.facebookUrl) ?? settings?.facebookUrl,
    instagramUrl: toString(data.instagramUrl) ?? settings?.instagramUrl,
    youtubeUrl: toString(data.youtubeUrl) ?? settings?.youtubeUrl,
    tiktokUrl: toString(data.tiktokUrl) ?? settings?.tiktokUrl,
    bankAccountNumber: toString(data.bankAccountNumber) ?? settings?.bankAccountNumber,
    bankAccountName: toString(data.bankAccountName) ?? settings?.bankAccountName,
    bankCode: toString(data.bankCode) ?? settings?.bankCode,
    siteName: toString(data.siteName) ?? settings?.siteName,
  });
}

export default function AboutPage() {
  const siteSettings = useQuery(api.settings.getByKey, { key: 'site' });
  const aboutPage = useQuery(api.homepage.getHomepage, { slug: 'about' });
  
  const settings = siteSettings?.value as any;
  const blocks = useMemo(() => (aboutPage?.blocks ?? []) as HomeBlock[], [aboutPage?.blocks]);

  // Loading state
  if (siteSettings === undefined || aboutPage === undefined) {
    return <StudioLoader variant="fullscreen" text="Đang tải trang" />;
  }

  // Tuân thủ hoàn toàn dashboard about-blocks: nếu không có block visible thì không render gì
  // (Fallback cũ đã bị bỏ - dữ liệu được quản lý qua dashboard)
  // Fallback reference (không dùng):
  // <HeroAbout siteName={settings?.siteName} logoUrl={settings?.logoUrl} />
  // <StatsAbout />
  // <BentoGridAbout />
  // <VisionAbout />
  // <CTAAbout contactEmail={settings?.contactEmail} address={settings?.address} ... />

  // Render động từ blocks
  const renderedBlocks = blocks
    .map((block) => {
      const key = String(block._id ?? block.kind);
      switch (block.kind) {
        case 'heroAbout':
          return <HeroAbout key={key} {...mapHeroAboutProps(block.data, settings)} />;
        case 'statsAbout':
          return <StatsAbout key={key} {...mapStatsAboutProps(block.data)} />;
        case 'bentoGridAbout':
          return <BentoGridAbout key={key} {...mapBentoGridAboutProps(block.data)} />;
        case 'visionAbout':
          return <VisionAbout key={key} {...mapVisionAboutProps(block.data)} />;
        case 'ctaAbout':
          return <CTAAbout key={key} {...mapCTAAboutProps(block.data, settings)} />;
        default:
          return null;
      }
    })
    .filter(Boolean);

  return <div className="min-h-screen bg-[#050505]">{renderedBlocks}</div>;
}
