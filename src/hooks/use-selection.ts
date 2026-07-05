"use client";

import { useCallback, useState } from "react";
import type { DragItemRef } from "~/server/actions";
import { keyOf } from "~/lib/item-key";

// Multi-select stav seznamu (checkboxy). Všechny vrácené callbacky jsou
// stabilní (funkční setState), takže nerozbíjejí memo() na řádcích.
export function useSelection() {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  const toggleSelect = useCallback((item: DragItemRef) => {
    const key = keyOf(item.type, item.id);
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedKeys(new Set());
  }, []);

  return { selectedKeys, setSelectedKeys, toggleSelect, clearSelection };
}
