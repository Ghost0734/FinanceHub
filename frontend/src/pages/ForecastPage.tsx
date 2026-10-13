import { useSession } from "../app/SessionProvider";

import { ForecastChart } from "../components/charts/ForecastChart";
import {
  ErrorPanel,
  LoadingPanel,
} from "../components/StatePanel";

import { useReportData } from "../lib/useReportData";
import { api } from "../lib/api";
import type { ForecastPoint } from "../lib/types";

export default function ForecastPage() {
  const session = useSession();

  const {
    data,
    isLoading,
    error,
    reload,
  } = useReportData<ForecastPoint[]>(
    `forecast:${session.version}`,
    () => api.forecast(30),
  );

  return (
    <main className="report-shell py-12">
      <p className="mono-label text-crimson">
        03.0 / Forecast
      </p>

      <h1 className="mt-4 font-display text-display-lg text-navy">
        Projected spending
      </h1>

      <p className="mt-4 max-w-measure font-serif text-body leading-relaxed text-ink-soft">
        Forecasts are projections, not observed spending.
        Interpret them alongside the underlying transaction history.
      </p>

      <section className="mt-10 border-t border-line pt-8">
        {isLoading ? (
          <LoadingPanel resource="the spending forecast" />
        ) : error ? (
          <ErrorPanel
            title="Forecast unavailable"
            message={String(error)}
            onRetry={reload}
          />
        ) : !data || data.length === 0 ? (
          <p className="font-serif text-body text-ink-soft">
            No forecast data was returned by the backend.
            Load transaction data and try again.
          </p>
        ) : (
          <>
            <p className="mb-6 font-mono text-micro uppercase text-muted">
              Projection horizon: {data.length} days
            </p>

            <ForecastChart points={data} />

            <p className="mt-5 max-w-measure font-serif text-caption italic leading-relaxed text-muted">
              Projected values are estimates based on the
              underlying spending trend. They are not observed
              transactions or guaranteed future expenditure.
            </p>
          </>
        )}
      </section>
    </main>
  );
}