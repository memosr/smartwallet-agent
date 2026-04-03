/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    fetchCache: 'force-no-store',
  },
};

module.exports = nextConfig;
