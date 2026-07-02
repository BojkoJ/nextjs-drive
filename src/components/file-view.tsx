"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import {
  CheckIcon,
  ChevronLeft,
  CopyIcon,
  Loader2Icon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { ConfirmDialog } from "~/components/confirm-dialog";
import { FilePreview } from "~/components/file-preview";
import { PendingLinkLabel } from "~/components/pending-link-label";
import { formatFileSize } from "~/lib/format-size";
import { DeleteFile, RenameFile } from "~/server/actions";
import type { files_table } from "~/server/db/schema";

export function FileView(props: { file: typeof files_table.$inferSelect }) {
  const { file } = props;
  const router = useRouter();

  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(file.name);
  const [isSaving, startSaveTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [justCopied, setJustCopied] = useState(false);

  useEffect(() => {
    if (!justCopied) return;
    const timer = setTimeout(() => setJustCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [justCopied]);

  const handleSaveName = () => {
    if (name.trim() === "" || name.trim() === file.name) {
      setName(file.name);
      setIsEditingName(false);
      return;
    }

    startSaveTransition(async () => {
      const result = await RenameFile(file.id, name.trim());
      if (result.error) {
        toast.error(result.error);
        setName(file.name);
      }
      setIsEditingName(false);
    });
  };

  const handleDelete = () => {
    startDeleteTransition(async () => {
      const result = await DeleteFile(file.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`"${file.name}" deleted`);
        router.push(`/f/${file.parent}`);
      }
      setShowDeleteConfirm(false);
    });
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(file.url);
    setJustCopied(true);
  };

  return (
    <div className="bg-background text-foreground min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href={`/f/${file.parent}`}
          className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1 font-mono text-sm"
        >
          <PendingLinkLabel>
            <ChevronLeft className="h-4 w-4" />
            Back to folder
          </PendingLinkLabel>
        </Link>

        <ConfirmDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
          title="Delete file"
          description={`Delete "${file.name}"? This cannot be undone.`}
          isConfirming={isDeleting}
          onConfirm={handleDelete}
        />

        <div className="relative">
          {/*<div className="border-primary/30 bg-primary/5 absolute inset-0 translate-x-2 translate-y-2 -rotate-1 border" />*/}
          <div className="border-border bg-card relative border p-8">
            <div className="mb-8">
              <FilePreview name={file.name} url={file.url} />
            </div>

            <div className="mb-6 flex items-center gap-2">
              {isEditingName ? (
                <>
                  <input
                    autoFocus
                    type="text"
                    value={name}
                    disabled={isSaving}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveName();
                      if (e.key === "Escape") {
                        setName(file.name);
                        setIsEditingName(false);
                      }
                    }}
                    className="border-border bg-input text-foreground focus:border-primary w-full max-w-md border px-2 py-1 font-mono text-xl focus:outline-none disabled:opacity-50"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSaveName}
                    disabled={isSaving}
                    className="hover:bg-primary/20 hover:text-primary h-8 w-8 cursor-pointer p-0"
                  >
                    {isSaving ? (
                      <Loader2Icon size={16} className="animate-spin" />
                    ) : (
                      <CheckIcon size={16} />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setName(file.name);
                      setIsEditingName(false);
                    }}
                    disabled={isSaving}
                    className="hover:bg-destructive/10 hover:text-destructive h-8 w-8 cursor-pointer p-0"
                  >
                    <XIcon size={16} />
                  </Button>
                </>
              ) : (
                <h1
                  onClick={() => setIsEditingName(true)}
                  className="text-foreground hover:text-primary cursor-pointer font-mono text-xl font-bold break-all"
                  title="Click to rename"
                >
                  {file.name}
                </h1>
              )}
            </div>

            <dl className="text-muted-foreground mb-8 grid grid-cols-2 gap-4 font-mono text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs tracking-widest uppercase">Size</dt>
                <dd className="text-foreground mt-1">
                  {formatFileSize(file.size)}
                </dd>
              </div>
              <div>
                <dt className="text-xs tracking-widest uppercase">Uploaded</dt>
                <dd className="text-foreground mt-1">
                  {new Date(file.created_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </dd>
              </div>
            </dl>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={handleCopyLink}
                className="relative cursor-pointer overflow-hidden rounded-none border-2 text-xs font-bold tracking-wide uppercase"
              >
                {/* Invisible reference reserves the button's width so it
                    never resizes when the animated label below swaps text. */}
                <span className="invisible inline-flex items-center gap-2">
                  <CopyIcon size={16} />
                  Copy link
                </span>
                <AnimatePresence initial={false}>
                  <motion.span
                    key={justCopied ? "copied" : "copy"}
                    initial={{ y: 14, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -14, opacity: 0 }}
                    transition={{ duration: 0.22, ease: "easeInOut" }}
                    className="absolute inset-0 flex items-center justify-center gap-2"
                  >
                    {justCopied ? (
                      <CheckIcon size={16} />
                    ) : (
                      <CopyIcon size={16} />
                    )}
                    {justCopied ? "Copied!" : "Copy link"}
                  </motion.span>
                </AnimatePresence>
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className="border-destructive text-destructive hover:bg-destructive cursor-pointer gap-2 rounded-none border-2 text-xs font-bold tracking-wide uppercase hover:text-white"
              >
                {isDeleting ? (
                  <Loader2Icon size={16} className="animate-spin" />
                ) : (
                  <Trash2Icon size={16} />
                )}
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
