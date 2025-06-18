import Image from "next/image";

import { Button } from "~/components/ui/button";
import { SignInButton } from "@clerk/nextjs";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-neutral-900">
      {/* Animated background elements */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 animate-pulse rounded-full bg-gradient-to-br from-neutral-700/20 to-neutral-600/20 blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-neutral-800 backdrop-blur-sm">
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
              <Button className="transform cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl">
                Get Started
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-30 md:pt-65">
        <div className="container mx-auto px-4 text-center">
          <Button
            asChild
            size="lg"
            type="submit"
            className="hover:shadow-3xl group transform cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-purple-700"
          >
            <SignInButton forceRedirectUrl={"/drive"} />
          </Button>
        </div>
      </section>
    </div>
  );
}
