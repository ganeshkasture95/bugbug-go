/** @type {import('next').NextConfig} */
const nextConfig = {
  // Environment variables that should be available on the client
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  // External packages for server components
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
}

export default nextConfig