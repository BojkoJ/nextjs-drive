import { CodeXmlIcon } from "lucide-react";

export const FOLDER_EMOJI = "\u{1F4C1}"; // 📁
export const FOLDER_OPEN_EMOJI = "\u{1F4C2}"; // 📂

const EXTENSION_EMOJI: Record<string, string> = {
  png: "\u{1F5BC}\u{FE0F}", // 🖼️
  jpg: "\u{1F5BC}\u{FE0F}",
  jpeg: "\u{1F5BC}\u{FE0F}",
  gif: "\u{1F5BC}\u{FE0F}",
  webp: "\u{1F5BC}\u{FE0F}",
  ppt: "\u{1F4FD}\u{FE0F}", // 📽️
  pptx: "\u{1F4FD}\u{FE0F}",
  xls: "\u{1F4CA}", // 📊
  xlsx: "\u{1F4CA}",
  txt: "\u{1F4C4}", // 📄
  doc: "\u{1F4C4}",
  docx: "\u{1F4C4}",
  pdf: "\u{1F4C4}",
  zip: "\u{1F4E6}", // 📦
  rar: "\u{1F4E6}",
  "7z": "\u{1F4E6}",
  mp4: "\u{1F3AC}", // 🎬
  avi: "\u{1F3AC}",
  mov: "\u{1F3AC}",
  mkv: "\u{1F3AC}",
  mp3: "\u{1F3B5}", // 🎵
  wav: "\u{1F3B5}",
  flac: "\u{1F3B5}",
};

const FALLBACK_EMOJI = "\u{1F4C3}"; // 📃

const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp"];
const VIDEO_EXTENSIONS = ["mp4", "avi", "mov", "mkv"];
const AUDIO_EXTENSIONS = ["mp3", "wav", "flac"];
const PDF_EXTENSIONS = ["pdf"];
// Handled by @iamjariwala/react-doc-viewer; docx renders inline, the rest
// (doc/ppt/pptx/xls/xlsx/odt) render as download cards, csv/txt/rtf/html/md
// get their own inline renderers. PDF stays on the browser-native <embed>.
const DOC_VIEWER_EXTENSIONS = [
  "doc",
  "docx",
  "ppt",
  "pptx",
  "xls",
  "xlsx",
  "odt",
  "csv",
  "txt",
  "rtf",
  "html",
  "htm",
  "md",
];

// Maps an extension to the Prism language identifier react-syntax-highlighter
// expects (see AVAILABLE_LANGUAGES_PRISM.MD in that package).
const CODE_EXTENSION_LANGUAGE: Record<string, string> = {
  ts: "typescript",
  tsx: "tsx",
  js: "javascript",
  jsx: "jsx",
  mjs: "javascript",
  cjs: "javascript",
  yaml: "yaml",
  yml: "yaml",
  toml: "toml",
  rs: "rust",
  go: "go",
  zig: "zig",
  cpp: "cpp",
  cc: "cpp",
  cxx: "cpp",
  h: "c",
  hpp: "cpp",
  c: "c",
  cs: "csharp",
  java: "java",
  kt: "kotlin",
  kts: "kotlin",
  py: "python",
  rb: "ruby",
  php: "php",
  swift: "swift",
  sh: "bash",
  json: "json",
  sql: "sql",
};

function getExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase();
}

export function getFileEmoji(fileName: string) {
  const extension = getExtension(fileName);
  if (!extension) return FALLBACK_EMOJI;
  return EXTENSION_EMOJI[extension] ?? FALLBACK_EMOJI;
}

export function isImageFile(fileName: string) {
  const extension = getExtension(fileName);
  return !!extension && IMAGE_EXTENSIONS.includes(extension);
}

export function isVideoFile(fileName: string) {
  const extension = getExtension(fileName);
  return !!extension && VIDEO_EXTENSIONS.includes(extension);
}

export function isAudioFile(fileName: string) {
  const extension = getExtension(fileName);
  return !!extension && AUDIO_EXTENSIONS.includes(extension);
}

export function isPdfFile(fileName: string) {
  const extension = getExtension(fileName);
  return !!extension && PDF_EXTENSIONS.includes(extension);
}

export function isDocViewerFile(fileName: string) {
  const extension = getExtension(fileName);
  return !!extension && DOC_VIEWER_EXTENSIONS.includes(extension);
}

export function isCodeFile(fileName: string) {
  const extension = getExtension(fileName);
  return !!extension && extension in CODE_EXTENSION_LANGUAGE;
}

export function getCodeLanguage(fileName: string) {
  const extension = getExtension(fileName);
  if (!extension) return "text";
  return CODE_EXTENSION_LANGUAGE[extension] ?? "text";
}

export function FileTypeIcon(props: { name: string; className?: string }) {
  if (isCodeFile(props.name)) {
    return (
      <CodeXmlIcon
        aria-hidden
        className={props.className}
        style={{ display: "inline", verticalAlign: "middle" }}
      />
    );
  }

  return (
    <span aria-hidden className={props.className}>
      {getFileEmoji(props.name)}
    </span>
  );
}

export function FolderTypeIcon(props: { className?: string }) {
  return (
    <span aria-hidden className={props.className}>
      {FOLDER_EMOJI}
    </span>
  );
}
