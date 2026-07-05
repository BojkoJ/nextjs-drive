/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  // PostHog reverse proxy: klient posílá analytiku na vlastní doménu
  // (/relay-iPtb, viz posthog-provider.tsx) a odsud se přeposílá na PostHog.
  // Bez těchto rewrites končí všechny relay požadavky jako 404 v app routeru.
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
    ];
  },
  // PostHog API posílá požadavky s koncovým lomítkem; bez tohoto by je
  // Next.js přesměrovával a proxy by se rozbila.
  skipTrailingSlashRedirect: true,
};

export default config;
