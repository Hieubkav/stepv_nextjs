'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from 'convex/react';
import { api } from '@dohy/backend/convex/_generated/api';

type BlockData = Record<string, unknown>;
type HomeBlock = {
  _id: unknown;
  kind: string;
  data?: BlockData | null;
};

type SiteHeaderMenuItem = { label?: string; url?: string; highlight?: boolean };
type SiteHeaderSocial = { platform?: string; url?: string; icon?: string };
type SiteHeaderCta = { label?: string; url?: string };
type SiteHeaderProps = {
  logo?: string;
  backgroundImage?: string;
  menuItems?: SiteHeaderMenuItem[];
  socials?: SiteHeaderSocial[];
  cta?: SiteHeaderCta;
};

type HeroBrandLogo = { url: string; alt: string };
type HeroCta = { label: string; url: string; style?: 'primary' | 'secondary' };
type HeroProps = {
  titleLines?: string[];
  subtitle?: string;
  brandLogos?: HeroBrandLogo[];
  videoUrl?: string;
  posterUrl?: string;
  ctas?: HeroCta[];
};

type WordSliderProps = { words?: string[]; repeatCount?: number };
type GalleryImage = { url: string; alt: string };
type GalleryProps = { images?: GalleryImage[]; animationDuration?: number; hoverScale?: number };
type AdviceButton = { text: string; url: string; style: 'primary' | 'secondary' };
type AdviceVideo = { videoId: string; title: string; linkUrl?: string };
type AdviceProps = { title?: string; subtitle?: string; buttons?: AdviceButton[]; videos?: AdviceVideo[]; mobileHeight?: number };
type StatItem = { number: string; label: string; delay?: number };
type StatsProps = { items?: StatItem[]; backgroundColor?: string };
type ServiceItem = { image: string; title: string; desc: string; icon: string; linkUrl?: string };
type ServicesProps = { title?: string; subtitle?: string; backgroundColor?: string; services?: ServiceItem[] };
type WhyChooseUsProps = { title?: string; subtitle?: string; videoUrl?: string; videoPoster?: string; videoAlt?: string; items?: { icon: string; title: string; description: string }[]; ctaText?: string; ctaLink?: string };
type Why3DAccordionItem = { title: string; content: string };
type Why3DCard = { icon: string; title: string; items: Why3DAccordionItem[] };
type Why3DProps = {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  topCards?: Why3DCard[];
  bottomCards?: Why3DCard[];
};
type TurningClientLogo = { image: string; alt: string; client_name: string };
type TurningProps = { title?: string; description?: string; buttonText?: string; buttonUrl?: string; backgroundColor?: string; textSize?: string; signatureImage?: string; founderName?: string; founderTitle?: string; clientLogos?: TurningClientLogo[] };
type WeWorkStep = { title: string; description: string; icon: string };
type WeWorkCta = { label: string; url: string };
type WeWorkProps = { title?: string; subtitle?: string; steps?: WeWorkStep[]; ctas?: WeWorkCta[] };
type StayControlFeature = { title: string; description: string; icon_svg?: string; width?: string; row?: number };
type StayControlProps = { title?: string; description?: string; subtitle?: string; features?: StayControlFeature[]; backgroundColor?: string; layout?: 'grid-2x2' | 'single-column' | 'custom' };
type ContactFieldOption = { label: string; value: string };
type ContactField = { name: string; label: string; type: string; placeholder?: string; required?: boolean; options?: ContactFieldOption[] };
type ContactLink = { label: string; value?: string; href?: string };
type ContactCta = { label: string; url: string };
type ContactSocialLink = { platform: string; url: string; icon?: string };
type CareSectionButton = { label?: string; url?: string };
 type CareSectionProps = { title?: string; description?: string; button?: CareSectionButton };

type ContactProps = {
  title?: string;
  subtitle?: string;
  backgroundColor?: string;
  socialIntro?: string;
  cta?: ContactCta;
  contactTitle?: string;
  contactDescription?: string;
  contactLinks?: ContactLink[];
  formTitle?: string;
  formDescription?: string;
  fields?: ContactField[];
  privacyText?: string;
  submitLabel?: string;
  promiseHighlight?: string;
  socialLinks?: ContactSocialLink[];
};
type SiteFooterLink = { label?: string; url?: string; highlight?: boolean };
type SiteFooterColumn = { title?: string; links?: SiteFooterLink[] };
type SiteFooterSocialLink = { platform?: string; url?: string; icon?: string };
type SiteFooterButton = { label?: string; url?: string };
type SiteFooterProps = {
  logo?: string;
  title?: string;
  description?: string;
  button?: SiteFooterButton;
  columns?: SiteFooterColumn[];
  socialTitle?: string;
  socialLinks?: SiteFooterSocialLink[];
  locationTitle?: string;
  locationLines?: string[];
  contactTitle?: string;
  contactEmail?: string;
  copyright?: string;
};

