import { type Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "~/components/ui/button";
import { OnboardUser } from "~/server/db/mutations";
import { GetRootFolderForUser } from "~/server/db/queries";

export const metadata: Metadata = {
  title: "My Drive",
};

export default async function DrivePage() {
  const session = await auth();

  if (!session.userId) {
    return redirect("/sign-in");
  }

  const rootFolder = await GetRootFolderForUser(session.userId);

  if (!rootFolder) {
    return (
      <section className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        <span className="border-primary bg-primary text-primary-foreground mb-6 -rotate-2 border-2 px-2.5 py-1 text-xs font-black tracking-wider uppercase">
          One time setup
        </span>
        <h1 className="text-foreground max-w-lg text-3xl font-black tracking-tight uppercase md:text-4xl">
          Welcome. Let&apos;s create your base folders.
        </h1>
        <p className="text-muted-foreground mt-4 max-w-md">
          Takes one click. You will get Documents, Photos and Videos folders to
          start with.
        </p>
        <form
          className="mt-10"
          action={async () => {
            "use server";
            const session = await auth();

            if (!session.userId) {
              return redirect("/sign-in");
            }

            const rootFolderId = await OnboardUser(session.userId);

            return redirect(`/f/${rootFolderId}`);
          }}
        >
          <Button
            size="lg"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground cursor-pointer rounded-none border-2 bg-transparent px-8 py-6 text-base font-bold tracking-wide uppercase"
            type="submit"
          >
            Create base folders
          </Button>
        </form>
      </section>
    );
  }

  return redirect(`/f/${rootFolder.id}`);
}
