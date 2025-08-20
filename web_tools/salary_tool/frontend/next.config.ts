import type { NextConfig } from "next";

const base = "/web_tools/salary_tool";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: "out",
  basePath: base,
  assetPrefix: base,
  images: { unoptimized: true },
};

export default nextConfig;