const SiteHeaderSection = dynamic(() => import('@/components/sections/SiteHeaderSection'), {
  ssr: false,
  loading: () => (
    <div className="h-24 bg-black flex items-center justify-center">
      <div className="text-white">Dang tai...</div>
    </div>
  ),
});

const HeroSection = dynamic(() => import('@/components/sections/HeroSection'), {
  ssr: false,
  loading: () => (
    <div className="h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
      <div className="text-white">Dang tai...</div>
    </div>
  ),
});

const WordSliderSection = dynamic(() => import('@/components/sections/WordSliderSection'), {
  ssr: false,
  loading: () => (
    <div className="h-32 bg-gray-900 flex items-center justify-center">
      <div className="text-white">Dang tai...</div>
    </div>
  ),
});

const GalleryPictureSection = dynamic(() => import('@/components/sections/GalleryPictureSection'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-900 flex items-center justify-center">
      <div className="text-white">Dang tai...</div>
    </div>
  ),
});

const YourAdviceSection = dynamic(() => import('@/components/sections/YourAdviceSection'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-black flex items-center justify-center">
      <div className="text-white">Dang tai...</div>
    </div>
  ),
});

const StatsSection = dynamic(() => import('@/components/sections/StatsSection'), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-900 flex items-center justify-center">
      <div className="text-white">Dang tai...</div>
    </div>
  ),
});

const ServicesSection = dynamic(() => import('@/components/sections/ServicesSection'), {
  ssr: false,
  loading: () => (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="text-white">Dang tai...</div>
    </div>
  ),
});

const WhyChooseUsSection = dynamic(() => import('@/components/sections/WhyChooseUsSection'), {
  ssr: false,
  loading: () => (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="text-white">Dang tai...</div>
    </div>
  ),
});

const Why3DVisualsSection = dynamic(() => import('@/components/sections/Why3DVisualsSection'), {
  ssr: false,
  loading: () => (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="text-white">Dang tai...</div>
    </div>
  ),
});

const TurningSection = dynamic(() => import('@/components/sections/TurningSection'), {
  ssr: false,
  loading: () => (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="text-white">Dang tai...</div>
    </div>
  ),
});

const WeWorkSection = dynamic(() => import('@/components/sections/WeWorkSection'), {
  ssr: false,
  loading: () => (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="text-white">Dang tai...</div>
    </div>
  ),
});

const CareSection = dynamic(() => import('@/components/sections/CareSection'), {
  ssr: false,
  loading: () => (
    <div className="h-48 bg-black flex items-center justify-center">
      <div className="text-white">Dang tai...</div>
    </div>
  ),
});

const StayControlSection = dynamic(() => import('@/components/sections/StayControlSection'), {
  ssr: false,
  loading: () => (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="text-white">Dang tai...</div>
    </div>
  ),
});


const SiteFooterSection = dynamic(() => import('@/components/sections/SiteFooterSection'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-black flex items-center justify-center">
      <div className="text-white">Dang tai...</div>
    </div>
  ),
});

const ContactFormSection = dynamic(() => import('@/components/sections/ContactFormSection'), {
  ssr: false,
  loading: () => (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="text-white">Dang tai...</div>
    </div>
  ),
});

function cleanProps<T extends Record<string, unknown>>(input: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined && value !== null)
  ) as Partial<T>;
}

const toString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim().length > 0 ? value : undefined;

const toNumber = (value: unknown): number | undefined =>
  typeof value === 'number' ? value : undefined;

const toBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }
  return undefined;
};

const toStringArray = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const result = (value as unknown[])
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map((item) => item.trim());
  return result.length > 0 ? result : undefined;
};

const toArray = (value: unknown): unknown[] | undefined => {
  if (Array.isArray(value)) return value as unknown[];
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (Array.isArray(record.items)) return record.items as unknown[];
    if (Array.isArray(record.values)) return record.values as unknown[];
  }
  return undefined;
};

const toAssetUrl = (value: unknown): string | undefined => {
  const direct = toString(value);
  if (direct) return direct;
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return toString(record.url) ?? toString(record.href) ?? toString(record.src);
  }
  return undefined;
};

