# Legal and compliance notes

> Maintainer's working notes, not legal advice. Last reviewed: 2026-11-04.
> Have anything you rely on checked by a lawyer.

Bojko Drive is a small, free, personal-file-storage web app run by one person in
the Czech Republic. This file records which rules were considered, how they apply
and what the operator still has to do outside the code.

## Applicability at a glance

| Rule | Applies? | Status |
| --- | --- | --- |
| GDPR (EU 2016/679) + Czech Act 110/2019 | **Yes** | Implemented: privacy policy, consent, erasure webhook, minimised analytics. See below. |
| ePrivacy / § 89(3) Act 127/2005 (cookies) | **Yes** | Implemented: opt-in analytics, equal choices, provable consent log, re-open link in footer. |
| Digital Services Act (EU 2022/2065) | **Yes, hosting-service duties** | Contact point, terms and notice-and-action in `/terms`. Platform duties (Art. 20+) do not apply to micro/small providers. |
| Act 480/2004 § 5 (provider identification) | **Yes** | Provider identity in `/terms` and `/privacy`. Add the IČO to `src/lib/legal.ts` if you operate as a sole trader. |
| European Accessibility Act (Directive 2019/882, Czech Act 424/2023) | **Probably not** | A free storage service is not one of the listed services, and microenterprise service providers are exempt. WCAG 2.2 AA is followed anyway; see `/accessibility`. |
| Cyber Resilience Act (EU 2024/2847) | **No, in our assessment** | See below. |
| NIS2 / Czech cybersecurity act | **No** | Applies to medium/large entities in listed sectors. |

## GDPR

Done in code:

- `/privacy` (Art. 13): controller, purposes, legal bases, retention, recipients,
  transfers, rights, complaint to ÚOOÚ.
- Analytics (PostHog) only after an explicit "Accept all"; "Only necessary" is
  equally prominent. Only a pseudonymous user ID is sent (no e-mail).
- Provable consent log with a keyed (HMAC) IP hash, deleted after 3 years.
- Right to erasure: deleting the account in Clerk triggers the `user.deleted`
  webhook (`/api/webhooks/clerk`), which deletes all files (UploadThing) and
  database rows.
- Access control: folder pages only load data of the signed-in owner.

Operator checklist (cannot be done from the repo):

1. **Clerk webhook**: Dashboard → Webhooks → add endpoint
   `https://<your-domain>/api/webhooks/clerk`, event `user.deleted`; put the
   signing secret in `CLERK_WEBHOOK_SIGNING_SECRET` (Netlify env). Without it,
   deleting an account leaves the files behind and the privacy policy is wrong.
2. **Clerk**: enable "Allow users to delete their accounts" (User & authentication
   → Account settings) so the self-service deletion promised in the policy
   exists. Consider "Require express consent to legal documents" with links to
   `/terms` and `/privacy`, which gives a per-account consent record.
3. **Processor agreements (Art. 28)**: accept the DPAs of Clerk, UploadThing,
   SingleStore, Netlify and PostHog in their dashboards and keep a copy.
4. **PostHog**: set data retention to match `ANALYTICS_RETENTION`
   (`src/lib/legal.ts`). The project currently uses the US cloud; an EU project
   would avoid the transfer (change the hosts in `next.config.js` and
   `netlify.toml`, and the key).
5. **Records of processing (Art. 30)** are generally not required for an
   occasional, small-scale controller, but a short internal list of the data in
   the policy's table is cheap to keep.
6. **Breach procedure**: notify ÚOOÚ within 72 h of becoming aware if there is a
   risk to individuals (Art. 33).
7. When the policy changes materially, bump `PRIVACY_POLICY_VERSION`.

## Accessibility

The European Accessibility Act (applicable since 28 June 2025; Czech Act
No. 424/2023 Coll.) covers listed consumer services (e-commerce, banking,
e-books, transport, ...). A free file-storage app is not clearly one of them,
and microenterprises (fewer than 10 staff and turnover or balance sheet of at
most EUR 2 M) providing services are exempt. The public-sector web accessibility
act (99/2019) does not apply to private persons. So there is likely **no legal
obligation**, but the site follows WCAG 2.2 AA as good practice and publishes
`/accessibility`.

Known gaps are listed on that page. Not yet done: an external audit and testing
with several screen readers.

## Cyber Resilience Act

The CRA regulates *products with digital elements* placed on the EU market in the
course of a commercial activity. Our assessment:

- The deployed website is a service we run ourselves; it is not software supplied
  to others for installation. Pure SaaS and websites are outside the CRA unless
  they are "remote data processing" belonging to a product.
- The public repository is non-commercial open-source software published without
  monetisation, which the CRA leaves out of scope (individual developers are not
  "manufacturers"; the "steward" regime is for organisations that systematically
  support commercial open source).
- Timeline for reference: vulnerability and incident reporting duties apply from
  11 Sep 2026, the rest from 11 Dec 2027.

This would change if the project were sold, offered with paid support, or
distributed commercially as an installable product. Meanwhile CRA-style hygiene is
followed voluntarily: `SECURITY.md` and `/.well-known/security.txt`
(vulnerability disclosure), Dependabot, `pnpm audit` and CodeQL in CI, and an SBOM
per CI run.

Keep `public/.well-known/security.txt` current: its `Expires` field must be
renewed at least yearly (RFC 9116).

## Licensing

- Repository licence: MIT (`LICENSE`). Without a licence a public repository is
  "all rights reserved" and nobody may legally reuse it.
- Production dependencies are MIT/ISC/BSD/Apache-2.0 or dual-licensed with a
  permissive option. The only copyleft component is libvips inside `sharp`
  (LGPL, dynamically linked, unmodified, server side only).
- If parts of the code originate from a tutorial or template, check that
  licence too.

## Security notes

- Dependencies are patched and `pnpm audit` is clean. Transitive fixes that
  upstream has not released yet live in `pnpm-workspace.yaml` under `overrides`;
  remove them once the parent packages catch up.
- Security headers are set in `next.config.js`. The Content-Security-Policy is in
  report-only mode until verified against Clerk and UploadThing in a browser.
- File links (`ufs.sh`) are unguessable but public. UploadThing supports private
  files with signed URLs if that is ever needed.
