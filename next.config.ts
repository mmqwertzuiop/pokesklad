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
      { hostname: "www.pompo.sk" },
      { hostname: "pompo.sk" },
      { hostname: "www.pompo.cz" },
      { hostname: "pompo.cz" },
      { hostname: "www.bambule.cz" },
      { hostname: "bambule.cz" },
      { hostname: "knihydobrovsky.cz" },
      { hostname: "www.knihydobrovsky.cz" },
      { hostname: "www.sparkys.cz" },
      { hostname: "sparkys.cz" },
      { hostname: "www.cernyrytir.cz" },
      { hostname: "cernyrytir.cz" },
      { hostname: "www.svet-her.cz" },
      { hostname: "svet-her.cz" },
    ],
  },
};

export default nextConfig;
