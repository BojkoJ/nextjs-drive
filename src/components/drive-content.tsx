"use client";

import Link from "next/link";
import {
  Fragment,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";

import { type files_table, type folders_table } from "~/server/db/schema";

import { ChevronRight, Loader2Icon, PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { ConfirmDialog } from "~/components/confirm-dialog";
import { GapDropZone } from "~/components/gap-drop-zone";
import { PendingLinkLabel } from "~/components/pending-link-label";
import { FileRow, FolderRow } from "~/components/file-row";
import { Show, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { UploadButton } from "./uploadthing";
import { useRouter } from "next/navigation";
import {
  CreateFolder,
  DeleteFile,
  DeleteFolder,
  DeleteItems,
  MoveItemsToPosition,
  type DragItemRef,
} from "~/server/actions";
import { toast } from "sonner";

type CombinedItem =
  | { type: "folder"; data: typeof folders_table.$inferSelect }
  | { type: "file"; data: typeof files_table.$inferSelect };

function keyOf(type: "file" | "folder", id: number) {
  return `${type}-${id}`;
}

function parseKey(key: string): DragItemRef {
  const separatorIndex = key.indexOf("-");
  return {
    type: key.slice(0, separatorIndex) as "file" | "folder",
    id: Number(key.slice(separatorIndex + 1)),
  };
}

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
  const [deletingKeys, setDeletingKeys] = useState<Set<string>>(new Set());
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [dragOverFolderId, setDragOverFolderId] = useState<number | null>(null);
  const [activeGapIndex, setActiveGapIndex] = useState<number | null>(null);
  const [isDraggingAny, setIsDraggingAny] = useState(false);
  const [, startMoveTransition] = useTransition();
  const [isDeleteBusy, startDeleteTransition] = useTransition();
  const [confirmState, setConfirmState] = useState<{
    title: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);
  const dragBadgeRef = useRef<HTMLDivElement>(null);

  const rootFolderId = props.parents.find(
    (parent) => parent.name === "root",
  )?.id;

  // Computed unconditionally (before the early returns below) so the
  // useOptimistic hook call that follows always runs in the same order,
  // per the Rules of Hooks.
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

  type OptimisticAction =
    | {
        type: "move";
        movedRefs: DragItemRef[];
        targetParentId: number;
        insertBefore: DragItemRef | null;
      }
    | { type: "createFolder"; tempId: number };

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

  function toggleSelect(type: "file" | "folder", id: number) {
    const key = keyOf(type, id);
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  function runDelete(items: DragItemRef[]) {
    setDeletingKeys((prev) => {
      const next = new Set(prev);
      items.forEach((item) => next.add(keyOf(item.type, item.id)));
      return next;
    });

    startDeleteTransition(async () => {
      const result =
        items.length === 1
          ? items[0]!.type === "file"
            ? await DeleteFile(items[0]!.id)
            : await DeleteFolder(items[0]!.id)
          : await DeleteItems(items);

      if (result.error) {
        toast.error(result.error);
        setDeletingKeys((prev) => {
          const next = new Set(prev);
          items.forEach((item) => next.delete(keyOf(item.type, item.id)));
          return next;
        });
      } else {
        setSelectedKeys(new Set());
        router.refresh();
      }
      setConfirmState(null);
    });
  }

  function requestDeleteFile(file: typeof files_table.$inferSelect) {
    setConfirmState({
      title: "Delete file",
      description: `Delete "${file.name}"? This cannot be undone.`,
      onConfirm: () => runDelete([{ id: file.id, type: "file" }]),
    });
  }

  function requestDeleteFolder(folder: typeof folders_table.$inferSelect) {
    setConfirmState({
      title: "Delete folder",
      description: `Delete "${folder.name}" and everything inside it? This cannot be undone.`,
      onConfirm: () => runDelete([{ id: folder.id, type: "folder" }]),
    });
  }

  function requestDeleteSelected() {
    const items = Array.from(selectedKeys).map(parseKey);
    setConfirmState({
      title: "Delete selected items",
      description: `Delete ${items.length} selected item${items.length === 1 ? "" : "s"}? This cannot be undone.`,
      onConfirm: () => runDelete(items),
    });
  }

  function runMove(
    items: DragItemRef[],
    targetParentId: number,
    insertBefore: DragItemRef | null,
  ) {
    startMoveTransition(async () => {
      // Reflect the move instantly; the DB write can lag a beat behind,
      // React reconciles optimisticItems back to real props once this
      // transition (and the router.refresh() below) settles.
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
        setSelectedKeys(new Set());
        router.refresh();
      }
    });
  }

  function handleDragStart(e: React.DragEvent, item: DragItemRef) {
    const key = keyOf(item.type, item.id);
    const draggedItems: DragItemRef[] =
      selectedKeys.size > 0 && selectedKeys.has(key)
        ? Array.from(selectedKeys).map(parseKey)
        : [item];

    e.dataTransfer.setData("application/json", JSON.stringify(draggedItems));
    e.dataTransfer.effectAllowed = "move";
    setIsDraggingAny(true);

    // Native drag images are a static snapshot, so paint the "N items" badge
    // imperatively right before the browser grabs it; React state wouldn't
    // flush in time for dataTransfer.setDragImage to see it.
    if (draggedItems.length > 1 && dragBadgeRef.current) {
      dragBadgeRef.current.textContent = `${draggedItems.length} items`;
      e.dataTransfer.setDragImage(dragBadgeRef.current, 24, 24);
    }
  }

  // Dropping onto a *different* folder removes the dragged row from this
  // view's optimistic list right away, so it can unmount before the native
  // dragend event reaches it. Resetting drag UI state eagerly at drop time
  // (rather than solely from dragend) means the gaps still collapse even
  // when the source row never sticks around to fire that event.
  function resetDragUiState() {
    setIsDraggingAny(false);
    setActiveGapIndex(null);
    setDragOverFolderId(null);
  }

  function handleDragEnd() {
    resetDragUiState();
  }

  function handleDropOnFolder(targetFolderId: number, e: React.DragEvent) {
    e.preventDefault();
    resetDragUiState();

    const raw = e.dataTransfer.getData("application/json");
    if (!raw) return;

    let payload: DragItemRef[];
    try {
      payload = JSON.parse(raw) as DragItemRef[];
    } catch {
      return;
    }

    if (
      payload.length === 1 &&
      payload[0]!.type === "folder" &&
      payload[0]!.id === targetFolderId
    ) {
      return;
    }

    runMove(payload, targetFolderId, null);
  }

  function handleDropOnGap(gapIndex: number, e: React.DragEvent) {
    e.preventDefault();
    resetDragUiState();

    const raw = e.dataTransfer.getData("application/json");
    if (!raw) return;

    let payload: DragItemRef[];
    try {
      payload = JSON.parse(raw) as DragItemRef[];
    } catch {
      return;
    }

    const insertBeforeItem = optimisticItems[gapIndex];
    const insertBefore = insertBeforeItem
      ? { type: insertBeforeItem.type, id: insertBeforeItem.data.id }
      : null;

    runMove(payload, props.currentFolderId, insertBefore);
  }

  function makeDropTargetHandlers(folderId: number) {
    return {
      onDragOver: (e: React.DragEvent) => {
        e.preventDefault();
        setDragOverFolderId(folderId);
      },
      onDragLeave: () => {
        setDragOverFolderId((current) =>
          current === folderId ? null : current,
        );
      },
      onDrop: (e: React.DragEvent) => handleDropOnFolder(folderId, e),
    };
  }

  return (
    <div className="bg-background text-foreground min-h-screen p-8">
      {/* Off-screen element used only as a custom drag preview image for multi-item drags */}
      <div
        ref={dragBadgeRef}
        className="border-primary bg-card text-foreground pointer-events-none fixed -top-96 -left-96 border-2 px-3 py-2 font-mono text-sm font-bold whitespace-nowrap"
      />

      <ConfirmDialog
        open={!!confirmState}
        onOpenChange={(open) => !open && setConfirmState(null)}
        title={confirmState?.title ?? ""}
        description={confirmState?.description ?? ""}
        isConfirming={isDeleteBusy}
        onConfirm={() => confirmState?.onConfirm()}
      />

      <div className="mx-auto max-w-6xl">
        {/* Real content is always mounted (never conditionally removed), just
            made invisible when empty, so this slot's natural height is always
            identical to its populated height and nothing below it ever shifts. */}
        <div
          className={`mb-4 flex items-center justify-between border-2 px-4 py-3 transition-colors ${selectedKeys.size > 0 ? "border-primary bg-primary/10" : "border-transparent"}`}
        >
          <span
            className={`text-foreground font-mono text-sm ${selectedKeys.size > 0 ? "" : "invisible"}`}
          >
            {selectedKeys.size} selected
          </span>
          <div
            className={`flex gap-2 ${selectedKeys.size > 0 ? "" : "invisible"}`}
            aria-hidden={selectedKeys.size === 0}
          >
            <Button
              variant="ghost"
              tabIndex={selectedKeys.size > 0 ? 0 : -1}
              className="text-muted-foreground cursor-pointer text-xs font-bold tracking-wide uppercase"
              onClick={() => setSelectedKeys(new Set())}
            >
              Clear
            </Button>
            <Button
              variant="outline"
              tabIndex={selectedKeys.size > 0 ? 0 : -1}
              className="border-destructive text-destructive hover:bg-destructive cursor-pointer gap-2 rounded-none border-2 text-xs font-bold tracking-wide uppercase hover:text-white"
              onClick={requestDeleteSelected}
            >
              <Trash2Icon size={14} />
              Delete selected
            </Button>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <Link href={`/f/${rootFolderId}`}>
              <Button
                variant="ghost"
                {...(rootFolderId ? makeDropTargetHandlers(rootFolderId) : {})}
                className={`text-muted-foreground hover:text-foreground mr-2 cursor-pointer font-mono ${dragOverFolderId === rootFolderId ? "bg-primary/10 ring-primary ring-2" : ""}`}
              >
                <PendingLinkLabel>My Drive</PendingLinkLabel>
              </Button>
            </Link>

            {userParents.map((parentFolder) => {
              if (parentFolder.name === "root") {
                return null; // Root folder přeskakujeme
              }

              return (
                <div key={parentFolder.id} className="flex items-center">
                  <ChevronRight className="text-muted-foreground h-4 w-4" />
                  <Link href={`/f/${parentFolder.id}`}>
                    <Button
                      variant="ghost"
                      {...makeDropTargetHandlers(parentFolder.id)}
                      className={`text-muted-foreground hover:text-foreground cursor-pointer font-mono ${dragOverFolderId === parentFolder.id ? "bg-primary/10 ring-primary ring-2" : ""}`}
                    >
                      <PendingLinkLabel>{parentFolder.name}</PendingLinkLabel>
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
          {/*<div className="absolute inset-0 translate-x-2 translate-y-2 -rotate-1 border border-primary/30 bg-primary/5" />*/}
          <div className="border-border bg-card relative border">
            <div
              className={`flex items-center gap-4 px-6 py-4 ${optimisticItems.length === 0 ? "" : "border-border border-b"}`}
            >
              <Checkbox
                checked={allSelected}
                onCheckedChange={toggleSelectAll}
                aria-label="Select all"
              />
              <div className="w-4 shrink-0" aria-hidden />
              <div className="text-muted-foreground grid flex-1 grid-cols-12 gap-4 text-xs font-bold tracking-widest uppercase">
                <div className="col-span-5">Name</div>
                <div className="col-span-3">Type</div>
                <div className="col-span-2">Size</div>
                <div className="col-span-2"></div>
              </div>
            </div>
            <ul>
              <GapDropZone
                isActive={activeGapIndex === 0}
                isDragActive={isDraggingAny}
                onActivate={() => setActiveGapIndex(0)}
                onDeactivate={() =>
                  setActiveGapIndex((current) =>
                    current === 0 ? null : current,
                  )
                }
                onDrop={(e) => handleDropOnGap(0, e)}
              />
              {optimisticItems.map((item, index) => (
                <Fragment key={keyOf(item.type, item.data.id)}>
                  {item.type === "folder" ? (
                    <FolderRow
                      folder={item.data}
                      size={props.folderSizes[item.data.id] ?? 0}
                      isEditing={editingFolderId === item.data.id}
                      onEditComplete={() => setEditingFolderId(null)}
                      isDeleting={deletingKeys.has(
                        keyOf("folder", item.data.id),
                      )}
                      isSelected={selectedKeys.has(
                        keyOf("folder", item.data.id),
                      )}
                      onToggleSelect={() =>
                        toggleSelect("folder", item.data.id)
                      }
                      onRequestDelete={() => requestDeleteFolder(item.data)}
                      draggable
                      onDragStart={(e) =>
                        handleDragStart(e, { id: item.data.id, type: "folder" })
                      }
                      onDragEnd={handleDragEnd}
                      isDropTarget={dragOverFolderId === item.data.id}
                      {...makeDropTargetHandlers(item.data.id)}
                    />
                  ) : (
                    <FileRow
                      file={item.data}
                      isDeleting={deletingKeys.has(keyOf("file", item.data.id))}
                      isSelected={selectedKeys.has(keyOf("file", item.data.id))}
                      onToggleSelect={() => toggleSelect("file", item.data.id)}
                      onRequestDelete={() => requestDeleteFile(item.data)}
                      draggable
                      onDragStart={(e) =>
                        handleDragStart(e, { id: item.data.id, type: "file" })
                      }
                      onDragEnd={handleDragEnd}
                    />
                  )}
                  <GapDropZone
                    isActive={activeGapIndex === index + 1}
                    isDragActive={isDraggingAny}
                    onActivate={() => setActiveGapIndex(index + 1)}
                    onDeactivate={() =>
                      setActiveGapIndex((current) =>
                        current === index + 1 ? null : current,
                      )
                    }
                    onDrop={(e) => handleDropOnGap(index + 1, e)}
                  />
                </Fragment>
              ))}
            </ul>
          </div>
        </div>

        <Button
          variant="outline"
          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground mt-6 cursor-pointer rounded-none border-2 bg-transparent text-xs font-bold tracking-wide uppercase"
          aria-label="Create folder"
          disabled={isCreatingFolder}
          onClick={() => {
            const tempId = -Date.now();
            startCreateTransition(async () => {
              // Show an empty, already-editable row instantly instead of
              // waiting on the round trip and then flashing "New Folder"
              // into view right before the user starts typing over it.
              applyOptimisticAction({ type: "createFolder", tempId });
              setEditingFolderId(tempId);

              const result = await CreateFolder(
                "New Folder",
                props.currentFolderId,
              );
              if (result.success && result.folderId) {
                setEditingFolderId(result.folderId);
                router.refresh();
              } else {
                setEditingFolderId(null);
                toast.error(result.error ?? "Failed to create folder");
              }
            });
          }}
        >
          {isCreatingFolder ? (
            <Loader2Icon className="mr-1.5 animate-spin" size={16} />
          ) : (
            <PlusIcon className="mr-1.5" size={16} />
          )}
          Folder
        </Button>
        <UploadButton
          className="mt-10"
          endpoint="driveUploader"
          appearance={{
            container: "!w-max flex-row items-center gap-3",
            button:
              "!cursor-pointer !rounded-none !border-2 !border-primary !bg-transparent !px-6 !py-2.5 !text-xs !font-bold !tracking-wide !text-primary !uppercase !shadow-none after:!bg-primary hover:!bg-primary hover:!text-primary-foreground ut-uploading:!cursor-wait ut-uploading:!bg-primary/20 ut-readying:!cursor-wait focus-within:!ring-2 focus-within:!ring-ring focus-within:!ring-offset-0",
            allowedContent: "!font-mono !text-xs !text-muted-foreground",
          }}
          content={{
            button: ({ ready, isUploading }) => {
              if (isUploading) return "Uploading...";
              if (ready) return "Choose file(s)";
              return "Loading...";
            },
          }}
          onClientUploadComplete={(res) => {
            const names = res.map((f) => f.name).join(", ");
            toast.success(`Uploaded ${names}`);
            router.refresh();
          }}
          onUploadError={(error) => {
            toast.error(`Upload failed: ${error.message}`);
          }}
          input={{ folderId: props.currentFolderId }}
        />
      </div>
    </div>
  );
}
