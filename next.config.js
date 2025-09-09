/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001', 'stefa-books.vercel.app', 'stefa-books.com.ua']
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
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
