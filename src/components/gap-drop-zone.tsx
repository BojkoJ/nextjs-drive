"use client";

import { motion } from "motion/react";

const ACTIVE_HEIGHT = 56;
const REST_HEIGHT = 10;

export function GapDropZone(props: {
  isActive: boolean;
  isDragActive: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  const height = props.isActive
    ? ACTIVE_HEIGHT
    : props.isDragActive
      ? REST_HEIGHT
      : 0;

  return (
    <motion.li
      layout
      transition={{ type: "spring", stiffness: 500, damping: 40 }}
      onDragOver={(e) => {
        e.preventDefault();
        if (!props.isActive) props.onActivate();
      }}
      onDragLeave={() => props.onDeactivate()}
      onDrop={(e) => {
        e.preventDefault();
        props.onDrop(e);
      }}
    >
      <motion.div
        initial={false}
        animate={{ height }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
        className={`overflow-hidden transition-colors ${
          props.isActive
            ? "border-2 border-primary bg-primary/10"
            : props.isDragActive
              ? "border-y border-border"
              : "border-0"
        }`}
      />
    </motion.li>
  );
}
