/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cette option empêche Vercel de tester les API pendant le build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Force toutes les routes API à être ignorées lors de la génération statique
  output: 'standalone', 
}

module.exports = nextConfig
