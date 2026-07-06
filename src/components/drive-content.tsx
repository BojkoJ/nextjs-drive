"use client";

import Link from "next/link";
import {
  Fragment,
  useCallback,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";

import { type files_table, type folders_table } from "~/server/db/schema";

import { PlusIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/spinner";
import { ConfirmDialog } from "~/components/confirm-dialog";
import { GapDropZone } from "~/components/gap-drop-zone";
import { FileRow, FolderRow } from "~/components/file-row";
import { SelectionBar } from "~/components/selection-bar";
import { Breadcrumbs } from "~/components/breadcrumbs";
import { ListHeader } from "~/components/list-header";
import { DriveUploadButton } from "~/components/drive-upload-button";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useSelection } from "~/hooks/use-selection";
import { useDeleteFlow } from "~/hooks/use-delete-flow";
import { useDriveDnd } from "~/hooks/use-drive-dnd";
import { keyOf, parseKey } from "~/lib/item-key";
import {
  CreateFolder,
  MoveItemsToPosition,
  type DragItemRef,
} from "~/server/actions";
import { toast } from "sonner";

type CombinedItem =
  | { type: "folder"; data: typeof folders_table.$inferSelect }
  | { type: "file"; data: typeof files_table.$inferSelect };

type OptimisticAction =
  | {
      type: "move";
      movedRefs: DragItemRef[];
      targetParentId: number;
      insertBefore: DragItemRef | null;
    }
  | { type: "createFolder"; tempId: number };

export default function DriveContent(props: {
  files: (typeof files_table.$inferSelect)[];
  folders: (typeof folders_table.$inferSelect)[];
  parents: (typeof folders_table.$inferSelect)[];
  currentFolderId: number;
  folderSizes: Record<number, number>;
}) {
  const userInfo = useUser();
  const router = useRouter();
  const [editingFolderId, setEditingFolderId] = useState<number | null>(null);
  const [isCreatingFolder, startCreateTransition] = useTransition();
  const [, startMoveTransition] = useTransition();

  const dragBadgeRef = useRef<HTMLDivElement>(null);

  const { selectedKeys, setSelectedKeys, toggleSelect, clearSelection } =
    useSelection();

  const onDeleted = useCallback(() => {
    clearSelection();
    router.refresh();
  }, [clearSelection, router]);
  const deleteFlow = useDeleteFlow(onDeleted);

  const handleEditComplete = useCallback(() => setEditingFolderId(null), []);

  const rootFolderId = props.parents.find(
    (parent) => parent.name === "root",
  )?.id;

  // Vypočítáno bezpodmínečně (před early returny níže), aby useOptimistic hook níž vždy běžel ve stejném pořadí (Rules of Hooks).
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

  const combinedItems: CombinedItem[] = [
    ...userFolders.map((f) => ({ type: "folder" as const, data: f })),
    ...userFiles.map((f) => ({ type: "file" as const, data: f })),
  ].sort((a, b) => a.data.order - b.data.order || a.data.id - b.data.id);

  const [optimisticItems, applyOptimisticAction] = useOptimistic(
    combinedItems,
    (state: CombinedItem[], action: OptimisticAction): CombinedItem[] => {
      if (action.type === "createFolder") {
        const placeholder: CombinedItem = {
          type: "folder",
          data: {
            id: action.tempId,
            ownerId: "",
            name: "",
            parent: props.currentFolderId,
            order: Number.MAX_SAFE_INTEGER,
            created_at: new Date(),
          },
        };
        return [...state, placeholder];
      }

      const movedSet = new Set(
        action.movedRefs.map((r) => keyOf(r.type, r.id)),
      );
      const movedItems = state.filter((item) =>
        movedSet.has(keyOf(item.type, item.data.id)),
      );
      const remaining = state.filter(
        (item) => !movedSet.has(keyOf(item.type, item.data.id)),
      );

      if (action.targetParentId !== props.currentFolderId) {
        return remaining;
      }

      let insertIndex = remaining.length;
      if (action.insertBefore) {
        const idx = remaining.findIndex(
          (item) =>
            item.type === action.insertBefore!.type &&
            item.data.id === action.insertBefore!.id,
        );
        if (idx !== -1) insertIndex = idx;
      }

      return [
        ...remaining.slice(0, insertIndex),
        ...movedItems,
        ...remaining.slice(insertIndex),
      ];
    },
  );

  function runMove(
    items: DragItemRef[],
    targetParentId: number,
    insertBefore: DragItemRef | null,
  ) {
    startMoveTransition(async () => {
      // Přesun se promítne okamžitě, zápis do DB může chvíli zaostávat.
      // React sesouhlasí optimisticItems zpět na skutečné props, jakmile se tento transition (a router.refresh() níže) usadí.
      applyOptimisticAction({
        type: "move",
        movedRefs: items,
        targetParentId,
        insertBefore,
      });

      const result = await MoveItemsToPosition(
        items,
        targetParentId,
        insertBefore,
      );
      if (result.error) {
        toast.error(result.error);
      } else {
        clearSelection();
        router.refresh();
      }
    });
  }

  const dnd = useDriveDnd({
    currentFolderId: props.currentFolderId,
    dragBadgeRef,
    getDragPayload: (item) => {
      const key = keyOf(item.type, item.id);
      if (selectedKeys.size > 0 && selectedKeys.has(key)) {
        // selectedKeys je Set, takže Array.from by vrátil pořadí podle kliknutí na checkbox, ne skutečné pořadí položek ve složce.
        // Odvození seznamu z optimisticItems (filter zachovává pořadí zdroje) proto udrží vnitřní pořadí přesouvané skupiny správné bez ohledu na pořadí výběru.
        return optimisticItems
          .filter((it) => selectedKeys.has(keyOf(it.type, it.data.id)))
          .map((it): DragItemRef => ({ id: it.data.id, type: it.type }));
      }
      return [item];
    },
    getGapInsertBefore: (gapIndex) => {
      const insertBeforeItem = optimisticItems[gapIndex];
      return insertBeforeItem
        ? { type: insertBeforeItem.type, id: insertBeforeItem.data.id }
        : null;
    },
    onMove: runMove,
  });

  if (!userInfo.isLoaded) {
    return null;
  }

  if (userInfo.isSignedIn === false) {
    return (
      <div className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center">
        <div className="mb-4 text-6xl">
          <span role="img" aria-label="Access Denied">
            😵‍💫
          </span>
        </div>
        <h1 className="mb-2 text-3xl font-bold uppercase">Access Denied</h1>
        <p className="text-muted-foreground mb-6 text-lg">
          You must be signed in to view this page.
        </p>
        <SignInButton mode="modal">
          <Button
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground cursor-pointer rounded-none border-2 bg-transparent px-6 uppercase"
          >
            Sign In
          </Button>
        </SignInButton>
      </div>
    );
  }

  if (!currentFolder) {
    return (
      <div className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center">
        <div className="mb-4 text-6xl">
          <span role="img" aria-label="Access Denied">
            😵‍💫
          </span>
        </div>
        <h1 className="mb-2 text-3xl font-bold uppercase">Access Denied</h1>
        <p className="text-muted-foreground mb-6 text-lg">
          You do not have permission to access this folder.
        </p>
        <Link href="/">
          <Button
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground cursor-pointer rounded-none border-2 bg-transparent px-6 uppercase"
          >
            Homepage
          </Button>
        </Link>
      </div>
    );
  }

  const allSelected =
    optimisticItems.length > 0 &&
    optimisticItems.every((item) =>
      selectedKeys.has(keyOf(item.type, item.data.id)),
    );

  function toggleSelectAll() {
    setSelectedKeys(
      allSelected
        ? new Set()
        : new Set(
            optimisticItems.map((item) => keyOf(item.type, item.data.id)),
          ),
    );
  }

  function requestDeleteSelected() {
    deleteFlow.requestDeleteItems(Array.from(selectedKeys).map(parseKey));
  }

  function createFolder() {
    const tempId = -Date.now();
    startCreateTransition(async () => {
      // Rovnou ukážeme prázdný, editovatelný řádek - nečekáme na odpověď serveru a pak bleskneme "New Folder" těsně předtím, než ho uživatel začne přepisovat.
      applyOptimisticAction({ type: "createFolder", tempId });
      setEditingFolderId(tempId);

      const result = await CreateFolder("New Folder", props.currentFolderId);
      if (result.success && result.folderId) {
        setEditingFolderId(result.folderId);
        router.refresh();
      } else {
        setEditingFolderId(null);
        toast.error(result.error ?? "Failed to create folder");
      }
    });
  }

  return (
    <div className="bg-background text-foreground min-h-screen p-4 sm:p-8">
      {/* Mimo obrazovku - slouží jen jako vlastní obrázek pro drag preview u přesunu více položek najednou */}
      <div
        ref={dragBadgeRef}
        className="border-primary bg-card text-foreground pointer-events-none fixed -top-96 -left-96 border-2 px-3 py-2 font-mono text-sm font-bold whitespace-nowrap"
      />

      <ConfirmDialog
        open={!!deleteFlow.confirmState}
        onOpenChange={(open) => !open && deleteFlow.closeConfirm()}
        title={deleteFlow.confirmState?.title ?? ""}
        description={deleteFlow.confirmState?.description ?? ""}
        isConfirming={deleteFlow.isDeleteBusy}
        onConfirm={() => deleteFlow.confirmState?.onConfirm()}
      />

      <div className="mx-auto max-w-6xl">
        <SelectionBar
          selectedCount={selectedKeys.size}
          onClear={clearSelection}
          onDeleteSelected={requestDeleteSelected}
        />

        <Breadcrumbs
          parents={userParents}
          rootFolderId={rootFolderId}
          dragOverFolderId={dnd.dragOverFolderId}
          dropTarget={dnd.folderDropTarget}
        />

        <div className="relative">
          {/*<div className="absolute inset-0 translate-x-2 translate-y-2 -rotate-1 border border-primary/30 bg-primary/5" />*/}
          <div className="border-border bg-card relative border">
            <ListHeader
              allSelected={allSelected}
              onToggleSelectAll={toggleSelectAll}
              hasItems={optimisticItems.length > 0}
            />
            <ul>
              <GapDropZone
                index={0}
                isActive={dnd.activeGapIndex === 0}
                isDragActive={dnd.isDraggingAny}
                onActivate={dnd.activateGap}
                onDeactivate={dnd.deactivateGap}
                onDrop={dnd.dropOnGap}
              />
              {optimisticItems.map((item, index) => (
                <Fragment key={keyOf(item.type, item.data.id)}>
                  {item.type === "folder" ? (
                    <FolderRow
                      folder={item.data}
                      listIndex={index}
                      size={props.folderSizes[item.data.id] ?? 0}
                      isEditing={editingFolderId === item.data.id}
                      onEditComplete={handleEditComplete}
                      isDeleting={deleteFlow.deletingKeys.has(
                        keyOf("folder", item.data.id),
                      )}
                      isSelected={selectedKeys.has(
                        keyOf("folder", item.data.id),
                      )}
                      onToggleSelect={toggleSelect}
                      onRequestDelete={deleteFlow.requestDeleteFolder}
                      draggable
                      onDragStart={dnd.handleDragStart}
                      onDragEnd={dnd.handleDragEnd}
                      isDropTarget={dnd.dragOverFolderId === item.data.id}
                      dropTarget={dnd.folderDropTarget}
                    />
                  ) : (
                    <FileRow
                      file={item.data}
                      listIndex={index}
                      isDeleting={deleteFlow.deletingKeys.has(
                        keyOf("file", item.data.id),
                      )}
                      isSelected={selectedKeys.has(keyOf("file", item.data.id))}
                      onToggleSelect={toggleSelect}
                      onRequestDelete={deleteFlow.requestDeleteFile}
                      draggable
                      onDragStart={dnd.handleDragStart}
                      onDragEnd={dnd.handleDragEnd}
                    />
                  )}
                  <GapDropZone
                    index={index + 1}
                    isActive={dnd.activeGapIndex === index + 1}
                    isDragActive={dnd.isDraggingAny}
                    onActivate={dnd.activateGap}
                    onDeactivate={dnd.deactivateGap}
                    onDrop={dnd.dropOnGap}
                  />
                </Fragment>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground cursor-pointer rounded-none border-2 bg-transparent text-xs font-bold tracking-wide uppercase"
            aria-label="Create folder"
            disabled={isCreatingFolder}
            onClick={createFolder}
          >
            {isCreatingFolder ? (
              <Spinner className="mr-1.5 h-4 w-4" />
            ) : (
              <PlusIcon className="mr-1.5 h-4 w-4" />
            )}
            Folder
          </Button>
          <DriveUploadButton folderId={props.currentFolderId} />
        </div>
      </div>
    </div>
  );
}
