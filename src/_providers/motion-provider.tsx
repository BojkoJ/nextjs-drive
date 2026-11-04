"use client";

import { MotionConfig } from "motion/react";

// Respektuje systémové nastavení "omezit pohyb" (prefers-reduced-motion): motion animace přesunů a layoutu se pak vypnou (WCAG 2.3.3).
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
