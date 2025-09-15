import type { NextConfig } from "next";
import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactStrictMode: true,
  // Tối ưu hình ảnh
  images: {
    domains: [
      'stepv.studio',
      'images.unsplash.com',
      'ytimg.com',
      'i.ytimg.com',
      // Thêm các domain khác nếu cần
    ],
    // Sử dụng remotePatterns để linh hoạt hơn
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'stepv.studio',
        port: '',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ytimg.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Tối ưu chất lượng hình ảnh
    minimumCacheTTL: 60,
    formats: ['image/avif', 'image/webp'],
    // Disable optimizer in dev to avoid 400s with Bun
    unoptimized: process.env.NODE_ENV !== 'production',
  },
  
  // Tối ưu hiệu năng
  experimental: {
    // optimizeCss requires 'critters'; disable to avoid runtime error
    optimizeCss: false,
    // Loại bỏ nextScriptWorkers vì chưa cài Partytown
  },
  
  // Tối ưu build
  // swcMinify không còn được hỗ trợ trong Next.js 15+, sẽ sử dụng swc mặc định
  
  // Tối ưu font
  // optimizeFonts không còn được hỗ trợ trong Next.js 15+
  
  // Tối ưu đường dẫn
  trailingSlash: false,
  
  // Tối ưu asset
  compress: true,
  
  // Tối ưu server response
  poweredByHeader: false,
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on'
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload'
        },
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin'
        }
      ]
    }
  ],
  
  // Tối ưu webpack
  webpack: (config, { dev, isServer }) => {
    // Tối ưu cho production
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      };
    }
    
    return config;
  },
  
  // Tối ưu env
  env: {
    NEXT_PUBLIC_APP_NAME: 'DOHY Media',
  },
};

export default withMDX(nextConfig);