const collectEntries = (value: unknown): unknown[] | undefined => {
  const result: unknown[] = [];
  const visited = new Set<unknown>();

  const visit = (input: unknown) => {
    if (input === undefined || input === null) return;
    if (typeof input === 'function') return;
    if (typeof input === 'string') {
      result.push(input);
      return;
    }
    if (visited.has(input)) return;
    if (Array.isArray(input)) {
      visited.add(input);
      input.forEach(visit);
      return;
    }
    if (typeof input === 'object') {
      visited.add(input);
      const record = input as Record<string, unknown>;
      const hasContent =
        'label' in record ||
        'title' in record ||
        'text' in record ||
        'name' in record ||
        'url' in record ||
        'href' in record ||
        'link' in record ||
        'path' in record ||
        'to' in record ||
        'platform' in record ||
        'icon' in record ||
        'iconName' in record;
      if (hasContent) {
        result.push(record);
        return;
      }
      Object.values(record).forEach(visit);
    }
  };

  visit(value);
  return result.length > 0 ? result : undefined;
};

function mapSiteHeaderProps(data?: BlockData | null): Partial<SiteHeaderProps> {
  if (!data) return {};
  const record = data as Record<string, unknown>;

  const menuSource =
    collectEntries(record.menuItems) ??
    collectEntries(record.menu) ??
    collectEntries(record.navigation) ??
    collectEntries(record.links) ??
    collectEntries(record.items);

  const menuItems = menuSource
    ? menuSource
        .map((item) => {
          if (!item) return null;
          if (typeof item === 'string') {
            return { label: item } as SiteHeaderMenuItem;
          }
          if (typeof item !== 'object') return null;
          const itemRecord = item as Record<string, unknown>;
          const label =
            toString(itemRecord.label) ??
            toString(itemRecord.title) ??
            toString(itemRecord.text) ??
            toString(itemRecord.name);
          if (!label) return null;

          const rawUrl =
            itemRecord.url ??
            itemRecord.href ??
            itemRecord.link ??
            itemRecord.path ??
            itemRecord.to;
          const url = toAssetUrl(rawUrl) ?? toString(rawUrl);
          const highlight =
            toBoolean(itemRecord.highlight) ??
            toBoolean(itemRecord.isHighlighted) ??
            toBoolean(itemRecord.active) ??
            toBoolean(itemRecord.isActive);

          const menuItem: SiteHeaderMenuItem = { label };
          if (url) menuItem.url = url;
          if (highlight !== undefined) menuItem.highlight = highlight;
          return menuItem;
        })
        .filter((item): item is SiteHeaderMenuItem => item !== null && !!item.label)
    : undefined;

  const socialSource =
    collectEntries(record.socials) ??
    collectEntries(record.socialLinks) ??
    collectEntries(record.socialIcons) ??
    collectEntries(record.links);

  const socials = socialSource
    ? socialSource
        .map((item) => {
          if (!item) return null;
          if (typeof item === 'string') {
            return { platform: item, url: item } as SiteHeaderSocial;
          }
          if (typeof item !== 'object') return null;
          const socialRecord = item as Record<string, unknown>;
          const url = toAssetUrl(socialRecord.url ?? socialRecord.href ?? socialRecord.link);
          if (!url) return null;
          const platform =
            toString(socialRecord.platform) ??
            toString(socialRecord.label) ??
            toString(socialRecord.name);
          const icon = toString(socialRecord.icon) ?? toString(socialRecord.iconName);
          const social: SiteHeaderSocial = { url };
          if (platform) social.platform = platform;
          if (icon) social.icon = icon;
          return social;
        })
        .filter((social): social is SiteHeaderSocial => social !== null && !!social.url)
    : undefined;

  const ctaValue = record.cta ?? record.callToAction ?? record.button ?? record.primaryCta;
  const cta = (() => {
    if (!ctaValue) return undefined;
    if (typeof ctaValue === 'string') {
      return { label: ctaValue, url: '#contact' } satisfies SiteHeaderCta;
    }
    if (typeof ctaValue !== 'object') return undefined;
    const ctaRecord = ctaValue as Record<string, unknown>;
    const label =
      toString(ctaRecord.label) ??
      toString(ctaRecord.text) ??
      toString(ctaRecord.title);
    if (!label) return undefined;
    const url =
      toAssetUrl(ctaRecord.url ?? ctaRecord.href ?? ctaRecord.link) ??
      toString(ctaRecord.url) ??
      toString(ctaRecord.href) ??
      toString(ctaRecord.link);
    const result: SiteHeaderCta = { label };
    if (url) result.url = url;
    return result;
  })();

  return cleanProps<SiteHeaderProps>({
    logo:
      toAssetUrl(record.logo) ??
      toAssetUrl(record.logoUrl) ??
      toAssetUrl(record.logoImage) ??
      toAssetUrl(record.brandLogo),
    backgroundImage:
      toAssetUrl(record.backgroundImage) ??
      toAssetUrl(record.background) ??
      toAssetUrl(record.heroImage) ??
      toAssetUrl(record.coverImage),
    menuItems,
    socials,
    cta,
  });
}

