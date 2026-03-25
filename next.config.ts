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
      { hostname: "www.bubuobchod.cz" },
      { hostname: "bubuobchod.cz" },
      { hostname: "www.cardstore.cz" },
      { hostname: "cardstore.cz" },
      { hostname: "www.cardempire.sk" },
      { hostname: "cardempire.sk" },
      { hostname: "www.hras.cz" },
      { hostname: "hras.cz" },
      { hostname: "www.shadowball.cz" },
      { hostname: "shadowball.cz" },
      { hostname: "www.playingcardshop.eu" },
      { hostname: "playingcardshop.eu" },
    ],
  },
};

export default nextConfig;
