"use client";

import Link from "next/link";
import { openCookieSettings } from "~/lib/consent";

export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={openCookieSettings}
      className={className}
    >
      Cookie settings
    </button>
  );
}

// Odkazy do patičky: zásady a znovuotevření cookie lišty (odvolání souhlasu musí být stejně snadné jako jeho udělení).
export function LegalLinks() {
  return (
    <>
      <Link href="/privacy" className="hover:underline">
        Privacy Policy
      </Link>
      <span className="hidden opacity-30 md:inline">•</span>
      <CookieSettingsButton className="cursor-pointer hover:underline" />
    </>
  );
}
