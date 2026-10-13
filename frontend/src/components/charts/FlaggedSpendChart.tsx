import {
  Bar,
  CartesianGrid,
  ComposedChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Transaction } from "@/lib/types";
import { dateValue, formatCurrency, formatCurrencyCompact, formatDate, formatDateShort, formatScore } from "@/lib/format";
import { CHART, CHART_FONT, gridProps, xAxisProps, yAxisProps } from "./chartTheme";
import { ChartTooltip } from "./ChartTooltip";

interface Point {
  time: number;
  date: string;
  amount: number;
  merchant: string;
  category: string;
  transactionId: string;
  /** Isolation Forest decision score for this record. */
  score: number;
  /**
   * Present only for the seeded demo dataset, where the generator records the
   * anomaly it injected. Empty for uploaded CSVs — never a model output.
   */
  seededReason: string;
}

/** Up to `count` evenly spaced ticks across the plotted span. */
function buildTimeTicks(min: number, max: number, count: number): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) return [min];
  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, index) => min + step * index);
}

/**
 * Flagged spend over time, as one stem per transaction.
 *
 * This is the only complete time series the API exposes: `/transactions` returns
 * every flagged record (verified against `summary.flagged_transactions`), while
 * the full all-transactions daily series is not available. The axis is numeric
 * rather than categorical, so gaps in the stems represent real gaps in time.
 */
export function FlaggedSpendChart({ transactions }: { transactions: Transaction[] }) {
  const points: Point[] = transactions
    .map((transaction) => ({
      time: dateValue(transaction.date),
      date: transaction.date,
      amount: transaction.amount,
      merchant: transaction.merchant,
      category: transaction.category,
      transactionId: transaction.transaction_id,
      score: transaction.anomaly_score,
      seededReason: transaction.known_anomaly ? transaction.anomaly_reason : "",
    }))
    .sort((a, b) => a.time - b.time);

  if (points.length === 0) {
    return null;
  }

  const amounts = points.map((point) => point.amount);
  const mean = amounts.reduce((total, amount) => total + amount, 0) / amounts.length;
  const max = Math.max(...amounts);
  const ticks = buildTimeTicks(points[0].time, points[points.length - 1].time, 6);

  return (
    <div className="px-3 pb-3 pt-5 sm:px-5 sm:pb-5">
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid {...gridProps} />
          <XAxis
            {...xAxisProps}
            dataKey="time"
            type="number"
            scale="time"
            domain={["dataMin", "dataMax"]}
            ticks={ticks}
            tickFormatter={(value: number) => formatDateShort(new Date(value).toISOString().slice(0, 10))}
          />
          <YAxis
            {...yAxisProps}
            tickFormatter={(value: number) => formatCurrencyCompact(value)}
            domain={[0, Math.ceil(max * 1.1)]}
          />
          <Tooltip
            cursor={{ fill: CHART.paperDeep }}
            content={({ active, payload }) => {
              if (active !== true || !payload || payload.length === 0) return null;
              const point = payload[0].payload as Point;
              const rows = [
                { label: "Amount", value: formatCurrency(point.amount), accent: true },
                { label: "Category", value: point.category },
                { label: "Merchant", value: point.merchant },
                { label: "Transaction", value: point.transactionId },
                { label: "Anomaly score", value: formatScore(point.score) },
              ];
              return (
                <ChartTooltip
                  title={formatDate(point.date)}
                  rows={rows}
                  footnote={
                    point.seededReason === ""
                      ? undefined
                      : `Seeded dataset note: ${point.seededReason}.`
                  }
                />
              );
            }}
          />
          <ReferenceLine
            y={mean}
            stroke={CHART.muted}
            strokeDasharray="4 4"
            label={{
              value: `mean ${formatCurrency(mean)}`,
              position: "insideTopRight",
              fill: CHART.muted,
              fontFamily: CHART_FONT,
              fontSize: 10,
            }}
          />
          <Bar dataKey="amount" fill={CHART.crimson} barSize={4} isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>

      <p className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-3">
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="inline-block h-3 w-[2px] bg-crimson" />
          <span className="font-serif text-caption text-ink-soft">Flagged transaction</span>
        </span>
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="inline-block h-[2px] w-6 bg-line-strong" />
          <span className="font-serif text-caption text-ink-soft">Mean flagged amount</span>
        </span>
      </p>
    </div>
  );
}
