"use server";

import { and, eq, inArray, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "./db";
import { files_table, folders_table } from "./db/schema";
import { GetNextOrderValue } from "./db/queries";
import { auth } from "@clerk/nextjs/server";
import { UTApi } from "uploadthing/server";

const utApi = new UTApi();

// Anotováno explicitně: bez toho by TS při kombinování více server akcí (např. v ternárním výrazu) unii zjednodušil a "result.error" by přestalo typovat.
export type ActionResult =
  | { error: string; success?: undefined }
  | { success: true; error?: undefined };

export type DragItemRef = { id: number; type: "file" | "folder" };

function extractFileKey(url: string) {
  return url.replace("https://49g2gpt71x.ufs.sh/f/", "");
}

// Idiomatická náhrada dřívějšího cookie triku (nastavení náhodné cookie): revalidatePath zneplatní client router cache, takže navigace i refresh dostanou čerstvá data.
// Scope "layout" záměrně pokrývá celý strom - mutace ovlivňují i StorageMeter v root layoutu.
function revalidateDrive() {
  revalidatePath("/", "layout");
}

async function getOwnedFolder(folderId: number, ownerId: string) {
  const [folder] = await db
    .select()
    .from(folders_table)
    .where(
      and(eq(folders_table.id, folderId), eq(folders_table.ownerId, ownerId)),
    );
  return folder;
}

async function getOwnedFile(fileId: number, ownerId: string) {
  const [file] = await db
    .select()
    .from(files_table)
    .where(and(eq(files_table.id, fileId), eq(files_table.ownerId, ownerId)));
  return file;
}

// Projde strom složek do hloubky (BFS) a vrátí id všech potomků (ne včetně samotné složky).
async function getDescendantFolderIds(folderId: number, ownerId: string) {
  const descendantIds: number[] = [];
  let currentLevel = [folderId];

  while (currentLevel.length > 0) {
    const children = await db
      .select({ id: folders_table.id })
      .from(folders_table)
      .where(
        and(
          inArray(folders_table.parent, currentLevel),
          eq(folders_table.ownerId, ownerId),
        ),
      );

    if (children.length === 0) break;

    currentLevel = children.map((c) => c.id);
    descendantIds.push(...currentLevel);
  }

  return descendantIds;
}

// Rozbalí vybrané složky na kompletní seznam id včetně všech podsložek, s deduplikací překryvů (např. když je vybraná složka i její podsložka).
async function collectFolderSubtreeIds(folderIds: number[], ownerId: string) {
  const descendantIdLists = await Promise.all(
    folderIds.map((id) => getDescendantFolderIds(id, ownerId)),
  );
  return [...new Set([...folderIds, ...descendantIdLists.flat()])];
}

// Smaže dané soubory (řádky z DB) najednou: jeden batch do UploadThing API a jeden DELETE dotaz. Ownership musí být ověřen volajícím.
async function deleteFileRecords(
  files: (typeof files_table.$inferSelect)[],
) {
  if (files.length === 0) return;
  await utApi.deleteFiles(files.map((f) => extractFileKey(f.url)));
  await db.delete(files_table).where(
    inArray(
      files_table.id,
      files.map((f) => f.id),
    ),
  );
}

export async function DeleteFile(fileId: number): Promise<ActionResult> {
  const session = await auth();
  if (!session?.userId) {
    return { error: "Unauthorized" };
  }

  const file = await getOwnedFile(fileId, session.userId);
  if (!file) {
    return { error: "File not found." };
  }

  await deleteFileRecords([file]);

  revalidateDrive();

  return { success: true };
}

type CreateFolderResult =
  | { error: string; success?: undefined; folderId?: undefined }
  | { success: true; folderId: number; error?: undefined };

export async function CreateFolder(
  name: string,
  parentId: number,
): Promise<CreateFolderResult> {
  const session = await auth();
  if (!session?.userId) {
    return { error: "Unauthorized" };
  }

  // Oba dotazy jsou nezávislé, běží paralelně (viz pravidlo o Promise.all).
  const [order, folderExistsCheckName] = await Promise.all([
    GetNextOrderValue(parentId, session.userId),
    db
      .select()
      .from(folders_table)
      .where(
        and(
          eq(folders_table.name, name),
          eq(folders_table.parent, parentId),
          eq(folders_table.ownerId, session.userId),
        ),
      ),
  ]);

  const newFolder = {
    name,
    parent: parentId,
    ownerId: session.userId,
    order,
  };

  if (folderExistsCheckName.length > 0) {
    newFolder.name += " " + folderExistsCheckName.length.toString();
  }

  const newFolderId = await db
    .insert(folders_table)
    .values(newFolder)
    .$returningId();

  if (!newFolderId || newFolderId.length === 0) {
    return { error: "Failed to create folder." };
  }

  revalidateDrive();
  return { success: true, folderId: newFolderId[0]!.id };
}

export async function RenameFolder(
  folderId: number,
  newName: string,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.userId) {
    return { error: "Unauthorized" };
  }

  const folder = await getOwnedFolder(folderId, session.userId);
  if (!folder) {
    return { error: "Folder not found." };
  }

  // Zkontrolujeme, jestli složka s novým názvem už v tomtéž rodiči neexistuje.
  const parentCondition =
    folder.parent === null
      ? isNull(folders_table.parent)
      : eq(folders_table.parent, folder.parent);

  const folderExistsCheckName = await db
    .select()
    .from(folders_table)
    .where(
      and(
        eq(folders_table.name, newName),
        parentCondition,
        eq(folders_table.ownerId, session.userId),
      ),
    );

  if (
    folderExistsCheckName.length > 0 &&
    folderExistsCheckName[0]!.id !== folderId
  ) {
    return { error: "Folder with this name already exists in this directory." };
  }

  const updateResult = await db
    .update(folders_table)
    .set({ name: newName })
    .where(eq(folders_table.id, folderId));

  if (!updateResult) {
    return { error: "Failed to rename folder." };
  }

  revalidateDrive();

  return { success: true };
}

