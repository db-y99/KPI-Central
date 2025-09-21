import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // Enable Turbopack features
  turbopack: {
    // Turbopack specific configuration
    rules: {
      // Add any specific rules if needed
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'y99.vn',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
