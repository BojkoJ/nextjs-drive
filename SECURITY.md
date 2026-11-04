# Security Policy

## Supported versions

Only the latest commit on `main`, which is what runs at
<https://bojko-drive.netlify.app/>, receives security fixes.

## Reporting a vulnerability

Please **do not open a public issue** for security problems.

Report privately by either:

- using GitHub's **"Report a vulnerability"** button on the
  [Security tab](https://github.com/BojkoJ/nextjs-drive/security/advisories/new) of this repository, or
- e-mailing **honzabojko@seznam.cz** (English or Czech).

Please include what you found, where (URL or file), steps to reproduce and the
impact you expect. Proof-of-concept code is welcome; please do not access,
change or delete other people's data while testing.

### What to expect

- Acknowledgement within **7 days**.
- An assessment and a plan or fix, usually within **30 days** for confirmed
  issues, faster for critical ones.
- Credit in the fix notes if you want it. This is a hobby project and has no
  bug bounty.

We follow coordinated disclosure: please give us a reasonable chance to fix the
issue before you publish details.

### Scope

In scope: this repository and the deployed application. Out of scope: issues
in third-party services we use (Clerk, UploadThing, PostHog, Netlify,
SingleStore) - please report those to the vendor - and denial-of-service
testing, social engineering and physical attacks.

## Dependencies

Dependencies are monitored with Dependabot and `pnpm audit` in CI, and the
code is scanned with CodeQL. A software bill of materials (CycloneDX) is
produced by every CI run.
