"use client";

import { useEffect, useRef } from "react";
import { animate } from "motion/react";
import { interpolate } from "flubber";

// Dvoubarevná "duotone" složka podle reference: světlejší zlatá výplň s výrazně tmavším zlatým obrysem, zaoblené spoje.
const OPEN_FLAP = "M5 20 L7 11 H22.5 L20.5 20 Z";

// Zadní vrstva je rozdělená na výstupek úchytu (zůstává zlatý, vždy) a papír pod ním (bílý, odhalený až když se křídlo odklopí).
const TAB_SHAPE = "M3 6.5 V4.5 H9 L11 6.5 Z";
const PAPER_SHAPE = "M3 20.5 V6.5 H21 V20.5 Z";

const STROKE = "#d9a227"; // tmavší zlatý obrys
const TAB_FILL = "#e7b63a"; // tmavší zlatá: výstupek úchytu vzadu
const PAPER_FILL = "#ffffff"; // papír viditelný uvnitř, jakmile se křídlo otevře
const FLAP_FILL = "#f6cf5e"; // světlejší zlatá: přední strana

const morphFlap = interpolate(PAPER_SHAPE, OPEN_FLAP, {
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
        {/* Papír uvnitř kapsy, konstantní, odhalí se, jak se křídlo otevírá */}
        <path d={PAPER_SHAPE} fill={PAPER_FILL} stroke={STROKE} />
        {/* Výstupek úchytu vzadu, konstantní */}
        <path d={TAB_SHAPE} fill={TAB_FILL} stroke={STROKE} />
        {/* Přední křídlo: morph z kapsy na nakloněné otevřené křídlo */}
        <path ref={flapRef} d={PAPER_SHAPE} fill={FLAP_FILL} stroke={STROKE} />
      </svg>
    </span>
  );
}
