/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  distDir: ".next",

  env: {
    TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL,
    TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN,
    JWT_SECRET: process.env.JWT_SECRET,
  },
};

export default nextConfig;
