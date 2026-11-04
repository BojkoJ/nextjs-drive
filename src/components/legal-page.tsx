import Link from "next/link";

// Sdílené stavební bloky právních stránek (/privacy, /terms, /accessibility): nadpis, sekce, tabulka.

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 md:py-24">
      <h1 className="text-foreground text-4xl leading-none font-black tracking-tight uppercase md:text-5xl">
        {title}
      </h1>
      <div className="bg-primary mt-6 h-1.25 w-24" />
      <p className="text-muted-foreground mt-6 text-sm">
        Last updated: {updated}
      </p>
      {children}
      <p className="mt-16">
        <Link
          href="/"
          className="text-primary inline-block py-1 text-sm underline underline-offset-4"
        >
          ← Back to Bojko Drive
        </Link>
      </p>
    </article>
  );
}

export function LegalSection({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-12 scroll-mt-24">
      <h2 className="text-foreground text-xl font-black tracking-tight uppercase">
        {title}
      </h2>
      <div className="text-muted-foreground mt-4 space-y-4 leading-relaxed">
        {children}
      </div>
    </section>
  );
}

type TableRow = React.ReactNode[] | { group: string };

// Tabulka s popisky sloupců (scope="col"); řádek { group } je mezititulek přes celou šířku.
// Rolovatelný obal je zaostřitelný z klávesnice a pojmenovaný, aby šla široká tabulka na malém displeji procházet bez myši (WCAG 2.1.1).
export function LegalTable({
  label,
  head,
  rows,
}: {
  label: string;
  head: string[];
  rows: TableRow[];
}) {
  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      className="border-border focus-visible:ring-ring overflow-x-auto border-2 focus-visible:ring-2 focus-visible:outline-none"
    >
      <table className="w-full min-w-xl text-left text-sm">
        <thead className="border-border text-foreground border-b-2">
          <tr>
            {head.map((h) => (
              <th key={h} scope="col" className="px-3 py-2 font-bold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) =>
            Array.isArray(row) ? (
              <tr key={i} className="border-border border-t align-top">
                {row.map((cell, j) => (
                  <td key={j} className="px-3 py-2">
                    {cell}
                  </td>
                ))}
              </tr>
            ) : (
              <tr key={i} className="border-border border-t">
                <th
                  scope="colgroup"
                  colSpan={head.length}
                  className="text-foreground px-3 py-2 font-bold"
                >
                  {row.group}
                </th>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}
