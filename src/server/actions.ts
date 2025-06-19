"use server";

import { and, eq, isNull } from "drizzle-orm";
import { db } from "./db";
import { files_table, folders_table } from "./db/schema";
import { auth } from "@clerk/nextjs/server";
import { UTApi } from "uploadthing/server";
import { cookies } from "next/headers";

const utApi = new UTApi();

export async function DeleteFile(fileId: number) {
  const session = await auth();
  if (!session || !session.userId) {
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

  const utApiResult = await utApi.deleteFiles([
    file.url.replace("https://49g2gpt71x.ufs.sh/f/", ""),
  ]);

  console.log(utApiResult);

  const dbDeleteResult = await db
    .delete(files_table)
    .where(eq(files_table.id, fileId));

  console.log(dbDeleteResult);

  // Malý cookie trik pro force refresh
  // Tímto způsobem zajistíme, že se stránka znovu načte, aby se změny projevily
  const c = await cookies();
  c.set("force-refresh", JSON.stringify(Math.random()));

  return { success: true };
}

//server action that takes a name and parentId, and creates a folder with that name and parentId (don't forget to set ownerId)
export async function CreateFolder(name: string, parentId: number) {
  const session = await auth();
  if (!session || !session.userId) {
    return { error: "Unauthorized" };
  }

  const newFolder = {
    name,
    parent: parentId,
    ownerId: session.userId,
  }

  console.log(newFolder)

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

  // Malý cookie trik pro force refresh
  const c = await cookies();
  c.set("force-refresh", JSON.stringify(Math.random()));
  return { success: true, folderId: newFolderId[0]!.id };
}

export async function RenameFolder(folderId: number, newName: string) {
  const session = await auth();
  if (!session || !session.userId) {
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

  // Force refresh using cookie trick
  const c = await cookies();
  c.set("force-refresh", JSON.stringify(Math.random()));

  return { success: true };
}