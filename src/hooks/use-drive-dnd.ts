"use client";

import { useCallback, useMemo, useState } from "react";
import type { DragItemRef } from "~/server/actions";
import { useLatest } from "~/hooks/use-latest";

// Stabilní trojice handlerů pro složku jako drop target (řádek složky,
// breadcrumb). Řádky si z nich uvnitř vytvoří vlastní DOM handlery se svým id.
export type FolderDropTargetHandlers = {
  onDragOver: (e: React.DragEvent, folderId: number) => void;
  onDragLeave: (folderId: number) => void;
  onDrop: (e: React.DragEvent, folderId: number) => void;
};

function readDragPayload(e: React.DragEvent): DragItemRef[] | null {
  const raw = e.dataTransfer.getData("application/json");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DragItemRef[];
  } catch {
    return null;
  }
}

// Kompletní stavová mašina HTML5 drag & dropu pro drive: kdo se táhne,
// který gap/složka je aktivní drop target a badge pro multi-item drag.
// Callbacky z opts čtou čerstvý stav komponenty, proto jdou přes useLatest ref
// - všechny handlery, které hook vrací, tak zůstávají stabilní pro memo() na řádcích.
export function useDriveDnd(opts: {
  currentFolderId: number;
  // Off-screen element pro custom drag preview u multi-item dragů; vlastní ho
  // komponenta (ref vracený z hooku by "nakazil" návratový objekt pro
  // react-hooks/refs lint pravidlo).
  dragBadgeRef: React.RefObject<HTMLDivElement | null>;
  // Co se vlastně táhne, když drag začne na dané položce (multi-select apod.)
  getDragPayload: (item: DragItemRef) => DragItemRef[];
  // Před kterou položku se vkládá při dropu na gap s daným indexem
  getGapInsertBefore: (gapIndex: number) => DragItemRef | null;
  onMove: (
    items: DragItemRef[],
    targetParentId: number,
    insertBefore: DragItemRef | null,
  ) => void;
}) {
  const [isDraggingAny, setIsDraggingAny] = useState(false);
  const [activeGapIndex, setActiveGapIndex] = useState<number | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<number | null>(null);

  const latestOpts = useLatest(opts);

  // Drop na jinou složku odstraní tažený řádek z optimistického seznamu dřív,
  // než k němu stihne doletět nativní dragend.
  // Reset se proto dělá i přímo při dropu, aby se gaps sbalily, i když zdrojový řádek už neexistuje.
  const resetDragUiState = useCallback(() => {
    setIsDraggingAny(false);
    setActiveGapIndex(null);
    setDragOverFolderId(null);
  }, []);

  const handleDragStart = useCallback(
    (e: React.DragEvent, item: DragItemRef) => {
      const { getDragPayload, dragBadgeRef } = latestOpts.current;
      const draggedItems = getDragPayload(item);

      e.dataTransfer.setData("application/json", JSON.stringify(draggedItems));
      e.dataTransfer.effectAllowed = "move";
      setIsDraggingAny(true);

      if (draggedItems.length > 1 && dragBadgeRef.current) {
        dragBadgeRef.current.textContent = `${draggedItems.length} items`;
        e.dataTransfer.setDragImage(dragBadgeRef.current, 24, 24);
      }
    },
    [latestOpts],
  );

  const handleDragEnd = useCallback(() => {
    resetDragUiState();
  }, [resetDragUiState]);

  const handleDropOnFolder = useCallback(
    (e: React.DragEvent, targetFolderId: number) => {
      e.preventDefault();
      resetDragUiState();

      const payload = readDragPayload(e);
      if (!payload) return;

      if (
        payload.length === 1 &&
        payload[0]!.type === "folder" &&
        payload[0]!.id === targetFolderId
      ) {
        return;
      }

      latestOpts.current.onMove(payload, targetFolderId, null);
    },
    [latestOpts, resetDragUiState],
  );

  const folderDropTarget: FolderDropTargetHandlers = useMemo(
    () => ({
      onDragOver: (e, folderId) => {
        e.preventDefault();
        setDragOverFolderId(folderId);
      },
      onDragLeave: (folderId) => {
        setDragOverFolderId((current) =>
          current === folderId ? null : current,
        );
      },
      onDrop: (e, folderId) => handleDropOnFolder(e, folderId),
    }),
    [handleDropOnFolder],
  );

  const activateGap = useCallback((index: number) => {
    setActiveGapIndex(index);
  }, []);

  const deactivateGap = useCallback((index: number) => {
    setActiveGapIndex((current) => (current === index ? null : current));
  }, []);

  const dropOnGap = useCallback(
    (index: number, e: React.DragEvent) => {
      e.preventDefault();
      resetDragUiState();

      const payload = readDragPayload(e);
      if (!payload) return;

      latestOpts.current.onMove(
        payload,
        latestOpts.current.currentFolderId,
        latestOpts.current.getGapInsertBefore(index),
      );
    },
    [latestOpts, resetDragUiState],
  );

  return {
    isDraggingAny,
    activeGapIndex,
    dragOverFolderId,
    handleDragStart,
    handleDragEnd,
    folderDropTarget,
    activateGap,
    deactivateGap,
    dropOnGap,
  };
}
