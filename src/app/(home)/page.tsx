import Link from "next/link";
import Image from "next/image";

import { Button } from "~/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default function HomePage() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 animate-pulse rounded-full bg-gradient-to-br from-neutral-700/20 to-neutral-600/20 blur-3xl"></div>
      </div>

      <section className="relative z-10 pt-30 md:pt-65">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-4xl">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-600/20 blur-xl"></div>
              <h1 className="relative bg-gradient-to-r from-neutral-100 via-blue-200 to-purple-200 bg-clip-text py-4 text-4xl leading-tight font-bold text-transparent md:text-6xl lg:text-7xl">
                Your files, everywhere you are
              </h1>
            </div>

            <p className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-neutral-400 md:text-2xl">
              Store your files with Bojko Drive. Access your documents, photos,
              and videos from any device, anywhere in the world.
            </p>

            <div className="mb-12 flex items-center justify-center">
              <form
                action={async () => {
                  "use server";

                  const session = await auth();

                  if (!session.userId) {
                    return redirect("/sign-in");
                  }

                  return redirect("/drive");
                }}
              >
                <Button
                  size="lg"
                  type="submit"
                  className="hover:shadow-3xl group transform cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-purple-700"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </form>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-neutral-500">
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                No Credit Card Required
              </div>
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                Safe and Secure
              </div>
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                Supports all File Types
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
