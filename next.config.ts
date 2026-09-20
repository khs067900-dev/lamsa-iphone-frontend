import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
    optimizePackageImports: ["lucide-react", "react-icons", "framer-motion", "swiper"],
    // Enable aggressive code splitting
    optimizeCss: true,
  },
  
  // Production optimizations
  poweredByHeader: false,
  compress: true,
  
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/sitemap.xml", destination: "/sitemap.xml" },
        { source: "/robots.txt", destination: "/robots.txt" },
      ],
      afterFiles: [],
      fallback: [
        {
          source: "/api/:path*",
          destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
        },
      ],
    };
  },
  
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
        ],
      },
      // Cache static assets aggressively
      {
        source: "/(.*)\\.(jpg|jpeg|png|webp|avif|gif|svg|ico|woff|woff2|ttf|otf)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  
  images: {
    qualities: [75, 80],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 828, 1080, 1200],
    imageSizes: [64, 128, 256],
    minimumCacheTTL: 86400, // 24 hours
    remotePatterns: [
      { hostname: "ibb.co" },
      { hostname: "i.ibb.co" },
      { protocol: "https", hostname: "lamsa-iphone-backend.vercel.app" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "cloudinary.com" },
      { protocol: "https", hostname: "eauthenticate.saudibusiness.gov.sa" },
    ],
  },
};

export default nextConfig;
