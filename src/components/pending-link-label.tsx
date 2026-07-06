"use client";

import { useLinkStatus } from "next/link";
import { Spinner } from "~/components/ui/spinner";

// Musí být vykreslen jako potomek <Link> - useLinkStatus čte pending stav nejbližšího rodičovského Linku.
// Spinner se překrývá přes label (ztlumený, ne odstraněný), ne vedle něj, takže label pořád zabírá šířku a okolí se při navigaci nerozšíří.
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
        // Vycentrováno flexboxem (inset-0 + items/justify-center), ne translate - animace spinneru by transform na obalu každý snímek přepsala, takže by to driftovalo.
        // Flex centering žádný transform nepoužívá, takže tu není s čím kolidovat.
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner className="h-3.5 w-3.5" />
        </span>
      )}
    </span>
  );
}
