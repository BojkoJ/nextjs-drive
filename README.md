# Nextjs Google Drive Clone

Bojko Drive - Google Drive clone built with T3 stack - Next.js, TypeScript, TailwindCSS

- Database hosted on SingleStore
- Project hosted on Netlify
- Auth implemented with Clerk
- Analytics implemented with PostHog

### Live demo:

https://bojko-drive.netlify.app/

### How to run locally:

- Clone this repo
- Install packages: `pnpm install`

#### Setup `.env` file by copying and filling out the `.env.example`

## Tech Stack:

- Next.js 15
- TypeScript
- TailwindCSS
- ShadCN/UI
- Drizzle ORM
- Zod
- Uploadthing
- MySQL (SingleStore)
- CI pipeline (GitHub Actions)

## MAIN TODO:

- [x] Set up database and data model _(finished 10.04.2025)_
- [x] Move folder open state to URL
- [x] Add ClerkAuth
- [x] Add file uploading (only images for now)
- [x] Add analytics (Posthog)
- [x] Make sure the sort order is consistent
- [x] 'Delete file' button
- [x] Add ownership to folders, each user sees only his folders
- [ ] Real homepage + Onboarding
- [ ] Create folder - server action that takes a name and parentId, and creates a folder with that name and parentId (don't forget to set ownerId)
- [ ] Delete folder - fetch all folders that have it as parent and their children too, then delete them all
- [ ] Make a "file view" page
- [ ] Toasts after file upload, Loading states, better UX
- [ ] Gray out a row while it's being deleted - set states in component etc.

## Note from 10.04.2025

Just finished up connecting database, next steps:

- [x] Update schema to show files and folders
- [x] Manually insert examples
- [x] Render them in the UI
- [x] Push and make sure it all works

**Done all TODOs ✅**

## Note from 11.04.2025

- [x] Change folders to link components, remove all client states
- [x] Clean up the database and data fetching patterns

**Done all TODOs ✅**

## Note from 18.06.2025

- [x] Add ownership to files and folders
- [x] Upload files to the right folder
- [x] Allow files that aren't images to be uploaded
