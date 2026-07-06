"use client";

import { Checkbox } from "~/components/ui/checkbox";

// Hlavička seznamu: select-all checkbox + popisky sloupců. Sloupce kopírují responzivní hybrid layout řádků (flex na mobilu, 12-col grid od sm).
export function ListHeader(props: {
  allSelected: boolean;
  onToggleSelectAll: () => void;
  hasItems: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-4 sm:gap-4 sm:px-6 ${props.hasItems ? "border-border border-b" : ""}`}
    >
      <Checkbox
        checked={props.allSelected}
        onCheckedChange={props.onToggleSelectAll}
        aria-label="Select all"
      />
      <div className="hidden w-4 shrink-0 sm:block" aria-hidden />
      <div className="text-muted-foreground flex flex-1 items-center gap-2 text-xs font-bold tracking-widest uppercase sm:grid sm:grid-cols-12 sm:gap-4">
        <div className="flex-1 sm:col-span-5">Name</div>
        <div className="hidden sm:col-span-3 sm:block">Type</div>
        <div className="shrink-0 sm:col-span-2">Size</div>
        <div className="sm:col-span-2"></div>
      </div>
    </div>
  );
}
