"use server";

import { and, eq, inArray, isNull } from "drizzle-orm";
import { db } from "./db";
import { files_table, folders_table } from "./db/schema";
import { GetNextOrderValue } from "./db/queries";
import { auth } from "@clerk/nextjs/server";
import { UTApi } from "uploadthing/server";
import { cookies } from "next/headers";

const utApi = new UTApi();

// Anotováno explicitně: bez toho by TS při kombinování více server akcí
// (např. v ternárním výrazu) unii zjednodušil a "result.error" by přestalo typovat.
export type ActionResult =
  | { error: string; success?: undefined }
  | { success: true; error?: undefined };

function extractFileKey(url: string) {
  return url.replace("https://49g2gpt71x.ufs.sh/f/", "");
}

async function forceRefresh() {
  // Malý cookie trik pro force refresh
  // Tímto způsobem zajistíme, že se stránka znovu načte, aby se změny projevily
  const c = await cookies();
  c.set("force-refresh", JSON.stringify(Math.random()));
}

// Projde strom složek do hloubky (BFS) a vrátí id všech potomků (ne včetně samotné složky)
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

export async function DeleteFile(fileId: number): Promise<ActionResult> {
  const session = await auth();
  if (!session?.userId) {
    return { error: "Unauthorized" };
  }

  const [file] = await db
    .select()
    .from(files_table)
    .where(
      and(eq(files_table.id, fileId), eq(files_table.ownerId, session.userId)),
    );

  if (!file) {
    return { error: "File not found." };
  }

  await utApi.deleteFiles([extractFileKey(file.url)]);

  await db.delete(files_table).where(eq(files_table.id, fileId));

  await forceRefresh();

  return { success: true };
}

type CreateFolderResult =
  | { error: string; success?: undefined; folderId?: undefined }
  | { success: true; folderId: number; error?: undefined };

//server action that takes a name and parentId, and creates a folder with that name and parentId (don't forget to set ownerId)
export async function CreateFolder(
  name: string,
  parentId: number,
): Promise<CreateFolderResult> {
  const session = await auth();
  if (!session?.userId) {
    return { error: "Unauthorized" };
  }

  const newFolder = {
    name,
    parent: parentId,
    ownerId: session.userId,
    order: await GetNextOrderValue(parentId, session.userId),
  }

  const folderExistsCheckName = await db.select().from(folders_table).where(
    and(
      eq(folders_table.name, name),
      eq(folders_table.parent, parentId),
      eq(folders_table.ownerId, session.userId)
    )
  )

  if (folderExistsCheckName.length > 0) {
    newFolder.name += " " + folderExistsCheckName.length.toString();
  }

  const newFolderId = await db.insert(folders_table).values(newFolder).$returningId();

  if (!newFolderId || newFolderId.length === 0) {
    return { error: "Failed to create folder." };
  }

  await forceRefresh();
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

  // Check if folder exists and belongs to user
  const [folder] = await db
    .select()
    .from(folders_table)
    .where(
      and(eq(folders_table.id, folderId), eq(folders_table.ownerId, session.userId)),
    );

  if (!folder) {
    return { error: "Folder not found." };
  }
  // Check if a folder with the new name already exists in the same parent directory
  const parentCondition = folder.parent === null
    ? isNull(folders_table.parent)
    : eq(folders_table.parent, folder.parent);

  const folderExistsCheckName = await db.select().from(folders_table).where(
    and(
      eq(folders_table.name, newName),
      parentCondition,
      eq(folders_table.ownerId, session.userId)
    )
  );

  if (folderExistsCheckName.length > 0 && folderExistsCheckName[0]!.id !== folderId) {
    return { error: "Folder with this name already exists in this directory." };
  }

  // Update the folder name
  const updateResult = await db
    .update(folders_table)
    .set({ name: newName })
    .where(eq(folders_table.id, folderId));

  if (!updateResult) {
    return { error: "Failed to rename folder." };
  }

  await forceRefresh();

  return { success: true };
}