export async function RenameFile(
  fileId: number,
  newName: string,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.userId) {
    return { error: "Unauthorized" };
  }

  const file = await getOwnedFile(fileId, session.userId);
  if (!file) {
    return { error: "File not found." };
  }

  const fileExistsCheckName = await db
    .select()
    .from(files_table)
    .where(
      and(
        eq(files_table.name, newName),
        eq(files_table.parent, file.parent),
        eq(files_table.ownerId, session.userId),
      ),
    );

  if (fileExistsCheckName.length > 0 && fileExistsCheckName[0]!.id !== fileId) {
    return { error: "File with this name already exists in this directory." };
  }

  await db
    .update(files_table)
    .set({ name: newName })
    .where(eq(files_table.id, fileId));

  revalidateDrive();

  return { success: true };
}

export async function DeleteFolder(folderId: number): Promise<ActionResult> {
  const session = await auth();
  if (!session?.userId) {
    return { error: "Unauthorized" };
  }

  const folder = await getOwnedFolder(folderId, session.userId);
  if (!folder) {
    return { error: "Folder not found." };
  }

  if (folder.parent === null) {
    return { error: "Cannot delete your root folder." };
  }

  const allFolderIds = await collectFolderSubtreeIds(
    [folderId],
    session.userId,
  );

  const filesToDelete = await db
    .select()
    .from(files_table)
    .where(
      and(
        inArray(files_table.parent, allFolderIds),
        eq(files_table.ownerId, session.userId),
      ),
    );

  await deleteFileRecords(filesToDelete);

  await db.delete(folders_table).where(inArray(folders_table.id, allFolderIds));

  revalidateDrive();

  return { success: true };
}

// Smaže více vybraných souborů/složek naráz (multi-select delete): vše se zvaliduje, pak se maže dávkově - jeden batch pro UploadThing a jeden DELETE na tabulku.
// Překryvy (vybraný soubor uvnitř vybrané složky, složka i její podsložka) se deduplikují.
export async function DeleteItems(items: DragItemRef[]): Promise<ActionResult> {
  const session = await auth();
  if (!session?.userId) {
    return { error: "Unauthorized" };
  }
  const ownerId = session.userId;

  if (items.length === 0) {
    return { error: "Nothing to delete." };
  }

  const fileIds = items.filter((i) => i.type === "file").map((i) => i.id);
  const folderIds = items.filter((i) => i.type === "folder").map((i) => i.id);

  const [ownedFiles, ownedFolders] = await Promise.all([
    fileIds.length > 0
      ? db
          .select()
          .from(files_table)
          .where(
            and(
              inArray(files_table.id, fileIds),
              eq(files_table.ownerId, ownerId),
            ),
          )
      : Promise.resolve([]),
    folderIds.length > 0
      ? db
          .select()
          .from(folders_table)
          .where(
            and(
              inArray(folders_table.id, folderIds),
              eq(folders_table.ownerId, ownerId),
            ),
          )
      : Promise.resolve([]),
  ]);

  if (ownedFiles.length !== fileIds.length) {
    return { error: "File not found." };
  }
  if (ownedFolders.length !== folderIds.length) {
    return { error: "Folder not found." };
  }
  if (ownedFolders.some((folder) => folder.parent === null)) {
    return { error: "Cannot delete your root folder." };
  }

  const allFolderIds =
    folderIds.length > 0 ? await collectFolderSubtreeIds(folderIds, ownerId) : [];

  const filesInFolders =
    allFolderIds.length > 0
      ? await db
          .select()
          .from(files_table)
          .where(
            and(
              inArray(files_table.parent, allFolderIds),
              eq(files_table.ownerId, ownerId),
            ),
          )
      : [];

  const filesById = new Map(
    [...ownedFiles, ...filesInFolders].map((file) => [file.id, file]),
  );
  await deleteFileRecords([...filesById.values()]);

  if (allFolderIds.length > 0) {
    await db
      .delete(folders_table)
      .where(inArray(folders_table.id, allFolderIds));
  }

  revalidateDrive();

  return { success: true };
}

