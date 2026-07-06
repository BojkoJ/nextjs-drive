import { Loader2Icon } from "lucide-react";
import { cn } from "~/lib/utils";

// Prohlížeče často nemají hardwarovou akceleraci CSS animací přímo na SVG
// elementech - proto se točí obalový span a SVG uvnitř zůstává statické.
// Velikost se předává přes className (h-4 w-4 apod.), ikona ji vyplní.
export function Spinner(props: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 animate-spin items-center justify-center",
        props.className,
      )}
    >
      <Loader2Icon className="size-full" />
    </span>
  );
}
