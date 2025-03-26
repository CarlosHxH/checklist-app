// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Otimizações de performance
  compress: true, // Habilita compressão Gzip
  
  // Configurações de imagem
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/avif', 'image/webp'], // Formatos modernos
    minimumCacheTTL: 60, // Cache de 1 minuto
  },

  // Otimizações de webpack
  webpack: (config, { dev, isServer }) => {
    // Reduz tamanho do bundle
    config.optimization.minimize = !dev;
    
    // Melhorar cache para produção
    if (!dev) {
      config.cache = {
        type: 'filesystem',
        maxMemoryPercent: 10, // Limita uso de memória
        maxAge: 1000 * 60 * 60 * 24 * 7, // Cache por 7 dias
      }
    }

    return config;
  },

  // Configurações de performance
  experimental: {
    // Habilita otimizações de runtime
    runtime: 'experimental-edge',
    
    // Reduz tamanho dos polyfills
    legacyBrowsers: false,
    
    // Carregamento mais rápido
    optimizePackageImports: true,
  },

  // Otimizações de carregamento
  reactStrictMode: true,
  swcMinify: true, // Minificação mais rápida
  
  // Reduz JavaScript não essencial
  productionBrowserSourceMaps: false,
}

export default nextConfig;