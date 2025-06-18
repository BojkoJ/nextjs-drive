import Link from "next/link";

import { FileIcon, Folder as FolderIcon, Trash2Icon } from "lucide-react";
import type { files_table, folders_table } from "~/server/db/schema";
import { Button } from "./ui/button";
import { deleteFile } from "~/server/actions";

export function FileRow(props: { file: typeof files_table.$inferSelect }) {
  const { file } = props;

  return (
    <li
      key={file.id}
      className="hover:bg-neutral-750 border-b border-neutral-700 px-6 py-4"
    >
      <div className="grid grid-cols-12 items-center gap-4">
        <div className="col-span-6 flex items-center">
          <Link
            href={file.url}
            className="flex items-center text-gray-100 hover:text-neutral-500"
            target="_blank" // Otevře v novém tabu - vhodné pro drive klon - když klikneme na file tak je vhodné aby se otevřel v novém tabu
          >
            <FileIcon className="mr-3" size={20} />
            {file.name}
          </Link>
        </div>
        <div className="col-span-3 text-gray-400">{"file"}</div>
        <div className="col-span-2 text-gray-400">{file.size}</div>
        <div className="col-span-1 text-gray-400">
          <Button
            variant="ghost"
            className="cursor-pointer hover:bg-neutral-600"
            onClick={() => deleteFile(file.id)}
            aria-label="Delete file"
          >
            <Trash2Icon size={25} />
          </Button>
        </div>
      </div>
    </li>
  );
}

export function FolderRow(props: {
  folder: typeof folders_table.$inferSelect;
}) {
  const { folder } = props;

  return (
    <li
      key={folder.id}
      className="hover:bg-neutral-750 border-b border-gray-700 px-6 py-4"
    >
      <div className="grid grid-cols-12 items-center gap-4">
        <div className="col-span-6 flex items-center">
          <Link
            href={`/f/${folder.id}`}
            className="flex cursor-pointer items-center text-gray-100 hover:text-neutral-500"
          >
            <FolderIcon className="mr-3" size={20} />
            {folder.name}
          </Link>
        </div>
        <div className="col-span-3 text-gray-400">Folder</div>
        <div className="col-span-3 text-gray-400"></div>
      </div>
    </li>
  );
}
