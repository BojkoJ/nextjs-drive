import { type Metadata } from "next";
import { SignInWithConsent } from "~/components/privacy-consent-dialog";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function SignInPage() {
  const session = await auth();

  if (session.userId) {
    return redirect("/drive");
  }

  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <span className="border-primary bg-primary text-primary-foreground mb-6 -rotate-2 border-2 px-2.5 py-1 text-xs font-black tracking-wider uppercase">
        Bojko Drive
      </span>
      <h1 className="text-foreground max-w-md text-3xl font-black tracking-tight uppercase md:text-4xl">
        Sign in to get to your files.
      </h1>
      <div className="mt-8">
        <SignInWithConsent
          size="lg"
          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground cursor-pointer rounded-none border-2 bg-transparent px-8 py-6 text-base font-bold tracking-wide uppercase"
        >
          Sign in
        </SignInWithConsent>
      </div>
    </section>
  );
}