function mapHeroProps(data?: BlockData | null): Partial<HeroProps> {
  if (!data) return {};

  const titleLines = toStringArray(data.titleLines);

  const brandLogos = Array.isArray(data.brandLogos)
    ? (data.brandLogos as unknown[])
        .map((item) => {
          if (!item || typeof item !== 'object') return null;
          const record = item as Record<string, unknown>;
          const url = toString(record.url);
          if (!url) return null;
          const alt = toString(record.alt) ?? 'Brand logo';
          return { url, alt } as HeroBrandLogo;
        })
        .filter((logo): logo is HeroBrandLogo => logo !== null)
    : undefined;

  const ctas = Array.isArray(data.ctas)
    ? (data.ctas as unknown[])
        .map((item) => {
          if (!item || typeof item !== 'object') return null;
          const record = item as Record<string, unknown>;
          const label = toString(record.label);
          const url = toString(record.url);
          if (!label || !url) return null;
          const styleValue = toString(record.style);
          const style = styleValue === 'primary' || styleValue === 'secondary' ? styleValue : undefined;
          const cta: HeroCta = { label, url };
          if (style) cta.style = style;
          return cta;
        })
        .filter((cta): cta is HeroCta => cta !== null)
    : undefined;

  const subtitle = toString(data.subtitle);
  const videoUrl = toString(data.videoUrl);
  const posterUrl = toString(data.posterUrl) ?? toString((data as Record<string, unknown>).poster);

  return cleanProps<HeroProps>({
    titleLines,
    subtitle,
    brandLogos,
    videoUrl,
    posterUrl,
    ctas,
  });
}

function mapWordSliderProps(data?: BlockData | null): Partial<WordSliderProps> {
  if (!data) return {};
  return cleanProps<WordSliderProps>({
    words: toStringArray(data.words),
    repeatCount: toNumber(data.repeatCount),
  });
}

function mapGalleryProps(data?: BlockData | null): Partial<GalleryProps> {
  if (!data) return {};
  const images = Array.isArray(data.images)
    ? (data.images as unknown[])
        .map((item) => {
          if (!item || typeof item !== 'object') return null;
          const record = item as Record<string, unknown>;
          const url = toString(record.url);
          if (!url) return null;
          const alt = toString(record.alt) ?? 'Gallery image';
          return { url, alt } as GalleryImage;
        })
        .filter((image): image is GalleryImage => image !== null)
    : undefined;

  return cleanProps<GalleryProps>({
    images,
    animationDuration: toNumber(data.animationDuration),
    hoverScale: toNumber(data.hoverScale),
  });
}

function mapAdviceProps(data?: BlockData | null): Partial<AdviceProps> {
  if (!data) return {};

  const buttons = Array.isArray(data.buttons)
    ? (data.buttons as unknown[])
        .map((item) => {
          if (!item || typeof item !== 'object') return null;
          const record = item as Record<string, unknown>;
          const text = toString(record.text);
          const url = toString(record.url);
          const styleValue = toString(record.style);
          if (!text || !url) return null;
          const style: AdviceButton['style'] =
            styleValue === 'primary' || styleValue === 'secondary' ? styleValue : 'primary';
          return { text, url, style } as AdviceButton;
        })
        .filter((button): button is AdviceButton => button !== null)
    : undefined;

  const videos = Array.isArray(data.videos)
    ? (data.videos as unknown[])
        .map((item) => {
          if (!item || typeof item !== 'object') return null;
          const record = item as Record<string, unknown>;
          const videoId = toString(record.videoId);
          const title = toString(record.title);
          if (!videoId || !title) return null;
          const linkUrl = toString(record.linkUrl);
          return cleanProps<AdviceVideo>({ videoId, title, linkUrl });
        })
        .filter((video): video is AdviceVideo => video !== null)
    : undefined;

  return cleanProps<AdviceProps>({
    title: toString(data.title),
    subtitle: toString(data.subtitle),
    buttons,
    videos,
    mobileHeight: toNumber(data.mobileHeight),
  });
}

function mapStatsProps(data?: BlockData | null): Partial<StatsProps> {
  if (!data) return {};

  const items = Array.isArray(data.items)
    ? (data.items as unknown[])
        .map((item) => {
          if (!item || typeof item !== 'object') return null;
          const record = item as Record<string, unknown>;
          const numberValue = toString(record.number);
          const label = toString(record.label);
          if (!numberValue || !label) return null;
          return cleanProps<StatItem>({ number: numberValue, label, delay: toNumber(record.delay) });
        })
        .filter((entry): entry is StatItem => entry !== null)
    : undefined;

  return cleanProps<StatsProps>({
    items,
    backgroundColor: toString(data.backgroundColor),
  });
}

