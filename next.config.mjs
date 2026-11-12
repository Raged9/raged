/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/contact",
        destination: "/portofolio",
        permanent: true,
      },
      {
        source: "/portfolio",
        destination: "/portofolio",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
