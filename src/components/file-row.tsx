import Link from "next/link";

import {
  FileIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  FileVideoIcon,
  FolderArchiveIcon,
  Folder as FolderIcon,
  ImageIcon,
  MusicIcon,
  PresentationIcon,
  Trash2Icon,
  CheckIcon,
  XIcon,
} from "lucide-react";
import type { files_table, folders_table } from "~/server/db/schema";
import { Button } from "./ui/button";
import { DeleteFile, RenameFolder } from "~/server/actions";
import { useState, useEffect, useRef } from "react";

export function FileRow(props: {
  file: typeof files_table.$inferSelect;
  last?: boolean;
}) {
  const { file, last = false } = props;

  return (
    <li
      key={file.id}
      className={`px-6 py-4 font-mono text-sm hover:bg-accent/50 ${last ? "" : "border-b border-border"}`}
    >
      <div className="grid grid-cols-12 items-center gap-4">
        <div className="col-span-6 flex items-center">
          <Link
            href={file.url}
            className="flex items-center text-foreground hover:text-primary"
            target="_blank" // Otevře v novém tabu - vhodné pro drive klon - když klikneme na file tak je vhodné aby se otevřel v novém tabu
          >
            {file.name.includes(".png") ||
            file.name.includes(".jpg") ||
            file.name.includes(".jpeg") ||
            file.name.includes(".gif") ||
            file.name.includes(".webp") ? (
              <ImageIcon className="mr-3 text-primary" size={20} />
            ) : file.name.includes(".ppt") || file.name.includes(".pptx") ? (
              <PresentationIcon className="mr-3 text-primary" size={20} />
            ) : file.name.includes(".xls") || file.name.includes(".xlsx") ? (
              <FileSpreadsheetIcon className="mr-3 text-primary" size={20} />
            ) : file.name.includes(".txt") ||
              file.name.includes(".doc") ||
              file.name.includes(".docx") ||
              file.name.includes(".pdf") ? (
              <FileTextIcon className="mr-3 text-primary" size={20} />
            ) : file.name.includes(".zip") ||
              file.name.includes(".rar") ||
              file.name.includes(".7z") ? (
              <FolderArchiveIcon className="mr-3 text-primary" size={20} />
            ) : file.name.includes(".mp4") ||
              file.name.includes(".avi") ||
              file.name.includes(".mov") ||
              file.name.includes(".mkv") ? (
              <FileVideoIcon className="mr-3 text-primary" size={20} />
            ) : file.name.includes(".mp3") ||
              file.name.includes(".wav") ||
              file.name.includes(".flac") ? (
              <MusicIcon className="mr-3 text-primary" size={20} />
            ) : (
              <FileIcon className="mr-3 text-primary" size={20} />
            )}
            {file.name}
          </Link>
        </div>
        <div className="col-span-3 text-muted-foreground">{"File"}</div>
        <div className="col-span-2 text-muted-foreground">
          {Math.ceil(file.size / 1024)} KB
        </div>
        <div className="col-span-1 text-muted-foreground">
          <Button
            variant="ghost"
            className="cursor-pointer hover:bg-destructive/10 hover:text-destructive"
            onClick={() => DeleteFile(file.id)}
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
  last?: boolean;
  isEditing?: boolean;
  onEditComplete?: () => void;
}) {
  const { folder, last = false, isEditing = false, onEditComplete } = props;
  const [isEditMode, setIsEditMode] = useState(isEditing);
  const [folderName, setFolderName] = useState(folder.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const [prevIsEditing, setPrevIsEditing] = useState(isEditing);
  const [prevFolderNameProp, setPrevFolderNameProp] = useState(folder.name);
  if (isEditing !== prevIsEditing || folder.name !== prevFolderNameProp) {
    setPrevIsEditing(isEditing);
    setPrevFolderNameProp(folder.name);
    if (isEditing) {
      setIsEditMode(true);
      setFolderName(folder.name);
    }
  }

  useEffect(() => {
    if (isEditMode && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditMode]);

  const handleSave = async () => {
    if (folderName.trim() === "") {
      setFolderName(folder.name);
      return;
    }

    try {
      const result = await RenameFolder(folder.id, folderName.trim());
      if (result.error) {
        console.error("Failed to rename folder:", result.error);
        setFolderName(folder.name); // Revert to original name
      }
    } catch (error) {
      console.error("Error renaming folder:", error);
      setFolderName(folder.name); // Revert to original name
    }

    setIsEditMode(false);
    onEditComplete?.();
  };

  const handleCancel = () => {
    setFolderName(folder.name);
    setIsEditMode(false);
    onEditComplete?.();
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      void handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <li
      key={folder.id}
      className={`px-6 py-4 font-mono text-sm hover:bg-accent/50 ${last ? "" : "border-b border-border"}`}
    >
      <div className="grid grid-cols-12 items-center gap-4">
        <div className="col-span-6 flex items-center">
          {isEditMode ? (
            <div className="flex w-full items-center">
              <FolderIcon className="mr-3 text-amber-400" size={20} />
              <input
                ref={inputRef}
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-2/3 border border-border bg-input px-2 py-1 font-mono text-foreground focus:border-primary focus:outline-none"
              />
              <div className="ml-2 flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void handleSave()}
                  className="h-6 w-6 cursor-pointer p-0 hover:bg-primary/20 hover:text-primary"
                >
                  <CheckIcon size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  className="h-6 w-6 cursor-pointer p-0 hover:bg-destructive/10 hover:text-destructive"
                >
                  <XIcon size={14} />
                </Button>
              </div>
            </div>
          ) : (
            <Link
              href={`/f/${folder.id}`}
              className="flex cursor-pointer items-center text-foreground hover:text-primary"
            >
              <FolderIcon className="mr-3 text-amber-400" size={20} />
              {folder.name}
            </Link>
          )}
        </div>
        <div className="col-span-3 text-muted-foreground">Folder</div>
        <div className="col-span-3 text-muted-foreground"></div>
      </div>
    </li>
  );
}
