import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/web_tools/salary_tool' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/web_tools/salary_tool' : '',
  images: {
    unoptimized: true
  }
};

export default nextConfig;
