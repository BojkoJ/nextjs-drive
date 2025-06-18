import { Button } from "~/components/ui/button";
import { SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();

  if (session.userId) {
    return redirect("/drive");
  }

  return (
    <div className="min-h-screen bg-neutral-900">
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
