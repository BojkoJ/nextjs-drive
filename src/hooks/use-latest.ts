"use client";

import { useEffect, useRef } from "react";

// Zpřístupní vždy aktuální hodnotu uvnitř stabilních callbacků, aniž by musela být v dependency arrays - viz "useLatest for Stable Callback Refs" v references.
// Handlery, které ji čtou, se díky tomu nemusí znovu vytvářet při každém renderu.
export function useLatest<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}
