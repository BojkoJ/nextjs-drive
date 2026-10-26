// Údaje správce a verze textu zásad. Při jakékoli věcné změně /privacy zvyš PRIVACY_POLICY_VERSION –
// uživatelé pak budou před přihlášením požádáni o potvrzení znovu.
export const PRIVACY_POLICY_VERSION = "2026-10-26";
export const PRIVACY_POLICY_UPDATED = "26 October 2026";

// TODO: doplnit před nasazením – Art. 13(1)(a) GDPR vyžaduje identitu a kontakt správce.
export const CONTROLLER = {
  name: "Jan Bojko",
  address: "Písek 450, 73984, Písek u Jablunkova",
  email: "honzabojko@seznam.cz",
} as const;

// Jak dlouho držíme záznamy o souhlasech (obecná promlčecí lhůta 3 roky). Starší se mažou při každém zápisu nového.
export const CONSENT_LOG_RETENTION_YEARS = 3;

// Jak dlouho držíme analytická data v PostHogu (nastav stejně v PostHog → Project settings → Data retention).
export const ANALYTICS_RETENTION = "12 months";
