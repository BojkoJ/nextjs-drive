"use client";

import { memo } from "react";
import { motion } from "motion/react";

const ACTIVE_HEIGHT = 56;
const REST_HEIGHT = 10;

// Callbacky berou index jako argument (místo closure per gap), takže rodič
// může předávat stabilní funkce a memo() přeskočí re-render neaktivních gapů.
export const GapDropZone = memo(function GapDropZone(props: {
  index: number;
  isActive: boolean;
  isDragActive: boolean;
  onActivate: (index: number) => void;
  onDeactivate: (index: number) => void;
  onDrop: (index: number, e: React.DragEvent) => void;
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
        if (!props.isActive) props.onActivate(props.index);
      }}
      onDragLeave={() => props.onDeactivate(props.index)}
      onDrop={(e) => {
        e.preventDefault();
        props.onDrop(props.index, e);
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
});
