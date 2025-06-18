"use client";

import Link from "next/link";

import type { files_table, folders_table } from "~/server/db/schema";

import { ChevronRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { FileRow, FolderRow } from "~/components/file-row";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { UploadButton } from "./uploadthing";
import { useRouter } from "next/navigation";

export default function DriveContent(props: {
  files: (typeof files_table.$inferSelect)[];
  folders: (typeof folders_table.$inferSelect)[];
  parents: (typeof folders_table.$inferSelect)[];
  currentFolderId: number;
}) {
  const router = useRouter();

  const rootFolderId = props.parents.find(
    (parent) => parent.name === "root",
  )?.id;

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-gray-100">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <Link href={`/f/${rootFolderId}`}>
              <Button
                variant="ghost"
                className="mr-2 cursor-pointer text-gray-300 hover:text-white"
              >
                My Drive
              </Button>
            </Link>

            {props.parents.map((parentFolder) => {
              if (parentFolder.name === "root") {
                return null; // Root folder přeskakujeme
              }

              return (
                <div key={parentFolder.id} className="flex items-center">
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                  <Link href={`/f/${parentFolder.id}`}>
                    <Button
                      variant="ghost"
                      className="cursor-pointer text-gray-300 hover:text-white"
                    >
                      {parentFolder.name}
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
          <div className="">
            <SignedOut>
              <SignInButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
        <div className="rounded-lg bg-gray-800 shadow-xl">
          <div className="border-b border-gray-700 px-6 py-4">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-400">
              <div className="col-span-6">Name</div>
              <div className="col-span-3">Type</div>
              <div className="col-span-2">Size</div>
              <div className="col-span-1"></div>
            </div>
          </div>
          <ul>
            {props.folders.map((folder) => (
              <FolderRow key={folder.id} folder={folder} />
            ))}
            {props.files.map((file) => (
              <FileRow key={file.id} file={file} />
            ))}
          </ul>
        </div>
        <UploadButton
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
