import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "~/components/ui/button";
import { OnboardUser } from "~/server/db/mutations";
import { GetRootFolderForUser } from "~/server/db/queries";

export default async function DrivePage() {
  const session = await auth();

  if (!session.userId) {
    return redirect("/sign-in");
  }

  const rootFolder = await GetRootFolderForUser(session.userId);

  if (!rootFolder) {
    return (
      <div className="min-h-screen bg-neutral-900">
        {/* Hero Section */}
        <section className="relative z-10 pt-30 md:pt-65">
          <div className="container mx-auto px-4 text-center">
            <h1 className="mb-6 text-4xl font-bold text-white">
              Welcome to Bojko Drive
            </h1>
            <h3 className="mb-14 text-2xl font-semibold text-gray-300">
              First things first - you need to create your base folders.
            </h3>
            <form
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
                className="hover:shadow-3xl group transform cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-purple-700"
                type="submit"
              >
                Create Base Folders
              </Button>
            </form>
          </div>
        </section>
      </div>
    );
  }

  return redirect(`/f/${rootFolder.id}`);
}
