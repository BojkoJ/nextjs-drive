"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { GetMoveTargets, type MoveTargetFolder } from "~/server/actions";

type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; folders: MoveTargetFolder[] };

type Option = {
  id: number;
  label: string;
  depth: number;
  disabledReason: string | null;
};

// Seřadí složky do stromu (depth-first), aby se dalo odsazením poznat, která složka leží v které.
// Složky, do kterých přesun nedává smysl (aktuální složka, přesouvané složky a jejich podsložky), jsou označené jako nedostupné.
function buildOptions(
  folders: MoveTargetFolder[],
  currentFolderId: number,
  movingFolderIds: number[],
): Option[] {
  const childrenOf = new Map<number | null, MoveTargetFolder[]>();
  for (const folder of folders) {
    const siblings = childrenOf.get(folder.parent) ?? [];
    siblings.push(folder);
    childrenOf.set(folder.parent, siblings);
  }

  const options: Option[] = [];
  const walk = (
    parent: number | null,
    depth: number,
    insideMoving: boolean,
  ) => {
    for (const folder of childrenOf.get(parent) ?? []) {
      const isMoving = movingFolderIds.includes(folder.id);
      const blocked = insideMoving || isMoving;
      options.push({
        id: folder.id,
        label: folder.parent === null ? "My Drive" : folder.name,
        depth,
        disabledReason:
          folder.id === currentFolderId
            ? "current folder"
            : blocked
              ? "cannot move a folder into itself"
              : null,
      });
      walk(folder.id, depth + 1, blocked);
    }
  };
  walk(null, 0, false);

  return options;
}

// Obsah dialogu se vykresluje jen při otevření, takže načtení složek i vybraný cíl se pokaždé začínají od nuly.
function MoveTargetPicker(props: {
  currentFolderId: number;
  movingFolderIds: number[];
  onConfirm: (targetFolderId: number) => void;
  onCancel: () => void;
}) {
  const [load, setLoad] = useState<LoadState>({ status: "loading" });
  const [target, setTarget] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    GetMoveTargets()
      .then((result) => {
        if (cancelled) return;
        setLoad(
          result.folders
            ? { status: "ready", folders: result.folders }
            : { status: "error" },
        );
      })
      .catch(() => {
        if (!cancelled) setLoad({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const options = useMemo(
    () =>
      load.status === "ready"
        ? buildOptions(
            load.folders,
            props.currentFolderId,
            props.movingFolderIds,
          )
        : [],
    [load, props.currentFolderId, props.movingFolderIds],
  );

  return (
    <>
      {load.status === "loading" && (
        <div
          role="status"
          className="text-muted-foreground flex items-center gap-2 text-sm"
        >
          <Spinner className="h-4 w-4" />
          Loading folders…
        </div>
      )}
      {load.status === "error" && (
        <p role="alert" className="text-destructive text-sm">
          Could not load your folders. Close this window and try again.
        </p>
      )}
      {load.status === "ready" && (
        <fieldset className="border-border max-h-64 overflow-y-auto border-2">
          <legend className="sr-only">Destination folder</legend>
          <ul>
            {options.map((option) => {
              const inputId = `move-target-${option.id}`;
              return (
                <li key={option.id}>
                  <label
                    htmlFor={inputId}
                    style={{ paddingLeft: `${0.75 + option.depth * 1.25}rem` }}
                    className={`flex items-center gap-3 py-2 pr-3 font-mono text-sm ${
                      option.disabledReason
                        ? "text-muted-foreground cursor-not-allowed"
                        : "hover:bg-accent/50 cursor-pointer"
                    }`}
                  >
                    <input
                      id={inputId}
                      type="radio"
                      name="move-target"
                      className="accent-primary size-4 shrink-0"
                      disabled={option.disabledReason !== null}
                      checked={target === option.id}
                      onChange={() => setTarget(option.id)}
                    />
                    <span className="min-w-0 break-all">{option.label}</span>
                    {option.disabledReason && (
                      <span className="shrink-0 text-xs">
                        ({option.disabledReason})
                      </span>
                    )}
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
      )}

      <DialogFooter>
        <Button
          variant="outline"
          className="cursor-pointer rounded-none border-2 text-xs font-bold tracking-wide uppercase"
          onClick={props.onCancel}
        >
          Cancel
        </Button>
        <Button
          variant="outline"
          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground cursor-pointer rounded-none border-2 bg-transparent text-xs font-bold tracking-wide uppercase"
          disabled={target === null}
          onClick={() => target !== null && props.onConfirm(target)}
        >
          Move here
        </Button>
      </DialogFooter>
    </>
  );
}

// Přesun vybraných položek do zvolené složky bez tažení myší (klávesnice, čtečky obrazovky, dotyk) - alternativa k drag & drop (WCAG 2.1.1, 2.5.7).
export function MoveDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemCount: number;
  currentFolderId: number;
  movingFolderIds: number[];
  onConfirm: (targetFolderId: number) => void;
}) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move to…</DialogTitle>
          <DialogDescription>
            Choose the folder for {props.itemCount}{" "}
            {props.itemCount === 1 ? "selected item" : "selected items"}.
          </DialogDescription>
        </DialogHeader>
        <MoveTargetPicker
          currentFolderId={props.currentFolderId}
          movingFolderIds={props.movingFolderIds}
          onConfirm={props.onConfirm}
          onCancel={() => props.onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
