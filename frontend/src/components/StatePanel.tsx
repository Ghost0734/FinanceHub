import type { ReactNode } from "react";
import { AlertIcon, DashIcon } from "./icons";

interface LoadingPanelProps {
  /** Names the resource being retrieved, e.g. "the spending summary". */
  resource: string;
  /** Number of placeholder rules; keeps the reserved height close to the result. */
  rows?: number;
}

/**
 * Loading state. Reserves a plausible height with hairline placeholders so the
 * report does not jump when the data arrives, and announces itself politely.
 */
export function LoadingPanel({ resource, rows = 4 }: LoadingPanelProps) {
  return (
    <div className="border border-line bg-paper-white px-5 py-6" role="status" aria-live="polite">
      <span className="mono-label">Retrieving {resource}</span>
      <div className="mt-4 space-y-3" aria-hidden="true">
        {Array.from({ length: rows }, (_, index) => (
          <div
            key={index}
            className="h-3 animate-pulse bg-paper-deep"
            style={{ width: `${88 - index * 9}%`, animationDelay: `${index * 90}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

interface ErrorPanelProps {
  /** What failed, in the report's voice, e.g. "The spending summary is unavailable". */
  title: string;
  /** The backend's own message, or a network description. */
  message: string;
  /** An actionable line, such as how to start the service. */
  hint?: string;
  onRetry?: () => void;
}

/**
 * Failure state. A crimson rule marks it, and the message is the backend's own
 * text wherever one was returned — never a generic apology.
 */
export function ErrorPanel({ title, message, hint, onRetry }: ErrorPanelProps) {
  return (
    <div className="border border-line border-l-2 border-l-crimson bg-crimson-wash px-5 py-5" role="alert">
      <div className="flex items-baseline gap-3">
        <AlertIcon className="mt-0.5 shrink-0 text-crimson" />
        <div className="min-w-0">
          <p className="font-serif text-serif-lg font-semibold text-ink">{title}</p>
          <p className="mt-1.5 font-mono text-mono leading-relaxed text-ink-soft">{message}</p>
          {hint ? (
            <p className="mt-3 max-w-measure font-serif text-caption italic leading-relaxed text-muted">
              {hint}
            </p>
          ) : null}
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="editorial-link mt-4 text-crimson"
            >
              Retry request
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

interface EmptyPanelProps {
  title: string;
  message: string;
  action?: ReactNode;
}

/** Empty state — a dashed frame, matching the reference reports' inner rules. */
export function EmptyPanel({ title, message, action }: EmptyPanelProps) {
  return (
    <div className="border border-dashed border-line-strong bg-paper-white px-5 py-6">
      <div className="flex items-baseline gap-3">
        <DashIcon className="mt-0.5 shrink-0 text-muted" />
        <div className="min-w-0">
          <p className="font-serif text-serif-lg font-semibold text-ink">{title}</p>
          <p className="mt-1.5 max-w-measure font-serif text-body leading-relaxed text-muted">{message}</p>
          {action ? <div className="mt-4">{action}</div> : null}
        </div>
      </div>
    </div>
  );
}
