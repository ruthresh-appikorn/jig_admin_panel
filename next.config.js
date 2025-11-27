/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // ✅ Static export for Firebase hosting
  trailingSlash: true,
  images: {
    unoptimized: true, // Required for static export
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Skip type checking during build since we've already validated types
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
