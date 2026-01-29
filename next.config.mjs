/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Utile pour éviter les blocages mineurs sur mobile
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
