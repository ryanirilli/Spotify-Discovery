/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true    
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
