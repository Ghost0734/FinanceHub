import type { ReactNode } from "react";

interface ConclusionBandProps {
  /** Mono section label, e.g. `04.0 · FINDINGS AND NEXT STEPS`. */
  label: string;
  /** The conclusion itself, set large in serif on navy. */
  statement: ReactNode;
  children?: ReactNode;
}

/**
 * The report's conclusion, carried on a full-bleed navy band.
 *
 * Navy is reserved for this: the one place where the report states what it
 * believes. Typography is white on navy at a generous size, with a single
 * crimson rule tying it back to the findings above.
 */
export function ConclusionBand({ label, statement, children }: ConclusionBandProps) {
  return (
    <section className="mt-16 bg-navy md:mt-24" aria-label={label}>
      <div className="report-shell py-14 md:py-20">
        <span className="mono-label-on-navy text-crimson-bright">{label}</span>

        <div className="mt-5 border-t-2 border-crimson" />

        <p className="mt-10 max-w-measure font-serif text-serif-xl leading-snug text-paper-white md:text-display-md">
          {statement}
        </p>

        {children ? <div className="mt-12">{children}</div> : null}
      </div>
    </section>
  );
}

export interface ConclusionColumnData {
  label: string;
  items: ReactNode[];
}

/** Two or three labelled columns beneath the conclusion statement. */
export function ConclusionColumns({ columns }: { columns: ConclusionColumnData[] }) {
  return (
    <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
      {columns.map((column) => (
        <div key={column.label} className="border-t border-line-onNavy pt-4">
          <h3 className="mono-label-on-navy">{column.label}</h3>
          <ul className="mt-3 list-none space-y-2.5 p-0">
            {column.items.map((item, index) => (
              <li
                key={index}
                className="max-w-measure font-serif text-body leading-relaxed text-paper"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
