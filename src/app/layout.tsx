import "~/styles/globals.css";

import { type Metadata } from "next";

import { Geist } from "next/font/google";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import { PostHogProvider } from "~/_providers/posthog-provider";
import Link from "next/link";
import Image from "next/image";
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
      <html lang="en" className={`${geist.variable}`}>
        <body>
          <PostHogProvider>
            {/* Header */}
            <header className="border-neutral-5 00 relative z-10 border-b bg-neutral-900 backdrop-blur-sm">
              <div className="container mx-auto px-4 py-4">
                <nav className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Link href="/" className="flex items-center space-x-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                        <Image
                          src="/favicon.ico"
                          alt="Logo"
                          width={32}
                          height={32}
                          className="h-5 w-5"
                        />
                      </div>
                      <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-xl font-bold text-transparent">
                        Bojko Drive
                      </span>
                    </Link>
                  </div>
                  <div className="flex items-center space-x-4">
                    <SignedIn>
                      <UserButton />
                    </SignedIn>
                    <SignedOut>
                      <SignInButton forceRedirectUrl={"/drive"}>
                        <Button
                          variant="outline"
                          className="cursor-pointer bg-neutral-200 hover:bg-neutral-800 hover:text-white"
                        >
                          Sign In
                        </Button>
                      </SignInButton>
                    </SignedOut>
                  </div>
                </nav>
              </div>
            </header>
            {children}
          </PostHogProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
