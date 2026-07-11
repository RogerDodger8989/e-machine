import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Native better-sqlite3-bindningen och Prisma-motorn ska köras server-side
  // som de är, inte bundlas om av webpack/Turbopack.
  serverExternalPackages: ["better-sqlite3", "@prisma/adapter-better-sqlite3"],
};

export default nextConfig;
