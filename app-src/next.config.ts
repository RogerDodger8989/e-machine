import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Native better-sqlite3-bindningen och Prisma-motorn ska köras server-side
  // som de är, inte bundlas om av webpack/Turbopack.
  serverExternalPackages: ["better-sqlite3", "@prisma/adapter-better-sqlite3"],
  experimental: {
    // Standardgränsen (1 MB) räcker inte för att spara en företagslogga —
    // base64-kodning av bilden lägger på ~33% overhead, så ett vanligt
    // fotos-storlek (t.ex. en logga sparad från mobilen) tar sig annars
    // aldrig igenom formuläret (components/company-profile-form.tsx).
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
