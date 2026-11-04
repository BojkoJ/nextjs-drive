import Link from "next/link";
import { type Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DriveContent from "~/components/drive-content";

import { Button } from "~/components/ui/button";
import {
  getAllParentsForFolder,
  GetFiles,
  GetFolders,
  GetFolderSizes,
} from "~/server/db/queries";

export const metadata: Metadata = {
  title: "My Drive",
};

function FolderNotFoundScreen() {
  return (
    <div className="bg-background text-foreground flex h-screen w-full flex-col items-center justify-center gap-y-5">
      <p>
        <span className="font-semibold italic">Oooops... </span> You&apos;re
        looking for a folder that doesn&apos;t exist or has been deleted.
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

export default async function GoogleDriveClone(props: {
  params: Promise<{ folderId: string }>;
}) {
  const params = await props.params;

  // Data složky se načítají a posílají klientovi jen přihlášenému vlastníkovi - bez toho by šlo podle číselného id vyčíst cizí složky a odkazy na soubory.
  const session = await auth();
  if (!session.userId) {
    return redirect("/sign-in");
  }

  // Zajistíme, že folderId je číslo, jinak vrátíme error page
  const parsedFolderId = parseInt(params.folderId);
  if (isNaN(parsedFolderId)) {
    return <FolderNotFoundScreen />;
  }

  // JSX se nesmí sestavovat uvnitř try bloku - vykreslení proběhne až mimo tuto funkci, takže try/catch tady hlídá jen fetch dat níže, ne render DriveContent.
  let folders: Awaited<ReturnType<typeof GetFolders>>;
  let files: Awaited<ReturnType<typeof GetFiles>>;
  let parents: Awaited<ReturnType<typeof getAllParentsForFolder>>;

  try {
    // Počkáme na všechny Promisy paralelně místo sekvenčně - žádný dotaz nezávisí na výsledku jiného, takže čekáme jen na ten nejpomalejší.
    [folders, files, parents] = await Promise.all([
      GetFolders(parsedFolderId, session.userId),
      GetFiles(parsedFolderId, session.userId),
      getAllParentsForFolder(parsedFolderId, session.userId),
    ]);
  } catch (err) {
    console.log(err);
    return <FolderNotFoundScreen />;
  }

  const folderSizes = await GetFolderSizes(folders.map((folder) => folder.id));

  return (
    <DriveContent
      files={files}
      folders={folders}
      parents={parents}
      currentFolderId={parsedFolderId}
      folderSizes={folderSizes}
    />
  );
}
