import { Button } from "~/components/ui/button";
import { SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const session = await auth();

  if (session.userId) {
    return redirect("/drive");
  }

  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <span className="mb-6 -rotate-2 border-2 border-primary bg-primary px-2.5 py-1 text-xs font-black tracking-wider text-primary-foreground uppercase">
        Bojko Drive
      </span>
      <h1 className="max-w-md text-3xl font-black tracking-tight text-foreground uppercase md:text-4xl">
        Sign in to get to your files.
      </h1>
      <div className="mt-8">
        <Button
          asChild
          size="lg"
          className="cursor-pointer rounded-none border-2 border-primary bg-transparent px-8 py-6 text-base font-bold tracking-wide text-primary uppercase hover:bg-primary hover:text-primary-foreground"
        >
          <SignInButton forceRedirectUrl={"/drive"} />
        </Button>
      </div>
    </section>
  );
}
