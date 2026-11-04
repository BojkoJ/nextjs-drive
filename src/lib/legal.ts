// Údaje správce a verze textu zásad. Při jakékoli věcné změně /privacy zvyš PRIVACY_POLICY_VERSION –
// uživatelé pak budou před přihlášením požádáni o potvrzení znovu.
export const PRIVACY_POLICY_VERSION = "2026-11-04";
export const PRIVACY_POLICY_UPDATED = "4 November 2026";

// Data poslední změny ostatních právních stránek (/terms, /accessibility). Nemají vliv na souhlasy.
export const TERMS_UPDATED = "4 November 2026";
export const ACCESSIBILITY_UPDATED = "4 November 2026";

// Identifikace správce osobních údajů a poskytovatele služby: čl. 13(1)(a) GDPR, § 5 zákona č. 480/2004 Sb.
// (o některých službách informační společnosti) a kontaktní místo podle čl. 11 a 12 nařízení (EU) 2022/2065 (DSA).
// Pokud službu provozuješ jako podnikatel (OSVČ), doplň sem i IČO a uprav stránky /terms a /privacy.
export const CONTROLLER = {
  name: "Jan Bojko",
  address: "Písek 450, 73984, Písek u Jablunkova",
  email: "honzabojko@seznam.cz",
} as const;

// Jak dlouho držíme záznamy o souhlasech (obecná promlčecí lhůta 3 roky). Starší se mažou při každém zápisu nového.
export const CONSENT_LOG_RETENTION_YEARS = 3;

// Jak dlouho držíme analytická data v PostHogu (nastav stejně v PostHog → Project settings → Data retention).
export const ANALYTICS_RETENTION = "12 months";
