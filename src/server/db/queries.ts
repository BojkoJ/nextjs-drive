import "server-only";

import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import {
  files_table as filesSchema,
  folders_table as foldersSchema,
} from "~/server/db/schema";

// Funkce, která vrátí všechny rodiče složky (včetně samotné složky) - pro breadcrumb
export async function getAllParentsForFolder(folderId: number) {
  const parents = [];
  let currentId: number | null = folderId;

  while (currentId !== null) {
    const folder = await db
      .selectDistinct()
      .from(foldersSchema)
      .where(eq(foldersSchema.id, currentId));

    if (!folder[0]) {
      throw new Error("Folder not found");
    }

    // Abychom zajistili správné pořadí, místo push použijeme unshift, protože push přidává na konec pole
    // Pole parents by pak bylo opačně než jak chceme (root by byl poslední místo první atd)
    // Unshift přidá na začátek pole, takže pořadí bude správnéS
    // Šlo by použít .reverse(), ale to je bad practice, protože to vytvoří nové pole a je to zbytečně náročné na výkon
    parents.unshift(folder[0]);
    currentId = folder[0]?.parent;
  }

  return parents;
}

export function GetFolders(folderId: number) {
  return db
    .select()
    .from(foldersSchema)
    .where(eq(foldersSchema.parent, folderId));
}

export function GetFiles(folderId: number) {
  return db.select().from(filesSchema).where(eq(filesSchema.parent, folderId));
}
