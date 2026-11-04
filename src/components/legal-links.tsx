"use client";

import Link from "next/link";
import { openCookieSettings } from "~/lib/consent";

const linkClass =
  "hover:text-foreground inline-block cursor-pointer py-1 hover:underline";

export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={openCookieSettings} className={className}>
      Cookie settings
    </button>
  );
}

// Odkazy do patičky: zásady, podmínky, prohlášení o přístupnosti a znovuotevření cookie lišty
// (odvolání souhlasu musí být stejně snadné jako jeho udělení). Patička je na všech stránkách.
export function LegalLinks() {
  return (
    <nav aria-label="Legal">
      <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-0">
        <li>
          <Link href="/privacy" className={linkClass}>
            Privacy Policy
          </Link>
        </li>
        <li>
          <Link href="/terms" className={linkClass}>
            Terms of Service
          </Link>
        </li>
        <li>
          <Link href="/accessibility" className={linkClass}>
            Accessibility
          </Link>
        </li>
        <li>
          <CookieSettingsButton className={linkClass} />
        </li>
      </ul>
    </nav>
  );
}
