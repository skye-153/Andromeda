import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  /* config options here */
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
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.externals.push({
        '@tauri-apps/api/shell': 'commonjs @tauri-apps/api/shell',
        '@tauri-apps/api/fs': 'commonjs @tauri-apps/api/fs',
        '@tauri-apps/api/path': 'commonjs @tauri-apps/api/path',
      });
    } else {
      // For server-side (Next.js build), alias these modules to an empty object
      config.resolve.alias = {
        ...config.resolve.alias,
        '@tauri-apps/api/shell': false,
        '@tauri-apps/api/fs': false,
        '@tauri-apps/api/path': false,
      };
    }
    return config;
  },
};

export default nextConfig;
