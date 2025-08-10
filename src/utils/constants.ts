// Application constants

export const SITE_CONFIG = {
  name: 'Step V Studio',
  description: 'Chuyên gia hình ảnh 3D cho thương hiệu nước hoa & làm đẹp - Step V Studio',
  url: process.env.NODE_ENV === 'production'
    ? 'https://stepv-nextjs.vercel.app'
    : 'http://localhost:3000',
  author: 'Step V Studio',
  keywords: '3D Animation, Product Visualization, Perfume, Beauty, 3D Rendering, Visual Effects, Creative Video Production, Design',
};

export const NAVIGATION_ITEMS = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Giới thiệu', href: '/about' },
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Liên hệ', href: '/contact' },
];

export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;