function mapServicesProps(data?: BlockData | null): Partial<ServicesProps> {
  if (!data) return {};

  const services = Array.isArray(data.items)
    ? (data.items as unknown[])
        .map((item) => {
          if (!item || typeof item !== 'object') return null;
          const record = item as Record<string, unknown>;
          const image = toString(record.image);
          const title = toString(record.title);
          const desc = toString(record.description) ?? toString(record.desc);
          const icon = toString(record.icon);
          if (!image || !title || !desc || !icon) return null;
          const linkUrl = toString(record.linkUrl);
          return cleanProps<ServiceItem>({ image, title, desc, icon, linkUrl });
        })
        .filter((service): service is ServiceItem => service !== null)
    : undefined;

  return cleanProps<ServicesProps>({
    title: toString(data.title),
    subtitle: toString(data.subtitle),
    backgroundColor: toString(data.backgroundColor),
    services,
  });
}

function mapWhyChooseUsProps(data?: BlockData | null): Partial<WhyChooseUsProps> {
  if (!data) return {};

  const items = Array.isArray(data.items)
    ? (data.items as unknown[])
        .map((item) => {
          if (!item || typeof item !== 'object') return null;
          const record = item as Record<string, unknown>;
          const icon = toString(record.icon);
          const title = toString(record.title);
          const description = toString(record.description);
          if (!icon || !title || !description) return null;
          return { icon, title, description };
        })
        .filter((entry): entry is { icon: string; title: string; description: string } => entry !== null)
    : undefined;

  return cleanProps<WhyChooseUsProps>({
    title: toString(data.title),
    subtitle: toString(data.subtitle),
    videoUrl: toString(data.videoUrl),
    videoPoster: toString(data.videoPoster) ?? toString((data as Record<string, unknown>).videoPlaceholder),
    videoAlt: toString(data.videoAlt),
    items,
    ctaText: toString(data.ctaText),
    ctaLink: toString(data.ctaLink),
  });
}

function mapWhy3DProps(data?: BlockData | null): Partial<Why3DProps> {
  if (!data) return {};
  const record = data as Record<string, unknown>;

  const parseCards = (value: unknown): Why3DCard[] | undefined => {
    if (!Array.isArray(value)) return undefined;
    const cards = (value as unknown[])
      .map((item) => {
        if (!item || typeof item !== 'object') return null;
        const itemRecord = item as Record<string, unknown>;
        const icon = toString(itemRecord.icon);
        const title = toString(itemRecord.title);
        if (!icon || !title) return null;

        const items = Array.isArray(itemRecord.items)
          ? (itemRecord.items as unknown[])
              .map((entry) => {
                if (!entry || typeof entry !== 'object') return null;
                const entryRecord = entry as Record<string, unknown>;
                const entryTitle = toString(entryRecord.title);
                const content = toString(entryRecord.content);
                if (!entryTitle || !content) return null;
                return { title: entryTitle, content } as Why3DAccordionItem;
              })
              .filter((accordion): accordion is Why3DAccordionItem => accordion !== null)
          : [];

        if (items.length === 0) return null;
        return { icon, title, items } as Why3DCard;
      })
      .filter((card): card is Why3DCard => card !== null);

    return cards.length > 0 ? cards : undefined;
  };

  return cleanProps<Why3DProps>({
    title: toString(record.title),
    subtitle: toString(record.subtitle),
    buttonText: toString(record.buttonText),
    buttonLink: toString(record.buttonLink),
    topCards: parseCards(record.topCards ?? record['topCards']),
    bottomCards: parseCards(record.bottomCards ?? record['bottomCards']),
  });
}


function mapTurningProps(data?: BlockData | null): Partial<TurningProps> {
  if (!data) return {};

  const clientLogos = Array.isArray(data.clientLogos)
    ? (data.clientLogos as unknown[])
        .map((item) => {
          if (!item || typeof item !== 'object') return null;
          const record = item as Record<string, unknown>;
          const image = toString(record.image);
          if (!image) return null;
          const alt = toString(record.alt) ?? 'Client logo';
          const clientName = toString(record.client_name) ?? alt;
          return { image, alt, client_name: clientName } as TurningClientLogo;
        })
        .filter((logo): logo is TurningClientLogo => logo !== null)
    : undefined;

  return cleanProps<TurningProps>({
    title: toString(data.title),
    description: toString(data.description),
    buttonText: toString(data.buttonText),
    buttonUrl: toString(data.buttonUrl),
    backgroundColor: toString(data.backgroundColor),
    textSize: toString(data.textSize),
    signatureImage: toString(data.signatureImage),
    founderName: toString(data.founderName),
    founderTitle: toString(data.founderTitle),
    clientLogos,
  });
}

