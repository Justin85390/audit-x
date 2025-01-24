/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['justindonlon.com'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig 