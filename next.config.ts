import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Reducir workers para builds con poca memoria
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
};

export default nextConfig;