function mapWeWorkProps(data?: BlockData | null): Partial<WeWorkProps> {
  if (!data) return {};
  const record = data as Record<string, unknown>;

  const rawSteps = Array.isArray(record.steps)
    ? (record.steps as unknown[])
    : Array.isArray(record.items)
      ? (record.items as unknown[])
      : undefined;

  const steps = rawSteps
    ? rawSteps
        .map((item) => {
          if (!item || typeof item !== 'object') return null;
          const stepRecord = item as Record<string, unknown>;
          const title = toString(stepRecord.title);
          const description = toString(stepRecord.description);
          const icon = toString(stepRecord.icon);
          if (!title || !description || !icon) return null;
          return { title, description, icon } as WeWorkStep;
        })
        .filter((step): step is WeWorkStep => step !== null)
    : undefined;

  const ctas = Array.isArray(record.ctas)
    ? (record.ctas as unknown[])
        .map((item) => {
          if (!item || typeof item !== 'object') return null;
          const ctaRecord = item as Record<string, unknown>;
          const label = toString(ctaRecord.label);
          const url = toString(ctaRecord.url);
          if (!label || !url) return null;
          return { label, url } as WeWorkCta;
        })
        .filter((cta): cta is WeWorkCta => cta !== null)
    : undefined;

  return cleanProps<WeWorkProps>({
    title: toString(record.title),
    subtitle: toString(record.subtitle),
    steps,
    ctas,
  });
}


function mapStayControlProps(data?: BlockData | null): Partial<StayControlProps> {
  if (!data) return {};
  const record = data as Record<string, unknown>;

  const featureSource = Array.isArray(record.features)
    ? (record.features as unknown[])
    : Array.isArray(record.items)
      ? (record.items as unknown[])
      : undefined;

  const features = featureSource
    ? featureSource
        .map((item) => {
          if (!item || typeof item !== 'object') return null;
          const featureRecord = item as Record<string, unknown>;
          const title = toString(featureRecord.title);
          const description = toString(featureRecord.description);
          if (!title || !description) return null;
          const iconSvg = toString(featureRecord.icon_svg) ?? toString(featureRecord.iconSvg);
          const width = toString(featureRecord.width);
          const row = toNumber(featureRecord.row);
          const feature: StayControlFeature = { title, description };
          if (iconSvg) feature.icon_svg = iconSvg;
          if (width) feature.width = width;
          if (row !== undefined) feature.row = row;
          return feature;
        })
        .filter((feature): feature is StayControlFeature => feature !== null)
    : undefined;

  const layoutValue = toString(record.layout);
  const layout =
    layoutValue === 'grid-2x2' || layoutValue === 'single-column' || layoutValue === 'custom'
      ? layoutValue
      : undefined;

  return cleanProps<StayControlProps>({
    title: toString(record.title),
    description: toString(record.description) ?? toString(record.subtitle),
    subtitle: toString(record.subtitle),
    features,
    backgroundColor: toString(record.backgroundColor),
    layout,
  });
}


function mapCareSectionProps(data?: BlockData | null): Partial<CareSectionProps> {
  if (!data) return {};
  const record = data as Record<string, unknown>;

  const title = toString(record.title);
  const description = toString(record.description);

  const buttonValue = record.button ?? record.cta ?? record.action;
  let button: CareSectionButton | undefined;
  if (typeof buttonValue === 'string') {
    button = { label: buttonValue, url: '#contact' };
  } else if (buttonValue && typeof buttonValue === 'object') {
    const buttonRecord = buttonValue as Record<string, unknown>;
    const label = toString(buttonRecord.label) ?? toString(buttonRecord.text) ?? toString(buttonRecord.title);
    const url =
      toString(buttonRecord.url) ??
      toString(buttonRecord.href) ??
      toString(buttonRecord.link);
    if (label) {
      button = { label };
      if (url) button.url = url;
    }
  }

  return cleanProps<CareSectionProps>({ title, description, button });
}

