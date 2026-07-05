"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

// Sdílená inline-rename logika pro FileRow i FolderRow: drží rozepsaný název,
// edit mód, ukládání přes server akci a klávesové zkratky (Enter/Escape).
// inputRef vlastní komponenta a předává ho sem - vracet ref z hooku by
// "nakazilo" celý návratový objekt pro react-hooks/refs lint pravidlo.
export function useRename(opts: {
  // Aktuální název ze serveru (props) - draft se s ním synchronizuje,
  // ale nikdy ne během editace, aby se nepřepsalo, co uživatel píše.
  name: string;
  initiallyEditing?: boolean;
  fallbackError: string;
  action: (newName: string) => Promise<{ error?: string }>;
  onEditComplete?: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const [isEditMode, setIsEditMode] = useState(opts.initiallyEditing ?? false);
  const [draft, setDraft] = useState(opts.name);
  const [isSaving, startSaveTransition] = useTransition();
  const { inputRef } = opts;

  // Render-phase sync s externí změnou názvu (např. refresh z jiného tabu).
  const [prevNameProp, setPrevNameProp] = useState(opts.name);
  if (opts.name !== prevNameProp) {
    setPrevNameProp(opts.name);
    if (!isEditMode) {
      setDraft(opts.name);
    }
  }

  useEffect(() => {
    if (isEditMode && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditMode, inputRef]);

  // resetDraft: true předepíše do inputu aktuální serverový název - používá
  // se při externě spuštěné editaci (nově vytvořená složka). Kliknutí na
  // tužku draft nechává, protože ten už je se serverem synchronizovaný
  // (a po čerstvém rename může být novější než zatím nerefreshnutá props).
  const startEditing = (resetDraft = false) => {
    if (resetDraft) setDraft(opts.name);
    setIsEditMode(true);
  };

  const save = () => {
    if (draft.trim() === "") {
      setDraft(opts.name);
      return;
    }

    startSaveTransition(async () => {
      try {
        const result = await opts.action(draft.trim());
        if (result.error) {
          toast.error(result.error);
          setDraft(opts.name);
        }
      } catch {
        toast.error(opts.fallbackError);
        setDraft(opts.name);
      }

      setIsEditMode(false);
      opts.onEditComplete?.();
    });
  };

  const cancel = () => {
    setDraft(opts.name);
    setIsEditMode(false);
    opts.onEditComplete?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      save();
    } else if (e.key === "Escape") {
      cancel();
    }
  };

  return {
    isEditMode,
    draft,
    setDraft,
    isSaving,
    startEditing,
    save,
    cancel,
    handleKeyDown,
  };
}

export type UseRenameReturn = ReturnType<typeof useRename>;
