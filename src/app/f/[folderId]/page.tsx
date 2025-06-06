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
  // I když tady TS server ukazuje, že folderId je typu number, tak typeof folderId je string
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
        <Link href="/f/1">
          <Button
            variant="ghost"
            className="mr-2 cursor-pointer border border-gray-50 text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            Go back
          </Button>
        </Link>
      </div>
    );
  }

  // 2. Počkáme na všechny Promisy, které získáme z funkcí, které je vrací
  // Toto zajistí, že získání folderů, souborů a parent-folderů proběhne paralelně,
  // což je rychlejší než čekat na každý dotaz zvlášť, taky to dává větší smysl
  const [folders, files, parents] = await Promise.all([
    GetFolders(parsedFolderId),
    GetFiles(parsedFolderId),
    getAllParentsForFolder(parsedFolderId),
  ]);

  // 3. Až všechny Promisy skončí, tak je renderujeme komponentu DriveContent
  return <DriveContent files={files} folders={folders} parents={parents} />;
}
