/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    "/api/publicar-facebook": ["./lib/fuentes/**"],
    "/api/debug-imagen": ["./lib/fuentes/**"],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'espnmedia-cdn.akamaized.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'a.espncdn.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.mlbstatic.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'midfield.mlbstatic.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;