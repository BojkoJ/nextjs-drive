"use client";

import Link, { useLinkStatus } from "next/link";
import { memo, useRef, useState } from "react";
import { motion } from "motion/react";

import { CheckIcon, GripVerticalIcon, PencilIcon, Trash2Icon, XIcon } from "lucide-react";
import type { files_table, folders_table } from "~/server/db/schema";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Spinner } from "./ui/spinner";
import { RenameFile, RenameFolder, type DragItemRef } from "~/server/actions";
import { useRename, type UseRenameReturn } from "~/hooks/use-rename";
import type { FolderDropTargetHandlers } from "~/hooks/use-drive-dnd";
import { FileTypeIcon } from "~/lib/file-icons";
import { formatFileSize } from "~/lib/format-size";
import { AnimatedFolderIcon } from "./animated-folder-icon";

// motion.li přetypovává onDragStart/onDragEnd pro svoje pointer-drag gesto (PanInfo), což zastiňuje nativní HTML5 DnD callbacky, které tu chceme.
// Tento cast je jen typový: bez `drag` propu motion tyto handlery beze změny předá jako obyčejné nativní ondragstart/ondragend DOM listenery.
function nativeDragHandler(
  handler: ((e: React.DragEvent) => void) | undefined,
) {
  return handler as unknown as
    | ((event: MouseEvent | TouchEvent | PointerEvent, info: unknown) => void)
    | undefined;
}

const LONG_NAME_THRESHOLD = 40;

// Nad tímto prahem by název jinak přetekl ze sloupce Name do Type (výška řádku je pevná, zalamování/růst řádku nejde).
// Místo toho ho omezíme na výšku zhruba jednoho řádku s vertikálním scrollbarem, takže celý název zůstává dostupný, jen odscrollovaný.
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
      onMouseDown={props.onMouseDown}
      onMouseUp={props.onMouseUp}
      // Nativní HTML5 drag-and-drop stejně nemá touch ekvivalent, takže handle (a místo pro něj vyhrazené) se zobrazuje až od sm+.
      className="text-muted-foreground hidden h-4 w-4 shrink-0 cursor-grab active:cursor-grabbing sm:block"
    />
  );
}

// Nativní `draggable` na řádku by dovolil zahájit drag odkudkoliv. Aby šlo táhnout jen za handle, řádek drží draggable=false, dokud handle nenahlásí mousedown,
// a zase ho vypne při dragend (proběhl skutečný drag) nebo mouseup přímo na handle (jen klik, žádný drag).
function useDragArmed() {
  const [dragArmed, setDragArmed] = useState(false);
  return {
    dragArmed,
    arm: () => setDragArmed(true),
    disarm: () => setDragArmed(false),
  };
}

function rowClassName(opts: {
  last: boolean;
  isDeleting: boolean;
  isDropTarget?: boolean;
}) {
  return [
    "hover:bg-accent/50 flex items-center gap-2 px-3 py-4 font-mono text-sm transition-opacity sm:gap-4 sm:px-6",
    opts.last ? "" : "border-border border-b",
    opts.isDeleting ? "pointer-events-none opacity-50" : "",
    opts.isDropTarget ? "bg-primary/10 ring-primary ring-2 ring-inset" : "",
  ].join(" ");
}

