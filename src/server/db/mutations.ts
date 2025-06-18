import "server-only";

import { db } from "~/server/db";
import { files_table as filesSchema } from "~/server/db/schema";

// Omit nás nechá vybrat specifické klíče, které nebudou zahrnuty v typu
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
    .values({ ...input.file, parent: input.file.parent });
}
