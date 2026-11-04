# Nextjs Google Drive Clone

Bojko Drive - Google Drive clone built with T3 stack - Next.js, TypeScript, TailwindCSS

- Database hosted on SingleStore
- Project hosted on Netlify
- Auth implemented with Clerk
- Analytics implemented with PostHog (only with the visitor's consent)

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

#### Optional: erase data when an account is deleted

Create a Clerk webhook (Dashboard → Webhooks) for the `user.deleted` event pointing to `https://<your-domain>/api/webhooks/clerk` and set `CLERK_WEBHOOK_SIGNING_SECRET` to its signing secret. Then deleting an account also deletes the user's files and folders.

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
- `pnpm audit` - check dependencies for known vulnerabilities

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
6. **Dependency audit** – `pnpm audit` fails the build on high or critical vulnerabilities.
7. **SBOM** – Generates a CycloneDX software bill of materials as a build artifact.

### **CD (Continuous Deployment)**

Deployment is triggered automatically by Netlify when changes are pushed. Netlify builds the project and deploys it to the live environment.

## Security

Please report vulnerabilities privately, see [SECURITY.md](SECURITY.md). CI runs `pnpm audit` and CodeQL and generates an SBOM; Dependabot keeps dependencies and GitHub Actions up to date.

## Legal

- Licence: [MIT](LICENSE)
- Privacy Policy, Terms of Service and Accessibility Statement are served by the app at `/privacy`, `/terms` and `/accessibility`.
- Compliance notes for the operator (GDPR, cookies, DSA, accessibility, CRA, licences): [docs/COMPLIANCE.md](docs/COMPLIANCE.md)
