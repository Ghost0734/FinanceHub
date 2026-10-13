import type { SummaryResponse } from "@/lib/types";
import { formatCurrency, formatInteger, formatPercent } from "@/lib/format";
import { ArrowUpRight } from "./icons";
import { MetaList } from "./MetaList";

interface ReportHeroProps {
  /** `data-source.source` */
  source?: string;
  /** `data-source.rows` */
  rows?: number;
  /** `GET /summary`, or null while it loads or if it failed. */
  summary: SummaryResponse | null;
  isLoading: boolean;
  hasError: boolean;
}

/**
 * The opening spread of the report.
 *
 * A deep-navy panel carries the title, the session metadata and the upload
 * action; the panel beside it is the frontispiece — the one figure that frames
 * the whole investigation, which is flagged spend set against total spend.
 * Split at `lg`; stacked with the navy panel first below it.
 */
export function ReportHero({ source, rows, summary, isLoading, hasError }: ReportHeroProps) {
  const flaggedShare = summary?.flagged_spend_pct ?? null;

  return (
    <section
      className="grid border-b border-line lg:grid-cols-2"
      aria-labelledby="report-title"
    >
      {/* Title panel */}
      <div className="bg-navy px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
        <div className="mx-auto w-full max-w-[34rem] lg:ml-auto lg:mr-0">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <span className="mono-label-on-navy">
              FinanceHub <span className="text-crimson-bright">/</span> Report 01
            </span>
            <span className="mono-label-on-navy">
              {hasError ? "Service unavailable" : isLoading ? "Analyzing session" : "Analysis complete"}
            </span>
          </div>

          <div className="mt-5 border-t border-line-onNavy" />

          <h1
            id="report-title"
            className="mt-10 font-display text-display-xl font-extrabold uppercase text-paper-white"
          >
            Find the transactions
            <br />
            that deserve a <span className="text-crimson-bright">closer look</span>.
          </h1>

          <p className="mt-8 max-w-measureTight font-serif text-lede leading-relaxed text-muted-onNavy">
            FinanceHub combines anomaly detection, policy retrieval, and a structured investigation
            workflow to help reviewers understand unusual expenses and determine what evidence is
            still needed.
          </p>

          <div className="mt-10">
            <MetaList
              tone="navy"
              items={[
                { label: "Dataset", value: source ?? "—" },
                {
                  label: "Records",
                  value: rows === undefined ? "—" : formatInteger(rows),
                },
                {
                  label: "Flagged",
                  value:
                    summary === null
                      ? "—"
                      : `${formatInteger(summary.flagged_transactions)} of ${formatInteger(
                          summary.total_transactions,
                        )}`,
                  accent: summary !== null && summary.flagged_transactions > 0,
                },
                {
                  label: "Exposure",
                  value: summary === null ? "—" : formatCurrency(summary.flagged_spend),
                },
              ]}
            />
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <a
              href="#upload"
              className="inline-flex items-center gap-2.5 border border-crimson bg-crimson px-5 py-3 font-mono text-label uppercase tracking-[0.14em] text-paper-white transition-colors duration-quick hover:bg-crimson-deep"
            >
              Analyze a CSV file
            </a>
            <a href="#index" className="editorial-link text-paper-white">
              Open the transaction index
              <ArrowUpRight />
            </a>
          </div>
        </div>
      </div>

      {/* Frontispiece */}
      <div className="bg-paper-white px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
        <div className="mx-auto w-full max-w-[34rem] lg:ml-0 lg:mr-auto">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <span className="mono-label text-crimson">Frontispiece</span>
            <span className="font-mono text-micro uppercase text-muted">
              {isLoading ? "Loading" : hasError ? "Unavailable" : "Report 01"}
            </span>
          </div>

          <h2 className="mt-4 font-display text-display-sm text-navy">
            Flagged spend against total spend
          </h2>

          <div className="mt-5 border-t border-line-strong" />

          {summary === null ? (
            <div className="mt-8 space-y-3" aria-hidden="true">
              {[92, 74, 58, 66].map((width, index) => (
                <div
                  key={width}
                  className="h-3 animate-pulse bg-paper-deep"
                  style={{ width: `${width}%`, animationDelay: `${index * 80}ms` }}
                />
              ))}
              <p className="pt-3 font-mono text-mono text-muted">
                {hasError
                  ? "The summary endpoint did not answer, so the frontispiece is empty."
                  : "Retrieving the spending summary…"}
              </p>
            </div>
          ) : (
            <>
              <p className="mt-8 font-display text-display-lg tabular leading-none text-crimson">
                {formatCurrency(summary.flagged_spend)}
              </p>
              <p className="mt-3 font-serif text-caption text-muted">
                Flagged across {formatInteger(summary.flagged_transactions)} of{" "}
                {formatInteger(summary.total_transactions)} reviewed transactions —{" "}
                {formatPercent(summary.flagged_spend_pct)} of all spend in this session.
              </p>

              {/* Composition: flagged spend as a share of the total. */}
              <div className="mt-7">
                <div className="flex items-baseline justify-between pb-2">
                  <span className="mono-label">Composition of spend</span>
                  <span className="font-mono text-micro tabular text-muted">
                    {formatCurrency(summary.total_spend)} total
                  </span>
                </div>
                <div className="relative h-2.5 w-full bg-paper-deep" role="img" aria-label={`Flagged spend is ${formatPercent(summary.flagged_spend_pct)} of total spend`}>
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-0 left-0 bg-crimson"
                    style={{ width: `${Math.min(100, Math.max(0, flaggedShare ?? 0))}%` }}
                  />
                </div>
                <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <span className="flex items-center gap-2">
                    <span aria-hidden="true" className="inline-block h-2.5 w-2.5 bg-crimson" />
                    <span className="font-mono text-micro uppercase text-ink-soft">
                      Flagged {formatPercent(summary.flagged_spend_pct)}
                    </span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span aria-hidden="true" className="inline-block h-2.5 w-2.5 bg-paper-deep" />
                    <span className="font-mono text-micro uppercase text-ink-soft">
                      Remainder {formatPercent(100 - summary.flagged_spend_pct)}
                    </span>
                  </span>
                </div>
              </div>

              <div className="mt-8">
                <MetaList
                  items={[
                    { label: "Total spend", value: formatCurrency(summary.total_spend) },
                    {
                      label: "Reviewed",
                      value: `${formatInteger(summary.total_transactions)} transactions`,
                    },
                    {
                      label: "Flagged",
                      value: `${formatInteger(summary.flagged_transactions)} transactions`,
                      accent: summary.flagged_transactions > 0,
                    },
                    {
                      label: "Categories affected",
                      value: `${formatInteger(summary.category_risk.length)}`,
                    },
                  ]}
                />
              </div>

              <p className="mt-6 font-serif text-caption italic leading-relaxed text-muted">
                A flagged transaction is a statistical outlier awaiting review. It is not a finding of
                fraud and not a confirmed policy breach — the investigation sections that follow
                establish what evidence exists.
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
