'use client';

import { useSiteSettings } from '@/hooks/useSiteConfig';
import XIcon from './XIcon';

interface DynamicContactInfoProps {
  showEmail?: boolean;
  showPhone?: boolean;
  showAddress?: boolean;
  className?: string;
  linkClassName?: string;
}

export default function DynamicContactInfo({
  showEmail = true,
  showPhone = true,
  showAddress = false,
  className = '',
  linkClassName = 'text-[#FFD700] hover:underline'
}: DynamicContactInfoProps) {
  const { getSetting } = useSiteSettings();

  return (
    <div className={`space-y-2 ${className}`}>
      {showEmail && getSetting('contact_email') && (
        <div>
          <a 
            href={`mailto:${getSetting('contact_email')}`} 
            className={linkClassName}
          >
            {getSetting('contact_email')}
          </a>
        </div>
      )}
      
      {showPhone && getSetting('contact_phone') && (
        <div>
          <a 
            href={`tel:${getSetting('contact_phone')}`} 
            className={linkClassName}
          >
            {getSetting('contact_phone')}
          </a>
        </div>
      )}
      
      {showAddress && getSetting('contact_address') && (
        <div className="text-gray-300">
          {getSetting('contact_address')}
        </div>
      )}
    </div>
  );
}

// Component riêng cho social links
interface DynamicSocialLinksProps {
  className?: string;
  iconClassName?: string;
  showLabels?: boolean;
}

export function DynamicSocialLinks({
  className = 'flex space-x-4',
  iconClassName = 'w-5 h-5',
  showLabels = false
}: DynamicSocialLinksProps) {
  const { getSetting } = useSiteSettings();

  const socialLinks = [
    {
      name: 'YouTube',
      url: getSetting('youtube_url'),
      icon: 'fab fa-youtube',
      color: 'text-red-500'
    },
    {
      name: 'TikTok',
      url: getSetting('tiktok_url'),
      icon: 'fab fa-tiktok',
      color: 'text-white'
    },
    {
      name: 'Facebook',
      url: getSetting('facebook_url'),
      icon: 'fab fa-facebook',
      color: 'text-blue-600'
    },
    {
      name: 'Instagram',
      url: getSetting('instagram_url'),
      icon: 'fab fa-instagram',
      color: 'text-pink-500'
    },
    {
      name: 'Pinterest',
      url: getSetting('pinterest_url'),
      icon: 'fab fa-pinterest',
      color: 'text-red-600'
    },
    {
      name: 'X',
      url: getSetting('x_url'),
      icon: 'fab fa-x-twitter',
      color: 'text-white'
    }
  ].filter(social => social.url); // Chỉ hiển thị những link có URL

  if (socialLinks.length === 0) return null;

  return (
    <div className={className}>
      {socialLinks.map((social, index) => (
        <a
          key={index}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:scale-110 transition-transform"
          title={social.name}
        >
          {social.icon === 'fab fa-x-twitter' ? (
            <XIcon className={`${iconClassName} ${social.color}`} size={20} />
          ) : (
            <i className={`${social.icon} ${iconClassName} ${social.color}`}></i>
          )}
          {showLabels && (
            <span className="ml-2 text-sm">{social.name}</span>
          )}
        </a>
      ))}
    </div>
  );
}
