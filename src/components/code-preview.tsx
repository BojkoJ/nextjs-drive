"use client";

import { useEffect, useState } from "react";
import { PrismAsyncLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Spinner } from "~/components/ui/spinner";
import { getCodeLanguage } from "~/lib/file-icons";

type FetchResult =
  | { url: string; content: string; failed?: undefined }
  | { url: string; failed: true; content?: undefined };

export function CodePreview(props: { name: string; url: string }) {
  const [result, setResult] = useState<FetchResult | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(props.url)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch file");
        return res.text();
      })
      .then((text) => {
        if (!cancelled) setResult({ url: props.url, content: text });
      })
      .catch(() => {
        if (!cancelled) setResult({ url: props.url, failed: true });
      });

    return () => {
      cancelled = true;
    };
  }, [props.url]);

  // Pokud se url od posledního dokončeného fetch změnila, bereme starý výsledek jako zastaralý (loading), místo abychom bleskli obsah jiného souboru.
  const current = result?.url === props.url ? result : null;

  if (current?.failed) {
    return (
      <div className="flex h-[70vh] w-full items-center justify-center border border-border bg-background text-muted-foreground">
        Could not load preview.
      </div>
    );
  }

  if (!current) {
    return (
      <div className="flex h-[70vh] w-full items-center justify-center border border-border bg-background text-muted-foreground">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  return (
    <div className="h-[70vh] w-full overflow-auto border border-border">
      <SyntaxHighlighter
        language={getCodeLanguage(props.name)}
        style={vscDarkPlus}
        showLineNumbers
        customStyle={{ margin: 0, minHeight: "100%", fontSize: "0.8rem" }}
      >
        {current.content}
      </SyntaxHighlighter>
    </div>
  );
}
