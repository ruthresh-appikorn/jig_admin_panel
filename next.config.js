/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@heroui/react", "@heroui/form"],

  async redirects() {
    return [
      {
        source: '/admin_login',
        destination: '/features/admin/login',
        permanent: false,
      },
      {
        source: '/admin_dashboard',
        destination: '/features/admin/dashboard',
        permanent: false,
      },
    ];
  },};

module.exports = nextConfig;
