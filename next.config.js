/** @type {import('next').NextConfig} */
const nextConfig = {
  // Minimal config to fix pages-manifest.json issue
  eslint: {
    ignoreDuringBuilds: true,
  },
  trailingSlash: false,
  output: 'standalone',
  // Отключаем статическую генерацию для решения проблем с Html импортом
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001']
    }
  },
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/photo-*',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/images/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/images/**',
      },
    ],
    // Enhanced image optimization settings
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 дней кэширования
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Дополнительные настройки для Cloudinary
    deviceSizes: [320, 420, 640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Заголовки безпеки
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/admin/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://res.cloudinary.com https://images.unsplash.com; font-src 'self' data:; connect-src 'self' https://api.cloudinary.com;",
          },
        ],
      },
    ]
  },
};

module.exports = nextConfig;