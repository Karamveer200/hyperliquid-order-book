import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  productionBrowserSourceMaps:
    process.env.NEXT_PRODUCTION_DATADOG_SOURCEMAPS === 'true',

  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's2.coinmarketcap.com',
        pathname: '/static/img/coins/**',
      },
    ],
    localPatterns: [
      {
        pathname: '/**',
      },
      {
        pathname: '/api/cmc-image/**',
      },
    ],
  },

  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  allowedDevOrigins: [],
};

export default nextConfig;
