"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { PendingLinkLabel } from "~/components/pending-link-label";
import type { FolderDropTargetHandlers } from "~/hooks/use-drive-dnd";
import type { folders_table } from "~/server/db/schema";

// Breadcrumb navigace; každá úroveň je zároveň drop target, takže položky jde přetáhnout přímo na nadřazenou složku.
export function Breadcrumbs(props: {
  parents: (typeof folders_table.$inferSelect)[];
  rootFolderId: number | undefined;
  dragOverFolderId: number | null;
  dropTarget: FolderDropTargetHandlers;
}) {
  const { rootFolderId, dropTarget } = props;

  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex flex-wrap items-center">
        <Link href={`/f/${rootFolderId}`}>
          <Button
            variant="ghost"
            {...(rootFolderId !== undefined
              ? {
                  onDragOver: (e: React.DragEvent) =>
                    dropTarget.onDragOver(e, rootFolderId),
                  onDragLeave: () => dropTarget.onDragLeave(rootFolderId),
                  onDrop: (e: React.DragEvent) =>
                    dropTarget.onDrop(e, rootFolderId),
                }
              : {})}
            className={`text-muted-foreground hover:text-foreground mr-2 cursor-pointer font-mono ${props.dragOverFolderId === rootFolderId ? "bg-primary/10 ring-primary ring-2" : ""}`}
          >
            <PendingLinkLabel>My Drive</PendingLinkLabel>
          </Button>
        </Link>

        {props.parents.map((parentFolder) => {
          if (parentFolder.name === "root") {
            return null; // Root folder přeskakujeme
          }

          return (
            <div key={parentFolder.id} className="flex items-center">
              <ChevronRight className="text-muted-foreground h-4 w-4" />
              <Link href={`/f/${parentFolder.id}`}>
                <Button
                  variant="ghost"
                  onDragOver={(e) => dropTarget.onDragOver(e, parentFolder.id)}
                  onDragLeave={() => dropTarget.onDragLeave(parentFolder.id)}
                  onDrop={(e) => dropTarget.onDrop(e, parentFolder.id)}
                  className={`text-muted-foreground hover:text-foreground cursor-pointer font-mono ${props.dragOverFolderId === parentFolder.id ? "bg-primary/10 ring-primary ring-2" : ""}`}
                >
                  <PendingLinkLabel>{parentFolder.name}</PendingLinkLabel>
                </Button>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
