import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    // Ignore Node.js specific modules for client-side builds
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        http2: false,
        tls: false,
        crypto: false,
        os: false,
        path: false,
        stream: false,
        util: false,
        zlib: false,
        child_process: false,
        buffer: false,
      };
    }
    
    // Ignore specific modules that cause issues in client-side builds
    config.externals = config.externals || [];
    config.externals.push({
      'googleapis': 'commonjs googleapis',
      'node:buffer': 'commonjs buffer',
      'node:fs': 'commonjs fs',
      'node:path': 'commonjs path',
    });
    
    return config;
  },
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
