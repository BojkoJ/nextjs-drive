"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { PRIVACY_POLICY_VERSION } from "~/lib/legal";

// § 89 odst. 3 zákona č. 127/2005 Sb. (znění účinné od 1. 1. 2026):
// "Každý, kdo hodlá používat nebo používá sítě elektronických komunikací k ukládání údajů nebo k získávání
// přístupu k údajům uloženým v koncových zařízeních účastníků nebo uživatelů, získá od těchto účastníků
// nebo uživatelů předem prokazatelný souhlas s rozsahem a účelem jejich zpracování. Tato povinnost neplatí
// pro technické ukládání nebo přístup výhradně pro potřeby přenosu zprávy prostřednictvím sítě elektronických
// komunikací nebo je-li to nezbytné pro potřeby poskytování služby informační společnosti, která je výslovně
// vyžádána účastníkem nebo uživatelem."
//
// Souhlasy držíme v localStorage (uložení volby samotné je "nezbytné" a souhlas nevyžaduje).
const COOKIE_KEY = "bojko-drive:cookie-consent";
const PRIVACY_KEY = "bojko-drive:privacy-consent";
const CONSENT_ID_KEY = "bojko-drive:consent-id";
const CHANGE_EVENT = "bojko-drive:consent-change";

// Doporučení ÚOOÚ: souhlas platí max. 12 měsíců, po odmítnutí se lišta neukazuje dříve než za 6 měsíců.
const MONTH_MS = 30 * 24 * 60 * 60 * 1000;
const ACCEPT_TTL_MS = 12 * MONTH_MS;
const REJECT_TTL_MS = 6 * MONTH_MS;

// Zvyš, když se změní účely/kategorie cookies – staré souhlasy tím přestanou platit.
const COOKIE_CONSENT_VERSION = 1;

type CookieConsentRecord = {
  analytics: boolean;
  version: number;
  decidedAt: string;
};

type PrivacyConsentRecord = {
  version: string;
  acceptedAt: string;
};

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    // localStorage může být zablokovaný (soukromý režim apod.) – bereme jako "bez volby"
    return null;
  }
}

function writeRaw(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // ignorujeme, volba pak platí jen do reloadu
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function parse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

// Náhodné ID prohlížeče, které spojí záznamy v serverovém logu souhlasů (nenese žádnou identitu).
function getConsentId(): string {
  const existing = readRaw(CONSENT_ID_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID();
  try {
    window.localStorage.setItem(CONSENT_ID_KEY, id);
  } catch {
    // bez localStorage bude mít každý záznam nové ID, což nevadí
  }
  return id;
}

// Zapíše volbu na server jako důkaz souhlasu (§ 89 odst. 3 "prokazatelný"). Selhání nesmí zablokovat UI.
// keepalive: požadavek se dokončí, i když hned po kliknutí následuje přesměrování na Clerk.
function logConsent(
  type: "cookies" | "privacy",
  granted: boolean,
  version: string,
) {
  fetch("/api/consent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ consentId: getConsentId(), type, granted, version }),
    keepalive: true,
  }).catch(() => undefined);
}

function evaluateCookieConsent(raw: string | null): boolean | null {
  const record = parse<CookieConsentRecord>(raw);
  if (record?.version !== COOKIE_CONSENT_VERSION) return null;
  const ttl = record.analytics ? ACCEPT_TTL_MS : REJECT_TTL_MS;
  if (Date.now() - new Date(record.decidedAt).getTime() > ttl) return null;
  return record.analytics;
}

// Ruční znovuotevření lišty z odkazu "Cookie settings" v patičce.
let settingsOpen = false;
const settingsListeners = new Set<() => void>();

function setSettingsOpen(value: boolean) {
  settingsOpen = value;
  settingsListeners.forEach((l) => l());
}

// Prvek, ze kterého uživatel lištu otevřel - po volbě se na něj vrací fokus (WCAG 2.4.3), jinak by klávesnicový uživatel skončil na začátku stránky.
let returnFocusTo: HTMLElement | null = null;

export function openCookieSettings() {
  returnFocusTo =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
  setSettingsOpen(true);
}

function restoreFocus() {
  const target = returnFocusTo;
  returnFocusTo = null;
  if (target?.isConnected) requestAnimationFrame(() => target.focus());
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  settingsListeners.add(callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
    settingsListeners.delete(callback);
  };
}

const noop = () => () => undefined;

// true až po hydrataci, aby se banner nevykresloval do SSR HTML (jinak by problikl i uživatelům s uloženou volbou)
export function useHydrated() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

export function useCookieConsent() {
  const hydrated = useHydrated();
  const raw = useSyncExternalStore(
    subscribe,
    () => readRaw(COOKIE_KEY),
    () => null,
  );
  const isOpen = useSyncExternalStore(
    subscribe,
    () => settingsOpen,
    () => false,
  );

  // analytics: true/false = platná volba, null = nerozhodnuto nebo vypršelo → chovej se jako "jen nezbytné"
  const analytics = useMemo(() => evaluateCookieConsent(raw), [raw]);

  const decide = useCallback((value: boolean) => {
    const record: CookieConsentRecord = {
      analytics: value,
      version: COOKIE_CONSENT_VERSION,
      decidedAt: new Date().toISOString(),
    };
    writeRaw(COOKIE_KEY, JSON.stringify(record));
    logConsent("cookies", value, String(COOKIE_CONSENT_VERSION));
    setSettingsOpen(false);
    restoreFocus();
  }, []);

  return {
    hydrated,
    analytics,
    // true, když lištu ručně znovu otevřel uživatel (ne když se ukázala sama při první návštěvě)
    reopened: isOpen,
    // lišta je vidět, dokud uživatel nezvolí (nebo ji ručně neotevře z patičky)
    showBanner: hydrated && (analytics === null || isOpen),
    decide,
  };
}

export function usePrivacyConsent() {
  const hydrated = useHydrated();
  const raw = useSyncExternalStore(
    subscribe,
    () => readRaw(PRIVACY_KEY),
    () => null,
  );

  const accepted = useMemo(() => {
    const record = parse<PrivacyConsentRecord>(raw);
    return record?.version === PRIVACY_POLICY_VERSION;
  }, [raw]);

  const accept = useCallback(() => {
    const record: PrivacyConsentRecord = {
      version: PRIVACY_POLICY_VERSION,
      acceptedAt: new Date().toISOString(),
    };
    writeRaw(PRIVACY_KEY, JSON.stringify(record));
    logConsent("privacy", true, PRIVACY_POLICY_VERSION);
  }, []);

  return { hydrated, accepted, accept };
}
