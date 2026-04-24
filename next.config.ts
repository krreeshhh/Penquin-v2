import type { NextConfig } from "next";
import { execSync } from "child_process";

const commitHash = execSync('git rev-parse --short HEAD').toString().trim();

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_COMMIT_HASH: commitHash,
    NEXT_PUBLIC_GITHUB_REPO: "https://github.com/krreeshhh/Penquin-v2",
  },
};

export default nextConfig;
