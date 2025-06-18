/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  async rewrites() {
    return [
      {
        source: "/relay-iPtb/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/relay-iPtb/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
      {
        source: "/relay-iPtb/flags",
        destination: "https://us.i.posthog.com/flags",
      },
    ];
  },
  // Toto je nutné pro podporu API požadavků PostHog s koncovým lomítkem
  skipTrailingSlashRedirect: true,
};

export default config;
