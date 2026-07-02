import { Button } from "~/components/ui/button";
import { ArrowRight } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default function HomePage() {
  return (
    <section className="px-4 py-24 md:py-36">
      <div className="mx-auto max-w-4xl">
        <span className="mb-8 inline-block -rotate-2 border-2 border-primary bg-primary px-2.5 py-1 text-xs font-black tracking-wider text-primary-foreground uppercase">
          Solo built. No VC money.
        </span>

        <h1 className="max-w-2xl text-5xl leading-[0.95] font-black tracking-tight text-foreground uppercase md:text-7xl">
          Store stuff.
          <br />
          Find it <span className="text-primary">again.</span>
        </h1>

        <div className="mt-6 mb-10 h-[5px] w-24 bg-primary [clip-path:polygon(0_0,100%_10%,98%_100%,2%_90%)]" />

        <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
          A plain, honest drive for the files that actually matter to you.
          Upload, organize, done. Nothing else fighting for your attention.
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
              className="cursor-pointer gap-2 rounded-none border-2 border-primary bg-transparent px-8 py-6 text-base font-bold tracking-wide text-primary uppercase hover:bg-primary hover:text-primary-foreground"
            >
              Get started free
              <ArrowRight className="h-5 w-5" />
            </Button>
          </form>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          No credit card. Any file type. Your files stay yours.
        </p>
      </div>
    </section>
  );
}
