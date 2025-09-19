'use client';

import Image from 'next/image';
import { getLucideIcon } from '@/lib/lucide-icons';
import type { SiteFooterColumn, SiteFooterProps, SiteFooterSocialLink } from '@/lib/site-layout';

type SiteFooterSectionProps = SiteFooterProps;

const DEFAULT_COLUMNS: SiteFooterColumn[] = [
  {
    title: 'Studio',
    links: [
      { label: 'Trang chu', url: '/' },
      { label: 'Dich vu', url: '#services' },
    ],
  },
  {
    title: 'Tai nguyen',
    links: [
      { label: 'Thu vien', url: '#library' },
      { label: 'Blog', url: '#blog' },
    ],
  },
];

const DEFAULT_SOCIALS: SiteFooterSocialLink[] = [
  { platform: 'YouTube', url: 'https://youtube.com', icon: 'Youtube' },
  { platform: 'TikTok', url: 'https://tiktok.com', icon: 'Music4' },
];

const SiteFooterSection = ({
  logo,
  title,
  description,
  button,
  columns,
  socialTitle = 'Theo doi chung toi',
  socialLinks,
  locationTitle,
  locationLines,
  contactTitle = 'Lien he',
  contactEmail,
  copyright = 'c 2025 DOHY Media. All rights reserved.',
}: SiteFooterSectionProps) => {
  const titleText = title?.trim();
  const descriptionText = description?.trim();
  const buttonLabel = button?.label?.trim();
  const buttonHref = button?.url?.trim();

  const resolvedColumns = columns && columns.length > 0 ? columns : DEFAULT_COLUMNS;
  const resolvedSocials = socialLinks && socialLinks.length > 0 ? socialLinks : DEFAULT_SOCIALS;
  const hasHero = Boolean(titleText || descriptionText || buttonLabel);

  const renderHeroButton = () => {
    if (!buttonLabel) return null;
    const href = buttonHref && buttonHref.length > 0 ? buttonHref : '#contact';
    const isHash = href.startsWith('#');
    const isExternal = /^https?:\/\//i.test(href);
    const className =
      'inline-flex items-center gap-3 rounded-full border border-[#FFD700] px-10 py-3 text-sm font-medium uppercase tracking-wide text-[#FFD700] transition-all duration-300 hover:bg-[#FFD700] hover:text-black';

    return (
      <a
        href={href}
        className={className}
        target={!isHash && isExternal ? '_blank' : undefined}
        rel={!isHash && isExternal ? 'noopener noreferrer' : undefined}
      >
        {buttonLabel}
      </a>
    );
  };

  return (
    <footer className="relative w-full bg-black text-white">
      {hasHero && (
        <>
          <div className="w-full py-20">
            <div className="max-w-7xl mx-auto px-6 lg:px-16 text-center">
              {titleText && (
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-thin text-gray-300 leading-tight mb-8 tracking-wide uppercase">
                  {titleText}
                </h1>
              )}
              {descriptionText && (
                <p className="text-lg md:text-xl text-white font-light leading-relaxed max-w-4xl mx-auto mb-8">
                  {descriptionText}
                </p>
              )}
              {renderHeroButton()}
            </div>
          </div>

          <div className="w-full h-px bg-white/20" />
        </>
      )}

      <div className="w-full py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          <div>
            {logo ? (
              <Image src={logo} alt="Footer logo" width={96} height={96} className="h-16 w-auto mb-6 object-contain" />
            ) : (
              <div className="text-2xl font-semibold uppercase tracking-wide mb-6">DOHY MEDIA</div>
            )}
            {descriptionText && (
              <p className="text-sm text-white/70 leading-relaxed max-w-sm">{descriptionText}</p>
            )}
          </div>

          {resolvedColumns.map((column, index) => (
            <div key={column.title ?? `column-${index}`}>
              {column.title && (
                <h3 className="text-sm font-medium text-white uppercase tracking-wider mb-6">{column.title}</h3>
              )}
              <ul className="space-y-3">
                {(column.links ?? []).map((link) => {
                  if (!link.label) return null;
                  const href = link.url ?? '#';
                  const isExternal = /^https?:\/\//i.test(href);
                  return (
                    <li key={`${column.title ?? 'column'}-${link.label}`}>
                      <a
                        href={href}
                        className={`text-sm transition-colors ${
                          link.highlight ? 'text-[#FFD700]' : 'text-gray-300 hover:text-white'
                        }`}
                        target={isExternal ? '_blank' : undefined}
                        rel={isExternal ? 'noopener noreferrer' : undefined}
                      >
                        {link.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          <div className="space-y-6">
            {socialTitle && <h3 className="text-sm font-medium uppercase tracking-wider">{socialTitle}</h3>}
            <div className="flex flex-wrap gap-3">
              {resolvedSocials.map((social) => {
                if (!social?.url) return null;
                const Icon = getLucideIcon(social.icon ?? 'Share2') ?? getLucideIcon('Share2');
                const isExternal = /^https?:\/\//i.test(social.url);
                return (
                  <a
                    key={`${social.platform}-${social.url}`}
                    href={social.url}
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noopener noreferrer' : undefined}
                    className="p-2 rounded-full border border-white/20 hover:border-[#FFD700] hover:text-[#FFD700] transition-colors"
                    aria-label={social.platform ?? 'Social link'}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>

            {(locationTitle || (locationLines && locationLines.length > 0)) && (
              <div className="space-y-2 text-sm text-gray-300">
                {locationTitle && <div className="uppercase tracking-wider text-white">{locationTitle}</div>}
                {(locationLines ?? []).map((line, idx) => (
                  <div key={`location-${idx}`}>{line}</div>
                ))}
              </div>
            )}

            {(contactTitle || contactEmail) && (
              <div className="space-y-2 text-sm text-gray-300">
                {contactTitle && <div className="uppercase tracking-wider text-white">{contactTitle}</div>}
                {contactEmail && (
                  <a href={`mailto:${contactEmail}`} className="text-[#FFD700] hover:underline">
                    {contactEmail}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-white/20" />

      <div className="py-6 text-center text-sm text-white/60">{copyright}</div>
    </footer>
  );
};

export default SiteFooterSection;
