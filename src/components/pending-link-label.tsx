"use client";

import { useLinkStatus } from "next/link";
import { Spinner } from "~/components/ui/spinner";

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
    <span
      className={`relative inline-flex items-center ${props.className ?? ""}`}
    >
      <span
        className={`inline-flex items-center gap-1.5 transition-opacity ${pending ? "opacity-0" : "opacity-100"}`}
      >
        {props.children}
      </span>
      {pending && (
        // Centered via flexbox (inset-0 + items/justify-center), not
        // translate: any transform on this wrapper would combine with the
        // spinner's own rotate() and drift as the animation overwrites the
        // composited transform each frame. Flex centering has no transform
        // at all, so there's nothing for the spin animation to collide with.
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner className="h-3.5 w-3.5" />
        </span>
      )}
    </span>
  );
}
