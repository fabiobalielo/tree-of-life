import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["three"],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      three: require.resolve("three"),
    };

    // Add specific alias for the examples folder
    config.resolve.alias["three/examples/jsm/controls/OrbitControls.js"] =
      require.resolve("three/examples/jsm/controls/OrbitControls.js");

    return config;
  },
};

export default nextConfig;
