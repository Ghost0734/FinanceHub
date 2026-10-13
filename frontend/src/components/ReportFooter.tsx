import { backendLabel } from "@/lib/api";
import { formatInteger } from "@/lib/format";

interface ReportFooterProps {
  /** `data-source.source` — the session's current dataset label. */
  source?: string;
  /** `data-source.rows` */
  rows?: number;
}

/**
 * The colophon.
 *
 * It closes the report with the session's provenance — where the data came from
 * and how many records it holds — plus the endpoint the interface is reading.
 * This is deliberately plain: it is a methodology note, not a marketing footer.
 */
export function ReportFooter({ source, rows }: ReportFooterProps) {
  return (
    <footer className="mt-20 border-t border-line py-10">
      <div className="report-shell">
        <div className="grid gap-x-10 gap-y-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div>
            <h2 className="mono-label">About this report</h2>
            <p className="mt-3 max-w-measure font-serif text-body leading-relaxed text-ink-soft">
              FinanceHub scores expenses with an Isolation Forest, retrieves policy text by
              similarity, and runs a four-step investigation workflow. Flagged transactions are
              statistical outliers awaiting review — not findings of fraud or of a policy breach.
              Uploaded files are analysed in the local session and never leave the machine.
            </p>
          </div>

          <div>
            <h2 className="mono-label">Session</h2>
            <dl className="mt-3 border-t border-line pt-3">
              <div className="flex items-baseline justify-between gap-4 py-1.5">
                <dt className="font-serif text-caption text-muted">Dataset</dt>
                <dd className="font-mono text-mono tabular text-ink">{source ?? "—"}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-1.5">
                <dt className="font-serif text-caption text-muted">Records</dt>
                <dd className="font-mono text-mono tabular text-ink">
                  {rows === undefined ? "—" : formatInteger(rows)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-1.5">
                <dt className="font-serif text-caption text-muted">Analysis service</dt>
                <dd className="truncate font-mono text-mono text-ink" title={backendLabel()}>
                  {backendLabel()}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <p className="mt-10 border-t border-line pt-5 font-mono text-micro uppercase text-muted">
          FinanceHub · Report 01 · Financial investigation
        </p>
      </div>
    </footer>
  );
}
