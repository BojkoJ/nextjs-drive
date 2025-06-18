import { useUser } from "@clerk/nextjs";
import { usePathname, useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { useEffect } from "react";

export default function PostHogPageView() {
  const userInfo = useUser();
  const posthog = usePostHog();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Trackuje identifikaci uživatele pomocí PostHog
  // Tento efekt se spouští při přihlášení nebo odhlášení uživatele a aktualizuje profil uživatele v PostHog
  useEffect(() => {
    if (userInfo.user?.id) {
      posthog.identify(userInfo.user?.id, {
        email: userInfo.user?.emailAddresses[0]?.emailAddress,
      });
    } else {
      posthog.reset();
    }
  }, [posthog, userInfo.user]);

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
