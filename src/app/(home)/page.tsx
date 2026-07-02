import { Button } from "~/components/ui/button";
import { FilesMockPreview } from "~/components/files-mock-preview";
import { SupportedFileTypes } from "~/components/supported-file-types";
import { ArrowRight } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();
  const isSignedIn = !!session.userId;

  const year = new Date().getFullYear();

  return (
    <>
      <section className="px-4 py-24 md:py-36">
        <div className="mx-auto grid max-w-6xl items-center gap-16 md:grid-cols-2">
          <div>
            <h1 className="text-foreground max-w-2xl text-5xl leading-[0.95] font-black tracking-tight uppercase md:text-7xl">
              Store stuff.
              <br />
              Find it <span className="text-primary">again.</span>
            </h1>

            <div className="bg-primary mt-6 mb-10 h-1.25 w-24 [clip-path:polygon(0_0,100%_10%,98%_100%,2%_90%)]" />

            <p className="text-muted-foreground max-w-xl text-lg leading-relaxed">
              Just a normal drive app for your files.
              <br />
              No cookies, no spying on u, no crap.
              <br />
              Upload, organize, enjoy calm UI, done.
              <br />
              <br />
              <i className="font-extralight">
                Nothing else fighting for your attention.
              </i>
            </p>

            <div className="mt-10">
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
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground cursor-pointer gap-2 rounded-none border-2 bg-transparent px-8 py-6 text-base font-bold tracking-wide uppercase"
                >
                  {isSignedIn ? "Go to your stuff" : "Get started free"}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </form>
            </div>

            <p className="text-muted-foreground mt-8 text-sm">
              No credit card. Any file type. Your files stay yours.
            </p>
          </div>

          <div className="hidden md:block">
            <FilesMockPreview />
          </div>
        </div>
      </section>

      <SupportedFileTypes />

      <div className="flex flex-col items-center justify-center gap-2 border-t border-gray-300 py-5 text-center text-xs text-gray-500 md:flex-row dark:border-gray-600/80 dark:text-gray-200">
        <span>© {year} bojko drive</span>
        <span className="hidden opacity-30 md:inline">•</span>
        <span>
          web made by{" "}
          <a
            href="https://bojkoj.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-gray-500 hover:text-[#0580bf] dark:text-gray-400"
          >
            Jan Bojko
          </a>
        </span>
      </div>
    </>
  );
}
