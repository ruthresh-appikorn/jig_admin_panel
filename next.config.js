/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  async redirects() {
    return [
      {
        source: "/admin_login",
        destination: "/features/admin/login",
        permanent: false,
      },
      {
        source: "/admin_dashboard",
        destination: "/features/admin/dashboard",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
