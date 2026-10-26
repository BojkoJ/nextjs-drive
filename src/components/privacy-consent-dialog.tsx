"use client";

import { useState } from "react";
import Link from "next/link";
import { SignInButton } from "@clerk/nextjs";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { usePrivacyConsent } from "~/lib/consent";

// Tlačítko přihlášení/registrace. Dokud uživatel (v tomto prohlížeči, pro aktuální verzi zásad) nepotvrdil
// zpracování osobních údajů, otevře se místo přesměrování na Clerk potvrzovací okno s checkboxem.
export function SignInWithConsent({
  children,
  ...buttonProps
}: React.ComponentProps<typeof Button>) {
  const { accepted, accept } = usePrivacyConsent();
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);

  return (
    <>
      {accepted ? (
        <SignInButton forceRedirectUrl={"/drive"}>
          <Button {...buttonProps}>{children}</Button>
        </SignInButton>
      ) : (
        <Button {...buttonProps} onClick={() => setOpen(true)}>
          {children}
        </Button>
      )}

      {/* Dialog zůstává mountnutý i po uložení souhlasu, aby Clerk dokončil přesměrování */}
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setChecked(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Before you continue</DialogTitle>
            <DialogDescription>
              To create your account we process your name, e-mail address and
              the files you upload, so you can use Bojko Drive.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-start gap-3">
            <Checkbox
              id="privacy-consent"
              checked={checked}
              onCheckedChange={(value) => setChecked(value === true)}
              className="mt-0.5"
            />
            <label
              htmlFor="privacy-consent"
              className="cursor-pointer text-sm leading-relaxed"
            >
              I agree to the{" "}
              <Link
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-4"
              >
                processing of personal data
              </Link>
              .
            </label>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="cursor-pointer rounded-none border-2 text-xs font-bold tracking-wide uppercase"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <SignInButton forceRedirectUrl={"/drive"}>
              <Button
                disabled={!checked}
                onClick={accept}
                className="border-primary bg-primary text-primary-foreground cursor-pointer rounded-none border-2 text-xs font-bold tracking-wide uppercase"
              >
                Continue
              </Button>
            </SignInButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
