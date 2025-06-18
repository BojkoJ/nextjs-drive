import "server-only";

import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { files_table as filesSchema } from "~/server/db/schema";
import { folders_table as folderSchema } from "~/server/db/schema";

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
  return await db
    .insert(filesSchema)
    .values({ ...input.file, ownerId: input.userId });
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
