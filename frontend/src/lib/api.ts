import type {
  DataSourceResponse,
  ForecastPoint,
  HealthResponse,
  InvestigationResponse,
  SummaryResponse,
  Transaction,
  UploadResponse,
} from "./types";

/**
 * Base URL resolution.
 *
 * Default is the relative `/api` prefix, which Vite proxies to
 * http://127.0.0.1:8001 in both `dev` and `preview` (see vite.config.ts). The
 * backend sends no CORS headers, so a relative prefix is what makes local
 * development work without touching the Python service.
 *
 * Set VITE_API_BASE_URL to an absolute URL to talk to a different host directly.
 */
const configuredBase = (import.meta.env.VITE_API_BASE_URL ?? "").trim();
export const API_BASE_URL = (configuredBase === "" ? "/api" : configuredBase).replace(/\/+$/, "");
const USING_PROXY = configuredBase === "";

/** Request ceilings. Long enough for real work, short enough to fail visibly. */
const DEFAULT_TIMEOUT_MS = 12_000;
const UPLOAD_TIMEOUT_MS = 45_000;
const INVESTIGATION_TIMEOUT_MS = 20_000;

/** Upper bound accepted by `GET /transactions` (`limit=101` returns 422). */
export const MAX_TRANSACTION_LIMIT = 100;

/** A transport or HTTP failure, normalised for display. */
export class ApiError extends Error {
  readonly status: number | null;
  readonly detail: string;

  constructor(message: string, status: number | null, detail: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

interface FastApiValidationItem {
  loc?: unknown[];
  msg?: string;
}

/** Pull the useful sentence out of a FastAPI error body. */
function extractDetail(payload: unknown, fallback: string): string {
  if (typeof payload !== "object" || payload === null || !("detail" in payload)) {
    return fallback;
  }
  const detail = (payload as { detail: unknown }).detail;
  if (typeof detail === "string" && detail.trim() !== "") {
    return detail;
  }
  if (Array.isArray(detail)) {
    const messages = (detail as FastApiValidationItem[])
      .map((item) => {
        const field = Array.isArray(item.loc) ? String(item.loc[item.loc.length - 1] ?? "") : "";
        const message = item.msg ?? "invalid value";
        return field === "" ? message : `${field}: ${message}`;
      })
      .filter((message) => message !== "");
    if (messages.length > 0) {
      return messages.join(" · ");
    }
  }
  return fallback;
}

async function request<T>(
  path: string,
  options: { method?: "GET" | "POST"; body?: FormData | string; timeoutMs?: number } = {},
): Promise<T> {
  const { method = "GET", body, timeoutMs = DEFAULT_TIMEOUT_MS } = options;
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      body,
      headers: typeof body === "string" ? { "Content-Type": "application/json" } : undefined,
      signal: controller.signal,
    });

    if (!response.ok) {
      let payload: unknown = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }
      const detail = extractDetail(payload, `The service returned ${response.status}.`);
      throw new ApiError(detail, response.status, detail);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("The analysis service did not respond in time.", null, "Request timed out.");
    }
    throw new ApiError(
      "FinanceHub could not reach the analysis service.",
      null,
      "Network request failed. Confirm the backend is running.",
    );
  } finally {
    window.clearTimeout(timer);
  }
}

/** Absolute URL of the backend root, for diagnostics shown in the UI. */
export function backendLabel(): string {
  return USING_PROXY ? "http://127.0.0.1:8001 (via local proxy)" : API_BASE_URL;
}

export const api = {
  health: () => request<HealthResponse>("/health"),

  dataSource: () => request<DataSourceResponse>("/data-source"),

  summary: () => request<SummaryResponse>("/summary"),

  transactions: (options: { anomaliesOnly?: boolean; limit?: number } = {}) => {
    const { anomaliesOnly = false, limit = MAX_TRANSACTION_LIMIT } = options;
    const capped = Math.min(Math.max(1, Math.trunc(limit)), MAX_TRANSACTION_LIMIT);
    const params = new URLSearchParams({
      anomalies_only: String(anomaliesOnly),
      limit: String(capped),
    });
    return request<Transaction[]>(`/transactions?${params.toString()}`);
  },

  forecast: (days: number) => {
    const clamped = Math.min(Math.max(1, Math.trunc(days)), 30);
    return request<ForecastPoint[]>(`/forecast?days=${clamped}`);
  },

  investigate: (transactionId: string) =>
    request<InvestigationResponse>("/investigations", {
      method: "POST",
      body: JSON.stringify({ transaction_id: transactionId }),
      timeoutMs: INVESTIGATION_TIMEOUT_MS,
    }),

  uploadCsv: (file: File) => {
    const form = new FormData();
    form.append("file", file, file.name);
    return request<UploadResponse>("/transactions/upload", {
      method: "POST",
      body: form,
      timeoutMs: UPLOAD_TIMEOUT_MS,
    });
  },
};
