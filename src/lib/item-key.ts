import type { DragItemRef } from "~/server/actions";

// Jednotný stringový klíč "file-12" / "folder-7" pro položky driveu - používá se pro React keys, Sety vybraných/mazaných položek a drag & drop payloady.
export function keyOf(type: "file" | "folder", id: number) {
  return `${type}-${id}`;
}

export function parseKey(key: string): DragItemRef {
  const separatorIndex = key.indexOf("-");
  return {
    type: key.slice(0, separatorIndex) as "file" | "folder",
    id: Number(key.slice(separatorIndex + 1)),
  };
}
