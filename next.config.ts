import type { NextConfig } from "next";
import { LEGACY_SECTOR_REDIRECTS } from "./src/lib/sectorCatalog";

const nextConfig: NextConfig = {
  // Keep the Next.js badge out of both FAB slots so a left-thumb reach
  // in `next dev` is not swallowed by the dev indicator.
  devIndicators: { position: 'top-right' },
  async redirects() {
    return Object.entries(LEGACY_SECTOR_REDIRECTS).map(([from, destination]) => ({
      source: `/sectors/${from}`,
      destination,
      permanent: true,
    }));
  },
};

export default nextConfig;
