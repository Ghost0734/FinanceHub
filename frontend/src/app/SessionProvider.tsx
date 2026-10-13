import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { api } from "@/lib/api";
import { useReportData } from "@/lib/useReportData";
import { describeError } from "@/lib/errors";

export interface SessionValue {
  /** `data-source.source`, e.g. "Demo dataset" or "Local upload: expenses.csv". */
  source?: string;
  /** `data-source.rows` */
  rows?: number;
  /**
   * Increments whenever the backend session changes — currently after a CSV
   * upload. Report sections include it in their fetch keys so they refetch
   * against the new dataset instead of showing stale figures.
   */
  version: number;
  isLoading: boolean;
  error: string | null;
  /** Call after an action that replaces the session's dataset. */
  refresh: () => void;
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState(0);

  const { data, error, isLoading } = useReportData(`data-source:${version}`, () => api.dataSource());

  const refresh = useCallback(() => {
    setVersion((current) => current + 1);
  }, []);

  const value = useMemo<SessionValue>(
    () => ({
      source: data?.source,
      rows: data?.rows,
      version,
      isLoading,
      error: error === null ? null : describeError(new Error(error)),
      refresh,
    }),
    [data, version, isLoading, error, refresh],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (value === null) {
    throw new Error("useSession must be called inside a SessionProvider.");
  }
  return value;
}
