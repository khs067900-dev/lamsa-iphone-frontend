import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
    optimizePackageImports: ["lucide-react", "react-icons", "framer-motion", "swiper"],
  },
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
  images: {
    qualities: [75, 80],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 828, 1080, 1200],
    imageSizes: [64, 128, 256],
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
