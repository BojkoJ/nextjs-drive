"use client";

import Link from "next/link";

import { type files_table, type folders_table } from "~/server/db/schema";

import { ChevronRight, PlusIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { FileRow, FolderRow } from "~/components/file-row";
import { Show, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { UploadButton } from "./uploadthing";
import { useRouter } from "next/navigation";
import { CreateFolder } from "~/server/actions";
import { useState } from "react";

export default function DriveContent(props: {
  files: (typeof files_table.$inferSelect)[];
  folders: (typeof folders_table.$inferSelect)[];
  parents: (typeof folders_table.$inferSelect)[];
  currentFolderId: number;
}) {
  const userInfo = useUser();
  const router = useRouter();
  const [editingFolderId, setEditingFolderId] = useState<number | null>(null);

  const rootFolderId = props.parents.find(
    (parent) => parent.name === "root",
  )?.id;

  if (!userInfo.isLoaded) {
    return null;
  }

  if (userInfo.isSignedIn === false) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
        <div className="mb-4 text-6xl">
          <span role="img" aria-label="Access Denied">
            😵‍💫
          </span>
        </div>
        <h1 className="mb-2 text-3xl font-bold uppercase">Access Denied</h1>
        <p className="mb-6 text-lg text-muted-foreground">
          You must be signed in to view this page.
        </p>
        <SignInButton mode="modal">
          <Button
            variant="outline"
            className="cursor-pointer rounded-none border-2 border-primary bg-transparent px-6 text-primary uppercase hover:bg-primary hover:text-primary-foreground"
          >
            Sign In
          </Button>
        </SignInButton>
      </div>
    );
  }

  const userFiles = props.files.filter(
    (file) => file.ownerId === userInfo.user?.id,
  );
  const userFolders = props.folders.filter(
    (folder) => folder.ownerId === userInfo.user?.id,
  );
  const userParents = props.parents.filter(
    (parent) => parent.ownerId === userInfo.user?.id,
  );

  const currentFolder =
    userFolders.find((folder) => folder.id === props.currentFolderId) ??
    userParents.find((parent) => parent.id === props.currentFolderId);

  if (!currentFolder) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
        <div className="mb-4 text-6xl">
          <span role="img" aria-label="Access Denied">
            😵‍💫
          </span>
        </div>
        <h1 className="mb-2 text-3xl font-bold uppercase">Access Denied</h1>
        <p className="mb-6 text-lg text-muted-foreground">
          You do not have permission to access this folder.
        </p>
        <Link href="/">
          <Button
            variant="outline"
            className="cursor-pointer rounded-none border-2 border-primary bg-transparent px-6 text-primary uppercase hover:bg-primary hover:text-primary-foreground"
          >
            Homepage
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8 text-foreground">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <Link href={`/f/${rootFolderId}`}>
              <Button
                variant="ghost"
                className="mr-2 cursor-pointer font-mono text-muted-foreground hover:text-foreground"
              >
                My Drive
              </Button>
            </Link>

            {userParents.map((parentFolder) => {
              if (parentFolder.name === "root") {
                return null; // Root folder přeskakujeme
              }

              return (
                <div key={parentFolder.id} className="flex items-center">
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  <Link href={`/f/${parentFolder.id}`}>
                    <Button
                      variant="ghost"
                      className="cursor-pointer font-mono text-muted-foreground hover:text-foreground"
                    >
                      {parentFolder.name}
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
          <div className="">
            <Show when="signed-out">
              <SignInButton />
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 translate-x-2 translate-y-2 -rotate-1 border border-primary/30 bg-primary/5" />
          <div className="relative border border-border bg-card">
            <div
              className={`px-6 py-4 ${userFolders.length <= 0 && userFiles.length <= 0 ? "" : "border-b border-border"}`}
            >
              <div className="grid grid-cols-12 gap-4 text-xs font-bold tracking-widest text-muted-foreground uppercase">
                <div className="col-span-6">Name</div>
                <div className="col-span-3">Type</div>
                <div className="col-span-2">Size</div>
                <div className="col-span-1"></div>
              </div>
            </div>
            <ul>
              {userFolders.map((folder, index) => (
                <FolderRow
                  key={folder.id}
                  folder={folder}
                  last={index === userFolders.length - 1}
                  isEditing={editingFolderId === folder.id}
                  onEditComplete={() => setEditingFolderId(null)}
                />
              ))}
              {userFiles.map((file, index) => (
                <FileRow
                  key={file.id}
                  file={file}
                  last={index === userFiles.length - 1}
                />
              ))}
            </ul>
          </div>
        </div>

        <Button
          variant="outline"
          className="mt-6 cursor-pointer rounded-none border-2 border-primary bg-transparent text-xs font-bold tracking-wide text-primary uppercase hover:bg-primary hover:text-primary-foreground"
          aria-label="Create folder"
          onClick={async () => {
            const result = await CreateFolder(
              "New Folder",
              props.currentFolderId,
            );
            if (result.success && result.folderId) {
              setEditingFolderId(result.folderId);
              router.refresh();
            }
          }}
        >
          <PlusIcon className="mr-1.5" size={16} /> Folder
        </Button>
        <UploadButton
          className="mt-10"
          endpoint="driveUploader"
          onClientUploadComplete={() => {
            router.refresh();
          }}
          input={{ folderId: props.currentFolderId }}
        />
      </div>
    </div>
  );
}
