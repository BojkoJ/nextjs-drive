# Nextjs Google Drive Clone

Bojko Drive - Google Drive clone built with T3 stack - Next.js, TypeScript, TailwindCSS

- Database hosted on SingleStore
- Project hosted on Netlify
- Auth implemented with Clerk
- Analytics implemented with PostHog

## Live demo:

https://bojko-drive.netlify.app/

## How to run locally:

#### Requirements:

- [Node.js (v18+)](https://nodejs.org/en/download)
- [pnpm](https://pnpm.io/installation)
- [Git](https://git-scm.com/downloads)

#### Steps:

- Clone this repo
- Install packages: `pnpm install`
- Setup `.env` file by copying and filling out the `.env.example`
- Run project by `pnpm dev` and enjoy on http://localhost:3000
- Eventually you can run `pnpm build` and `pnpm start` to build and run the production version

#### Reccomended Development Tools:

- **Visual Studio Code** with the following extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - Python

#### Handy Commands:

- `pnpm dev` - run the development server
- `pnpm build` - build the project for production
- `pnpm start` - start the production server
- `pnpm check` - run lint with ESLint and type checks with TypeScript
- `pnpm db:push` - push the database schema to SingleStore
- `pnpm db:studio` - open the Drizzle Studio to manage the database

## Tech Stack:

- [Next.js 15](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [ShadCN/UI](https://ui.shadcn.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Zod](https://zod.dev/)
- [Uploadthing](https://uploadthing.com/)
- [MySQL (SingleStore)](https://www.singlestore.com/)
- [CI pipeline (GitHub Actions)](https://github.com/features/actions)

## CI/CD Pipeline:

My CI/CD pipeline uses **GitHub Actions** for the, ensuring that code is automatically checked with deployment. The pipeline includes the following steps:

### 🛠 **CI (Continuous Integration)**

1. **Checkout kódu** – Loads the repository code into the GitHub Actions runner.
2. **Instalace závislostí** – We use `pnpm` to install all necessary dependencies for the project.
3. **Copy `.env` file** – Copies the `.env.example` to `.env` for the CI environment.
4. **Typecheck** – Checks TypeScript types to ensure type safety across the codebase.
5. **Lint** – Runs ESLint to check for code quality and style issues.

### 🚀 **CD (Continuous Deployment)**

Deployment is triggered automatically by Netlify when changes are pushed to the `main` branch. Netlify builds the project and deploys it to the live environment.

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

**Done all TODOs ✅**
