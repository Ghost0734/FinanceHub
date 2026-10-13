import type { Transaction } from "@/lib/types";
import { formatScore, joinClassNames } from "@/lib/format";

interface ScoreRulerProps {
  /** The reviewed population, as returned by `/transactions`. */
  reviewed: Transaction[];
  /** The transaction under investigation. */
  subject: Transaction;
}

/**
 * The subject's anomaly score, positioned inside the reviewed population.
 *
 * The ruler is a plain HTML instrument rather than a chart: one tick per
 * reviewed transaction on a shared score axis, flagged records marked in
 * crimson, and the subject drawn taller with its value printed above. The
 * printed value means the position never depends on colour alone.
 */
export function ScoreRuler({ reviewed, subject }: ScoreRulerProps) {
  if (reviewed.length === 0) {
    return null;
  }

  const scores = reviewed.map((transaction) => transaction.anomaly_score);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const span = max - min;

  const position = (score: number): number => {
    if (span <= 0) return 50;
    return ((score - min) / span) * 100;
  };

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4 pb-1">
        <span className="mono-label">Lowest reviewed {formatScore(min)}</span>
        <span className="mono-label">Highest reviewed {formatScore(max)}</span>
      </div>

      <div className="relative h-14 border-t border-line pt-2">
        <div className="relative h-6" role="img" aria-label={`Anomaly score ${formatScore(subject.anomaly_score)} on a scale from ${formatScore(min)} to ${formatScore(max)}`}>
          {/* The axis. */}
          <span className="absolute left-0 top-3 h-px w-full bg-line-strong" aria-hidden="true" />

          {/* One tick per reviewed transaction. */}
          {reviewed.map((transaction) => (
            <span
              key={transaction.transaction_id}
              aria-hidden="true"
              className={joinClassNames(
                "absolute top-2 w-px",
                transaction.is_anomaly ? "h-3 bg-crimson" : "h-2 bg-line-strong",
              )}
              style={{ left: `${position(transaction.anomaly_score)}%` }}
            />
          ))}

          {/* The subject. */}
          <span
            aria-hidden="true"
            className="absolute top-0 h-6 w-[2px] bg-crimson"
            style={{ left: `calc(${position(subject.anomaly_score)}% - 1px)` }}
          />
        </div>

        <span
          className="absolute top-7 -translate-x-1/2 whitespace-nowrap font-mono text-mono tabular text-crimson"
          style={{ left: `${position(subject.anomaly_score)}%` }}
        >
          {formatScore(subject.anomaly_score)}
        </span>
      </div>

      <p className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-3">
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="inline-block h-3 w-[2px] bg-crimson" />
          <span className="font-serif text-caption text-ink-soft">
            Subject / flagged transaction
          </span>
        </span>
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="inline-block h-2 w-[1px] bg-line-strong" />
          <span className="font-serif text-caption text-ink-soft">Reviewed, not flagged</span>
        </span>
      </p>
    </div>
  );
}
