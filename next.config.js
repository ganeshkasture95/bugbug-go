/** @type {import('next').NextConfig} */
const nextConfig = {
  // Environment variables that should be available on the client
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  // External packages for server components
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['jose'],
  },
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  
  // Bundle analyzer (uncomment to analyze bundle)
  // webpack: (config, { isServer }) => {
  //   if (!isServer) {
  //     config.resolve.fallback = {
  //       ...config.resolve.fallback,
  //       fs: false,
  //     };
  //   }
  //   return config;
  // },
}

export default nextConfig