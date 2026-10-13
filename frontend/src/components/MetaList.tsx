import type { ReactNode } from "react";
import { joinClassNames } from "@/lib/format";

export interface MetaItem {
  label: string;
  value: ReactNode;
  /** Renders the value in monospace — the default for identifiers and figures. */
  mono?: boolean;
  /** Draws the value in crimson. Reserved for the decisive value in a group. */
  accent?: boolean;
}

interface MetaListProps {
  items: MetaItem[];
  /** Chooses the palette for the navy hero or the paper body. */
  tone?: "paper" | "navy";
  /** Two columns from the `sm` breakpoint, for compact metadata blocks. */
  columns?: 1 | 2;
}

/**
 * A definition list of label/value rows separated by hairlines.
 *
 * This is the report's workhorse for metadata: it appears in the navy hero and
 * again in the dossier header. Labels are small uppercase monospace; values are
 * monospace by default so identifiers and figures align on the digit.
 */
export function MetaList({ items, tone = "paper", columns = 1 }: MetaListProps) {
  const isNavy = tone === "navy";

  return (
    <dl
      className={joinClassNames(
        "grid",
        columns === 2 ? "sm:grid-cols-2 sm:gap-x-10" : "grid-cols-1",
      )}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className={joinClassNames(
            "flex items-baseline justify-between gap-6 border-t py-2.5",
            isNavy ? "border-line-onNavy" : "border-line",
          )}
        >
          <dt className={isNavy ? "mono-label-on-navy" : "mono-label"}>{item.label}</dt>
          <dd
            className={joinClassNames(
              "min-w-0 text-right",
              item.mono === false ? "font-serif text-caption" : "font-mono text-mono tabular",
              item.accent
                ? isNavy
                  ? "text-crimson-bright"
                  : "text-crimson"
                : isNavy
                  ? "text-paper"
                  : "text-ink",
            )}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
