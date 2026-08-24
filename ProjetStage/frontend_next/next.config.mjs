/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: '127.0.0.1' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: '127.0.0.1' },
      { protocol: 'https', hostname: 'localhost' },
    ],
  },
};

export default nextConfig;
