import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel handles deployment automatically, no need for static export
  // output: 'export', // Commented out for Vercel

  // Enable image optimization for Vercel (better performance)
  images: {
    domains: [
      'images.unsplash.com',
      'stepv.studio',
      'via.placeholder.com',
      'eqriodcmakvwbjcbbegu.supabase.co'
    ],
    // unoptimized: true, // Not needed for Vercel
  },

  // No basePath needed for Vercel (custom domain support)
  // basePath: process.env.NODE_ENV === 'production' ? '/stepv_nextjs' : '',

  // Trailing slash not required for Vercel
  // trailingSlash: true,

  // Experimental features
  experimental: {
    // Add any experimental features here if needed
  },

  // Turbopack configuration for development
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
};

export default nextConfig;
