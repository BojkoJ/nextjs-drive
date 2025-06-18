"use client";

import dynamicLoader from "next/dynamic";
import posthog from "posthog-js";

import { useEffect } from "react";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { env } from "~/env";

const SuspendedPostHogPageView = dynamicLoader(
  () => import("./pageview-tracker"),
  { ssr: false },
);

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(String(env.NEXT_PUBLIC_POSTHOG_KEY ?? ""), {
      api_host: "/relay-iPtb",
      // api_host: (env.NEXT_PUBLIC_POSTHOG_HOST as string) ?? "https://us.i.posthog.com",
      ui_host: "https://us.posthog.com",
      capture_pageview: false,
      person_profiles: "identified_only", // nebo 'always' pro vytvoření profilu i pro anonymní uživatele
    });
  }, []);

  return (
    <PHProvider client={posthog}>
      <SuspendedPostHogPageView />
      {children}
    </PHProvider>
  );
}
