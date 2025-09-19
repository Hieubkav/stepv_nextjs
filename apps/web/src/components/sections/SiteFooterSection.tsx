'use client';

import Image from 'next/image';
import { getLucideIcon } from '@/lib/lucide-icons';

interface FooterLink {
  label?: string;
  url?: string;
  highlight?: boolean;
}

interface FooterColumn {
  title?: string;
  links?: FooterLink[];
}

interface FooterSocialLink {
  platform?: string;
  url?: string;
  icon?: string;
}

interface FooterButton {
  label?: string;
  url?: string;
}

interface SiteFooterSectionProps {
  logo?: string;
  title?: string;
  description?: string;
  button?: FooterButton;
  columns?: FooterColumn[];
  socialTitle?: string;
  socialLinks?: FooterSocialLink[];
  locationTitle?: string;
  locationLines?: string[];
  contactTitle?: string;
  contactEmail?: string;
  copyright?: string;
}

const DEFAULT_BUTTON: FooterButton = { label: 'DAT LICH HEN', url: '#contact' };
const DEFAULT_COLUMNS: FooterColumn[] = [
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

const DEFAULT_SOCIALS: FooterSocialLink[] = [
  { platform: 'YouTube', url: 'https://youtube.com', icon: 'Youtube' },
  { platform: 'TikTok', url: 'https://tiktok.com', icon: 'Music4' },
];

const SiteFooterSection = ({
  logo,
  title = 'Hay de chung toi cham soc ban',
  description = 'DOHY Media la doi tac 3D, animation va marketing sang tao cho thuong hieu cua ban.',
  button,
  columns,
  socialTitle = 'Theo doi chung toi',
  socialLinks,
  locationTitle,
  locationLines,
  contactTitle = 'Lien he',
  contactEmail,
  copyright = '© 2025 DOHY Media. All rights reserved.',
}: SiteFooterSectionProps) => {
  const resolvedButton = button ?? DEFAULT_BUTTON;
  const resolvedColumns = columns && columns.length > 0 ? columns : DEFAULT_COLUMNS;
  const resolvedSocials = socialLinks && socialLinks.length > 0 ? socialLinks : DEFAULT_SOCIALS;

  return (
    <footer className="relative w-full bg-black text-white">
      <div className="w-full py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-16 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-thin text-gray-300 leading-tight mb-8 tracking-wide uppercase">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-white font-light leading-relaxed max-w-4xl mx-auto mb-8">
            {description}
          </p>
          {resolvedButton?.label && (
            <a
              href={resolvedButton.url ?? '#contact'}
              className="bg-gradient-to-r from-gray-800 to-gray-900 text-[#FFD700] hover:from-gray-700 hover:to-gray-800 px-10 py-3 rounded-full font-medium tracking-wide uppercase border border-gray-700 inline-flex items-center justify-center"
            >
              {resolvedButton.label}
            </a>
          )}
        </div>
      </div>

      <div className="w-full h-px bg-white/20" />

      <div className="w-full py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          <div>
            {logo ? (
              <Image src={logo} alt="Footer logo" width={96} height={96} className="h-16 w-auto mb-6 object-contain" />
            ) : (
              <div className="text-2xl font-semibold uppercase tracking-wide mb-6">DOHY MEDIA</div>
            )}
            <p className="text-sm text-white/70 leading-relaxed max-w-sm">
              {description}
            </p>
          </div>

          {resolvedColumns.map((column) => (
            <div key={column.title ?? Math.random()}>
              {column.title && (
                <h3 className="text-sm font-medium text-white uppercase tracking-wider mb-6">{column.title}</h3>
              )}
              <ul className="space-y-3">
                {(column.links ?? []).map((link) => {
                  if (!link.label) return null;
                  const href = link.url ?? '#';
                  return (
                    <li key={`${column.title}-${link.label}`}>
                      <a
                        href={href}
                        className={`text-sm transition-colors ${
                          link.highlight ? 'text-[#FFD700]' : 'text-gray-300 hover:text-white'
                        }`}
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
                return (
                  <a
                    key={`${social.platform}-${social.url}`}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
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
                {(locationLines ?? []).map((line, index) => (
                  <div key={`location-${index}`}>{line}</div>
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

      <div className="py-6 text-center text-sm text-white/60">
        {copyright}
      </div>
    </footer>
  );
};

export default SiteFooterSection;
