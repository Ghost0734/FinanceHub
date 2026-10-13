/**
 * Response types for the FinanceHub FastAPI backend.
 *
 * Every field below was read directly from the running service at
 * http://127.0.0.1:8001 and from the route definitions in `main.py`.
 * Nothing here is speculative — do not add fields the backend does not return.
 */

/** `GET /health` */
export interface HealthResponse {
  status: string;
}

/** `GET /data-source` — the current in-memory analysis session. */
export interface DataSourceResponse {
  /** Human label, e.g. "Demo dataset" or "Local upload: expenses.csv". */
  source: string;
  rows: number;
}

/**
 * A scored transaction record, as returned by `GET /transactions`.
 *
 * `known_anomaly` / `anomaly_reason` are *seeded ground-truth labels* produced by
 * the synthetic generator in `finpilot/data.py`. `normalize_transactions()` sets
 * them to `false` / `""` for every uploaded CSV, so they are empty for real data.
 * They are NOT model output — only `anomaly_score` and `is_anomaly` are.
 */
export interface Transaction {
  transaction_id: string;
  /** ISO calendar date, `YYYY-MM-DD`. */
  date: string;
  merchant: string;
  category: string;
  amount: number;
  employee_id: string;
  known_anomaly: boolean;
  anomaly_reason: string;
  is_anomaly: boolean;
  /** Isolation Forest decision score; higher is more unusual. */
  anomaly_score: number;
}

/** One row of `summary.category_risk` — flagged spend aggregated by category. */
export interface CategoryRisk {
  category: string;
  flagged_transactions: number;
  flagged_spend: number;
}

/** `GET /summary` */
export interface SummaryResponse {
  total_transactions: number;
  total_spend: number;
  flagged_transactions: number;
  /** Potential exposure: the summed amount of flagged transactions. */
  flagged_spend: number;
  flagged_spend_pct: number;
  category_risk: CategoryRisk[];
}

/** `GET /forecast` — a projection, never an observation. */
export interface ForecastPoint {
  /** ISO calendar date, `YYYY-MM-DD`. */
  date: string;
  predicted_spend: number;
}

/** `POST /transactions/upload` — the backend's own report of what it ingested. */
export interface UploadResponse {
  message: string;
  rows: number;
  flagged_transactions: number;
  source: string;
}

export interface EvidenceItem {
  type: string;
  detail: string;
}

/**
 * A policy document retrieved by similarity search (ChromaDB, with a lexical
 * fallback). Retrieval is a relevance match, NOT a determination that the policy
 * applies to this transaction. `distance` is null when the lexical fallback ran.
 */
export interface RetrievedPolicy {
  policy_id: string;
  text: string;
  distance: number | null;
}

/**
 * `verification` from `POST /investigations`.
 *
 * `flags` are real rule evaluations produced by `_verify()` in
 * `finpilot/investigation.py`. `confidence` is a *heuristic assessment score*,
 * computed as `min(0.98, 0.55 + 0.1 * len(flags) + 0.15 if flagged)` — it is a
 * weighted tally, not a calibrated probability. Present it as such.
 */
export interface InvestigationVerification {
  flags: string[];
  policy_ids: string[];
  confidence: number;
}

/** `POST /investigations` */
export interface InvestigationResponse {
  transaction: Transaction;
  evidence: EvidenceItem[];
  policies: RetrievedPolicy[];
  verification: InvestigationVerification;
  /** Template-generated narrative. Not an independently verified fact. */
  summary: string;
}
