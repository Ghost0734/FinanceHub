import type { ReactNode } from "react";

interface ExhibitProps {
  /** Exhibit identifier, e.g. `EXHIBIT 01`. */
  label: string;
  /** Serif title shown in the header strip. */
  title: string;
  /** Mono figures aligned to the right of the header. */
  meta?: ReactNode;
  /** The figure itself. */
  children: ReactNode;
  /** The caption that reads beneath the frame. */
  caption?: ReactNode;
  /** Adds horizontal scroll for wide tables on narrow screens. */
  scrollX?: boolean;
}

/**
 * A framed exhibit: the report's container for a chart or a table.
 *
 * The frame is a single hairline with square corners and an uppercase mono
 * header strip, following the reference reports. It deliberately carries no
 * shadow and no radius — the border does the work of separating the figure
 * from the body text.
 */
export function Exhibit({ label, title, meta, children, caption, scrollX = false }: ExhibitProps) {
  return (
    <figure className="min-w-0">
      <div className="border border-line bg-paper-white">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-line px-4 py-3 sm:px-5">
          <div className="flex items-baseline gap-4">
            <span className="mono-label text-crimson">{label}</span>
            <span className="font-serif text-caption font-semibold text-ink">{title}</span>
          </div>
          {meta ? <div className="flex items-baseline gap-5">{meta}</div> : null}
        </div>

        <div className={scrollX ? "overflow-x-auto" : undefined}>{children}</div>
      </div>

      {caption ? (
        <figcaption className="mt-3 border-l border-line pl-4 font-serif text-caption italic leading-relaxed text-muted">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

/** A label/value pair for an exhibit header strip. */
export function ExhibitMeta({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex items-baseline gap-2">
      <span className="mono-label">{label}</span>
      <span className="font-mono text-mono tabular text-ink">{value}</span>
    </span>
  );
}
