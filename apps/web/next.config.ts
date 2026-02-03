import type { NextConfig } from "next";
import { createMDX } from "fumadocs-mdx/next";

type RemotePattern = {
  protocol?: "http" | "https";
  hostname: string;
  port?: string;
  pathname: string;
};

const withMDX = createMDX();

const imageDomains: string[] = [
  "stepv.studio",
  "images.unsplash.com",
  "ytimg.com",
  "i.ytimg.com",
];

const remotePatterns: RemotePattern[] = [
  {
    protocol: "https",
    hostname: "stepv.studio",
    port: "",
    pathname: "/wp-content/uploads/**",
  },
  {
    protocol: "https",
    hostname: "images.unsplash.com",
    port: "",
    pathname: "/**",
  },
  {
    protocol: "https",
    hostname: "ytimg.com",
    port: "",
    pathname: "/**",
  },
  {
    protocol: "https",
    hostname: "i.ytimg.com",
    port: "",
    pathname: "/**",
  },
];

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (convexUrl) {
  try {
    const { hostname, protocol } = new URL(convexUrl);
    if (hostname && !imageDomains.includes(hostname)) {
      imageDomains.push(hostname);
    }

    const normalizedProtocol = (protocol.replace(":", "") as "http" | "https") || "https";
    remotePatterns.push({
      protocol: normalizedProtocol,
      hostname,
      port: "",
      pathname: "/**",
    });
  } catch (error) {
    console.warn("Invalid NEXT_PUBLIC_CONVEX_URL for image domains", error);
  }
}

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactStrictMode: true,
  images: {
    domains: imageDomains,
    remotePatterns,
    minimumCacheTTL: 60,
    formats: ["image/avif", "image/webp"],
    // Disable optimizer in dev to avoid 400s with Bun
    unoptimized: process.env.NODE_ENV !== "production",
  },
  experimental: {
    optimizeCss: false,
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
  trailingSlash: false,
  compress: true,
  poweredByHeader: false,
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        { key: "X-DNS-Prefetch-Control", value: "on" },
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "origin-when-cross-origin" },
      ],
    },
  ],
  webpack: (config, { dev }) => {
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            vendor: {
              test: /[\\\\/]node_modules[\\\\/]/,
              name: "vendors",
              chunks: "all",
            },
          },
        },
      };
    }

    return config;
  },
  env: {
    NEXT_PUBLIC_APP_NAME: "DOHY Media",
  },
};

export default withMDX(nextConfig);
