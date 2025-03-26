/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (
    config,
    { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
  ) => {
    if (config.cache && !dev) {
      config.cache = Object.freeze({
        type: 'memory',
        max: 1000,
        maxAge: 1000 * 60 * 60 * 24 * 30,
      })
    }
    return config
  },
}

export default nextConfig