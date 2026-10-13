import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ForecastPoint } from "@/lib/types";
import { formatCurrency, formatCurrencyCompact, formatDate, formatDateShort } from "@/lib/format";
import { CHART, CHART_FONT, gridProps, xAxisProps, yAxisProps } from "./chartTheme";
import { ChartTooltip } from "./ChartTooltip";

/**
 * Projected daily spend.
 *
 * Every point here is a projection: the backend fits a linear trend over daily
 * totals and extends it. The series is therefore drawn dashed with hollow
 * markers, and a labelled rule marks where the projection begins, so no reader
 * can mistake it for an observation.
 */
export function ForecastChart({ points }: { points: ForecastPoint[] }) {
  const data = points.map((point) => ({
    date: point.date,
    label: formatDateShort(point.date),
    predicted: point.predicted_spend,
  }));

  if (data.length === 0) {
    return null;
  }

  const max = Math.max(...data.map((row) => row.predicted));

  return (
    <div className="px-3 pb-3 pt-5 sm:px-5 sm:pb-5">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 16, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid {...gridProps} />
          <XAxis {...xAxisProps} dataKey="label" interval="preserveStartEnd" />
          <YAxis
            {...yAxisProps}
            tickFormatter={(value: number) => formatCurrencyCompact(value)}
            domain={[0, Math.ceil(max * 1.15)]}
          />
          <Tooltip
            cursor={{ stroke: CHART.lineStrong, strokeDasharray: "3 3" }}
            content={({ active, payload }) => {
              if (active !== true || !payload || payload.length === 0) return null;
              const row = payload[0].payload as { date: string; predicted: number };
              return (
                <ChartTooltip
                  title={formatDate(row.date)}
                  rows={[{ label: "Projected spend", value: formatCurrency(row.predicted), accent: true }]}
                  footnote="Projection from a linear trend. Not an observation."
                />
              );
            }}
          />
          <ReferenceLine
            x={data[0].label}
            stroke={CHART.lineStrong}
            strokeDasharray="3 3"
            label={{
              value: "projection begins",
              position: "insideTopLeft",
              fill: CHART.muted,
              fontFamily: CHART_FONT,
              fontSize: 10,
            }}
          />
          <Line
            type="linear"
            dataKey="predicted"
            stroke={CHART.navy}
            strokeWidth={1.75}
            strokeDasharray="6 4"
            isAnimationActive={false}
            dot={{ r: 3, fill: CHART.white, stroke: CHART.navy, strokeWidth: 1.5 }}
            activeDot={{ r: 4.5, fill: CHART.crimson, stroke: CHART.white, strokeWidth: 1.5 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <p className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-3">
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="inline-block h-[2px] w-8 border-t-2 border-dashed border-navy" />
          <span className="font-serif text-caption text-ink-soft">
            Projected spend (linear trend, clipped at zero)
          </span>
        </span>
      </p>
    </div>
  );
}
