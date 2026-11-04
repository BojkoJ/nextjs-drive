import { LegalLinks } from "~/components/legal-links";

// Patička ve všech stránkách: zásady ochrany osobních údajů musí být dostupné odkudkoliv, odkud se sbírají data.
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-border text-muted-foreground border-t py-4 text-xs">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-x-6 gap-y-1 px-4 text-center md:flex-row">
        <span>© {year} Bojko Drive</span>
        <LegalLinks />
        <span>
          web made by{" "}
          <a
            href="https://bojkoj.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary inline-block py-1 font-medium hover:underline"
          >
            Jan Bojko
          </a>
        </span>
      </div>
    </footer>
  );
}
