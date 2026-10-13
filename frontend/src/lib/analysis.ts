import type { SummaryResponse, Transaction } from "./types";
import { dateValue, formatCurrency, formatScore, monthKey, pluralize } from "./format";

/**
 * Derived analysis.
 *
 * Every function here reads only fields the backend actually returns, and every
 * derivation is deliberately conservative:
 *
 *  - `/transactions` returns the *highest-scoring* N rows, not a random sample of
 *    the dataset. No benchmark (median, mean, percentile) is therefore computed
 *    across "all transactions" — that figure would be biased by construction.
 *  - `summary.category_risk` is treated as authoritative for flagged spend and
 *    counts; the transaction rows are used only for ordering and detail.
 */

export interface FlaggedMonth {
  key: string;
  label: string;
  flaggedSpend: number;
  flaggedCount: number;
}

export interface CategoryProfile {
  category: string;
  flaggedSpend: number;
  flaggedCount: number;
  /** Share of all flagged spend, 0–100. */
  shareOfFlaggedSpend: number;
  firstFlaggedDate: string | null;
  lastFlaggedDate: string | null;
}

export interface ObservedSignal {
  label: string;
  detail: string;
  /** `attention` renders with the crimson accent; `neutral` stays in ink. */
  tone: "neutral" | "attention";
}

export function selectFlagged(transactions: Transaction[]): Transaction[] {
  return transactions.filter((transaction) => transaction.is_anomaly);
}

/** Flagged transactions in chronological order — the only complete time series available. */
export function buildFlaggedLedger(transactions: Transaction[]): Transaction[] {
  return selectFlagged(transactions).slice().sort((a, b) => dateValue(a.date) - dateValue(b.date));
}

/** Flagged spend aggregated by calendar month. */
export function groupFlaggedByMonth(transactions: Transaction[]): FlaggedMonth[] {
  const buckets = new Map<string, FlaggedMonth>();

  for (const transaction of buildFlaggedLedger(transactions)) {
    const key = monthKey(transaction.date);
    const existing = buckets.get(key);
    if (existing) {
      existing.flaggedSpend += transaction.amount;
      existing.flaggedCount += 1;
    } else {
      buckets.set(key, {
        key,
        label: key,
        flaggedSpend: transaction.amount,
        flaggedCount: 1,
      });
    }
  }

  return Array.from(buckets.values()).sort((a, b) => a.key.localeCompare(b.key));
}

/** Date span covered by the flagged transactions, for captions. */
export function flaggedDateSpan(transactions: Transaction[]): { first: string; last: string } | null {
  const ledger = buildFlaggedLedger(transactions);
  if (ledger.length === 0) return null;
  return { first: ledger[0].date, last: ledger[ledger.length - 1].date };
}

/**
 * Category profiles. Flagged spend and counts come from `summary.category_risk`
 * because that endpoint aggregates the full dataset; the transaction rows only
 * contribute the first/last flagged date.
 */
export function buildCategoryProfiles(
  summary: SummaryResponse,
  transactions: Transaction[],
): CategoryProfile[] {
  const datesByCategory = new Map<string, string[]>();
  for (const transaction of selectFlagged(transactions)) {
    const dates = datesByCategory.get(transaction.category) ?? [];
    dates.push(transaction.date);
    datesByCategory.set(transaction.category, dates);
  }

  const totalFlaggedSpend = summary.flagged_spend;

  return summary.category_risk
    .map((row) => {
      const dates = (datesByCategory.get(row.category) ?? []).slice().sort();
      return {
        category: row.category,
        flaggedSpend: row.flagged_spend,
        flaggedCount: row.flagged_transactions,
        shareOfFlaggedSpend: totalFlaggedSpend > 0 ? (row.flagged_spend / totalFlaggedSpend) * 100 : 0,
        firstFlaggedDate: dates.length > 0 ? dates[0] : null,
        lastFlaggedDate: dates.length > 0 ? dates[dates.length - 1] : null,
      };
    })
    .sort((a, b) => b.flaggedSpend - a.flaggedSpend);
}

/** The largest single flagged amounts, for the exposure table. */
export function topExposure(transactions: Transaction[], limit: number): Transaction[] {
  return selectFlagged(transactions)
    .slice()
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}

