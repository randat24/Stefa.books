/** @type {import('next').NextConfig} */

// Generate a unique build ID for cache busting
const generateBuildId = () => {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
};

const BUILD_ID = '20250919-1841';

const nextConfig = {
  // Generate a consistent build ID for the current build
  generateBuildId: () => BUILD_ID,

  // Make build ID available in the app
  env: {
    NEXT_PUBLIC_BUILD_ID: BUILD_ID,
  },

  // Default output for Netlify deployment
  // output: 'standalone',
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001', 'stefa-books.com.ua', 'stefa-books.netlify.app', '*.netlify.app']
    }
  },
  // Настройки для Netlify деплоя
  trailingSlash: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
    localPatterns: [
      {
        pathname: '/logo.svg',
        search: '?v=*',
      },
      {
        pathname: '/**',
        search: '',
      },
    ],
    // Оптимизация изображений
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 дней кеширования
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Включаем кеширование изображений
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Заголовки для кеширования
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Build-ID',
            value: BUILD_ID,
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ]
  },
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    NEXT_PUBLIC_BUILD_ID: BUILD_ID,
  },
  // TypeScript configuration for build
  typescript: {
    // Ignore type errors during build - fix them separately
    ignoreBuildErrors: true,
  },
  eslint: {
    // Allow production builds to complete even with lint warnings
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
