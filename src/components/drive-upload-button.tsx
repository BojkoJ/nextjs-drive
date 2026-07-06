"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UploadButton } from "./uploadthing";
import { isCodeFile } from "~/lib/file-icons";

// Prohlížeče přiřazují zdrojovým souborům podle přípony konkrétní "script" MIME typy (.py -> text/x-python, .sh -> application/x-sh, .js -> text/javascript atd.).
// UploadThing na vstupu zřejmě odmítá uploady, jejichž Content-Type vypadá jako skript, zatímco nerozpoznaný typ (např. .go) proklouzne bez problému.
function normalizeCodeFileType(file: File): File {
  if (isCodeFile(file.name) && file.type !== "text/plain") {
    return new File([file], file.name, {
      type: "text/plain",
      lastModified: file.lastModified,
    });
  }
  return file;
}

// Nastylovaný UploadThing button pro nahrávání do konkrétní složky, včetně toastů a refreshe po dokončení. Plně samostatný - potřebuje jen id složky.
export function DriveUploadButton(props: { folderId: number }) {
  const router = useRouter();

  return (
    <UploadButton
      endpoint="driveUploader"
      onBeforeUploadBegin={(files) => files.map(normalizeCodeFileType)}
      appearance={{
        container: "!w-max flex-row items-center gap-3",
        button:
          "!cursor-pointer !rounded-none !border-2 !border-primary !bg-transparent !px-6 !py-2.5 !text-xs !font-bold !tracking-wide !text-primary !uppercase !shadow-none after:!bg-primary hover:!bg-primary hover:!text-primary-foreground ut-uploading:!cursor-wait ut-uploading:!bg-primary/20 ut-readying:!cursor-wait focus-within:!ring-2 focus-within:!ring-ring focus-within:!ring-offset-0",
        allowedContent: "!font-mono !text-xs !text-muted-foreground",
      }}
      content={{
        button: ({ ready, isUploading }) => {
          if (isUploading) return "Uploading...";
          if (ready) return "Choose file(s)";
          return "Loading...";
        },
      }}
      onClientUploadComplete={(res) => {
        const names = res.map((f) => f.name).join(", ");
        toast.success(`Uploaded ${names}`);
        router.refresh();
      }}
      onUploadError={(error) => {
        toast.error(`Upload failed: ${error.message}`);
      }}
      input={{ folderId: props.folderId }}
    />
  );
}
