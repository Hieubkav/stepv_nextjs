'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
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
  const [expandedColumn, setExpandedColumn] = useState<number | null>(null);
  const [expandedContact, setExpandedContact] = useState(false);

  const titleText = title?.trim();
  const descriptionText = description?.trim();
  const buttonLabel = button?.label?.trim();
  const buttonHref = button?.url?.trim();

  const resolvedColumns = columns && columns.length > 0 ? columns : DEFAULT_COLUMNS;
  const resolvedSocials = socialLinks && socialLinks.length > 0 ? socialLinks : DEFAULT_SOCIALS;
  const hasHero = Boolean(titleText || descriptionText || buttonLabel);

  // Mobile-first: show top 4 socials on mobile, all on desktop
  const mobileSocials = resolvedSocials.slice(0, 4);

  const renderHeroButton = () => {
    if (!buttonLabel) return null;
    const href = buttonHref && buttonHref.length > 0 ? buttonHref : '#contact';
    const isHash = href.startsWith('#');
    const isExternal = /^https?:\/\//i.test(href);

    return (
      <a
        href={href}
        className="inline-flex items-center gap-3 rounded-full border border-[#FFD700] px-10 py-3 text-sm font-medium uppercase tracking-wide text-[#FFD700] transition-all duration-300 hover:bg-[#FFD700] hover:text-black"
        target={!isHash && isExternal ? '_blank' : undefined}
        rel={!isHash && isExternal ? 'noopener noreferrer' : undefined}
      >
        {buttonLabel}
      </a>
    );
  };

  const ColumnAccordion = ({ column, index }: { column: SiteFooterColumn; index: number }) => {
    const isExpanded = expandedColumn === index;

    return (
      <div key={column.title ?? `column-${index}`}>
        {/* Mobile: Accordion */}
        <button
          onClick={() => setExpandedColumn(isExpanded ? null : index)}
          className="md:hidden w-full flex items-center justify-between py-4 border-b border-white/10 hover:border-white/20 transition-colors"
        >
          {column.title && (
            <h3 className="text-sm font-medium text-white uppercase tracking-wider text-left">{column.title}</h3>
          )}
          <ChevronDown
            className={`w-4 h-4 text-white/60 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Mobile: Expanded content */}
        {isExpanded && (
          <ul className="md:hidden space-y-3 py-4 pl-0">
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
        )}

        {/* Desktop: Always visible */}
        <div className="hidden md:block">
          {column.title && (
            <h3 className="text-sm font-medium text-white uppercase tracking-wider mb-4">{column.title}</h3>
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
      </div>
    );
  };

  return (
    <footer className="relative w-full bg-black text-white">
      {/* Hero Section - Hidden on Mobile */}
      {hasHero && (
        <>
          <div className="hidden md:block w-full py-16 lg:py-20">
            <div className="max-w-7xl mx-auto px-6 lg:px-16 text-center">
              {titleText && (
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-thin text-gray-300 leading-tight mb-6 tracking-wide uppercase">
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

          <div className="hidden md:block w-full h-px bg-white/20" />
        </>
      )}

      {/* Main Footer Content */}
      <div className="w-full py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          {/* Mobile Grid - 1 column */}
          <div className="md:hidden space-y-0">
            {/* Logo Section - Mobile */}
            <div className="pb-4 border-b border-white/10">
              {logo ? (
                <Image
                  src={logo}
                  alt="Footer logo"
                  width={80}
                  height={80}
                  className="h-12 w-auto mb-3 object-contain"
                />
              ) : (
                <div className="text-xl font-semibold uppercase tracking-wide mb-2">DOHY MEDIA</div>
              )}
            </div>

            {/* Columns Section - Accordion on Mobile */}
            <div className="space-y-0">
              {resolvedColumns.map((column, index) => (
                <ColumnAccordion key={column.title ?? `column-${index}`} column={column} index={index} />
              ))}
            </div>

            {/* Social & Contact Section - Mobile */}
            <div>
              {/* Social Links */}
              <div>
                {socialTitle && (
                  <h3 className="text-sm font-medium text-white uppercase tracking-wider mb-4">{socialTitle}</h3>
                )}
                <div className="flex flex-wrap gap-2">
                  {mobileSocials.map((social) => {
                    if (!social?.url) return null;
                    const Icon = getLucideIcon(social.icon ?? 'Share2') ?? getLucideIcon('Share2');
                    const isExternal = /^https?:\/\//i.test(social.url);
                    return (
                      <a
                        key={`${social.platform}-${social.url}`}
                        href={social.url}
                        target={isExternal ? '_blank' : undefined}
                        rel={isExternal ? 'noopener noreferrer' : undefined}
                        className="p-2 rounded-full border border-white/20 hover:border-[#FFD700] hover:text-[#FFD700] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        aria-label={social.platform ?? 'Social link'}
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Location & Contact - Combined Accordion on Mobile */}
              <div>
                {/* Mobile: Accordion */}
                <button
                  onClick={() => setExpandedContact(!expandedContact)}
                  className="md:hidden w-full flex items-center justify-between py-4 border-b border-white/10 hover:border-white/20 transition-colors"
                >
                  <h3 className="text-sm font-medium text-white uppercase tracking-wider">
                    {locationTitle} & {contactTitle}
                  </h3>
                  <ChevronDown
                    className={`w-4 h-4 text-white/60 transition-transform duration-300 ${
                      expandedContact ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Mobile: Expanded content */}
                {expandedContact && (
                  <div className="md:hidden py-4 space-y-4">
                    {(locationTitle || (locationLines && locationLines.length > 0)) && (
                      <div className="space-y-2 text-sm text-gray-300">
                        {locationTitle && (
                          <div className="uppercase tracking-wider text-white text-xs font-medium">{locationTitle}</div>
                        )}
                        {(locationLines ?? []).map((line, idx) => (
                          <div key={`location-${idx}`}>{line}</div>
                        ))}
                      </div>
                    )}

                    {(contactTitle || contactEmail) && (
                      <div className="space-y-2 text-sm text-gray-300">
                        {contactTitle && (
                          <div className="uppercase tracking-wider text-white text-xs font-medium">{contactTitle}</div>
                        )}
                        {contactEmail && (
                          <a href={`mailto:${contactEmail}`} className="text-[#FFD700] hover:underline break-all">
                            {contactEmail}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Grid - 4 columns: Logo | Links1 | Links2 | Social/Contact */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Logo & Description - Col 1 */}
            <div>
              {logo ? (
                <Image src={logo} alt="Footer logo" width={96} height={96} className="h-16 w-auto mb-4 object-contain" />
              ) : (
                <div className="text-2xl font-semibold uppercase tracking-wide mb-4">DOHY MEDIA</div>
              )}
              {descriptionText && (
                <p className="text-sm text-white/70 leading-relaxed max-w-sm">{descriptionText}</p>
              )}
            </div>

            {/* Links Columns - Col 2-3 */}
            {resolvedColumns.map((column, index) => (
              <div key={column.title ?? `column-${index}`}>
                {column.title && (
                  <h3 className="text-sm font-medium text-white uppercase tracking-wider mb-4">{column.title}</h3>
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

            {/* Social & Contact - Col 4 */}
            <div className="space-y-6">
              {/* Social Links */}
              <div>
                {socialTitle && (
                  <h3 className="text-sm font-medium text-white uppercase tracking-wider mb-4">{socialTitle}</h3>
                )}
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
                        className="p-2 rounded-full border border-white/20 hover:border-[#FFD700] hover:text-[#FFD700] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        aria-label={social.platform ?? 'Social link'}
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Location */}
              {(locationTitle || (locationLines && locationLines.length > 0)) && (
                <div className="space-y-2 text-sm text-gray-300">
                  {locationTitle && (
                    <div className="uppercase tracking-wider text-white text-xs font-medium">{locationTitle}</div>
                  )}
                  {(locationLines ?? []).map((line, idx) => (
                    <div key={`location-${idx}`}>{line}</div>
                  ))}
                </div>
              )}

              {/* Contact */}
              {(contactTitle || contactEmail) && (
                <div className="space-y-2 text-sm text-gray-300">
                  {contactTitle && (
                    <div className="uppercase tracking-wider text-white text-xs font-medium">{contactTitle}</div>
                  )}
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
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-white/20" />

      {/* Copyright */}
      <div className="py-6 text-center text-xs md:text-sm text-white/60">{copyright}</div>
    </footer>
  );
};

export default SiteFooterSection;
