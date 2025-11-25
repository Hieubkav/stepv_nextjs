'use client';

import { useContext, useEffect, useMemo, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2, Menu, X } from 'lucide-react';
import XIcon from '@/components/ui/XIcon';
import { Button } from '@/components/ui/button';
import { HeaderSkeleton } from '@/components/ui/section-skeletons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import CartIcon from '@/components/cart/CartIcon';
import { useCustomerAuth } from '@/features/auth';
import { getLucideIcon } from '@/lib/lucide-icons';
import { SiteLayoutDataContext } from '@/context/site-layout-data';
import type { SiteHeaderAuth, SiteHeaderMenuItem, SiteHeaderProps, SiteHeaderSocial } from '@/lib/site-layout';

type SiteHeaderSectionProps = SiteHeaderProps;

type ResolvedAuth = {
  enabled: boolean;
  loginUrl: string;
  registerUrl: string;
  profileUrl?: string;
  ordersUrl?: string;
  libraryUrl?: string;
  badgeLabel: string;
  dropdownTitle: string;
  showCart: boolean;
};

const FALLBACK_LOGO = '/images/logo.png';
const DEFAULT_AUTH: ResolvedAuth = {
  enabled: true,
  loginUrl: '/login',
  registerUrl: '/register',
  profileUrl: '/profile',
  ordersUrl: '/don-dat',
  libraryUrl: '/my-library',
  badgeLabel: 'Khách hàng',
  dropdownTitle: 'Không gian khách hàng',
  showCart: true,
};

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
    return <XIcon className="h-5 w-5" size={20} />;
  }

  const IconComponent =
    (normalizedIcon ? getLucideIcon(normalizedIcon) : undefined) ??
    (normalizedPlatform ? getLucideIcon(normalizedPlatform) : undefined) ??
    getLucideIcon('Share2');

  return IconComponent ? <IconComponent className="h-5 w-5" /> : null;
};

