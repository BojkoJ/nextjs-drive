import { FileTypeIcon, FolderTypeIcon } from "~/lib/file-icons";

const MOCK_ROWS = [
  { type: "folder", name: "Photos" },
  { type: "folder", name: "Documents" },
  { type: "file", name: "trip-2024.mp4" },
] as const;

export function FilesMockPreview() {
  return (
    <div className="relative">
      <div className="absolute inset-0 translate-x-3 translate-y-3 rotate-2 border border-primary/30 bg-primary/5" />
      <div className="relative -rotate-1 border border-border bg-card">
        <ul>
          {MOCK_ROWS.map((row, index) => (
            <li
              key={row.name}
              className={`flex items-center px-6 py-4 font-mono text-sm text-foreground ${index === MOCK_ROWS.length - 1 ? "" : "border-b border-border"}`}
            >
              {row.type === "folder" ? (
                <FolderTypeIcon className="mr-3 text-xl leading-none" />
              ) : (
                <FileTypeIcon name={row.name} className="mr-3 text-xl leading-none" />
              )}
              {row.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
