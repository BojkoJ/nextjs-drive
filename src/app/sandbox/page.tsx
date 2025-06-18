import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { mockFolders } from "~/lib/mock-data";
import { db } from "~/server/db";
import { folders_table } from "~/server/db/schema";

export default async function SandboxPage() {
  const user = await auth();

  if (!user.userId) {
    throw new Error("User not authenticated");
  }

  const folders = await db
    .select()
    .from(folders_table)
    .where(eq(folders_table.ownerId, user.userId));

  console.log(folders);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-gray-900 text-gray-50">
      Seed Function{" "}
      <form
        action={async () => {
          "use server";

          const user = await auth();

          if (!user.userId) {
            throw new Error("User not authenticated");
          }

          const rootFolder = await db
            .insert(folders_table)
            .values({
              name: "root",
              ownerId: user.userId,
              parent: null,
            })
            .$returningId();

          const insertableFolders = mockFolders.map((folder) => ({
            name: folder.name,
            ownerId: user.userId,
            parent: rootFolder[0]?.id,
          }));

          await db.insert(folders_table).values(insertableFolders);
        }}
      >
        <button
          type="submit"
          className="cursor-pointer rounded-lg border border-gray-50 px-4 py-2 transition-colors duration-200 hover:bg-gray-700"
        >
          Create Mock Folders
        </button>
      </form>
    </div>
  );
}
