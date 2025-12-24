import type { Metadata } from 'next';

const SITE_NAME = 'DOHY Media';
const DEFAULT_SEO_TITLE = 'Dịch Vụ Dựng Hình 3D & Render 3D Chuyên Nghiệp | Hình Ảnh Sắc Nét';
const SITE_DESCRIPTION = 'Cung cấp dịch vụ dựng hình 3D, render 3D chất lượng cao cho kiến trúc, sản phẩm và quảng cáo. Quy trình chuyên nghiệp, hình ảnh chân thực, đúng tiến độ.';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://dohymedia.com';

export function createMetadata(options: {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url: string;
  type?: 'website' | 'article';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  noindex?: boolean;
}): Metadata {
  const {
    title,
    description,
    keywords,
    image,
    url,
    type = 'website',
    author,
    publishedTime,
    modifiedTime,
    noindex,
  } = options;

  const imageUrl = image || `${SITE_URL}/og-image.jpg`;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
    },
    robots: {
      index: !noindex,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
    authors: author ? [{ name: author }] : [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    openGraph: {
      type,
      url,
      title,
      description,
      siteName: SITE_NAME,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'vi_VN',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      creator: '@dohymedia',
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
      other: {
        'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || '',
      },
    },
  };
}

export const baseMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: `%s | ${SITE_NAME}`,
    default: DEFAULT_SEO_TITLE,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'dịch vụ dựng hình 3D',
    'làm hình ảnh 3D chuyên nghiệp',
    'thiết kế kiến trúc 3D',
    'dựng nội thất 3D giá rẻ',
    'render kiến trúc siêu thực',
    'studio làm hoạt hình 3D',
    'dựng sản phẩm 3D quảng cáo',
    'thiết kế 3D sản phẩm mỹ phẩm',
    'làm video 3D quảng cáo',
    'dựng nhà chung cư bằng 3D',
    'dịch vụ render nhanh 3D',
    'thiết kế 3D ngoại thất',
    'làm mô hình 3D theo yêu cầu',
    'dựng phim hoạt hình 3D',
    'dựng phối cảnh kiến trúc',
    'dựng mô phỏng sản phẩm 3D',
    'khóa học đồ họa 3D',
    'làm 3D marketing cho doanh nghiệp',
    'Thư viện VFX',
    'dựng 3D siêu thực – photorealistic',
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: DEFAULT_SEO_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@dohymedia',
    creator: '@dohymedia',
    title: DEFAULT_SEO_TITLE,
    description: SITE_DESCRIPTION,
    images: [`${SITE_URL}/twitter-image.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: '/images/logo.png',
    shortcut: '/images/logo.png',
  },
};

export function generateCanonicalUrl(path: string): string {
  return `${SITE_URL}${path}`;
}

export function truncateDescription(text: string, maxLength: number = 160): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

