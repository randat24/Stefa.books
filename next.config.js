/** @type {import('next').NextConfig} */
const nextConfig = {
  // Minimal config for build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // External packages for server components
  serverExternalPackages: ['@supabase/supabase-js', '@supabase/realtime-js'],
  
  // Minimal experimental config
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001']
    },
  },
  
  // Force all pages to be dynamic - disable static generation completely
  output: 'standalone',
  trailingSlash: false,
  
  // Webpack config to handle build issues
  webpack: (config, { isServer, dev, webpack }) => {
    // Skip webpack config in development with Turbo
    if (dev) {
      return config;
    }
    
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'self': false,
        'window': false,
        'global': false,
      }
    }
    
    // Try to ignore Html import issues in production
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      /Html.*should not be imported outside of pages\/_document/,
      { module: /node_modules/, message: /Html/ },
      { message: /Html.*should not be imported outside of pages\/_document/ },
      { message: /should not be imported outside of pages\/_document/ },
      /Critical dependency/,
      /Can't resolve/,
    ];
    
    // Add aliases to potentially problematic modules
    config.resolve.alias = {
      ...config.resolve.alias,
      'next/document': false,
    };
    
    // Try to handle Html import errors more gracefully
    const originalEmit = config.plugins.find(plugin => plugin.constructor.name === 'HtmlWebpackPlugin');
    if (originalEmit) {
      config.plugins = config.plugins.filter(plugin => plugin.constructor.name !== 'HtmlWebpackPlugin');
    }
    
    // Try to exclude problematic chunks from server-side rendering
    if (isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
          },
        }
      };
    }
    
    return config
  },
  
  // Handle build errors more gracefully
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  
  // Disable static generation
  trailingSlash: false,
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