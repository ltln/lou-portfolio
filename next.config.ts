import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  images: {
    remotePatterns: [new URL("https://avatars.githubusercontent.com/u/*")],
  },
};

export default nextConfig;
