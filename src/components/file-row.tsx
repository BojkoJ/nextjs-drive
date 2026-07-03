import Link, { useLinkStatus } from "next/link";
import { motion } from "motion/react";

import {
  CheckIcon,
  GripVerticalIcon,
  Loader2Icon,
  PencilIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import type { files_table, folders_table } from "~/server/db/schema";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { RenameFile, RenameFolder } from "~/server/actions";
import { useState, useEffect, useRef, useTransition } from "react";
import { toast } from "sonner";
import { FileTypeIcon } from "~/lib/file-icons";
import { formatFileSize } from "~/lib/format-size";
import { AnimatedFolderIcon } from "./animated-folder-icon";

// motion.li's types redefine onDragStart/onDragEnd for its own pointer-drag
// gesture (PanInfo-based), which shadows the native HTML5 DnD callback shape
// we actually want here. This cast is type-only: with no `drag` prop set on
// the element, motion forwards these straight through as plain native
// ondragstart/ondragend DOM listeners.
function nativeDragHandler(
  handler: ((e: React.DragEvent) => void) | undefined,
) {
  return handler as unknown as
    | ((event: MouseEvent | TouchEvent | PointerEvent, info: unknown) => void)
    | undefined;
}

// Native `draggable` on the row would let a drag start from anywhere on it.
// To restrict dragging to this handle, the row keeps draggable=false until
// this handle reports mousedown, and the row flips it back off on drag end
// (a real drag happened) or this handle's own mouseup (just a click, no drag).
const LONG_NAME_THRESHOLD = 40;

// Past the threshold, a name would otherwise spill past the Name column into
// Type (row height is fixed, so wrapping and growing the row isn't an
// option). Confines it to roughly one line's height with a vertical
// scrollbar instead, so the full name is still reachable, just scrolled to.
function ScrollableName(props: { name: string }) {
  const isLong = props.name.length > LONG_NAME_THRESHOLD;
  return (
    <span
      className={
        isLong
          ? "max-h-5 min-w-0 overflow-y-auto align-middle break-all whitespace-normal"
          : "min-w-0 truncate"
      }
    >
      {props.name}
    </span>
  );
}

function DragHandle(props: {
  onMouseDown?: () => void;
  onMouseUp?: () => void;
}) {
  return (
    <GripVerticalIcon
      aria-hidden
      size={16}
      onMouseDown={props.onMouseDown}
      onMouseUp={props.onMouseUp}
      // Native HTML5 drag-and-drop has no touch equivalent anyway, so the
      // handle (and the width reserved for it) only shows up at sm+.
      className="text-muted-foreground hidden shrink-0 cursor-grab active:cursor-grabbing sm:block"
    />
  );
}

export function FileRow(props: {
  file: typeof files_table.$inferSelect;
  last?: boolean;
  isDeleting?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  onRequestDelete: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}) {
  const { file, last = false, isDeleting = false } = props;
  const [isEditMode, setIsEditMode] = useState(false);
  const [fileName, setFileName] = useState(file.name);
  const [isSaving, startSaveTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragArmed, setDragArmed] = useState(false);

  // Keep the displayed name in sync with genuinely external changes, but
  // never while the user has this row open for editing (see FolderRow).
  const [prevFileNameProp, setPrevFileNameProp] = useState(file.name);
  if (file.name !== prevFileNameProp) {
    setPrevFileNameProp(file.name);
    if (!isEditMode) {
      setFileName(file.name);
    }
  }

  useEffect(() => {
    if (isEditMode && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditMode]);

  const handleSave = () => {
    if (fileName.trim() === "") {
      setFileName(file.name);
      return;
    }

    startSaveTransition(async () => {
      try {
        const result = await RenameFile(file.id, fileName.trim());
        if (result.error) {
          toast.error(result.error);
          setFileName(file.name);
        }
      } catch {
        toast.error("Failed to rename file");
        setFileName(file.name);
      }

      setIsEditMode(false);
    });
  };

  const handleCancel = () => {
    setFileName(file.name);
    setIsEditMode(false);
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <motion.li
      key={file.id}
      layout
      transition={{ type: "spring", stiffness: 500, damping: 40 }}
      draggable={props.draggable && dragArmed}
      onDragStart={nativeDragHandler(props.onDragStart)}
      onDragEnd={nativeDragHandler((e) => {
        setDragArmed(false);
        props.onDragEnd?.(e);
      })}
      className={`hover:bg-accent/50 flex items-center gap-2 px-3 py-4 font-mono text-sm transition-opacity sm:gap-4 sm:px-6 ${last ? "" : "border-border border-b"} ${isDeleting ? "pointer-events-none opacity-50" : ""}`}
    >
      <Checkbox
        checked={!!props.isSelected}
        onCheckedChange={() => props.onToggleSelect?.()}
        aria-label={`Select ${file.name}`}
      />
      <DragHandle
        onMouseDown={() => setDragArmed(true)}
        onMouseUp={() => setDragArmed(false)}
      />
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:grid sm:grid-cols-12 sm:gap-4">
        <div className="flex min-w-0 flex-1 items-center sm:col-span-5">
          {isEditMode ? (
            <div className="flex w-full items-center">
              <FileTypeIcon
                name={file.name}
                className="mr-3 text-xl leading-none"
              />
              <input
                ref={inputRef}
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSaving}
                className="border-border bg-input text-foreground focus:border-primary w-2/3 border px-2 py-1 font-mono focus:outline-none disabled:opacity-50"
              />
              <div className="ml-2 flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="hover:bg-primary/20 hover:text-primary h-6 w-6 cursor-pointer p-0"
                >
                  {isSaving ? (
                    <Loader2Icon size={14} className="animate-spin" />
                  ) : (
                    <CheckIcon size={14} />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="hover:bg-destructive/10 hover:text-destructive h-6 w-6 cursor-pointer p-0"
                >
                  <XIcon size={14} />
                </Button>
              </div>
            </div>
          ) : (
            <Link
              href={`/file/${file.id}`}
              draggable={false}
              className="text-foreground hover:text-primary flex min-w-0 items-center"
            >
              <FileTypeIcon
                name={file.name}
                className="mr-3 shrink-0 text-xl leading-none"
              />
              {/* Render the just-saved local name, not the file.name prop:
                  the prop only updates once the background refresh lands,
                  which would otherwise flash the pre-rename name for a beat. */}
              <ScrollableName name={fileName} />
            </Link>
          )}
        </div>
        <div className="text-muted-foreground hidden sm:col-span-3 sm:block">
          {"File"}
        </div>
        <div className="text-muted-foreground shrink-0 text-xs whitespace-nowrap sm:col-span-2 sm:text-sm">
          {formatFileSize(file.size)}
        </div>
        <div className="text-muted-foreground flex shrink-0 items-center sm:col-span-2">
          {!isEditMode && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditMode(true)}
                aria-label="Rename file"
                className="hover:bg-primary/10 hover:text-primary cursor-pointer"
              >
                <PencilIcon size={18} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                onClick={props.onRequestDelete}
                disabled={isDeleting}
                aria-label="Delete file"
              >
                {isDeleting ? (
                  <Loader2Icon size={20} className="animate-spin" />
                ) : (
                  <Trash2Icon size={20} />
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.li>
  );
}

function FolderLinkIcon(props: { isDropTarget?: boolean }) {
  const { pending } = useLinkStatus();
  return (
    <AnimatedFolderIcon
      isOpen={pending || !!props.isDropTarget}
      className="mr-3 shrink-0 text-xl leading-none"
    />
  );
}

export function FolderRow(props: {
  folder: typeof folders_table.$inferSelect;
  size: number;
  last?: boolean;
  isEditing?: boolean;
  onEditComplete?: () => void;
  isDeleting?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  onRequestDelete: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  isDropTarget?: boolean;
}) {
  const {
    folder,
    last = false,
    isEditing = false,
    onEditComplete,
    isDeleting = false,
  } = props;
  const [isEditMode, setIsEditMode] = useState(isEditing);
  const [folderName, setFolderName] = useState(folder.name);
  const [isSaving, startSaveTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragArmed, setDragArmed] = useState(false);

  const [prevIsEditing, setPrevIsEditing] = useState(isEditing);
  if (isEditing !== prevIsEditing) {
    setPrevIsEditing(isEditing);
    if (isEditing) {
      setIsEditMode(true);
      setFolderName(folder.name);
    }
  }

  // Keep the displayed name in sync with genuinely external changes (e.g. a
  // refresh from another tab), but never while the user has this row open
  // for editing, since that would stomp on what they're currently typing.
  const [prevFolderNameProp, setPrevFolderNameProp] = useState(folder.name);
  if (folder.name !== prevFolderNameProp) {
    setPrevFolderNameProp(folder.name);
    if (!isEditMode) {
      setFolderName(folder.name);
    }
  }

  useEffect(() => {
    if (isEditMode && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditMode]);

  const handleSave = () => {
    if (folderName.trim() === "") {
      setFolderName(folder.name);
      return;
    }

    startSaveTransition(async () => {
      try {
        const result = await RenameFolder(folder.id, folderName.trim());
        if (result.error) {
          toast.error(result.error);
          setFolderName(folder.name);
        }
      } catch {
        toast.error("Failed to rename folder");
        setFolderName(folder.name);
      }

      setIsEditMode(false);
      onEditComplete?.();
    });
  };

  const handleCancel = () => {
    setFolderName(folder.name);
    setIsEditMode(false);
    onEditComplete?.();
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <motion.li
      key={folder.id}
      layout
      transition={{ type: "spring", stiffness: 500, damping: 40 }}
      draggable={props.draggable && dragArmed}
      onDragStart={nativeDragHandler(props.onDragStart)}
      onDragEnd={nativeDragHandler((e) => {
        setDragArmed(false);
        props.onDragEnd?.(e);
      })}
      onDragOver={props.onDragOver}
      onDragLeave={props.onDragLeave}
      onDrop={props.onDrop}
      className={`hover:bg-accent/50 flex items-center gap-2 px-3 py-4 font-mono text-sm transition-opacity sm:gap-4 sm:px-6 ${last ? "" : "border-border border-b"} ${isDeleting ? "pointer-events-none opacity-50" : ""} ${props.isDropTarget ? "bg-primary/10 ring-primary ring-2 ring-inset" : ""}`}
    >
      <Checkbox
        checked={!!props.isSelected}
        onCheckedChange={() => props.onToggleSelect?.()}
        aria-label={`Select ${folder.name}`}
      />
      <DragHandle
        onMouseDown={() => setDragArmed(true)}
        onMouseUp={() => setDragArmed(false)}
      />
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:grid sm:grid-cols-12 sm:gap-4">
        <div className="flex min-w-0 flex-1 items-center sm:col-span-5">
          {isEditMode ? (
            <div className="flex w-full items-center">
              <AnimatedFolderIcon
                isOpen
                className="mr-3 text-xl leading-none"
              />
              <input
                ref={inputRef}
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSaving}
                className="border-border bg-input text-foreground focus:border-primary w-2/3 border px-2 py-1 font-mono focus:outline-none disabled:opacity-50"
              />
              <div className="ml-2 flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="hover:bg-primary/20 hover:text-primary h-6 w-6 cursor-pointer p-0"
                >
                  {isSaving ? (
                    <Loader2Icon size={14} className="animate-spin" />
                  ) : (
                    <CheckIcon size={14} />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="hover:bg-destructive/10 hover:text-destructive h-6 w-6 cursor-pointer p-0"
                >
                  <XIcon size={14} />
                </Button>
              </div>
            </div>
          ) : (
            <Link
              href={`/f/${folder.id}`}
              draggable={false}
              className="text-foreground hover:text-primary flex min-w-0 cursor-pointer items-center"
            >
              <FolderLinkIcon isDropTarget={props.isDropTarget} />
              {/* Render the just-saved local name, not the folder.name prop:
                  the prop only updates once the background refresh lands,
                  which would otherwise flash the pre-rename name for a beat. */}
              <ScrollableName name={folderName} />
            </Link>
          )}
        </div>
        <div className="text-muted-foreground hidden sm:col-span-3 sm:block">
          Folder
        </div>
        <div className="text-muted-foreground shrink-0 text-xs whitespace-nowrap sm:col-span-2 sm:text-sm">
          {formatFileSize(props.size)}
        </div>
        <div className="text-muted-foreground flex shrink-0 items-center sm:col-span-2">
          {!isEditMode && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditMode(true)}
                aria-label="Rename folder"
                className="hover:bg-primary/10 hover:text-primary cursor-pointer"
              >
                <PencilIcon size={18} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                onClick={props.onRequestDelete}
                disabled={isDeleting}
                aria-label="Delete folder"
              >
                {isDeleting ? (
                  <Loader2Icon size={20} className="animate-spin" />
                ) : (
                  <Trash2Icon size={20} />
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.li>
  );
}
