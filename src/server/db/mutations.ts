import "server-only";

import { eq, lt } from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import { db } from "~/server/db";
import { extractFileKey } from "~/lib/file-key";
import { files_table as filesSchema } from "~/server/db/schema";
import { folders_table as folderSchema } from "~/server/db/schema";
import { consent_log_table as consentLogSchema } from "~/server/db/schema";
import { CONSENT_LOG_RETENTION_YEARS } from "~/lib/legal";
import { GetNextOrderValue } from "~/server/db/queries";

export async function getFolderById(folderId: number) {
  return await db
    .select()
    .from(folderSchema)
    .where(eq(folderSchema.id, folderId))
    .limit(1)
    .then((res) => res[0]);
}

export async function createFile(input: {
  file: {
    name: string;
    size: number;
    url: string;
    parent: number;
  };
  userId: string;
}) {
  const order = await GetNextOrderValue(input.file.parent, input.userId);
  return await db
    .insert(filesSchema)
    .values({ ...input.file, ownerId: input.userId, order });
}

export async function OnboardUser(userId: string) {
  const rootFolder = await db
    .insert(folderSchema)
    .values({
      name: "root",
      parent: null,
      ownerId: userId,
    })
    .$returningId();

  const rootFolderId = rootFolder[0]!.id;

  await db.insert(folderSchema).values([
    {
      name: "Documents",
      parent: rootFolderId,
      ownerId: userId,
    },
    {
      name: "Photos",
      parent: rootFolderId,
      ownerId: userId,
    },
    {
      name: "Videos",
      parent: rootFolderId,
      ownerId: userId,
    },
  ]);

  return rootFolderId;
}

const utApi = new UTApi();

// Počet souborů smazaných jedním voláním UploadThing API.
const UPLOADTHING_DELETE_BATCH = 100;

// Právo na výmaz (čl. 17 GDPR): po smazání účtu v Clerku (webhook user.deleted) odstraní všechny soubory uživatele z UploadThingu
// a jeho řádky z databáze. Úložiště se maže první - když selže, řádky v DB zůstanou a opakované doručení webhooku to dokončí.
export async function deleteAllUserData(userId: string) {
  const files = await db
    .select({ url: filesSchema.url })
    .from(filesSchema)
    .where(eq(filesSchema.ownerId, userId));

  for (let i = 0; i < files.length; i += UPLOADTHING_DELETE_BATCH) {
    const batch = files.slice(i, i + UPLOADTHING_DELETE_BATCH);
    await utApi.deleteFiles(batch.map((file) => extractFileKey(file.url)));
  }

  await db.delete(filesSchema).where(eq(filesSchema.ownerId, userId));
  await db.delete(folderSchema).where(eq(folderSchema.ownerId, userId));
}

export async function logConsent(input: {
  consentId: string;
  type: "cookies" | "privacy";
  granted: boolean;
  policyVersion: string;
  ipHash: string;
}) {
  await db.insert(consentLogSchema).values({
    ...input,
    granted: input.granted ? 1 : 0,
  });

  // záznamy starší než retenční lhůta mažeme průběžně, aby nebylo potřeba samostatný cron
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - CONSENT_LOG_RETENTION_YEARS);
  await db
    .delete(consentLogSchema)
    .where(lt(consentLogSchema.created_at, cutoff));
}
