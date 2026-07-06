"use client";

import { Trash2Icon } from "lucide-react";
import { Button } from "~/components/ui/button";

// Lišta hromadných akcí nad seznamem. Obsah je vždy vykreslený (nikdy podmíněně odstraněný), jen skrytý přes invisible, když je prázdný,
// takže výška tohoto slotu je vždy stejná jako když je vyplněný a nic pod ním se neposouvá.
export function SelectionBar(props: {
  selectedCount: number;
  onClear: () => void;
  onDeleteSelected: () => void;
}) {
  const hasSelection = props.selectedCount > 0;

  return (
    <div
      className={`mb-4 flex flex-wrap items-center justify-between gap-2 border-2 px-4 py-3 transition-colors ${hasSelection ? "border-primary bg-primary/10" : "border-transparent"}`}
    >
      <span
        className={`text-foreground font-mono text-sm ${hasSelection ? "" : "invisible"}`}
      >
        {props.selectedCount} selected
      </span>
      <div
        className={`flex gap-2 ${hasSelection ? "" : "invisible"}`}
        aria-hidden={!hasSelection}
      >
        <Button
          variant="ghost"
          tabIndex={hasSelection ? 0 : -1}
          className="text-muted-foreground cursor-pointer text-xs font-bold tracking-wide uppercase"
          onClick={props.onClear}
        >
          Clear
        </Button>
        <Button
          variant="outline"
          tabIndex={hasSelection ? 0 : -1}
          className="border-destructive text-destructive hover:bg-destructive cursor-pointer gap-2 rounded-none border-2 text-xs font-bold tracking-wide uppercase hover:text-white"
          onClick={props.onDeleteSelected}
        >
          <Trash2Icon className="h-3.5 w-3.5" />
          Delete selected
        </Button>
      </div>
    </div>
  );
}
