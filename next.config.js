/**
 * Spusť `build` nebo `dev` s `SKIP_ENV_VALIDATION` pro přeskočení validace env - hodí se hlavně pro Docker buildy.
 */
import "./src/env.js";

// Bezpečnostní hlavičky pro všechny odpovědi.
const securityHeaders = [
  // Prohlížeč nesmí hádat typ obsahu (ochrana před "MIME sniffing" u nahraných souborů).
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Stránku nelze vkládat do cizích rámů (clickjacking).
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Cizím webům se neposílá celá URL (v adrese je id složky/souboru).
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  // Jen HTTPS. Bez "preload", dokud není jisté, že všechny podomény poběží přes HTTPS.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
];

// Content-Security-Policy zatím jen v režimu Report-Only: porušení vidíš v konzoli prohlížeče, nic se neblokuje.
// Po ověření, že přihlášení (Clerk), nahrávání (UploadThing) a náhledy souborů nehlásí chyby, změň hlavičku na "Content-Security-Policy".
// Jakmile poběží Clerk na vlastní doméně (produkční instance), přidej ji do script-src / connect-src / frame-src / img-src.
// 'unsafe-inline' u skriptů je nutné pro Next.js bez nonce; přísnější varianta vyžaduje nonce v proxy.ts.
const contentSecurityPolicyReportOnly = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://*.clerk.accounts.dev https://*.clerk.com https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://img.clerk.com https://*.ufs.sh https://utfs.io",
  "media-src 'self' blob: https://*.ufs.sh https://utfs.io",
  "font-src 'self' data:",
  "connect-src 'self' https://*.clerk.accounts.dev https://*.clerk.com https://clerk-telemetry.com https://*.ufs.sh https://utfs.io https://*.ingest.uploadthing.com https://api.uploadthing.com",
  "frame-src 'self' https://challenges.cloudflare.com https://*.ufs.sh https://utfs.io",
  "object-src 'self' https://*.ufs.sh https://utfs.io",
  "worker-src 'self' blob:",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ");

/** @type {import("next").NextConfig} */
const config = {
  // Nevystavovat hlavičku X-Powered-By: Next.js.
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          ...securityHeaders,
          // V dev režimu React/Turbopack používají eval a inline skripty, takže by CSP jen spamovala konzoli.
          ...(process.env.NODE_ENV === "production"
            ? [
                {
                  key: "Content-Security-Policy-Report-Only",
                  value: contentSecurityPolicyReportOnly,
                },
              ]
            : []),
        ],
      },
    ];
  },
  // PostHog reverse proxy: klient posílá analytiku na vlastní doménu (/relay-iPtb, viz posthog-provider.tsx) a odsud se přeposílá na PostHog.
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
  // PostHog API posílá požadavky s koncovým lomítkem; bez tohoto by je Next.js přesměrovával a proxy by se rozbila.
  skipTrailingSlashRedirect: true,
};

export default config;
