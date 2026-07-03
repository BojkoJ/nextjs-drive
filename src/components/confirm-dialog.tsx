"use client";

import { Loader2Icon } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

export function ConfirmDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  isConfirming?: boolean;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{props.title}</DialogTitle>
          <DialogDescription>{props.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            className="cursor-pointer rounded-none border-2 text-xs font-bold tracking-wide uppercase"
            onClick={() => props.onOpenChange(false)}
            disabled={props.isConfirming}
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            className="cursor-pointer gap-2 rounded-none border-2 border-destructive text-xs font-bold tracking-wide text-destructive uppercase hover:bg-destructive hover:text-white"
            onClick={props.onConfirm}
            disabled={props.isConfirming}
          >
            {props.isConfirming && (
              <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
            )}
            {props.confirmLabel ?? "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
