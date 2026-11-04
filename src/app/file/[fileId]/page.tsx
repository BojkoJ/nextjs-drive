import Link from "next/link";
import { type Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { Button } from "~/components/ui/button";
import { FileView } from "~/components/file-view";
import { GetFileById } from "~/server/db/queries";

export const metadata: Metadata = {
  title: "File preview",
};

function NotFoundScreen() {
  return (
    <div className="bg-background text-foreground flex h-screen w-full flex-col items-center justify-center gap-y-5">
      <p>
        <span className="font-semibold italic">Oooops... </span> You&apos;re
        looking for a file that doesn&apos;t exist or has been deleted.
      </p>
      <Button
        asChild
        variant="ghost"
        className="border-border text-muted-foreground hover:bg-accent hover:text-foreground mr-2 cursor-pointer border"
      >
        <Link href="/">Go back to Home</Link>
      </Button>
    </div>
  );
}

export default async function FileViewPage(props: {
  params: Promise<{ fileId: string }>;
}) {
  const params = await props.params;
  const parsedFileId = parseInt(params.fileId);

  if (isNaN(parsedFileId)) {
    return <NotFoundScreen />;
  }

  const session = await auth();
  if (!session.userId) {
    return <NotFoundScreen />;
  }

  const file = await GetFileById(parsedFileId);

  if (!file?.ownerId || file.ownerId !== session.userId) {
    return <NotFoundScreen />;
  }

  return <FileView file={file} />;
}
