"use client";

import { useEffect, useRef } from "react";
import { animate } from "motion/react";
import { interpolate } from "flubber";

// Two-tone "duotone" folder matching the reference: a lighter gold fill with a distinct darker gold outline, rounded joins.
const FOLDER_BODY = "M3 20.5 V4.5 H9 L11 6.5 H21 V20.5 Z";
const OPEN_FLAP = "M5 20 L7 11 H22.5 L20.5 20 Z";

const STROKE = "#d9a227"; // darker gold outline ("okraje")
const BACK_FILL = "#e7b63a"; // slightly darker: the recessed interior/back
const FLAP_FILL = "#f6cf5e"; // lighter gold: the front face

const morphFlap = interpolate(FOLDER_BODY, OPEN_FLAP, {
  maxSegmentLength: 0.3,
});

export function AnimatedFolderIcon(props: {
  isOpen: boolean;
  className?: string;
}) {
  const flapRef = useRef<SVGPathElement>(null);
  const progressRef = useRef(0);

  useEffect(() => {
    const controls = animate(progressRef.current, props.isOpen ? 1 : 0, {
      type: "spring",
      stiffness: 320,
      damping: 26,
      onUpdate: (t) => {
        progressRef.current = t;
        flapRef.current?.setAttribute("d", morphFlap(t));
      },
    });
    return () => controls.stop();
  }, [props.isOpen]);

  return (
    <span className={`inline-block ${props.className ?? ""}`}>
      <svg
        viewBox="1.5 3 22 20"
        width="1em"
        height="1em"
        strokeWidth={1.15}
        strokeLinejoin="round"
        strokeLinecap="round"
        className="block"
        aria-hidden
      >
        {/* Back pocket + tab, constant */}
        <path d={FOLDER_BODY} fill={BACK_FILL} stroke={STROKE} />
        {/* Front flap: morphs pocket -> tilted open flap */}
        <path ref={flapRef} d={FOLDER_BODY} fill={FLAP_FILL} stroke={STROKE} />
      </svg>
    </span>
  );
}
