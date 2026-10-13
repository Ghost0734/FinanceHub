import type { ReactNode } from "react";
import { joinClassNames } from "@/lib/format";

export interface Finding {
  /** Finding number, e.g. `01`. */
  id: string;
  title: string;
  body: ReactNode;
  /** Marks the finding that carries the report's conclusion. */
  tone?: "plain" | "attention";
}

interface FindingsListProps {
  findings: Finding[];
  tone?: "paper" | "navy";
}

/**
 * Numbered findings in the order a reviewer should work through them.
 *
 * Each row is separated by a hairline and led by its number in the left gutter,
 * exactly as the reference reports do. A single finding may carry the crimson
 * accent; the rest stay in ink so the emphasis keeps its meaning.
 */
export function FindingsList({ findings, tone = "paper" }: FindingsListProps) {
  const isNavy = tone === "navy";

  return (
    <ol className="list-none p-0">
      {findings.map((finding) => (
        <li
          key={finding.id}
          className={joinClassNames(
            "grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-4 border-t py-6 md:grid-cols-[4.5rem_minmax(0,1fr)] md:gap-x-8",
            isNavy ? "border-line-onNavy" : "border-line",
          )}
        >
          <span className={joinClassNames("mono-label tabular", isNavy && "mono-label-on-navy")}>
            {finding.id}
          </span>

          <div className="min-w-0">
            <h3
              className={joinClassNames(
                "font-serif text-serif-lg font-semibold leading-snug",
                isNavy ? "text-paper-white" : "text-ink",
                finding.tone === "attention" && (isNavy ? "text-crimson-bright" : "text-crimson"),
              )}
            >
              {finding.title}
            </h3>
            <div
              className={joinClassNames(
                "mt-2 max-w-measure font-serif text-body leading-relaxed",
                isNavy ? "text-muted-onNavy" : "text-ink-soft",
              )}
            >
              {finding.body}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
