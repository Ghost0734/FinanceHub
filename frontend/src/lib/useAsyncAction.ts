import { useCallback, useRef, useState } from "react";
import { describeError } from "./errors";

export interface AsyncActionState<TResult> {
  /** The most recent successful result, or null before the first run. */
  result: TResult | null;
  error: string | null;
  isPending: boolean;
  run: () => Promise<void>;
  reset: () => void;
}

/**
 * Run a user-triggered request (an upload, an investigation) and expose its
 * state. The action is held in a ref so a new closure each render does not
 * restart anything, and `run` never throws — failures land in `error`.
 */
export function useAsyncAction<TResult>(action: () => Promise<TResult>): AsyncActionState<TResult> {
  const actionRef = useRef(action);
  actionRef.current = action;

  const [result, setResult] = useState<TResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const run = useCallback(async () => {
    setIsPending(true);
    setError(null);
    try {
      const next = await actionRef.current();
      setResult(next);
    } catch (cause: unknown) {
      setError(describeError(cause));
    } finally {
      setIsPending(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { result, error, isPending, run, reset };
}
