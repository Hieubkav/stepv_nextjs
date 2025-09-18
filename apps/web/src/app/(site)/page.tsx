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
type Why3DProps = { title?: string; subtitle?: string; buttonText?: string; buttonLink?: string };
type TurningClientLogo = { image: string; alt: string; client_name: string };
type TurningProps = { title?: string; description?: string; buttonText?: string; buttonUrl?: string; backgroundColor?: string; textSize?: string; signatureImage?: string; founderName?: string; founderTitle?: string; clientLogos?: TurningClientLogo[] };
type WeWorkStep = { title: string; description: string; icon: string };
type WeWorkProps = { title?: string; subtitle?: string; steps?: WeWorkStep[] };
type StayControlFeature = { title: string; description: string; icon_svg: string; width: string; row: number };
type StayControlProps = { title?: string; description?: string; features?: StayControlFeature[]; backgroundColor?: string; layout?: 'grid-2x2' | 'single-column' | 'custom' };
type ContactProps = { title?: string; subtitle?: string; backgroundColor?: string };

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

const StayControlSection = dynamic(() => import('@/components/sections/StayControlSection'), {
  ssr: false,
  loading: () => (
    <div className="h-screen bg-black flex items-center justify-center">
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

const toStringArray = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const result = (value as unknown[]).filter((item): item is string => typeof item === 'string' && item.length > 0);
  return result.length > 0 ? result : undefined;
};

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
  return cleanProps<Why3DProps>({
    title: toString(data.title),
    subtitle: toString(data.subtitle),
    buttonText: toString(data.buttonText),
    buttonLink: toString(data.buttonLink),
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

  const steps = Array.isArray(data.steps)
    ? (data.steps as unknown[])
        .map((item) => {
          if (!item || typeof item !== 'object') return null;
          const record = item as Record<string, unknown>;
          const title = toString(record.title);
          const description = toString(record.description);
          const icon = toString(record.icon);
          if (!title || !description || !icon) return null;
          return { title, description, icon } as WeWorkStep;
        })
        .filter((step): step is WeWorkStep => step !== null)
    : undefined;

  return cleanProps<WeWorkProps>({
    title: toString(data.title),
    subtitle: toString(data.subtitle),
    steps,
  });
}

function mapStayControlProps(data?: BlockData | null): Partial<StayControlProps> {
  if (!data) return {};

  const features = Array.isArray(data.features)
    ? (data.features as unknown[])
        .map((item) => {
          if (!item || typeof item !== 'object') return null;
          const record = item as Record<string, unknown>;
          const title = toString(record.title);
          const description = toString(record.description);
          const iconSvg = toString(record.icon_svg);
          const width = toString(record.width);
          const row = toNumber(record.row);
          if (!title || !description || !iconSvg || !width || row === undefined) return null;
          return { title, description, icon_svg: iconSvg, width, row } as StayControlFeature;
        })
        .filter((feature): feature is StayControlFeature => feature !== null)
    : undefined;

  const layoutValue = toString(data.layout);
  const layout = layoutValue === 'grid-2x2' || layoutValue === 'single-column' || layoutValue === 'custom' ? layoutValue : undefined;

  return cleanProps<StayControlProps>({
    title: toString(data.title),
    description: toString(data.description),
    features,
    backgroundColor: toString(data.backgroundColor),
    layout,
  });
}

function mapContactProps(data?: BlockData | null): Partial<ContactProps> {
  if (!data) return {};
  return cleanProps<ContactProps>({
    title: toString(data.title),
    subtitle: toString(data.subtitle),
    backgroundColor: toString(data.backgroundColor),
  });
}
export default function Home() {
  const homepage = useQuery(api.homepage.getHomepage, { slug: 'home' });
  const blocks = (homepage?.blocks ?? []) as HomeBlock[];

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
        case 'stayControl':
          return <StayControlSection key={key} {...mapStayControlProps(block.data)} />;
        case 'contactForm':
          return <ContactFormSection key={key} {...mapContactProps(block.data)} />;
        default:
          return null;
      }
    })
    .filter(Boolean);

  if (renderedBlocks.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center text-sm uppercase tracking-wider">
          Chua co block nao duoc hien thi. Vui long cau hinh noi dung tai dashboard.
        </div>
      </main>
    );
  }

  return <main className="min-h-screen">{renderedBlocks}</main>;
}