// Sdílený edit mód řádku: input + potvrzovací/zrušící tlačítka nad useRename. inputRef jde zvlášť (ne uvnitř rename objektu) kvůli react-hooks/refs pravidlu.
function RenameEditor({
  icon,
  rename,
  inputRef,
}: {
  icon: React.ReactNode;
  rename: UseRenameReturn;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="flex w-full items-center">
      {icon}
      <input
        ref={inputRef}
        type="text"
        value={rename.draft}
        onChange={(e) => rename.setDraft(e.target.value)}
        onKeyDown={rename.handleKeyDown}
        disabled={rename.isSaving}
        className="border-border bg-input text-foreground focus:border-primary w-2/3 border px-2 py-1 font-mono focus:outline-none disabled:opacity-50"
      />
      <div className="ml-2 flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={rename.save}
          disabled={rename.isSaving}
          className="hover:bg-primary/20 hover:text-primary h-6 w-6 cursor-pointer p-0"
        >
          {rename.isSaving ? (
            <Spinner className="h-3.5 w-3.5" />
          ) : (
            <CheckIcon className="h-3.5 w-3.5" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={rename.cancel}
          disabled={rename.isSaving}
          className="hover:bg-destructive/10 hover:text-destructive h-6 w-6 cursor-pointer p-0"
        >
          <XIcon className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

// Sdílená akční tlačítka řádku (tužka + koš).
function RowActions(props: {
  itemLabel: "file" | "folder";
  isDeleting: boolean;
  onRename: () => void;
  onDelete: () => void;
}) {
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={props.onRename}
        aria-label={`Rename ${props.itemLabel}`}
        className="hover:bg-primary/10 hover:text-primary cursor-pointer"
      >
        <PencilIcon className="h-4.5 w-4.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="hover:bg-destructive/10 hover:text-destructive cursor-pointer"
        onClick={props.onDelete}
        disabled={props.isDeleting}
        aria-label={`Delete ${props.itemLabel}`}
      >
        {props.isDeleting ? (
          <Spinner className="h-5 w-5" />
        ) : (
          <Trash2Icon className="h-5 w-5" />
        )}
      </Button>
    </>
  );
}

// memo(): řádek se překreslí jen když se změní jeho vlastní data/stav, ne při každé změně výběru či drag stavu jinde v seznamu.
// Všechny callback props proto musí být stabilní - berou identitu položky jako argument, místo aby ji rodič zavíral do inline closure.
//
// listIndex se v renderu nepoužívá - je tu jen proto, aby memo řádek překreslil, když se změní jeho pozice v seznamu.
// Motion `layout` (FLIP) animace přeuspořádání běží jen při re-renderu, takže bez tohoto propu by řádky po reorderu skočily na nové místo bez animace.
export const FileRow = memo(function FileRow(props: {
  file: typeof files_table.$inferSelect;
  listIndex: number;
  last?: boolean;
  isDeleting?: boolean;
  isSelected?: boolean;
  onToggleSelect: (item: DragItemRef) => void;
  onRequestDelete: (file: typeof files_table.$inferSelect) => void;
  draggable?: boolean;
  onDragStart: (e: React.DragEvent, item: DragItemRef) => void;
  onDragEnd: () => void;
}) {
  const { file, last = false, isDeleting = false } = props;
  const drag = useDragArmed();
  const inputRef = useRef<HTMLInputElement>(null);

  const rename = useRename({
    name: file.name,
    fallbackError: "Failed to rename file",
    action: (newName) => RenameFile(file.id, newName),
    inputRef,
  });

  const itemRef: DragItemRef = { id: file.id, type: "file" };

  return (
    <motion.li
      key={file.id}
      layout
      transition={{ type: "spring", stiffness: 500, damping: 40 }}
      draggable={props.draggable && drag.dragArmed}
      onDragStart={nativeDragHandler((e) => props.onDragStart(e, itemRef))}
      onDragEnd={nativeDragHandler(() => {
        drag.disarm();
        props.onDragEnd();
      })}
      className={rowClassName({ last, isDeleting })}
    >
      <Checkbox
        checked={!!props.isSelected}
        onCheckedChange={() => props.onToggleSelect(itemRef)}
        aria-label={`Select ${file.name}`}
      />
      <DragHandle onMouseDown={drag.arm} onMouseUp={drag.disarm} />
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:grid sm:grid-cols-12 sm:gap-4">
        <div className="flex min-w-0 flex-1 items-center sm:col-span-5">
          {rename.isEditMode ? (
            <RenameEditor
              rename={rename}
              inputRef={inputRef}
              icon={
                <FileTypeIcon
                  name={file.name}
                  className="mr-3 text-xl leading-none"
                />
              }
            />
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
              {/* Vykreslíme právě uložený lokální název, ne file.name prop - ten se aktualizuje až po doběhnutí refreshe na pozadí a jinak by na okamžik bleskl starý název. */}
              <ScrollableName name={rename.draft} />
            </Link>
          )}
        </div>
        <div className="text-muted-foreground hidden sm:col-span-3 sm:block">
          File
        </div>
        <div className="text-muted-foreground shrink-0 text-xs whitespace-nowrap sm:col-span-2 sm:text-sm">
          {formatFileSize(file.size)}
        </div>
        <div className="text-muted-foreground flex shrink-0 items-center sm:col-span-2">
          {!rename.isEditMode && (
            <RowActions
              itemLabel="file"
              isDeleting={isDeleting}
              onRename={() => rename.startEditing()}
              onDelete={() => props.onRequestDelete(file)}
            />
          )}
        </div>
      </div>
    </motion.li>
  );
});

function FolderLinkIcon(props: { isDropTarget?: boolean }) {
  const { pending } = useLinkStatus();
  return (
    <AnimatedFolderIcon
      isOpen={pending || !!props.isDropTarget}
      className="mr-3 shrink-0 text-xl leading-none"
    />
  );
}

// listIndex: viz komentář u FileRow - invaliduje memo při změně pozice, aby proběhla motion layout animace přeuspořádání.
export const FolderRow = memo(function FolderRow(props: {
  folder: typeof folders_table.$inferSelect;
  size: number;
  listIndex: number;
  last?: boolean;
  isEditing?: boolean;
  onEditComplete?: () => void;
  isDeleting?: boolean;
  isSelected?: boolean;
  onToggleSelect: (item: DragItemRef) => void;
  onRequestDelete: (folder: typeof folders_table.$inferSelect) => void;
  draggable?: boolean;
  onDragStart: (e: React.DragEvent, item: DragItemRef) => void;
  onDragEnd: () => void;
  isDropTarget?: boolean;
  dropTarget: FolderDropTargetHandlers;
}) {
  const { folder, last = false, isEditing = false, isDeleting = false } = props;
  const drag = useDragArmed();
  const inputRef = useRef<HTMLInputElement>(null);

  const rename = useRename({
    name: folder.name,
    initiallyEditing: isEditing,
    fallbackError: "Failed to rename folder",
    action: (newName) => RenameFolder(folder.id, newName),
    onEditComplete: props.onEditComplete,
    inputRef,
  });

  // Externě spuštěná editace (právě vytvořená složka): render-phase sync, ať se edit mód otevře bez čekání na efekt a input dostane serverový název.
  const [prevIsEditing, setPrevIsEditing] = useState(isEditing);
  if (isEditing !== prevIsEditing) {
    setPrevIsEditing(isEditing);
    if (isEditing) {
      rename.startEditing(true);
    }
  }

  const itemRef: DragItemRef = { id: folder.id, type: "folder" };

  return (
    <motion.li
      key={folder.id}
      layout
      transition={{ type: "spring", stiffness: 500, damping: 40 }}
      draggable={props.draggable && drag.dragArmed}
      onDragStart={nativeDragHandler((e) => props.onDragStart(e, itemRef))}
      onDragEnd={nativeDragHandler(() => {
        drag.disarm();
        props.onDragEnd();
      })}
      onDragOver={(e) => props.dropTarget.onDragOver(e, folder.id)}
      onDragLeave={() => props.dropTarget.onDragLeave(folder.id)}
      onDrop={(e) => props.dropTarget.onDrop(e, folder.id)}
      className={rowClassName({
        last,
        isDeleting,
        isDropTarget: props.isDropTarget,
      })}
    >
      <Checkbox
        checked={!!props.isSelected}
        onCheckedChange={() => props.onToggleSelect(itemRef)}
        aria-label={`Select ${folder.name}`}
      />
      <DragHandle onMouseDown={drag.arm} onMouseUp={drag.disarm} />
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:grid sm:grid-cols-12 sm:gap-4">
        <div className="flex min-w-0 flex-1 items-center sm:col-span-5">
          {rename.isEditMode ? (
            <RenameEditor
              rename={rename}
              inputRef={inputRef}
              icon={
                <AnimatedFolderIcon
                  isOpen
                  className="mr-3 text-xl leading-none"
                />
              }
            />
          ) : (
            <Link
              href={`/f/${folder.id}`}
              draggable={false}
              className="text-foreground hover:text-primary flex min-w-0 cursor-pointer items-center"
            >
              <FolderLinkIcon isDropTarget={props.isDropTarget} />
              {/* Vykreslíme právě uložený lokální název, ne folder.name prop - ten se aktualizuje až po doběhnutí refreshe na pozadí a jinak by na okamžik bleskl starý název. */}
              <ScrollableName name={rename.draft} />
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
          {!rename.isEditMode && (
            <RowActions
              itemLabel="folder"
              isDeleting={isDeleting}
              onRename={() => rename.startEditing()}
              onDelete={() => props.onRequestDelete(folder)}
            />
          )}
        </div>
      </div>
    </motion.li>
  );
});
