"use client";

import { useUser } from "@clerk/nextjs";
import { usePathname, useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { useEffect } from "react";

export default function PostHogPageView() {
  const userInfo = useUser();
  const posthog = usePostHog();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Trackuje identifikaci uživatele v PostHog - efekt se spouští při přihlášení nebo odhlášení.
  // Posíláme jen pseudonymní Clerk ID, žádný e-mail ani jméno (minimalizace údajů, čl. 5(1)(c) GDPR).
  // Závislost je primitiv (id), ne celý user objekt, takže se efekt nespouští při každé nesouvisející změně profilu.
  const userId = userInfo.user?.id;
  useEffect(() => {
    if (userId) {
      posthog.identify(userId);
    } else {
      posthog.reset();
    }
  }, [posthog, userId]);

  // Trackuje návštěvy stránek pomocí PostHog
  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }

      posthog.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams, posthog]);

  return null;
}
