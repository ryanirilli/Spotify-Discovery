/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['127.0.0.1', 'localhost', '192.168.4.152'],
  experimental: {
    viewTransition: true,
    optimizePackageImports: ['@chakra-ui/react'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.scdn.co'
      },
    ],
  },
}

module.exports = nextConfig
