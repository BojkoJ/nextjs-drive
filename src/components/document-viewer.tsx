"use client";

import dynamic from "next/dynamic";
import "@iamjariwala/react-doc-viewer/dist/index.css";

// The library touches browser-only APIs at module scope, so it can't be
// statically imported into a component that gets server-rendered even once
// (SSR of a "use client" component still runs on the server for the initial
// HTML). next/dynamic with ssr:false defers the import itself to the client.
export const DocumentViewer = dynamic(
  () =>
    import("@iamjariwala/react-doc-viewer").then((mod) => {
      function Viewer(props: { url: string; fileName: string }) {
        return (
          <mod.default
            documents={[{ uri: props.url, fileName: props.fileName }]}
            pluginRenderers={mod.DocViewerRenderers}
            config={{
              header: { disableHeader: false },
              themeMode: "dark",
            }}
            theme={{
              primary: "#8fd694",
              secondary: "#171a13",
              tertiary: "#1c2018",
              textPrimary: "#eef2ea",
              textSecondary: "#9db19a",
            }}
            className="h-[70vh] w-full"
          />
        );
      }
      return Viewer;
    }),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[70vh] w-full items-center justify-center border border-border bg-background text-muted-foreground">
        Loading preview...
      </div>
    ),
  },
);
