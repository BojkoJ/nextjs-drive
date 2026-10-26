"use client";

import dynamicLoader from "next/dynamic";
import posthog from "posthog-js";

import { useEffect } from "react";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { env } from "~/env";
import { useCookieConsent } from "~/lib/consent";

const SuspendedPostHogPageView = dynamicLoader(
  () => import("./pageview-tracker"),
  { ssr: false },
);

// Smaže zbylé PostHog cookies/localStorage. Volá se jen když PostHog v této stránce neběží
// (jinak by si instance znovu zapnula sběr, protože flag odmítnutí žije v těch samých úložištích).
function purgePostHogStorage() {
  try {
    for (const key of Object.keys(window.localStorage)) {
      if (key.startsWith("ph_") || key.startsWith("__ph_")) {
        window.localStorage.removeItem(key);
      }
    }
  } catch {
    // localStorage nedostupný
  }

  const labels = window.location.hostname.split(".");
  const domains = [
    undefined,
    ...labels.map((_, i) => `.${labels.slice(i).join(".")}`),
  ];
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0]?.trim();
    if (!name?.startsWith("ph_") && !name?.startsWith("__ph_")) continue;
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ""}`;
    }
  }
}

// Vykreslená před trackerem: efekty sourozenců běží v pořadí stromu, takže init proběhne dřív než první capture.
function PostHogConsentSync({ analytics }: { analytics: boolean | null }) {
  // Analytika běží jen s výslovným souhlasem (§ 89 odst. 3 zákona č. 127/2005 Sb., čl. 6(1)(a) GDPR).
  useEffect(() => {
    if (analytics === true) {
      if (posthog.__loaded) {
        posthog.opt_in_capturing();
      } else {
        posthog.init(String(env.NEXT_PUBLIC_POSTHOG_KEY ?? ""), {
          api_host: "/relay-iPtb",
          // api_host: (env.NEXT_PUBLIC_POSTHOG_HOST as string) ?? "https://us.i.posthog.com",
          ui_host: "https://us.posthog.com",
          capture_pageview: false,
          person_profiles: "identified_only", // nebo 'always' pro vytvoření profilu i pro anonymní uživatele
        });
      }
    } else if (posthog.__loaded) {
      // souhlas odvolán za běhu: okamžitě zastavit sběr, úložiště se vyčistí při dalším načtení stránky
      posthog.opt_out_capturing();
      posthog.reset();
    } else {
      purgePostHogStorage();
    }
  }, [analytics]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const { analytics } = useCookieConsent();

  return (
    <PHProvider client={posthog}>
      <PostHogConsentSync analytics={analytics} />
      {analytics === true && <SuspendedPostHogPageView />}
      {children}
    </PHProvider>
  );
}
