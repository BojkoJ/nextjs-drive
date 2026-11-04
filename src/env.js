import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    SINGLESTORE_USER: z.string(),
    SINGLESTORE_PASS: z.string(),
    SINGLESTORE_HOST: z.string(),
    SINGLESTORE_PORT: z.string(),
    SINGLESTORE_DB_NAME: z.string(),

    // Tajný klíč pro hashování IP v logu souhlasů (HMAC). Bez něj by šel hash IPv4 triviálně zpětně dopočítat.
    CONSENT_HASH_SALT: z.string().min(16),

    // Signing secret pro Clerk webhook user.deleted (výmaz dat po smazání účtu). Volitelný, aby šlo aplikaci spustit i bez webhooku;
    // bez něj endpoint /api/webhooks/clerk odpovídá 503 a data po smazání účtu zůstanou.
    CLERK_WEBHOOK_SIGNING_SECRET: z.string().min(1).optional(),
  },

  client: {
    NEXT_PUBLIC_POSTHOG_KEY: z.string(),
  },

  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    SINGLESTORE_USER: process.env.SINGLESTORE_USER,
    SINGLESTORE_PASS: process.env.SINGLESTORE_PASS,
    SINGLESTORE_HOST: process.env.SINGLESTORE_HOST,
    SINGLESTORE_PORT: process.env.SINGLESTORE_PORT,
    SINGLESTORE_DB_NAME: process.env.SINGLESTORE_DB_NAME,
    CONSENT_HASH_SALT: process.env.CONSENT_HASH_SALT,
    CLERK_WEBHOOK_SIGNING_SECRET: process.env.CLERK_WEBHOOK_SIGNING_SECRET,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
