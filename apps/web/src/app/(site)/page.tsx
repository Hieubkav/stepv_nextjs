'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useSiteLayoutData } from '@/context/site-layout-data';
import type { BlockData, HomeBlock } from '@/lib/site-layout';
import { StudioLoader } from '@/components/ui/studio-loader';
import {
  HeroSkeleton,
  WordSliderSkeleton,
  GallerySkeleton,
  AdviceSkeleton,
  StatsSkeleton,
  ServicesSkeleton,
  WhyChooseUsSkeleton,
  Why3DSkeleton,
  TurningSkeleton,
  WeWorkSkeleton,
  CareSkeleton,
  StayControlSkeleton,
  ContactSkeleton,
} from '@/components/ui/section-skeletons';

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

const HeroSection = dynamic(() => import('@/components/sections/HeroSection'), {
  ssr: false,
  loading: () => <HeroSkeleton />,
});

const WordSliderSection = dynamic(() => import('@/components/sections/WordSliderSection'), {
  ssr: false,
  loading: () => <WordSliderSkeleton />,
});

const GalleryPictureSection = dynamic(() => import('@/components/sections/GalleryPictureSection'), {
  ssr: false,
  loading: () => <GallerySkeleton />,
});

const YourAdviceSection = dynamic(() => import('@/components/sections/YourAdviceSection'), {
  ssr: false,
  loading: () => <AdviceSkeleton />,
});

const StatsSection = dynamic(() => import('@/components/sections/StatsSection'), {
  ssr: false,
  loading: () => <StatsSkeleton />,
});

const ServicesSection = dynamic(() => import('@/components/sections/ServicesSection'), {
  ssr: false,
  loading: () => <ServicesSkeleton />,
});

const WhyChooseUsSection = dynamic(() => import('@/components/sections/WhyChooseUsSection'), {
  ssr: false,
  loading: () => <WhyChooseUsSkeleton />,
});

const Why3DVisualsSection = dynamic(() => import('@/components/sections/Why3DVisualsSection'), {
  ssr: false,
  loading: () => <Why3DSkeleton />,
});

const TurningSection = dynamic(() => import('@/components/sections/TurningSection'), {
  ssr: false,
  loading: () => <TurningSkeleton />,
});

const WeWorkSection = dynamic(() => import('@/components/sections/WeWorkSection'), {
  ssr: false,
  loading: () => <WeWorkSkeleton />,
});

const CareSection = dynamic(() => import('@/components/sections/CareSection'), {
  ssr: false,
  loading: () => <CareSkeleton />,
});

const StayControlSection = dynamic(() => import('@/components/sections/StayControlSection'), {
  ssr: false,
  loading: () => <StayControlSkeleton />,
});

const ContactFormSection = dynamic(() => import('@/components/sections/ContactFormSection'), {
  ssr: false,
  loading: () => <ContactSkeleton />,
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



export default function Home() {
  const { isLoading, contentBlocks } = useSiteLayoutData();

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

  if (isLoading) {
    return <StudioLoader variant="fullscreen" text="Đang tải nội dung" />;
  }

  const renderedBlocks = contentBlocks
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
        case 'careSection':
          return <CareSection key={key} {...mapCareSectionProps(block.data)} />;
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
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center text-sm uppercase tracking-wider">
          Chưa có block nào được hiển thị. Vui lòng cấu hình nội dung tại dashboard.
        </div>
      </div>
    );
  }

  return <div className="min-h-screen">{renderedBlocks}</div>;
}