/** Rank of a transaction inside the reviewed population, 1-based. */
export function scoreRank(transactions: Transaction[], transactionId: string): number | null {
  const index = transactions.findIndex((transaction) => transaction.transaction_id === transactionId);
  return index === -1 ? null : index + 1;
}

function percentOfReview(rank: number, total: number): string {
  if (total <= 0) return "—";
  const share = (rank / total) * 100;
  if (share <= 1) return "highest-scoring item in the reviewed set";
  return `top ${share.toFixed(share < 10 ? 1 : 0)}% of the reviewed set`;
}

/**
 * Mechanical, reproducible observations about one transaction, computed from
 * the reviewed population only. These are counts and comparisons — they are not
 * explanations of intent, and none of them asserts a policy breach.
 */
export function buildObservedSignals(
  transaction: Transaction,
  reviewed: Transaction[],
): ObservedSignal[] {
  const signals: ObservedSignal[] = [];
  const total = reviewed.length;

  const rank = scoreRank(reviewed, transaction.transaction_id);
  if (rank !== null) {
    signals.push({
      label: "Rank by anomaly score",
      detail: `${rank} of ${total} reviewed — ${percentOfReview(rank, total)}.`,
      tone: rank <= Math.max(1, Math.round(total * 0.05)) ? "attention" : "neutral",
    });
  }

  const amounts = reviewed.map((item) => item.amount).sort((a, b) => a - b);
  if (amounts.length > 0) {
    const maxReviewed = amounts[amounts.length - 1];
    const largerCount = amounts.filter((amount) => amount > transaction.amount).length;
    if (largerCount === 0) {
      signals.push({
        label: "Amount",
        detail: `Largest single amount in the reviewed set at ${formatCurrency(transaction.amount)}.`,
        tone: "attention",
      });
    } else {
      signals.push({
        label: "Amount",
        detail: `${formatCurrency(transaction.amount)} — ${largerCount} ${pluralize(
          largerCount,
          "reviewed transaction is",
          "reviewed transactions are",
        )} larger; the reviewed maximum is ${formatCurrency(maxReviewed)}.`,
        tone: "neutral",
      });
    }
  }

  const sameMerchant = reviewed.filter((item) => item.merchant === transaction.merchant);
  signals.push({
    label: "Merchant frequency",
    detail:
      sameMerchant.length === 1
        ? `${transaction.merchant} appears once in the reviewed set.`
        : `${transaction.merchant} appears ${sameMerchant.length} times in the reviewed set.`,
    tone: sameMerchant.length > 1 ? "attention" : "neutral",
  });

  const duplicateLike = reviewed.filter(
    (item) =>
      item.merchant === transaction.merchant &&
      item.amount === transaction.amount &&
      item.transaction_id !== transaction.transaction_id,
  );
  if (duplicateLike.length > 0) {
    signals.push({
      label: "Identical amount at the same merchant",
      detail: `${duplicateLike.length} further reviewed ${pluralize(
        duplicateLike.length,
        "transaction shares",
        "transactions share",
      )} this merchant and exact amount (${duplicateLike
        .map((item) => item.transaction_id)
        .join(", ")}).`,
      tone: "attention",
    });
  }

  const categoryRows = reviewed.filter((item) => item.category === transaction.category);
  const categoryFlagged = categoryRows.filter((item) => item.is_anomaly).length;
  signals.push({
    label: "Category within the reviewed set",
    detail: `${categoryFlagged} of ${categoryRows.length} reviewed ${transaction.category} ${pluralize(
      categoryRows.length,
      "transaction is",
      "transactions are",
    )} flagged.`,
    tone: "neutral",
  });

  signals.push({
    label: "Anomaly score",
    detail: `${formatScore(transaction.anomaly_score)} — the Isolation Forest decision score for this record.`,
    tone: "neutral",
  });

  return signals;
}

/**
 * The reviewed population is capped by the backend at 100 rows and ordered by
 * anomaly score, so the index is a ranked slice rather than the whole ledger.
 */
export function reviewScope(transactions: Transaction[], totalTransactions: number): string {
  if (totalTransactions <= 0) return "No transactions in the current session.";
  if (transactions.length >= totalTransactions) {
    return `All ${totalTransactions} transactions in the current session.`;
  }
  return `Highest-scoring ${transactions.length} of ${totalTransactions} transactions in the current session.`;
}

export function hasSeededReason(transaction: Transaction): boolean {
  return transaction.known_anomaly && transaction.anomaly_reason.trim() !== "";
}
