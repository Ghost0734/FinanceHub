import type { ReactNode } from "react";
import { joinClassNames } from "@/lib/format";

interface ReportSectionProps {
  id: string;
  /** Report numbering, e.g. `01.0`. Rendered in the left gutter. */
  number: string;
  title: string;
  /** A short editorial line beneath the headline. */
  caption?: string;
  /** Controls aligned to the right of the headline rule. */
  actions?: ReactNode;
  children: ReactNode;
  /** Removes the top rule, for a section that follows another directly. */
  ruled?: boolean;
}

/**
 * One numbered section of the report.
 *
 * Every section shares the same rhythm: the number sits in its own gutter, a
 * hairline rule opens the content column, and the headline is followed by an
 * optional serif caption. Structure comes from rules and whitespace — never
 * from a card, a shadow or a border radius.
 */
export function ReportSection({
  id,
  number,
  title,
  caption,
  actions,
  children,
  ruled = true,
}: ReportSectionProps) {
  return (
    <section id={id} className="report-grid scroll-mt-28 pt-14 md:pt-20" aria-labelledby={`${id}-title`}>
      <div className="md:pt-1">
        <span className="mono-label block tabular text-crimson">{number}</span>
      </div>

      <div className="min-w-0">
        <div
          className={joinClassNames(
            "flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 pb-4",
            ruled && "rule-top pt-4",
          )}
        >
          <h2 id={`${id}-title`} className="max-w-measure text-display-md text-ink">
            {title}
          </h2>
          {actions ? <div className="flex items-center gap-4">{actions}</div> : null}
        </div>

        {caption ? (
          <p className="max-w-measure pb-8 font-serif text-caption italic leading-relaxed text-muted">
            {caption}
          </p>
        ) : (
          <div className="pb-6" />
        )}

        {children}
      </div>
    </section>
  );
}
