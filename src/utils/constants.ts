// Application constants

export const SITE_CONFIG = {
  name: 'StepV NextJS',
  description: 'Website tĩnh được xây dựng với NextJS 15, TypeScript, Tailwind CSS và Shadcn/ui',
  url: process.env.NODE_ENV === 'production' 
    ? 'https://yourusername.github.io/stepvNextJS' 
    : 'http://localhost:3000',
  author: 'StepV Team',
  keywords: 'NextJS, TypeScript, Tailwind CSS, Shadcn/ui, Static Site',
};

export const NAVIGATION_ITEMS = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Giới thiệu', href: '/about' },
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
