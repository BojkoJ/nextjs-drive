import Link from "next/link";
import DriveContent from "~/components/drive-content";

import { Button } from "~/components/ui/button";
import {
  getAllParentsForFolder,
  GetFiles,
  GetFolders,
} from "~/server/db/queries";

export default async function GoogleDriveClone(props: {
  params: Promise<{ folderId: string }>;
}) {
  const params = await props.params;

  // Zajistíme, že folderId je číslo, jinak vrátíme error page
  const parsedFolderId = parseInt(params.folderId);
  if (isNaN(parsedFolderId)) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-y-5 bg-gray-900 text-gray-50">
        <p>
          <span className="font-semibold italic">Oooops... </span> You&apos;re
          looking for a folder that doesn&apos;t exist or has been deleted.
        </p>
        <Link href="/">
          <Button
            variant="ghost"
            className="mr-2 cursor-pointer border border-gray-50 text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            Go back to Home
          </Button>
        </Link>
      </div>
    );
  }

  try {
    // 2. Počkáme na všechny Promisy, které získáme z funkcí, které je vrací
    // Toto zajistí, že získání folderů, souborů a parent-folderů proběhne paralelně,
    // což je rychlejší než čekat na každý dotaz zvlášť, taky to dává větší smysl
    const [folders, files, parents] = await Promise.all([
      GetFolders(parsedFolderId),
      GetFiles(parsedFolderId),
      getAllParentsForFolder(parsedFolderId),
    ]);

    // 3. Až všechny Promisy skončí, tak renderujeme komponentu DriveContent
    return (
      <DriveContent
        files={files}
        folders={folders}
        parents={parents}
        currentFolderId={parsedFolderId}
      />
    );
  } catch (err) {
    console.log(err);
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-y-5 bg-gray-900 text-gray-50">
        <p>
          <span className="font-semibold italic">Oooops... </span> You&apos;re
          looking for a folder that doesn&apos;t exist or has been deleted.
        </p>
        <Link href="/">
          <Button
            variant="ghost"
            className="mr-2 cursor-pointer border border-gray-50 text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            Go back to Home
          </Button>
        </Link>
      </div>
    );
  }
}
