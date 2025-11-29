import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  logging: {
    fetches: {
      fullUrl: true,
    },
    incomingRequests: {
      ignore: [/\api\/v1\/health/],
    },
  },
};

export default nextConfig;
