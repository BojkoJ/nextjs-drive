"use client";

import { useLinkStatus } from "next/link";
import { Loader2Icon } from "lucide-react";

// Must be rendered as a descendant of a <Link>: useLinkStatus reads the
// pending state of its nearest ancestor Link's navigation. The spinner is
// overlaid on top of the (now just dimmed, not removed) label rather than
// inserted inline, so the label keeps reserving its normal width and the
// surrounding button/breadcrumb never widens when a navigation starts.
export function PendingLinkLabel(props: {
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useLinkStatus();
  return (
    <span className={`relative inline-flex items-center ${props.className ?? ""}`}>
      <span
        className={`inline-flex items-center gap-1.5 transition-opacity ${pending ? "opacity-0" : "opacity-100"}`}
      >
        {props.children}
      </span>
      {pending && (
        <Loader2Icon
          className="absolute top-1/2 left-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 animate-spin"
          aria-hidden
        />
      )}
    </span>
  );
}
