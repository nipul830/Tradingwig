import type { NextConfig } from "next";

const repoBase = process.env.NODE_ENV === "production" ? "/Tradingwig" : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath: repoBase,
  assetPrefix: repoBase ? `${repoBase}/` : undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