function mapContactProps(data?: BlockData | null): Partial<ContactProps> {
  if (!data) return {};
  const record = data as Record<string, unknown>;

  const cta = (() => {
    const raw = record.cta ?? record['cta'];
    if (!raw || typeof raw !== 'object') return undefined;
    const ctaRecord = raw as Record<string, unknown>;
    const label = toString(ctaRecord.label);
    const url = toString(ctaRecord.url);
    if (!label || !url) return undefined;
    return { label, url } as ContactCta;
  })();

  const contactLinks = Array.isArray(record.contactLinks)
    ? (record.contactLinks as unknown[])
        .map((item) => {
          if (!item || typeof item !== 'object') return null;
          const linkRecord = item as Record<string, unknown>;
          const label = toString(linkRecord.label);
          const value = toString(linkRecord.value);
          const href = toString(linkRecord.href);
          if (!label && !value && !href) return null;
          const link: ContactLink = { label: label ?? value ?? href ?? '' };
          if (value) link.value = value;
          if (href) link.href = href;
          return link;
        })
        .filter((link): link is ContactLink => link !== null)
    : undefined;

  const fields = Array.isArray(record.fields)
    ? (record.fields as unknown[])
        .map((item) => {
          if (!item || typeof item !== 'object') return null;
          const fieldRecord = item as Record<string, unknown>;
          const name = toString(fieldRecord.name);
          const label = toString(fieldRecord.label);
          const type = toString(fieldRecord.type) ?? 'text';
          if (!name || !label) return null;
          const field: ContactField = { name, label, type };
          const placeholder = toString(fieldRecord.placeholder);
          const required = typeof fieldRecord.required === 'boolean' ? fieldRecord.required : undefined;
          if (placeholder) field.placeholder = placeholder;
          if (required !== undefined) field.required = required;

          if (Array.isArray(fieldRecord.options)) {
            const options = (fieldRecord.options as unknown[])
              .map((option) => {
                if (!option || typeof option !== 'object') return null;
                const optionRecord = option as Record<string, unknown>;
                const optionLabel = toString(optionRecord.label);
                const value = toString(optionRecord.value);
                if (!optionLabel || !value) return null;
                return { label: optionLabel, value } as ContactFieldOption;
              })
              .filter((option): option is ContactFieldOption => option !== null);
            if (options.length > 0) field.options = options;
          }
          return field;
        })
        .filter((field): field is ContactField => field !== null)
    : undefined;

  const socialLinks = Array.isArray(record.socialLinks)
    ? (record.socialLinks as unknown[])
        .map((item) => {
          if (!item || typeof item !== 'object') return null;
          const socialRecord = item as Record<string, unknown>;
          const platform = toString(socialRecord.platform);
          const url = toString(socialRecord.url);
          if (!platform || !url) return null;
          const icon = toString(socialRecord.icon);
          const link: ContactSocialLink = { platform, url };
          if (icon) link.icon = icon;
          return link;
        })
        .filter((link): link is ContactSocialLink => link !== null)
    : undefined;

  return cleanProps<ContactProps>({
    title: toString(record.title),
    subtitle: toString(record.subtitle),
    backgroundColor: toString(record.backgroundColor),
    socialIntro: toString(record.socialIntro),
    cta,
    contactTitle: toString(record.contactTitle),
    contactDescription: toString(record.contactDescription),
    contactLinks,
    formTitle: toString(record.formTitle),
    formDescription: toString(record.formDescription),
    fields,
    privacyText: toString(record.privacyText),
    submitLabel: toString(record.submitLabel),
    promiseHighlight: toString(record.promiseHighlight),
    socialLinks,
  });
}

function mapSiteFooterProps(data?: BlockData | null): Partial<SiteFooterProps> {
  if (!data) return {};
  const record = data as Record<string, unknown>;

  const buttonValue = record.button ?? record.cta ?? record.callToAction;
  const button =
    buttonValue && typeof buttonValue === 'object'
      ? (() => {
          const buttonRecord = buttonValue as Record<string, unknown>;
          const label = toString(buttonRecord.label);
          if (!label) return undefined;
          const url = toString(buttonRecord.url) ?? toString(buttonRecord.href);
          const result: SiteFooterButton = { label };
          if (url) result.url = url;
          return result;
        })()
      : undefined;

  const linksFrom = (value: unknown): SiteFooterLink[] | undefined => {
    if (!Array.isArray(value)) return undefined;
    const links = (value as unknown[])
      .map((item) => {
        if (!item || typeof item !== 'object') return null;
        const linkRecord = item as Record<string, unknown>;
        const label = toString(linkRecord.label);
        if (!label) return null;
        const url = toString(linkRecord.url) ?? toString(linkRecord.href);
        const highlight = toBoolean(linkRecord.highlight);
        const link: SiteFooterLink = { label };
        if (url) link.url = url;
        if (highlight !== undefined) link.highlight = highlight;
        return link;
      })
      .filter((link): link is SiteFooterLink => link !== null);
    return links.length > 0 ? links : undefined;
  };

  const columnsSource = Array.isArray(record.columns)
    ? (record.columns as unknown[])
    : Array.isArray(record.sections)
      ? (record.sections as unknown[])
      : undefined;

  const columns = columnsSource
    ? columnsSource
        .map((item) => {
          if (!item || typeof item !== 'object') return null;
          const columnRecord = item as Record<string, unknown>;
          const title = toString(columnRecord.title);
          const links = linksFrom(columnRecord.links ?? columnRecord.items);
          if (!title && !links) return null;
          const column: SiteFooterColumn = {};
          if (title) column.title = title;
          if (links) column.links = links;
          return column;
        })
        .filter((column): column is SiteFooterColumn => column !== null)
    : undefined;

  const socialSource = Array.isArray(record.socialLinks)
    ? (record.socialLinks as unknown[])
    : Array.isArray(record.socials)
      ? (record.socials as unknown[])
      : undefined;

  const socialLinks = socialSource
    ? socialSource
        .map((item) => {
          if (!item || typeof item !== 'object') return null;
          const socialRecord = item as Record<string, unknown>;
          const url = toString(socialRecord.url);
          if (!url) return null;
          const platform = toString(socialRecord.platform) ?? toString(socialRecord.label);
          const icon = toString(socialRecord.icon);
          const social: SiteFooterSocialLink = { url };
          if (platform) social.platform = platform;
          if (icon) social.icon = icon;
          return social;
        })
        .filter((social): social is SiteFooterSocialLink => social !== null)
    : undefined;

  const locationLines =
    toStringArray(record.locationLines) ??
    (() => {
      const locationValue = toString(record.location) ?? toString(record.address);
      if (!locationValue) return undefined;
      const lines = locationValue
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
      return lines.length > 0 ? lines : undefined;
    })();

  return cleanProps<SiteFooterProps>({
    logo: toString(record.logo) ?? toString(record.logoUrl) ?? toString(record.logoImage),
    title: toString(record.title),
    description: toString(record.description),
    button,
    columns,
    socialTitle: toString(record.socialTitle) ?? toString(record.followUsTitle),
    socialLinks,
    locationTitle: toString(record.locationTitle),
    locationLines,
    contactTitle: toString(record.contactTitle),
    contactEmail: toString(record.contactEmail) ?? toString(record.email),
    copyright: toString(record.copyright),
  });
}


