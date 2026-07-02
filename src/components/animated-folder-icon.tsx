"use client";

import { useEffect, useRef } from "react";
import { animate } from "motion/react";
import { interpolate } from "flubber";

// Adapted from Lucide's `folder` / `folder-open` icons (lucide-react
// v1.23.0): same silhouette, but every small rounded-corner arc has been
// replaced with a straight line to match this app's sharp-cornered look, and
// closed with an explicit final segment so both states are solid, fillable
// shapes. Morphed between via flubber so the transition has genuine
// in-between frames instead of a crossfade between two static glyphs.
const CLOSED_PATH =
  "M20 20l2-2V8l-2-2h-7.9l-1.69-.9L9.6 3.9L7.93 3H4l-2 2v13l2 2Z";
const OPEN_PATH =
  "M6 14l1.5-2.9L9.24 10H20l1.94 2.5l-1.54 6l-1.95 1.5H4l-2-2V5l2-2h3.9l1.69.9l.81 1.2l1.67.9H18l2 2v2Z";

const morph = interpolate(CLOSED_PATH, OPEN_PATH, { maxSegmentLength: 0.3 });

export function AnimatedFolderIcon(props: {
  isOpen: boolean;
  className?: string;
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const progressRef = useRef(0);

  useEffect(() => {
    const controls = animate(progressRef.current, props.isOpen ? 1 : 0, {
      type: "spring",
      stiffness: 260,
      damping: 22,
      onUpdate: (latest) => {
        progressRef.current = latest;
        pathRef.current?.setAttribute("d", morph(latest));
      },
    });
    return () => controls.stop();
  }, [props.isOpen]);

  return (
    <span className={`inline-block text-amber-400 ${props.className ?? ""}`}>
      <svg
        viewBox="0 0 24 24"
        width="1em"
        height="1em"
        fill="currentColor"
        className="block"
        aria-hidden
      >
        <path ref={pathRef} d={CLOSED_PATH} />
      </svg>
    </span>
  );
}
