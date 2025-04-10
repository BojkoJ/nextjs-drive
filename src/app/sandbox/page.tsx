import { db } from "~/server/db";
import { mockFolders, mockFiles } from "~/lib/mock-data";
import { files, folders } from "~/server/db/schema";

export default function SandboxPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-gray-900 text-gray-50">
      Seed Function{" "}
      <form
        action={async () => {
          "use server"; // This is a Next.js server action, happens only on server, even if called from client

          const folderInsert = await db.insert(folders).values(
            mockFolders.map((folder, index) => ({
              id: index + 1,
              name: folder.name,
              parent: index !== 0 ? 1 : null,
            })),
          );

          const fileInsert = await db.insert(files).values(
            mockFiles.map((file, index) => ({
              id: index + 1,
              name: file.name,
              size: 5000,
              url: file.url,
              parent: (index % 3) + 1,
            })),
          );

          console.log("Inserted folders: ", folderInsert);
          console.log("Inserted files: ", fileInsert);
        }}
      >
        <button
          type="submit"
          className="cursor-pointer rounded-lg border border-gray-50 px-4 py-2 transition-colors duration-200 hover:bg-gray-700"
        >
          Seed
        </button>
      </form>
    </div>
  );
}
