"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { PendingLinkLabel } from "~/components/pending-link-label";
import type { FolderDropTargetHandlers } from "~/hooks/use-drive-dnd";
import type { folders_table } from "~/server/db/schema";

// Breadcrumb navigace; každá úroveň je zároveň drop target, takže položky jde přetáhnout přímo na nadřazenou složku.
// Tlačítko je přímo odkaz (asChild), ne <button> uvnitř <a> - jinak by měla každá úroveň dva tab stopy.
export function Breadcrumbs(props: {
  parents: (typeof folders_table.$inferSelect)[];
  rootFolderId: number | undefined;
  dragOverFolderId: number | null;
  dropTarget: FolderDropTargetHandlers;
}) {
  const { rootFolderId, dropTarget } = props;

  // Poslední zobrazená úroveň je aktuální stránka (root se nevykresluje jako samostatná úroveň, takže pak je aktuální "My Drive").
  const visibleParents = props.parents.filter(
    (parentFolder) => parentFolder.name !== "root",
  );
  const lastVisibleId = visibleParents.at(-1)?.id;

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center">
        <li className="flex items-center">
          <Button
            asChild
            variant="ghost"
            className={`text-muted-foreground hover:text-foreground mr-2 cursor-pointer font-mono ${props.dragOverFolderId === rootFolderId ? "bg-primary/10 ring-primary ring-2" : ""}`}
          >
            <Link
              href={`/f/${rootFolderId}`}
              aria-current={lastVisibleId === undefined ? "page" : undefined}
              {...(rootFolderId !== undefined
                ? {
                    onDragOver: (e: React.DragEvent) =>
                      dropTarget.onDragOver(e, rootFolderId),
                    onDragLeave: () => dropTarget.onDragLeave(rootFolderId),
                    onDrop: (e: React.DragEvent) =>
                      dropTarget.onDrop(e, rootFolderId),
                  }
                : {})}
            >
              <PendingLinkLabel>My Drive</PendingLinkLabel>
            </Link>
          </Button>
        </li>

        {visibleParents.map((parentFolder) => (
          <li key={parentFolder.id} className="flex items-center">
            <ChevronRight
              aria-hidden
              className="text-muted-foreground h-4 w-4"
            />
            <Button
              asChild
              variant="ghost"
              className={`text-muted-foreground hover:text-foreground cursor-pointer font-mono ${props.dragOverFolderId === parentFolder.id ? "bg-primary/10 ring-primary ring-2" : ""}`}
            >
              <Link
                href={`/f/${parentFolder.id}`}
                aria-current={
                  parentFolder.id === lastVisibleId ? "page" : undefined
                }
                onDragOver={(e) => dropTarget.onDragOver(e, parentFolder.id)}
                onDragLeave={() => dropTarget.onDragLeave(parentFolder.id)}
                onDrop={(e) => dropTarget.onDrop(e, parentFolder.id)}
              >
                <PendingLinkLabel>{parentFolder.name}</PendingLinkLabel>
              </Link>
            </Button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
