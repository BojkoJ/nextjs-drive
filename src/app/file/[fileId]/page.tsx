import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Button } from "~/components/ui/button";
import { FileView } from "~/components/file-view";
import { GetFileById } from "~/server/db/queries";

function NotFoundScreen() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-y-5 bg-background text-foreground">
      <p>
        <span className="font-semibold italic">Oooops... </span> You&apos;re
        looking for a file that doesn&apos;t exist or has been deleted.
      </p>
      <Link href="/">
        <Button
          variant="ghost"
          className="mr-2 cursor-pointer border border-border text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          Go back to Home
        </Button>
      </Link>
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
