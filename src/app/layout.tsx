import "~/styles/globals.css";

import { type Metadata, type Viewport } from "next";

import { Geist } from "next/font/google";
import { ClerkProvider, Show, UserButton } from "@clerk/nextjs";
import { PostHogProvider } from "~/_providers/posthog-provider";
import { MotionProvider } from "~/_providers/motion-provider";
import Link from "next/link";
import { CookieBanner } from "~/components/cookie-banner";
import { SiteFooter } from "~/components/site-footer";
import { SignInWithConsent } from "~/components/privacy-consent-dialog";
import { StorageMeter } from "~/components/storage-meter";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: { default: "Bojko Drive", template: "%s – Bojko Drive" },
  description: "Cloud storage for your files",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

// Aplikace je vždy tmavá (class="dark" na <html>); colorScheme sladí i nativní prvky prohlížeče (scrollbary, formulářové ovladače).
export const viewport: Viewport = {
  colorScheme: "dark",
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
          {/* Odkaz pro přeskočení hlavičky (WCAG 2.4.1) - viditelný jen při zaostření z klávesnice */}
          <a
            href="#main-content"
            className="focus:border-primary focus:bg-background focus:text-primary sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:border-2 focus:px-4 focus:py-2 focus:text-sm focus:font-bold"
          >
            Skip to main content
          </a>
          <PostHogProvider>
            <MotionProvider>
              {/* Cookie lišta je v DOM hned za skip linkem, aby se k ní klávesnicí dalo dostat jako k první - vizuálně je ukotvená dole */}
              <CookieBanner />
              {/* Hlavička */}
              <header className="border-border bg-background sticky top-0 z-20 border-b">
                <div className="container mx-auto flex items-center justify-between px-4 py-3.5">
                  <Link href="/" className="flex items-center gap-2.5">
                    <span
                      aria-hidden
                      className="border-primary text-primary flex h-8 w-8 items-center justify-center border-2 text-sm font-black"
                    >
                      B
                    </span>
                    <span className="text-foreground text-sm font-bold tracking-[0.15em] uppercase">
                      Bojko Drive
                    </span>
                  </Link>
                  <div className="flex items-center gap-4">
                    <Show when="signed-in">
                      <StorageMeter />
                      <UserButton />
                    </Show>
                    <Show when="signed-out">
                      <SignInWithConsent
                        variant="outline"
                        className="cursor-pointer rounded-none border-2 text-xs font-bold tracking-wide uppercase"
                      >
                        Sign In
                      </SignInWithConsent>
                    </Show>
                  </div>
                </div>
              </header>
              <main id="main-content" tabIndex={-1} className="outline-none">
                {children}
              </main>
              <SiteFooter />
              <Toaster
                theme="dark"
                position="bottom-right"
                closeButton
                toastOptions={{
                  unstyled: true,
                  classNames: {
                    toast:
                      "flex items-center gap-3 w-full border-2 border-border bg-card px-4 py-3.5 font-mono text-sm text-foreground shadow-none",
                    title: "font-bold",
                    description: "text-muted-foreground",
                    actionButton:
                      "rounded-none! border-2 border-primary bg-primary px-3 py-1.5 text-xs font-bold tracking-wide text-primary-foreground uppercase",
                    cancelButton:
                      "rounded-none! border border-border bg-transparent px-3 py-1.5 text-xs text-muted-foreground uppercase",
                    closeButton:
                      "rounded-none! border border-border bg-card text-muted-foreground hover:text-foreground",
                    success: "border-primary [&_svg]:text-primary",
                    error: "border-destructive [&_svg]:text-destructive",
                  },
                }}
              />
            </MotionProvider>
          </PostHogProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
