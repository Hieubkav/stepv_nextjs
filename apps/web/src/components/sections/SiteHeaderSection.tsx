'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import XIcon from '@/components/ui/XIcon';
import { getLucideIcon } from '@/lib/lucide-icons';
import type { SiteHeaderCta, SiteHeaderMenuItem, SiteHeaderProps, SiteHeaderSocial } from '@/lib/site-layout';

type SiteHeaderSectionProps = SiteHeaderProps;

const DEFAULT_MENU: SiteHeaderMenuItem[] = [
  { label: 'TRANG CHU', url: '/', highlight: true },
  { label: 'DU AN', url: '#projects' },
  { label: 'DICH VU', url: '#services' },
  { label: 'VE CHUNG TOI', url: '#about' },
  { label: 'THU VIEN', url: '#library' },
  { label: 'LIEN HE', url: '#contact' },
];

const DEFAULT_SOCIALS: SiteHeaderSocial[] = [
  { platform: 'YouTube', url: 'https://www.youtube.com/@dohystudio', icon: 'Youtube' },
  { platform: 'TikTok', url: 'https://www.tiktok.com/@dohystudio', icon: 'Music4' },
  { platform: 'Facebook', url: 'https://www.facebook.com/profile.php?id=61574798173124&sk=friends_likes', icon: 'Facebook' },
  { platform: 'Instagram', url: 'https://www.instagram.com/dohy_studio/', icon: 'Instagram' },
  { platform: 'Pinterest', url: 'https://www.pinterest.com/dohy_studio/', icon: 'Palette' },
  { platform: 'X', url: 'https://x.com/dohystudio', icon: 'X' },
];

const DEFAULT_CTA: SiteHeaderCta = { label: 'LIEN HE', url: '#contact' };
const FALLBACK_LOGO = '/images/logo.png';

type NormalizedMenuItem = {
  label: string;
  href: string;
  isAnchor: boolean;
  isExternal: boolean;
  highlight: boolean;
  active: boolean;
};

type NormalizedSocialItem = {
  platform: string;
  url: string;
  icon?: string;
};

const normalizePath = (value: string) => {
  if (!value) return '/';
  if (value.length > 1 && value.endsWith('/')) return value.slice(0, -1);
  return value;
};

const isExternalLink = (href: string) => /^(https?:|mailto:|tel:)/i.test(href);

const getSocialColorClass = (platform?: string) => {
  const key = platform?.toLowerCase();
  switch (key) {
    case 'youtube':
      return 'text-red-500';
    case 'tiktok':
      return 'text-white';
    case 'facebook':
      return 'text-blue-500';
    case 'instagram':
      return 'text-pink-500';
    case 'pinterest':
      return 'text-red-600';
    case 'x':
    case 'twitter':
      return 'text-white';
    default:
      return 'text-white';
  }
};

const renderSocialIcon = (icon?: string, platform?: string) => {
  const normalizedIcon = icon?.trim();
  const normalizedPlatform = platform?.trim();
  if (normalizedIcon && normalizedIcon.toLowerCase() === 'x') {
    return <XIcon className="h-4 w-4" size={16} />;
  }

  const IconComponent =
    (normalizedIcon ? getLucideIcon(normalizedIcon) : undefined) ??
    (normalizedPlatform ? getLucideIcon(normalizedPlatform) : undefined) ??
    getLucideIcon('Share2');

  return IconComponent ? <IconComponent className="h-4 w-4" /> : null;
};

