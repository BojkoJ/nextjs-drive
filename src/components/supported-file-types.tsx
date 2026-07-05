import { FileTypeIcon } from "~/lib/file-icons";

const FILE_TYPE_GROUPS = [
  {
    label: "Images",
    sample: "x.png",
    extensions: ["PNG", "JPG", "JPEG", "GIF", "WEBP"],
  },
  {
    label: "Video & Audio",
    sample: "x.mp4",
    extensions: ["MP4", "AVI", "MOV", "MKV", "MP3", "WAV", "FLAC"],
  },
  {
    label: "Documents",
    sample: "x.pdf",
    extensions: [
      "PDF",
      "DOC",
      "DOCX",
      "PPT",
      "PPTX",
      "XLS",
      "XLSX",
      "ODT",
      "CSV",
      "TXT",
      "RTF",
      "HTML",
      "MD",
    ],
  },
  {
    label: "Code",
    sample: "x.ts",
    extensions: [
      "TS",
      "TSX",
      "JS",
      "JSX",
      "PY",
      "RS",
      "GO",
      "ZIG",
      "CPP",
      "C",
      "CS",
      "JAVA",
      "KT",
      "YAML",
      "TOML",
      "JSON",
      "SQL",
      "PHP",
      "RB",
      "SWIFT",
      "SH",
    ],
  },
] as const;

export function SupportedFileTypes() {
  return (
    <section className="border-border border-t px-4 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-foreground max-w-2xl text-3xl leading-[0.95] font-black tracking-tight uppercase md:text-5xl">
          Any file. <span className="text-primary">Actually opens.</span>
        </h2>

        <p className="text-muted-foreground mt-6 max-w-xl text-lg leading-relaxed">
          Upload whatever you want, there is no filter.
          <br />
          These types preview right in the browser, no extra apps.
        </p>

        <div className="border-border bg-border mt-14 grid gap-px overflow-hidden border sm:grid-cols-2 lg:grid-cols-4">
          {FILE_TYPE_GROUPS.map((group) => (
            <div key={group.label} className="bg-background p-6">
              <div className="flex items-center gap-3">
                <FileTypeIcon name={group.sample} className="text-2xl" />
                <h3 className="text-foreground text-xs font-bold tracking-widest uppercase">
                  {group.label}
                </h3>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {group.extensions.map((ext) => (
                  <span
                    key={ext}
                    className="border-border text-muted-foreground border px-2 py-0.5 font-mono text-[0.6875rem] tracking-wide uppercase"
                  >
                    {ext}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