export async function DeleteFolder(folderId: number): Promise<ActionResult> {
  const session = await auth();
  if (!session?.userId) {
    return { error: "Unauthorized" };
  }

  const [folder] = await db
    .select()
    .from(folders_table)
    .where(
      and(
        eq(folders_table.id, folderId),
        eq(folders_table.ownerId, session.userId),
      ),
    );

  if (!folder) {
    return { error: "Folder not found." };
  }

  if (folder.parent === null) {
    return { error: "Cannot delete your root folder." };
  }

  const descendantFolderIds = await getDescendantFolderIds(
    folderId,
    session.userId,
  );
  const allFolderIds = [folderId, ...descendantFolderIds];

  const filesToDelete = await db
    .select()
    .from(files_table)
    .where(
      and(
        inArray(files_table.parent, allFolderIds),
        eq(files_table.ownerId, session.userId),
      ),
    );

  if (filesToDelete.length > 0) {
    await utApi.deleteFiles(filesToDelete.map((f) => extractFileKey(f.url)));

    await db.delete(files_table).where(
      inArray(
        files_table.id,
        filesToDelete.map((f) => f.id),
      ),
    );
  }

  await db.delete(folders_table).where(inArray(folders_table.id, allFolderIds));

  await forceRefresh();

  return { success: true };
}

export type DragItemRef = { id: number; type: "file" | "folder" };

async function getOwnedFolder(folderId: number, ownerId: string) {
  const [folder] = await db
    .select()
    .from(folders_table)
    .where(and(eq(folders_table.id, folderId), eq(folders_table.ownerId, ownerId)));
  return folder;
}

async function getOwnedFile(fileId: number, ownerId: string) {
  const [file] = await db
    .select()
    .from(files_table)
    .where(and(eq(files_table.id, fileId), eq(files_table.ownerId, ownerId)));
  return file;
}

// Přesune jednu nebo více položek (souborů/složek) do cílové složky, volitelně
// je vloží před konkrétní sourozeneckou položku (drag & drop reorder), jinak je připojí na konec.
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

  const targetFolder = await getOwnedFolder(targetParentId, ownerId);
  if (!targetFolder) {
    return { error: "Target folder not found." };
  }

  for (const item of items) {
    if (item.type === "folder") {
      const folder = await getOwnedFolder(item.id, ownerId);
      if (!folder) return { error: "Folder not found." };
      if (folder.parent === null) {
        return { error: "Cannot move your root folder." };
      }
      if (item.id === targetParentId) {
        return { error: "Cannot move a folder into itself." };
      }

      const descendantFolderIds = await getDescendantFolderIds(
        item.id,
        ownerId,
      );
      if (descendantFolderIds.includes(targetParentId)) {
        return {
          error: "Cannot move a folder into one of its own subfolders.",
        };
      }
    } else {
      const file = await getOwnedFile(item.id, ownerId);
      if (!file) return { error: "File not found." };
    }
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

  // Resolve insertBefore's position against the ORIGINAL (unfiltered) list, then
  // shift it left by however many moved items preceded it there. This keeps a
  // drop right next to the dragged item's own old slot a true no-op, instead of
  // insertBefore silently vanishing (filtered out) and falling back to "append at end".
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

  await forceRefresh();

  return { success: true };
}

// Smaže více vybraných souborů/složek naráz (multi-select delete). Znovu využívá
// DeleteFile / DeleteFolder, takže se vlastnictví, cascade a UploadThing cleanup neduplikují.
export async function DeleteItems(items: DragItemRef[]): Promise<ActionResult> {
  const session = await auth();
  if (!session?.userId) {
    return { error: "Unauthorized" };
  }

  for (const item of items) {
    const result =
      item.type === "file" ? await DeleteFile(item.id) : await DeleteFolder(item.id);
    if (result.error) {
      return result;
    }
  }

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

  const [file] = await db
    .select()
    .from(files_table)
    .where(
      and(eq(files_table.id, fileId), eq(files_table.ownerId, session.userId)),
    );

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

  if (
    fileExistsCheckName.length > 0 &&
    fileExistsCheckName[0]!.id !== fileId
  ) {
    return { error: "File with this name already exists in this directory." };
  }

  await db
    .update(files_table)
    .set({ name: newName })
    .where(eq(files_table.id, fileId));

  await forceRefresh();

  return { success: true };
}
