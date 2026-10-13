import { useCallback, useEffect, useRef, useState } from "react";
import { describeError } from "./errors";

export interface ReportDataState<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  /** Re-run the request, e.g. after a CSV upload changes the session. */
  reload: () => void;
}

/**
 * Load one backend resource for a report section.
 *
 * `key` identifies the request rather than a dependency array, so callers cannot
 * accidentally re-fetch on every render. On failure the previously loaded value
 * is kept, so an error never blanks a section that was already readable.
 */
export function useReportData<T>(key: string, loader: () => Promise<T>): ReportDataState<T> {
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const [reloadToken, setReloadToken] = useState(0);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setError(null);

    loaderRef
      .current()
      .then((result) => {
        if (isCancelled) return;
        setData(result);
        setIsLoading(false);
      })
      .catch((cause: unknown) => {
        if (isCancelled) return;
        setError(describeError(cause));
        setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [key, reloadToken]);

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  return { data, error, isLoading, reload };
}
