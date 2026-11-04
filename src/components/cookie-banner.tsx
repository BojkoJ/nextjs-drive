"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { useCookieConsent } from "~/lib/consent";

// Obě volby jsou vizuálně totožné (požadavek ÚOOÚ/EDPB – odmítnutí nesmí být méně výrazné než souhlas).
const choiceClass =
  "flex-1 cursor-pointer rounded-none border-2 text-xs font-bold tracking-wide uppercase";

export function CookieBanner() {
  const { showBanner, analytics, reopened, decide } = useCookieConsent();
  const bannerRef = useRef<HTMLDivElement>(null);

  // Při ručním otevření z patičky přesuneme fokus na lištu, aby se o ní klávesnicový uživatel i čtečka dozvěděli.
  // Při první návštěvě fokus neukrádáme - lišta je v DOM hned za skip linkem.
  useEffect(() => {
    if (reopened && showBanner) bannerRef.current?.focus();
  }, [reopened, showBanner]);

  if (!showBanner) return null;

  return (
    <div
      ref={bannerRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-text"
      className="border-border bg-card text-foreground fixed inset-x-0 bottom-0 z-40 border-t-2 p-4 outline-none sm:inset-x-auto sm:bottom-4 sm:left-4 sm:max-w-md sm:border-2"
    >
      <h2
        id="cookie-banner-title"
        className="font-mono text-sm font-bold tracking-tight uppercase"
      >
        Cookies
      </h2>
      <p
        id="cookie-banner-text"
        className="text-muted-foreground mt-2 text-sm leading-relaxed"
      >
        We always use the cookies needed to sign you in and keep the site
        secure. With your consent we also use analytics (PostHog) to see how the
        site is used. No ads, nothing is sold.{" "}
        <Link
          href="/privacy#cookies"
          className="text-foreground underline underline-offset-4"
        >
          Details
        </Link>
        {analytics !== null && (
          <>
            {" "}
            <span className="text-foreground">
              Current setting: analytics {analytics ? "on" : "off"}.
            </span>
          </>
        )}
      </p>
      <div className="mt-4 flex gap-2">
        <Button
          variant="outline"
          className={choiceClass}
          onClick={() => decide(false)}
        >
          Only necessary
        </Button>
        <Button
          variant="outline"
          className={choiceClass}
          onClick={() => decide(true)}
        >
          Accept all
        </Button>
      </div>
    </div>
  );
}