const SiteHeaderSection = ({
  logo,
  backgroundImage,
  menuItems,
  socials,
  cta,
}: SiteHeaderSectionProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const resolvedLogo = typeof logo === 'string' && logo.trim().length > 0 ? logo.trim() : FALLBACK_LOGO;
  const normalizedPathname = normalizePath(pathname ?? '/');

  const resolvedMenu = useMemo<NormalizedMenuItem[]>(() => {
    const source = (menuItems ?? []).filter((item) => item?.label?.trim());
    const base = source.length > 0 ? source : DEFAULT_MENU;

    return base
      .map((item) => {
        if (!item?.label) return null;
        const label = item.label.trim();
        if (!label) return null;
        const href = (item.url ?? '#').trim() || '#';
        const isAnchor = href.startsWith('#');
        const isExternal = isExternalLink(href);
        const normalizedHref = isAnchor ? href : normalizePath(href);
        const active =
          item.highlight === true ||
          (!isExternal && !isAnchor && normalizePath(normalizedHref) === normalizedPathname) ||
          (href === '/' && normalizedPathname === '/');

        return {
          label,
          href,
          isAnchor,
          isExternal,
          highlight: item.highlight === true,
          active,
        } satisfies NormalizedMenuItem;
      })
      .filter((value): value is NormalizedMenuItem => value !== null);
  }, [menuItems, normalizedPathname]);

  const resolvedSocials = useMemo<NormalizedSocialItem[]>(() => {
    const source = (socials ?? []).filter((item) => item?.url);
    const base = source.length > 0 ? source : DEFAULT_SOCIALS;

    return base.reduce<NormalizedSocialItem[]>((acc, item) => {
      if (!item?.url) return acc;
      const platform = item.platform?.trim() ?? '';
      acc.push({
        platform,
        url: item.url,
        icon: item.icon?.trim() ?? platform,
      });
      return acc;
    }, []);
  }, [socials]);

  const resolvedCta = useMemo<SiteHeaderCta>(() => {
    if (cta?.label) {
      const href = cta.url && cta.url.trim().length > 0 ? cta.url.trim() : '#contact';
      return { label: cta.label, url: href };
    }
    return DEFAULT_CTA;
  }, [cta]);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleAnchorNavigation = (href: string) => {
    if (!href.startsWith('#')) return;
    if (normalizedPathname === '/') {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.location.assign(`/${href}`);
    }
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const renderMenuAction = (
    item: NormalizedMenuItem,
    variant: 'desktop' | 'mobile',
    closeAfter?: () => void,
  ) => {
    const baseClass =
      variant === 'desktop'
        ? 'px-3 py-2 uppercase font-semibold text-sm whitespace-nowrap transition-colors  border-transparent'
        : 'block px-4 py-3 uppercase font-semibold text-sm transition-colors rounded-lg';
    const activeClass =
      variant === 'desktop'
        ? item.highlight || item.active
          ? 'text-white border-white'
          : 'text-white hover:text-gray-300'
        : item.highlight || item.active
          ? 'text-black bg-white'
          : 'text-white hover:bg-white/10';
    const className = `${baseClass} ${activeClass}`;

    if (item.isAnchor) {
      return (
        <button
          type="button"
          onClick={() => {
            handleAnchorNavigation(item.href);
            closeAfter?.();
          }}
          className={className}
        >
          {item.label}
        </button>
      );
    }

    if (item.isExternal) {
      return (
        <a
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
          onClick={() => closeAfter?.()}
        >
          {item.label}
        </a>
      );
    }

    return (
      <a href={item.href} className={className} onClick={() => closeAfter?.()}>
        {item.label}
      </a>
    );
  };

  const renderDesktopCta = () => {
    if (!resolvedCta.label) return null;
    const className = 'hidden lg:inline-block uppercase text-xs font-semibold text-black bg-white rounded-full px-6 py-3 transition-transform hover:scale-105';
    const href = resolvedCta.url ?? '#contact';

    if (href.startsWith('#')) {
      return (
        <a
          href={href}
          onClick={(event) => {
            event.preventDefault();
            handleAnchorNavigation(href);
          }}
          className={className}
        >
          {resolvedCta.label}
        </a>
      );
    }

    if (isExternalLink(href)) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
          {resolvedCta.label}
        </a>
      );
    }

    return (
      <a
        href={href}
        className={className}
        onClick={(event) => {
          event.preventDefault();
          window.location.assign(href);
        }}
      >
        {resolvedCta.label}
      </a>
    );
  };

  const renderMobileCta = () => {
    if (!resolvedCta.label) return null;
    const className = 'block w-full text-center uppercase text-sm font-semibold text-black bg-white rounded-full px-6 py-3 transition-transform hover:scale-105';
    const href = resolvedCta.url ?? '#contact';

    if (href.startsWith('#')) {
      return (
        <a
          href={href}
          onClick={(event) => {
            event.preventDefault();
            handleAnchorNavigation(href);
            closeMobileMenu();
          }}
          className={className}
        >
          {resolvedCta.label}
        </a>
      );
    }

    if (isExternalLink(href)) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
          onClick={closeMobileMenu}
        >
          {resolvedCta.label}
        </a>
      );
    }

    return (
      <a
        href={href}
        className={className}
        onClick={(event) => {
          event.preventDefault();
          closeMobileMenu();
          window.location.assign(href);
        }}
      >
        {resolvedCta.label}
      </a>
    );
  };

  const renderLogo = (size: 'large' | 'medium' | 'mobile') => {
    const dimension = size === 'large' ? 80 : size === 'medium' ? 64 : 56;
    const heightClass =
      size === 'large' ? 'h-20 w-auto' : size === 'medium' ? 'h-16 w-auto' : 'h-14 w-auto';

    if (!resolvedLogo) {
      return (
        <a href="/" className="text-xl font-semibold uppercase tracking-wide text-white">
          DOHY MEDIA
        </a>
      );
    }

    return (
      <a href="/">
        <Image
          src={resolvedLogo}
          alt="Site logo"
          width={dimension}
          height={dimension}
          className={heightClass}
          priority
        />
      </a>
    );
  };

  const shellStyle: CSSProperties | undefined = backgroundImage
    ? {
        backgroundImage: `linear-gradient(rgba(10, 10, 10, 0.6), rgba(10, 10, 10, 0.6)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : undefined;

  const shellBase = 'relative overflow-hidden flex items-center justify-between gap-2 w-full px-6 sm:px-8 py-4 backdrop-blur-2xl transition-all duration-500';
  const shellTop = 'bg-black/30 border-b border-white/10 rounded-none shadow-none';
  const shellSticky = 'bg-black/60 border border-white/10 rounded-full shadow-2xl shadow-black/50 sm:w-[96%] sm:mx-auto sm:mt-3';

  const renderHeaderBar = (variant: 'top' | 'sticky') => (
    <>
      <div className="w-1/5 flex-shrink-0">
        {renderLogo(variant === 'top' ? 'large' : 'medium')}
      </div>

      <nav className="hidden lg:flex justify-center flex-1 max-w-3xl mx-4">
        <ul className="flex items-center justify-center space-x-1 w-full">
          {resolvedMenu.map((item) => (
            <li key={`${variant}-${item.label}-${item.href}`} className="flex-shrink-0">
              {renderMenuAction(item, 'desktop')}
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex items-center justify-end w-1/5 flex-shrink-0 gap-3">
        <div className="hidden lg:flex items-center gap-2">
          {resolvedSocials.map((social, index) => (
            <a
              key={`${social.platform}-${index}`}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-8 h-8 ${getSocialColorClass(social.platform)} hover:scale-110 transition-all duration-300 flex items-center justify-center`}
            >
              {renderSocialIcon(social.icon, social.platform)}
            </a>
          ))}
        </div>

        {renderDesktopCta()}

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((value) => !value)}
          className="lg:hidden text-white text-2xl focus:outline-none"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
        </button>
      </div>
    </>
  );

  return (
    <>
      <header
        id="site-header"
        className="font-sans fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out"
      >
        <div className={`${shellBase} ${isScrolled ? shellSticky : shellTop}`} style={shellStyle}>
          <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between gap-2">
            {renderHeaderBar(isScrolled ? 'sticky' : 'top')}
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div
          id="mobile-menu"
          className="fixed inset-0 z-[60] bg-black/90 text-white flex flex-col"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            {renderLogo('mobile')}
            <button
              type="button"
              onClick={closeMobileMenu}
              className="text-white"
              aria-label="Close menu"
            >
              <X className="h-7 w-7" />
            </button>
          </div>

          <nav className="p-6 overflow-y-auto">
            <ul className="space-y-4">
              {resolvedMenu.map((item) => (
                <li key={`mobile-${item.label}-${item.href}`}>
                  {renderMenuAction(item, 'mobile', closeMobileMenu)}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              {renderMobileCta()}
            </div>

            {resolvedSocials.length > 0 && (
              <div className="flex space-x-4 mt-8 justify-center">
                {resolvedSocials.map((social, index) => (
                  <a
                    key={`mobile-${social.platform}-${index}`}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 ${getSocialColorClass(social.platform)} hover:bg-white/10 rounded-full flex items-center justify-center transition-all duration-300`}
                    onClick={closeMobileMenu}
                  >
                    {renderSocialIcon(social.icon, social.platform)}
                  </a>
                ))}
              </div>
            )}
          </nav>
        </div>
      )}

      <style jsx>{`
        .transition-all {
          will-change: transform, opacity;
        }

        #mobile-menu {
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        nav ul {
          flex-wrap: nowrap;
          overflow: hidden;
        }

        nav ul li {
          flex-shrink: 0;
          min-width: fit-content;
        }

        @media (max-width: 1024px) {
          #site-header .w-1\/5 {
            width: auto;
          }
        }

        @media (min-width: 1024px) and (max-width: 1280px) {
          .max-w-3xl {
            max-width: 42rem;
          }

          .space-x-1 > :not([hidden]) ~ :not([hidden]) {
            margin-left: 0.125rem;
          }
        }

        @media (min-width: 1280px) {
          .max-w-3xl {
            max-width: 48rem;
          }

          .space-x-1 > :not([hidden]) ~ :not([hidden]) {
            margin-left: 0.25rem;
          }
        }
      `}</style>
    </>
  );
};

export default SiteHeaderSection;

