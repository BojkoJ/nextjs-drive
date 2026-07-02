import { Button } from "~/components/ui/button";
import { ArrowRight } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default function HomePage() {
  return (
    <section className="px-4 py-24 md:py-36">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-foreground max-w-2xl text-5xl leading-[0.95] font-black tracking-tight uppercase md:text-7xl">
          Store stuff.
          <br />
          Find it <span className="text-primary">again.</span>
        </h1>

        <div className="bg-primary mt-6 mb-10 h-1.25 w-24 [clip-path:polygon(0_0,100%_10%,98%_100%,2%_90%)]" />

        <p className="text-muted-foreground max-w-xl text-lg leading-relaxed">
          A plain, honest drive for the files that actually matter to you.
          <br />
          Upload, organize, enjoy calm UI, done. <br />
          Nothing else fighting for your attention.
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
              Get started free
              <ArrowRight className="h-5 w-5" />
            </Button>
          </form>
        </div>

        <p className="text-muted-foreground mt-8 text-sm">
          No credit card. Any file type. Your files stay yours.
        </p>
      </div>
    </section>
  );
}
