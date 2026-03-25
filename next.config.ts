import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "www.nekonecno.sk" },
      { hostname: "nekonecno.sk" },
      { hostname: "www.xzone.sk" },
      { hostname: "xzone.sk" },
      { hostname: "www.ihrysko.sk" },
      { hostname: "ihrysko.sk" },
      { hostname: "www.dracik.sk" },
      { hostname: "dracik.sk" },
    ],
  },
};

export default nextConfig;
