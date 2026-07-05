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

- [Node.js](https://nodejs.org/en/download)
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

#### Handy Commands:

- `pnpm dev` - run the development server
- `pnpm build` - build the project for production
- `pnpm start` - start the production server
- `pnpm check` - run lint with ESLint and type checks with TypeScript
- `pnpm db:push` - push the database schema to SingleStore
- `pnpm db:studio` - open the Drizzle Studio to manage the database

## Tech Stack:

- [Next.js 16](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [ShadCN/UI](https://ui.shadcn.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Zod](https://zod.dev/)
- [Uploadthing](https://uploadthing.com/)
- [MySQL (SingleStore)](https://www.singlestore.com/)
- [CI pipeline (GitHub Actions)](https://github.com/features/actions)

## CI/CD Pipeline:

The CI/CD pipeline uses **GitHub Actions** and **Netlify CD**, ensuring that code is automatically checked, linted, correctly built and deployed. The pipeline includes the following steps:

### **CI (Continuous Integration)**

1. **Checkout of the code** – Loads the repository code into the GitHub Actions runner.
2. **Dependencies Install** – We use `pnpm` to install all necessary dependencies for the project.
3. **Copy `.env` file** – Copies the `.env.example` to `.env` for the CI environment.
4. **Typecheck** – Checks TypeScript types to ensure type safety across the codebase.
5. **Lint** – Runs ESLint to check for code quality and style issues.

### **CD (Continuous Deployment)**

Deployment is triggered automatically by Netlify when changes are pushed. Netlify builds the project and deploys it to the live environment.
