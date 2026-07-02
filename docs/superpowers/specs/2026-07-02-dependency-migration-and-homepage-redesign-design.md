# Dependency migration and visual redesign

Date: 2026-07-02
Status: approved, ready for planning

## Context

Bojko Drive is a Google Drive clone (T3 stack: Next.js, TypeScript, Tailwind, ShadCN, Drizzle, Clerk, PostHog, Uploadthing, SingleStore). This is the first of two planned phases:

1. **This phase**: upgrade every dependency to its latest version, then redesign the site's shared visual language (it currently uses a generic blue to purple gradient with blurred glow blobs, the same pattern on every entry screen).
2. **Next phase** (separate spec, written after this one ships): implement the five remaining items on the README to do list (folder delete cascade, file view page, upload toasts and loading states, row graying during delete, drag and drop).

Production has real users and data on Netlify, so nothing in this phase touches the database schema or deletes data. It is a code and styling upgrade only.

## Part A: Dependency migration

Bump every package (`dependencies` and `devDependencies`) to latest with `pnpm up --latest`, including the major versions below, then fix whatever breaks:

| Package | Current | Target | Note |
|---|---|---|---|
| next / eslint-config-next | 15.3 | 16.x | major |
| @clerk/nextjs | 6.14 | 7.x | major, already on `clerkMiddleware` so migration should be small |
| zod | 3.24 | 4.x | major, `z.string().url()` style validators changed in `src/env.js` |
| typescript | 5.8 | 6.x | major |
| eslint | 9.24 | 10.x | major, flat config already in use |
| lucide-react | 0.474 | 1.x | major, icon set used heavily in `file-row.tsx` |
| react / react-dom | 19.1 | 19.2 | minor |
| everything else (drizzle-orm/kit, uploadthing, @t3-oss/env-nextjs, @libsql/client, tailwindcss, mysql2, posthog-js, prettier, etc.) | - | latest | mostly minor/patch |

Verification, in order:

1. `pnpm typecheck` and `pnpm lint` until clean.
2. `pnpm build` succeeds.
3. Manual walk-through in the dev server: sign in, sign out, create/rename folder, upload a file, delete a file, navigate breadcrumbs. This is the app's only real regression net since there is no test suite.
4. Do not run `pnpm db:push` against the real database. Nothing in this phase changes `schema.ts`, so it is not needed.

If a major bump turns out to need disproportionate rework (for example Clerk v7 changing session handling in a way that risks locking out existing users), stop and flag it instead of pushing through.

## Part B: Visual redesign

### Direction

Chosen from mockups: a brutalist layout (oversized uppercase headline, rotated "stamp" badge, sharp-cut accent rule, thick-border outline button, slightly rotated file-preview card) recolored with a sage mint palette on a near-black background. No gradients, no blurred glow blobs, no animated pulse effects anywhere.

Palette (as Tailwind `@theme` / shadcn CSS variables in `globals.css`, replacing the current unused `.dark` block, then applying `class="dark"` on `<html>` so the whole app actually uses these tokens instead of hardcoded `neutral-900` classes):

- `--background: #0f110d`, `--foreground: #eef2ea`
- `--card` / `--popover`: `#171a13`
- `--primary: #8fd694` (sage mint), `--primary-foreground: #0f110d`
- `--muted-foreground: #9db19a`
- `--border` / `--input`: low-opacity warm gray
- `--ring: #8fd694`
- `--destructive` stays the existing red

Typography stays Geist (already loaded). The "human, not AI" feel comes from composition, not a second typeface: uppercase tracking, the rotated stamp badge, the sharp-clipped rule under the headline, the tilted file-preview card, deliberate asymmetry. No serif, no cursive, no hand-drawn SVG flourishes (those were in the earlier mockups but not in the chosen direction).

### Scope

Rewrite these screens/components to the new direction:

- `src/app/layout.tsx` - header, logo mark, sign in button
- `src/app/(home)/page.tsx` - landing hero for signed-out visitors
- `src/app/(home)/sign-in/page.tsx`
- `src/app/(home)/drive/page.tsx` - the "create your base folders" onboarding screen for a signed-in user with no root folder yet
- `src/styles/globals.css` - palette tokens

Because `Button`'s default/ghost/outline variants read the shadcn CSS variables, switching those tokens will also lightly re-skin a few default-variant buttons elsewhere (e.g. the "Access Denied" and generic error screens in `drive-content.tsx` and `f/[folderId]/page.tsx`) from black-on-gray to the new palette automatically. That is expected and desirable for consistency.

**Out of scope for this phase:** the authenticated file browser itself, `drive-content.tsx` and `file-row.tsx` (the folder/file table, row hover states, upload button). Those keep their current hardcoded `neutral-800`/`neutral-900` look. Restyling the working file browser is a bigger, separate surface and wasn't part of what was asked for; revisit later if wanted.

### Copy

Casual and direct, no corporate marketing tone:

- Landing hero: headline "Store stuff. Find it again.", subhead about a no-nonsense personal drive, badge "solo-built", CTA "Get started free"
- Sign-in and onboarding screens get shorter variants of the same voice, consistent with the hero

## Verification before done

Per project standard: run the dev server, click through sign-in, the landing page, and the onboarding screen in an actual browser, in both a signed-out and signed-in-with-no-root-folder state, before calling this phase complete.

## Explicitly out of scope

- README to do list items (folder delete cascade, file view page, toasts/loading states, row graying during delete, drag and drop) - separate spec after this phase ships.
- Any database schema change or data migration.
- Redesign of the authenticated file browser UI.
