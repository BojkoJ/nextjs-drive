import { auth } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { z } from "zod";
import { createFile, getFolderById } from "~/server/db/mutations";

const f = createUploadthing();

// FileRouter pro naši aplikaci, může obsahovat více FileRoutes
export const ourFileRouter = {
  // Můžeme definovat libovolný počet FileRoutes, každou s unikátním routeSlug
  driveUploader: f({
    // f je helper pro vytvoření FileRoute
    blob: {
      /**
       * Pro kompletní seznam možností a výchozích hodnot, viz dokumentace File Route API
       * @see https://docs.uploadthing.com/file-routes#route-config
       */
      maxFileSize: "128MB",
      maxFileCount: 10,
    },
  })
    .input(
      z.object({
        folderId: z.number(),
      }),
    )
    // Nastavení oprávnění a typů souborů pro tuto FileRoute
    .middleware(async ({ input }) => {
      // middleware je funkce, která proběhně, než user zahájí upload

      // Tento kód běží na serveru před uploadem
      const user = await auth();

      // Pokud není uživatel přihlášen, vyhodíme chybu
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      if (!user.userId) throw new UploadThingError("Unauthorized");

      const folder = await getFolderById(input.folderId);

      // eslint-disable-next-line @typescript-eslint/only-throw-error
      if (!folder) throw new UploadThingError("Folder not found");

      if (folder.ownerId !== user.userId) {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw new UploadThingError("Unauthorized");
      }

      // Cokoliv je vráceno z middleware, bude dostupné v onUploadStart jako `metadata`
      return { userId: user.userId, parentId: input.folderId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // v onUploadComplete nelze volat auth(), protože onUploadComplete není voláno aplikací, ale Uploadthing serverem

      // Tento kód se spustí po úspěšném uploadu souboru
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.ufsUrl);

      await createFile({
        file: {
          name: file.name,
          size: file.size,
          url: file.ufsUrl,
          parent: metadata.parentId,
        },
        userId: metadata.userId,
      });

      // Cokoli, co je vráceno z onUploadComplete, bude dostupné na klientské straně v `onClientUploadComplete` callbacku
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
