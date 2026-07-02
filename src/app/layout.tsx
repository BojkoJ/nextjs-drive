import "~/styles/globals.css";

import { type Metadata } from "next";

import { Geist } from "next/font/google";
import {
  ClerkProvider,
  Show,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import { PostHogProvider } from "~/_providers/posthog-provider";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export const metadata: Metadata = {
  title: "Bojko Drive",
  description: "Cloud storage for your files",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`dark ${geist.variable}`}>
        <body>
          <PostHogProvider>
            {/* Header */}
            <header className="sticky top-0 z-20 border-b border-border bg-background">
              <div className="container mx-auto flex items-center justify-between px-4 py-3.5">
                <Link href="/" className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center border-2 border-primary text-sm font-black text-primary">
                    B
                  </span>
                  <span className="text-sm font-bold tracking-[0.15em] text-foreground uppercase">
                    Bojko Drive
                  </span>
                </Link>
                <div className="flex items-center gap-4">
                  <Show when="signed-in">
                    <UserButton />
                  </Show>
                  <Show when="signed-out">
                    <SignInButton forceRedirectUrl={"/drive"}>
                      <Button
                        variant="outline"
                        className="cursor-pointer rounded-none border-2 text-xs font-bold tracking-wide uppercase"
                      >
                        Sign In
                      </Button>
                    </SignInButton>
                  </Show>
                </div>
              </div>
            </header>
            {children}
          </PostHogProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
