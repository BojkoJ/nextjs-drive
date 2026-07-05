"use client";

import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  DeleteFile,
  DeleteFolder,
  DeleteItems,
  type DragItemRef,
} from "~/server/actions";
import type { files_table, folders_table } from "~/server/db/schema";
import { keyOf } from "~/lib/item-key";
import { useLatest } from "~/hooks/use-latest";

type ConfirmState = {
  title: string;
  description: string;
  onConfirm: () => void;
};

// Celý delete flow driveu: confirm dialog, "mažu" stav řádků a samotné
// spuštění server akce. onDeleted se volá po úspěchu (clear výběru + refresh).
export function useDeleteFlow(onDeleted: () => void) {
  const [deletingKeys, setDeletingKeys] = useState<Set<string>>(new Set());
  const [isDeleteBusy, startDeleteTransition] = useTransition();
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  const onDeletedRef = useLatest(onDeleted);

  const runDelete = useCallback(
    (items: DragItemRef[]) => {
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
          onDeletedRef.current();
        }
        setConfirmState(null);
      });
    },
    [onDeletedRef],
  );

  const requestDeleteFile = useCallback(
    (file: typeof files_table.$inferSelect) => {
      setConfirmState({
        title: "Delete file",
        description: `Delete "${file.name}"? This cannot be undone.`,
        onConfirm: () => runDelete([{ id: file.id, type: "file" }]),
      });
    },
    [runDelete],
  );

  const requestDeleteFolder = useCallback(
    (folder: typeof folders_table.$inferSelect) => {
      setConfirmState({
        title: "Delete folder",
        description: `Delete "${folder.name}" and everything inside it? This cannot be undone.`,
        onConfirm: () => runDelete([{ id: folder.id, type: "folder" }]),
      });
    },
    [runDelete],
  );

  const requestDeleteItems = useCallback(
    (items: DragItemRef[]) => {
      setConfirmState({
        title: "Delete selected items",
        description: `Delete ${items.length} selected item${items.length === 1 ? "" : "s"}? This cannot be undone.`,
        onConfirm: () => runDelete(items),
      });
    },
    [runDelete],
  );

  const closeConfirm = useCallback(() => setConfirmState(null), []);

  return {
    deletingKeys,
    isDeleteBusy,
    confirmState,
    closeConfirm,
    requestDeleteFile,
    requestDeleteFolder,
    requestDeleteItems,
  };
}
