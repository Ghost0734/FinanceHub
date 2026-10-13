/**
 * Formatting helpers.
 *
 * All numbers and dates rendered anywhere in the report go through this module
 * so that currency, dates and scores are presented consistently.
 */

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const currencyWholeFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const compactCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

const integerFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Full precision, e.g. `$2,848.14`. */
export function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return currencyFormatter.format(value);
}

/** No cents, e.g. `$102,145` — used in headline figures. */
export function formatCurrencyWhole(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return currencyWholeFormatter.format(value);
}

/** Shortened for axis ticks, e.g. `$14.5K`. */
export function formatCurrencyCompact(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return compactCurrencyFormatter.format(value);
}

export function formatInteger(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return integerFormatter.format(value);
}

export function formatPercent(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(digits)}%`;
}

/** Anomaly scores arrive with 4 decimals; show them exactly as delivered. */
export function formatScore(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return value.toFixed(4);
}

export function formatConfidence(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return `${Math.round(value * 100)}%`;
}

/**
 * Parse an ISO `YYYY-MM-DD` string into a UTC date.
 *
 * `new Date("2026-04-21")` is parsed as UTC midnight, which renders as the 20th
 * for anyone west of Greenwich. Building the date from parts and formatting it
 * in UTC keeps the calendar day stable in every timezone.
 */
function parseIsoDate(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** `2026-04-21` → `21 Apr 2026`. */
export function formatDate(iso: string): string {
  const date = parseIsoDate(iso);
  if (!date) return iso;
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/** `2026-04-21` → `21 Apr`. */
export function formatDateShort(iso: string): string {
  const date = parseIsoDate(iso);
  if (!date) return iso;
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]}`;
}

/** `2026-04-21` → `Apr 2026`. */
export function formatMonth(iso: string): string {
  const date = parseIsoDate(iso);
  if (!date) return iso;
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/** `2026-04-21` → `2026-04` — the monthly grouping key. */
export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

/** Milliseconds since epoch, for sorting. Invalid dates sort last. */
export function dateValue(iso: string): number {
  const date = parseIsoDate(iso);
  return date ? date.getTime() : Number.POSITIVE_INFINITY;
}

/** `receipt-rule` → `Receipt rule`. */
export function humanizePolicyId(policyId: string): string {
  const spaced = policyId.replace(/[-_]+/g, " ").trim();
  if (spaced === "") return policyId;
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/** `some text.` → `Some text` — for list rendering. */
export function sentenceCase(value: string): string {
  const trimmed = value.trim().replace(/\.$/, "");
  if (trimmed === "") return value;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}

export function joinClassNames(...values: Array<string | false | null | undefined>): string {
  return values.filter((value): value is string => typeof value === "string" && value !== "").join(" ");
}