// Přesune jednu nebo více položek do cílové složky, volitelně před konkrétní sourozeneckou položku (drag & drop reorder), jinak na konec.
export async function MoveItemsToPosition(
  items: DragItemRef[],
  targetParentId: number,
  insertBefore: DragItemRef | null,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.userId) {
    return { error: "Unauthorized" };
  }
  const ownerId = session.userId;

  if (items.length === 0) {
    return { error: "Nothing to move." };
  }

  // Kontrola cílové složky a validace všech přesouvaných položek jsou vzájemně nezávislé - běží paralelně místo jedné await smyčky za druhou.
  const [targetFolder, validationErrors] = await Promise.all([
    getOwnedFolder(targetParentId, ownerId),
    Promise.all(
      items.map(async (item): Promise<string | null> => {
        if (item.type === "folder") {
          const folder = await getOwnedFolder(item.id, ownerId);
          if (!folder) return "Folder not found.";
          if (folder.parent === null) {
            return "Cannot move your root folder.";
          }
          if (item.id === targetParentId) {
            return "Cannot move a folder into itself.";
          }

          const descendantFolderIds = await getDescendantFolderIds(
            item.id,
            ownerId,
          );
          if (descendantFolderIds.includes(targetParentId)) {
            return "Cannot move a folder into one of its own subfolders.";
          }
          return null;
        }

        const file = await getOwnedFile(item.id, ownerId);
        return file ? null : "File not found.";
      }),
    ),
  ]);

  if (!targetFolder) {
    return { error: "Target folder not found." };
  }

  const validationError = validationErrors.find((error) => error !== null);
  if (validationError) {
    return { error: validationError };
  }

  const [siblingFolders, siblingFiles] = await Promise.all([
    db
      .select()
      .from(folders_table)
      .where(
        and(
          eq(folders_table.parent, targetParentId),
          eq(folders_table.ownerId, ownerId),
        ),
      ),
    db
      .select()
      .from(files_table)
      .where(
        and(
          eq(files_table.parent, targetParentId),
          eq(files_table.ownerId, ownerId),
        ),
      ),
  ]);

  type SiblingRef = DragItemRef & { order: number };

  const movedSet = new Set(items.map((i) => `${i.type}-${i.id}`));

  const originalCombined: SiblingRef[] = [
    ...siblingFolders.map((f) => ({
      id: f.id,
      type: "folder" as const,
      order: f.order,
    })),
    ...siblingFiles.map((f) => ({
      id: f.id,
      type: "file" as const,
      order: f.order,
    })),
  ].sort((a, b) => a.order - b.order || a.id - b.id);

  const siblings = originalCombined.filter(
    (s) => !movedSet.has(`${s.type}-${s.id}`),
  );

  // Pozici insertBefore vyřešíme vůči PŮVODNÍMU (nefiltrovanému) seznamu a pak ji posuneme doleva o počet přesouvaných položek, které v něm byly před ní.
  // Drop hned vedle staré pozice tažené položky tak zůstane skutečné no-op, místo aby insertBefore tiše zmizel (odfiltrovaný) a spadli jsme na "přidat na konec".
  let insertIndex = siblings.length;
  if (insertBefore) {
    const originalIdx = originalCombined.findIndex(
      (s) => s.type === insertBefore.type && s.id === insertBefore.id,
    );
    if (originalIdx !== -1) {
      const removedBefore = originalCombined
        .slice(0, originalIdx)
        .filter((s) => movedSet.has(`${s.type}-${s.id}`)).length;
      insertIndex = originalIdx - removedBefore;
    }
  }

  const finalOrder: SiblingRef[] = [
    ...siblings.slice(0, insertIndex),
    ...items.map((i) => ({ ...i, order: 0 })),
    ...siblings.slice(insertIndex),
  ];

  await Promise.all(
    finalOrder.map((item, index) =>
      item.type === "folder"
        ? db
            .update(folders_table)
            .set({ order: index, parent: targetParentId })
            .where(eq(folders_table.id, item.id))
        : db
            .update(files_table)
            .set({ order: index, parent: targetParentId })
            .where(eq(files_table.id, item.id)),
    ),
  );

  revalidateDrive();

  return { success: true };
}
