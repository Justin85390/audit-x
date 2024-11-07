/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
    domains: ['justindonlon.com']
  }
}

module.exports = nextConfig 