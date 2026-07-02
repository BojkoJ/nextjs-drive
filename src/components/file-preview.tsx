"use client";

import "react-h5-audio-player/lib/styles.css";
import AudioPlayer from "react-h5-audio-player";
import { DocumentViewer } from "~/components/document-viewer";
import { CodePreview } from "~/components/code-preview";
import {
  FileTypeIcon,
  isAudioFile,
  isCodeFile,
  isDocViewerFile,
  isImageFile,
  isPdfFile,
  isVideoFile,
} from "~/lib/file-icons";

export function FilePreview(props: { name: string; url: string }) {
  const { name, url } = props;

  if (isImageFile(name)) {
    return (
      <div className="flex w-full items-center justify-center border border-border bg-background p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={name}
          className="max-h-[70vh] w-auto max-w-full object-contain"
        />
      </div>
    );
  }

  if (isVideoFile(name)) {
    return (
      <div className="flex w-full items-center justify-center border border-border bg-black">
        <video src={url} controls className="max-h-[70vh] w-full">
          <track kind="captions" />
        </video>
      </div>
    );
  }

  if (isAudioFile(name)) {
    return (
      <div className="w-full border border-border bg-background p-6">
        <AudioPlayer
          src={url}
          showJumpControls={false}
          layout="stacked-reverse"
          customAdditionalControls={[]}
        />
      </div>
    );
  }

  if (isCodeFile(name)) {
    return <CodePreview name={name} url={url} />;
  }

  if (isPdfFile(name)) {
    return (
      <div className="h-[70vh] w-full border border-border bg-background">
        <embed src={url} type="application/pdf" className="h-full w-full" />
      </div>
    );
  }

  if (isDocViewerFile(name)) {
    return (
      <div className="h-[70vh] w-full border border-border bg-background">
        <DocumentViewer url={url} fileName={name} />
      </div>
    );
  }

  return (
    <div className="flex h-56 w-full items-center justify-center border border-border bg-background">
      <FileTypeIcon name={name} className="text-8xl" />
    </div>
  );
}
