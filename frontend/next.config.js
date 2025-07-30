/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // Thêm dòng này để xuất tĩnh
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  images: { unoptimized: true },
  devIndicators: false,
  allowedDevOrigins: [],
}

module.exports = nextConfig
