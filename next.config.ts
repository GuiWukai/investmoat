import type { NextConfig } from "next";
import { LEGACY_SECTOR_REDIRECTS } from "./src/lib/sectorCatalog";

const nextConfig: NextConfig = {
  async redirects() {
    return Object.entries(LEGACY_SECTOR_REDIRECTS).map(([from, destination]) => ({
      source: `/sectors/${from}`,
      destination,
      permanent: true,
    }));
  },
};

export default nextConfig;