const SiteHeaderSection = ({
  logo,
  backgroundImage,
  menuItems,
  socials,
  auth,
}: SiteHeaderSectionProps) => {
  const layout = useContext(SiteLayoutDataContext);
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { customer, status: authStatus, logout } = useCustomerAuth();

  const resolvedLogo = typeof logo === 'string' && logo.trim().length > 0 ? logo.trim() : FALLBACK_LOGO;
  const normalizedPathname = normalizePath(pathname ?? '/');

  const resolvedMenu = useMemo<NormalizedMenuItem[]>(() => {
    const source = (menuItems ?? []).filter((item) => item?.label?.trim());
    return source
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
    return source.reduce<NormalizedSocialItem[]>((acc, item) => {
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

  const resolvedAuth = useMemo<ResolvedAuth>(() => ({
    ...DEFAULT_AUTH,
    ...auth,
    enabled: auth?.enabled ?? DEFAULT_AUTH.enabled,
  }), [auth]);

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
        ? 'inline-flex items-center px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-300 rounded-md focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/50'
        : 'block px-4 py-3 text-sm font-medium transition-colors duration-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-white';
    const activeClass =
      variant === 'desktop'
        ? item.highlight || item.active
          ? 'text-white'
          : 'text-white/90 hover:text-[#FFD700]'
        : item.highlight || item.active
          ? 'text-black bg-white'
          : 'text-white hover:bg-[#FFD700]/20 hover:text-[#FFD700]';
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

  const showSkeleton =
    Boolean(layout?.isLoading) ||
    !(
      Boolean(logo) ||
      Boolean(backgroundImage) ||
      resolvedMenu.length > 0 ||
      resolvedSocials.length > 0
    );

  if (showSkeleton) {
    return <HeaderSkeleton />;
  }

  const renderDesktopActions = () => {
    if (!resolvedAuth.enabled) return null;
    if (resolvedAuth.enabled) {
      return (
        <div className="hidden lg:flex items-center gap-3">
          {resolvedAuth.showCart ? <CartIcon tone="light" /> : null}
          <CustomerMenuButton
            auth={resolvedAuth}
            customer={customer}
            status={authStatus}
            onLogout={logout}
            onNavigate={(href) => router.push(href as any)}
          />
        </div>
      );
    }
    return null;
  };

  const renderMobileActions = () => {
    if (!resolvedAuth.enabled) return null;
    if (resolvedAuth.enabled) {
      return (
        <CustomerMobilePanel
          auth={resolvedAuth}
          customer={customer}
          status={authStatus}
          onLogout={() => {
            logout();
            closeMobileMenu();
          }}
          onNavigate={(href) => {
            closeMobileMenu();
            router.push(href as any);
          }}
        />
      );
    }
    return null;
  };

  const renderLogo = (size: 'large' | 'medium' | 'mobile') => {
    const dimension = size === 'large' ? 80 : size === 'medium' ? 64 : 56;
    const heightClass =
      size === 'large' ? 'h-20 w-auto' : size === 'medium' ? 'h-16 w-auto' : 'h-14 w-auto';

    if (!resolvedLogo) {
      return (
        <a href="/" className="text-xl font-semibold uppercase tracking-wide text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/50 rounded-lg">
          DOHY MEDIA
        </a>
      );
    }

    return (
      <a href="/" className="block focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/50 rounded-lg">
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

  const shellBase = 'relative overflow-hidden flex items-center justify-between gap-6 w-full px-6 lg:px-8 py-4 backdrop-blur-2xl transition-all duration-500';
  const shellTop = 'bg-black/30 border-b border-white/10 rounded-none shadow-none';
  const shellSticky = 'bg-black/60 border border-white/10 rounded-full shadow-2xl shadow-black/50 sm:w-[96%] sm:mx-auto sm:mt-3';

  const renderHeaderBar = (variant: 'top' | 'sticky') => (
    <>
      <div className="flex-shrink-0">
        {renderLogo(variant === 'top' ? 'large' : 'medium')}
      </div>

      <nav className="hidden lg:flex justify-center flex-1" aria-label="Main navigation">
        <ul className="flex items-center justify-center gap-6">
          {resolvedMenu.map((item) => (
            <li key={`${variant}-${item.label}-${item.href}`}>
              {renderMenuAction(item, 'desktop')}
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex items-center justify-end flex-shrink-0 gap-3">
        <div className="hidden lg:flex items-center gap-2" role="list" aria-label="Social media links">
          {resolvedSocials.map((social, index) => (
            <a
              key={`${social.platform}-${index}`}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.platform}
              className={`flex items-center justify-center w-10 h-10 ${getSocialColorClass(social.platform)} hover:scale-110 transition-all duration-200 rounded-md focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/50`}
            >
              {renderSocialIcon(social.icon, social.platform)}
            </a>
          ))}
        </div>

        {renderDesktopActions()}

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((value) => !value)}
          className="lg:hidden text-white focus:outline-none focus:ring-2 focus:ring-white rounded-md"
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
              {renderMobileActions()}
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
          min-width: fit-content;
        }
      `}</style>
    </>
  );
};

type CustomerInfo = { fullName?: string; account?: string; email?: string } | null;
const displayCustomerName = (customer: CustomerInfo) =>
  customer?.fullName || customer?.email || customer?.account || 'Khách hàng';

type CustomerMenuButtonProps = {
  auth: ResolvedAuth;
  customer: CustomerInfo;
  status: 'idle' | 'loading' | 'authenticated';
  onLogout: () => void;
  onNavigate: (href: string) => void;
};

function CustomerMenuButton({ auth, customer, status, onLogout, onNavigate }: CustomerMenuButtonProps) {
  if (status === 'loading') return <CustomerLoadingButton />;
  if (!customer) return <CustomerGuestButtons auth={auth} onNavigate={onNavigate} />;
  return <CustomerDropdown auth={auth} customer={customer} onLogout={onLogout} />;
}

function CustomerLoadingButton() {
  return (
    <Button type="button" variant="ghost" size="sm" className="h-11 px-3 text-white gap-2 hover:bg-white/10" disabled>
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>Đang tải</span>
    </Button>
  );
}

function CustomerGuestButtons({ auth, onNavigate }: { auth: ResolvedAuth; onNavigate: (href: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="h-10 px-4 font-semibold border-white/40 text-white bg-white/5 hover:bg-white/10"
        onClick={() => onNavigate(auth.loginUrl)}
      >
        Đăng nhập
      </Button>
      <Button
        size="sm"
        className="h-10 px-4 font-semibold bg-white text-black hover:bg-gray-100"
        onClick={() => onNavigate(auth.registerUrl)}
      >
        Đăng ký
      </Button>
    </div>
  );
}

type CustomerDropdownProps = { auth: ResolvedAuth; customer: CustomerInfo; onLogout: () => void };

function CustomerDropdown({ auth, customer, onLogout }: CustomerDropdownProps) {
  const displayName = displayCustomerName(customer);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="h-11 px-3 text-white hover:bg-white/10 gap-2">
          <div className="flex flex-col items-start leading-tight">
            <span className="text-[10px] uppercase font-semibold tracking-[0.35em] text-white/70">{auth.badgeLabel}</span>
            <span className="text-[13px] font-semibold max-w-[140px] truncate">{displayName}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="space-y-1">
          <p className="text-[11px] uppercase font-medium tracking-[0.3em] text-muted-foreground">{auth.dropdownTitle}</p>
          <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {auth.profileUrl && (
          <DropdownMenuItem asChild>
            <a href={auth.profileUrl} className="flex w-full items-center justify-between cursor-pointer">
              <span>Thông tin khách hàng</span>
            </a>
          </DropdownMenuItem>
        )}
        {auth.ordersUrl && (
          <DropdownMenuItem asChild>
            <a href={auth.ordersUrl} className="flex w-full items-center justify-between cursor-pointer">
              <span>Đơn hàng của tôi</span>
            </a>
          </DropdownMenuItem>
        )}
        {auth.libraryUrl && (
          <DropdownMenuItem asChild>
            <a href={auth.libraryUrl} className="flex w-full items-center justify-between cursor-pointer">
              <span>Thư viện & khóa học</span>
            </a>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            onLogout();
          }}
          className="cursor-pointer"
        >
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type CustomerMobilePanelProps = {
  auth: ResolvedAuth;
  customer: CustomerInfo;
  status: 'idle' | 'loading' | 'authenticated';
  onLogout: () => void;
  onNavigate: (href: string) => void;
};

function CustomerMobilePanel({ auth, customer, status, onLogout, onNavigate }: CustomerMobilePanelProps) {
  if (status === 'loading') return <p className="text-white/80">Đang tải tài khoản...</p>;
  if (!customer) return <CustomerMobileGuest auth={auth} onNavigate={onNavigate} />;
  return <CustomerMobileLogged auth={auth} customer={customer} onLogout={onLogout} onNavigate={onNavigate} />;
}

function CustomerMobileGuest({ auth, onNavigate }: { auth: ResolvedAuth; onNavigate: (href: string) => void }) {
  return (
    <div className="space-y-3">
      <Button className="w-full h-11 font-semibold bg-white text-black hover:bg-gray-100" onClick={() => onNavigate(auth.loginUrl)}>
        Đăng nhập
      </Button>
      <Button
        variant="outline"
        className="w-full h-11 font-semibold border-white/40 text-white bg-white/5 hover:bg-white/10"
        onClick={() => onNavigate(auth.registerUrl)}
      >
        Đăng ký
      </Button>
    </div>
  );
}

type CustomerMobileLoggedProps = {
  auth: ResolvedAuth;
  customer: CustomerInfo;
  onLogout: () => void;
  onNavigate: (href: string) => void;
};

function CustomerMobileLogged({ auth, customer, onLogout, onNavigate }: CustomerMobileLoggedProps) {
  const displayName = displayCustomerName(customer);
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-[11px] uppercase font-semibold tracking-[0.3em] text-white/70">{auth.badgeLabel}</span>
          <span className="text-base font-semibold text-white">{displayName}</span>
        </div>
        <span className="text-xs text-white/70">Đang đăng nhập</span>
      </div>
      <div className="grid gap-2">
        {auth.profileUrl && (
          <a
            href={auth.profileUrl}
            className="flex items-center justify-between rounded-md bg-white/10 px-4 py-3 text-white hover:bg-white/20"
            onClick={(event) => {
              event.preventDefault();
              onNavigate(auth.profileUrl!);
            }}
          >
            <span>Thông tin khách hàng</span>
          </a>
        )}
        {auth.ordersUrl && (
          <a
            href={auth.ordersUrl}
            className="flex items-center justify-between rounded-md bg-white/10 px-4 py-3 text-white hover:bg-white/20"
            onClick={(event) => {
              event.preventDefault();
              onNavigate(auth.ordersUrl!);
            }}
          >
            <span>Đơn hàng của tôi</span>
          </a>
        )}
        {auth.libraryUrl && (
          <a
            href={auth.libraryUrl}
            className="flex items-center justify-between rounded-md bg-white/10 px-4 py-3 text-white hover:bg-white/20"
            onClick={(event) => {
              event.preventDefault();
              onNavigate(auth.libraryUrl!);
            }}
          >
            <span>Thư viện & khóa học</span>
          </a>
        )}
      </div>
      <Button variant="ghost" className="w-full h-11 font-semibold text-red-100 border border-white/20 hover:bg-red-500/10" onClick={onLogout}>
        Đăng xuất
      </Button>
    </div>
  );
}

export default SiteHeaderSection;

