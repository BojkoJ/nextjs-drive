import "server-only";

import { and, eq, inArray, isNull, sum } from "drizzle-orm";
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

export async function GetRootFolderForUser(userId: string) {
  const folder = await db
    .select()
    .from(foldersSchema)
    .where(
      and(eq(foldersSchema.ownerId, userId), isNull(foldersSchema.parent)),
    );
  return folder[0];
}

export function GetFolders(folderId: number) {
  return db
    .select()
    .from(foldersSchema)
    .where(eq(foldersSchema.parent, folderId))
    .orderBy(foldersSchema.order, foldersSchema.id);
}

export function GetFiles(folderId: number) {
  return db
    .select()
    .from(filesSchema)
    .where(eq(filesSchema.parent, folderId))
    .orderBy(filesSchema.order, filesSchema.id);
}

export async function GetFileById(fileId: number) {
  const file = await db
    .select()
    .from(filesSchema)
    .where(eq(filesSchema.id, fileId));
  return file[0];
}

// Spočítá další volnou "order" hodnotu pro nově vytvořenou položku, aby se
// nově vytvořené složky/soubory přidávaly na konec seznamu, ne na jeho začátek
// (order sloupec má DB default 0, který by je jinak posunul mezi první položky).
export async function GetNextOrderValue(parentId: number, ownerId: string) {
  const [folders, files] = await Promise.all([
    db
      .select({ order: foldersSchema.order })
      .from(foldersSchema)
      .where(
        and(eq(foldersSchema.parent, parentId), eq(foldersSchema.ownerId, ownerId)),
      ),
    db
      .select({ order: filesSchema.order })
      .from(filesSchema)
      .where(
        and(eq(filesSchema.parent, parentId), eq(filesSchema.ownerId, ownerId)),
      ),
  ]);

  const orders = [...folders.map((f) => f.order), ...files.map((f) => f.order)];
  return orders.length === 0 ? 0 : Math.max(...orders) + 1;
}

// Sečte velikost všech souborů ve složce a rekurzivně ve všech jejích podsložkách.
export async function GetFolderSize(folderId: number) {
  let total = 0;
  let currentLevel = [folderId];

  while (currentLevel.length > 0) {
    const [files, childFolders] = await Promise.all([
      db
        .select({ size: filesSchema.size })
        .from(filesSchema)
        .where(inArray(filesSchema.parent, currentLevel)),
      db
        .select({ id: foldersSchema.id })
        .from(foldersSchema)
        .where(inArray(foldersSchema.parent, currentLevel)),
    ]);

    total += files.reduce((sum, f) => sum + f.size, 0);
    currentLevel = childFolders.map((f) => f.id);
  }

  return total;
}

// Celkové využití úložiště napříč všemi složkami uživatele (pro limit v navigaci).
export async function GetUserStorageUsage(userId: string) {
  const [result] = await db
    .select({ total: sum(filesSchema.size) })
    .from(filesSchema)
    .where(eq(filesSchema.ownerId, userId));

  return Number(result?.total ?? 0);
}
