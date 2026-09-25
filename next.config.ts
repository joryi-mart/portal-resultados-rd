/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    "/api/publicar-facebook": ["./lib/fuentes/**"],
    "/api/debug-imagen": ["./lib/fuentes/**"],
  },
  // La direccion vieja de Vercel (portal-resultados-rd.vercel.app) sigue mostrando
  // todo el sitio. Se manda de forma permanente a labankerard.com para que no
  // haya dos copias. Se excluye /api/ para no romper tareas automaticas
  // (cron-job.org, etc.) que pudieran seguir usando la direccion vieja.
  async redirects() {
    return [
      {
        source: "/:ruta((?!api/).*)",
        has: [{ type: "host", value: "portal-resultados-rd.vercel.app" }],
        destination: "https://labankerard.com/:ruta",
        permanent: true,
      },
    ];
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