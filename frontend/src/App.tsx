import { Routes, Route } from "react-router-dom";
import { ReportMasthead } from "./components/ReportMasthead";
import { ReportHero } from "./components/ReportHero";
import { ReportFooter } from "./components/ReportFooter";
import { useSession } from "./app/SessionProvider";
import { useReportData } from "./lib/useReportData";
import { api } from "./lib/api";
import type { SummaryResponse } from "./lib/types";

import InvestigationsPage from "./pages/InvestigationsPage";
import ForecastPage from "./pages/ForecastPage";

function OverviewPage() {
  const session = useSession();

  const {
    data: summary,
    isLoading,
    error,
  } = useReportData<SummaryResponse>("summary", () => api.summary());

  return (
    <>
      <ReportHero
        source={session.source}
        rows={session.rows}
        summary={summary}
        isLoading={isLoading}
        hasError={Boolean(error)}
      />

      <main className="report-shell py-12">
        <p className="mono-label">01.0 / Overview</p>

        <h2 className="mt-4 font-display text-display-md text-navy">
          Financial investigation report
        </h2>

        <p className="mt-4 max-w-measure font-serif text-body leading-relaxed text-ink-soft">
          Review unusual transactions, assess potential exposure, and identify
          where further evidence is needed. Statistical flags are indicators
          for review, not proof of fraud.
        </p>
      </main>
    </>
  );
}

function NotFoundPage() {
  return (
    <main className="report-shell min-h-[60vh] py-16">
      <p className="mono-label text-crimson">FinanceHub / Report 01</p>

      <h1 className="mt-4 font-display text-display-lg text-navy">
        Page not found
      </h1>

      <p className="mt-4 max-w-measure font-serif text-body text-ink-soft">
        The requested report section does not exist.
      </p>
    </main>
  );
}

export default function App() {
  const session = useSession();

  return (
    <>
      <ReportMasthead />

      <Routes>
        <Route path="/" element={<OverviewPage />} />

        <Route
          path="/investigations"
          element={<InvestigationsPage />}
        />

        <Route
          path="/forecast"
          element={<ForecastPage />}
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <ReportFooter
        source={session.source}
        rows={session.rows}
      />
    </>
  );
}