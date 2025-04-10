import { eq } from "drizzle-orm";
import DriveContent from "~/components/drive-content";
import { db } from "~/server/db";
import {
  files_table as filesSchema,
  folders_table as foldersSchema,
} from "~/server/db/schema";

// Funkce, která vrátí všechny rodiče složky (včetně samotné složky) - pro breadcrumb
async function getAllParents(folderId: number) {
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

export default async function GoogleDriveClone(props: {
  params: Promise<{ folderId: string }>;
}) {
  // I když tady TS server ukazuje, že folderId je typu number, tak typeof folderId je string
  const params = await props.params;
  const parsedFolderId = parseInt(params.folderId);
  if (isNaN(parsedFolderId)) {
    return <div>Invalid folder ID</div>;
  }

  // 1. Vytvoříme všechny Promisy co potřebujeme
  const filesPromise = db
    .select()
    .from(filesSchema)
    .where(eq(filesSchema.parent, parsedFolderId));

  const foldersPromise = db
    .select()
    .from(foldersSchema)
    .where(eq(foldersSchema.parent, parsedFolderId));

  const parentsPromise = getAllParents(parsedFolderId);

  // 2. Počkáme na všechny Promisy
  // Toto zajistí, že získání folderů a souborů proběhne paralelně, což je rychlejší než čekat na každý dotaz zvlášť
  const [folders, files, parents] = await Promise.all([
    foldersPromise,
    filesPromise,
    parentsPromise,
  ]);

  // 3. Až všechny Promisy skončí, tak je renderujeme komponentu DriveContent
  return <DriveContent files={files} folders={folders} parents={parents} />;
}
