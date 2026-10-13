import { joinClassNames } from "@/lib/format";

export interface TooltipRow {
  label: string;
  value: string;
  accent?: boolean;
}

interface ChartTooltipProps {
  /** The x value, already formatted. */
  title: string;
  rows: TooltipRow[];
  /** An extra line of context beneath the rows. */
  footnote?: string;
}

/**
 * The tooltip, styled as a small exhibit.
 *
 * It is a presentational component: each chart formats its own title and rows
 * from the Recharts payload, so the numbers shown always match the series the
 * reader is pointing at.
 */
export function ChartTooltip({ title, rows, footnote }: ChartTooltipProps) {
  return (
    <div className="border border-line-strong bg-paper-white px-3.5 py-3">
      <p className="mono-label border-b border-line pb-2">{title}</p>
      <dl className="mt-2 space-y-1.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-6">
            <dt className="font-serif text-caption text-muted">{row.label}</dt>
            <dd
              className={joinClassNames(
                "font-mono text-mono-lg tabular",
                row.accent ? "text-crimson" : "text-ink",
              )}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
      {footnote ? (
        <p className="mt-2.5 border-t border-line pt-2 font-serif text-caption italic text-muted">
          {footnote}
        </p>
      ) : null}
    </div>
  );
}
