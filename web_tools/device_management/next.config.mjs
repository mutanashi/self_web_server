/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    forceSwcTransforms: true,
    allowedDevOrigins: [
      "http://www.hihieverysunday.com",
      "https://www.hihieverysunday.com",
    ],
  },
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules/**', '**/.next/**'], // 🔧 忽略編譯 node_modules 和 .next
      };
    }
    return config;
  },
};

export default nextConfig;

