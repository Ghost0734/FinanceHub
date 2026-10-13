import type { ReactNode } from "react";
import { joinClassNames } from "@/lib/format";

interface LedgerPrimaryProps {
  label: string;
  /** The dominant figure, set in display type. */
  value: string;
  /** One line of context — where the figure came from. */
  note?: ReactNode;
  accent?: boolean;
}

/**
 * The lead figure of a section.
 *
 * Section 01.0 gives total spend a full column at display size rather than
 * repeating four equal cards; the remaining measures sit in the columns beside
 * it, separated by rules.
 */
export function LedgerPrimary({ label, value, note, accent = false }: LedgerPrimaryProps) {
  return (
    <div className="border-t border-line-strong pt-5">
      <span className="mono-label">{label}</span>
      <p
        className={joinClassNames(
          "mt-4 font-display text-display-xl tabular leading-none",
          accent ? "text-crimson" : "text-navy",
        )}
      >
        {value}
      </p>
      {note ? (
        <p className="mt-4 max-w-measureTight font-serif text-caption italic leading-relaxed text-muted">
          {note}
        </p>
      ) : null}
    </div>
  );
}

export interface LedgerItem {
  label: string;
  value: string;
  note?: string;
  accent?: boolean;
}

/**
 * Supporting measures as aligned columns.
 *
 * Vertical rules separate them from the `sm` breakpoint up; below that they
 * stack behind horizontal rules. Values are tabular monospace so the columns
 * align across rows.
 */
export function LedgerColumns({ items }: { items: LedgerItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-3 sm:gap-x-0 sm:gap-y-0">
      {items.map((item, index) => (
        <div
          key={item.label}
          className={joinClassNames(
            "border-t border-line pt-4",
            index > 0 && "sm:border-l sm:border-l-line sm:pl-6",
          )}
        >
          <span className="mono-label">{item.label}</span>
          <p
            className={joinClassNames(
              "mt-3 font-display text-display-sm tabular",
              item.accent ? "text-crimson" : "text-navy",
            )}
          >
            {item.value}
          </p>
          {item.note ? (
            <p className="mt-2 font-serif text-caption leading-relaxed text-muted">{item.note}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

/**
 * A single measure set as a ruled row. Used where a full ledger column would be
 * too heavy, such as the dossier header's fact row.
 */
export function LedgerRow({ items }: { items: LedgerItem[] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-8 gap-y-6 md:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="border-t border-line pt-3">
          <dt className="mono-label">{item.label}</dt>
          <dd
            className={joinClassNames(
              "mt-2 font-display text-display-sm tabular",
              item.accent ? "text-crimson" : "text-navy",
            )}
          >
            {item.value}
          </dd>
          {item.note ? (
            <p className="mt-1.5 font-mono text-micro uppercase text-muted">{item.note}</p>
          ) : null}
        </div>
      ))}
    </dl>
  );
}
