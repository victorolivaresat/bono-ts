import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración para Docker: genera salida standalone optimizada
  output: 'standalone',

  // Optimizaciones adicionales
  experimental: {
    // Mejora el rendimiento en producción
    optimizePackageImports: ['lucide-react', '@radix-ui/react-dialog'],
  },
};

export default nextConfig;