export default function Home() {
  const homepage = useQuery(api.homepage.getHomepage, { slug: 'home' });
  const blocks = (homepage?.blocks ?? []) as HomeBlock[];
  const hasSiteHeaderBlock = blocks.some((block) => block.kind === 'siteHeader');

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, []);

  if (homepage === undefined) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-sm uppercase tracking-wider">Dang tai noi dung trang chu...</div>
      </main>
    );
  }

  const renderedBlocks = blocks
    .map((block) => {
      const key = String(block._id ?? block.kind);
      switch (block.kind) {
        case 'siteHeader':
          return <SiteHeaderSection key={key} {...mapSiteHeaderProps(block.data)} />;
        case 'hero':
          return <HeroSection key={key} {...mapHeroProps(block.data)} />;
        case 'wordSlider':
          return <WordSliderSection key={key} {...mapWordSliderProps(block.data)} />;
        case 'gallery':
          return <GalleryPictureSection key={key} {...mapGalleryProps(block.data)} />;
        case 'yourAdvice':
          return <YourAdviceSection key={key} {...mapAdviceProps(block.data)} />;
        case 'stats':
          return <StatsSection key={key} {...mapStatsProps(block.data)} />;
        case 'services':
          return <ServicesSection key={key} {...mapServicesProps(block.data)} />;
        case 'whyChooseUs':
          return <WhyChooseUsSection key={key} {...mapWhyChooseUsProps(block.data)} />;
        case 'why3DVisuals':
          return <Why3DVisualsSection key={key} {...mapWhy3DProps(block.data)} />;
        case 'turning':
          return <TurningSection key={key} {...mapTurningProps(block.data)} />;
        case 'weWork':
          return <WeWorkSection key={key} {...mapWeWorkProps(block.data)} />;
        case 'careSection':
          return <CareSection key={key} {...mapCareSectionProps(block.data)} />;
        case 'stayControl':
          return <StayControlSection key={key} {...mapStayControlProps(block.data)} />;
        case 'contactForm':
          return <ContactFormSection key={key} {...mapContactProps(block.data)} />;
        case 'siteFooter':
          return <SiteFooterSection key={key} {...mapSiteFooterProps(block.data)} />;
        default:
          return null;
      }
    })
    .filter(Boolean);

  if (renderedBlocks.length === 0) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col">
        {!hasSiteHeaderBlock && <SiteHeaderSection key="fallback-siteHeader" />}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-sm uppercase tracking-wider">
            Chua co block nao duoc hien thi. Vui long cau hinh noi dung tai dashboard.
          </div>
        </div>
      </main>
    );
  }

  const finalBlocks = hasSiteHeaderBlock
    ? renderedBlocks
    : [<SiteHeaderSection key="fallback-siteHeader" />, ...renderedBlocks];

  return <main className="min-h-screen">{finalBlocks}</main>;
}
