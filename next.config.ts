import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const appRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Avoid incorrect workspace root when a lockfile exists outside this app (e.g. in the home directory).
  turbopack: {
    root: appRoot,
  },
};

export default nextConfig;
