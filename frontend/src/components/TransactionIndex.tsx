import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Transaction } from "@/lib/types";
import {
  dateValue,
  formatCurrency,
  formatDate,
  formatScore,
  joinClassNames,
  pluralize,
} from "@/lib/format";
import { SearchIcon, SortIcon } from "./icons";
import { EmptyPanel } from "./StatePanel";

type ScopeFilter = "flagged" | "all";
type SortKey = "rank" | "date" | "merchant" | "category" | "amount" | "anomaly_score";
type SortDirection = "asc" | "desc";

/** Ranked position inside the reviewed population, 1-based. */
interface Row {
  transaction: Transaction;
  rank: number;
  /** Derived review order — a presentation of rank, not a backend field. */
  reviewOrder: string;
}

const COLUMNS: Array<{ key: SortKey; label: string; numeric: boolean }> = [
  { key: "anomaly_score", label: "Score", numeric: true },
  { key: "date", label: "Date", numeric: false },
  { key: "merchant", label: "Merchant", numeric: false },
  { key: "category", label: "Category", numeric: false },
  { key: "amount", label: "Amount", numeric: true },
];

function reviewOrderFor(rank: number): string {
  if (rank === 1) return "Review first";
  if (rank <= 4) return "High priority";
  return "Routine review";
}

/** The seeded dataset note, shown only when the generator recorded one. */
function seededNote(transaction: Transaction): string | null {
  if (!transaction.known_anomaly) return null;
  const reason = transaction.anomaly_reason.trim();
  return reason === "" ? null : reason;
}

interface TransactionIndexProps {
  /** The reviewed population, already ordered by anomaly score. */
  transactions: Transaction[];
  /** Honest description of what this slice covers. */
  scopeNote: string;
}

/**
 * The transaction index: a dense, sortable, searchable evidence table.
 *
 * Two layouts share one filter and sort: a ruled table from the `md` breakpoint
 * up, and a stacked record list below it, so the reading experience survives a
 * phone without any horizontal page overflow. Flagged rows carry a crimson
 * marker *and* the words "Flagged", so the state never rests on colour.
 */
export function TransactionIndex({ transactions, scopeNote }: TransactionIndexProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<ScopeFilter>("flagged");
  const [sortKey, setSortKey] = useState<SortKey>("anomaly_score");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const rows: Row[] = useMemo(() => {
    const ranked = transactions.map((transaction, index) => ({
      transaction,
      rank: index + 1,
      reviewOrder: reviewOrderFor(index + 1),
    }));

    const needle = query.trim().toLowerCase();
    const filtered = ranked.filter((row) => {
      if (scope === "flagged" && !row.transaction.is_anomaly) return false;
      if (needle === "") return true;
      return (
        row.transaction.transaction_id.toLowerCase().includes(needle) ||
        row.transaction.merchant.toLowerCase().includes(needle)
      );
    });

    const direction = sortDirection === "asc" ? 1 : -1;
    return filtered.slice().sort((a, b) => {
      switch (sortKey) {
        case "rank":
          return (a.rank - b.rank) * direction;
        case "amount":
          return (a.transaction.amount - b.transaction.amount) * direction;
        case "anomaly_score":
          return (a.transaction.anomaly_score - b.transaction.anomaly_score) * direction;
        case "date":
          return (dateValue(a.transaction.date) - dateValue(b.transaction.date)) * direction;
        case "merchant":
          return a.transaction.merchant.localeCompare(b.transaction.merchant) * direction;
        case "category":
          return a.transaction.category.localeCompare(b.transaction.category) * direction;
      }
    });
  }, [transactions, query, scope, sortKey, sortDirection]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDirection(key === "merchant" || key === "category" ? "asc" : "desc");
  };

  const flaggedCount = transactions.filter((transaction) => transaction.is_anomaly).length;
  const openTransaction = (transactionId: string) => {
    navigate(`/investigations/${transactionId}`);
  };

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col gap-4 border-t border-line pt-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="lg:max-w-md lg:flex-1">
          <label htmlFor="transaction-search" className="mono-label block pb-2">
            Search transaction ID or merchant
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
              <SearchIcon />
            </span>
            <input
              id="transaction-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="TXN-00363 or Metro Hotel"
              className="w-full border border-line bg-paper-white py-2.5 pl-10 pr-3 font-mono text-mono text-ink placeholder:text-muted"
            />
          </div>
        </div>

        <fieldset className="border-0 p-0">
          <legend className="mono-label pb-2">Scope</legend>
          <div className="inline-flex border border-line">
            {(["flagged", "all"] as ScopeFilter[]).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={scope === option}
                onClick={() => setScope(option)}
                className={joinClassNames(
                  "px-4 py-2.5 font-mono text-label uppercase tracking-[0.14em] transition-colors duration-quick",
                  scope === option
                    ? "bg-navy text-paper-white"
                    : "bg-paper-white text-muted hover:text-ink",
                )}
              >
                {option === "flagged" ? `Flagged (${flaggedCount})` : `All reviewed (${transactions.length})`}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <p className="mt-3 font-mono text-micro uppercase text-muted">
        {scopeNote} · {rows.length} of {scope === "flagged" ? flaggedCount : transactions.length} shown
        {query.trim() === "" ? "" : ` · matching “${query.trim()}”`}
      </p>

      {rows.length === 0 ? (
        <div className="pt-6">
          <EmptyPanel
            title="No transactions match this view"
            message={
              query.trim() === ""
                ? "There are no transactions in this scope for the current dataset. Switch the scope, or upload a CSV to analyse a different set of expenses."
                : `Nothing in the reviewed set matches “${query.trim()}”. Search by transaction ID or merchant name, or clear the field to see the full list.`
            }
          />
        </div>
      ) : (
        <>
          {/* Table, md and up */}
          <div className="hidden md:block">
            <table className="mt-6 w-full">
              <caption className="sr-only">
                Reviewed transactions. Activate a column heading to sort; select a transaction ID to
                open its investigation.
              </caption>
              <thead>
                <tr className="border-b border-line-strong">
                  <th scope="col" className="mono-label py-3 pr-4 text-left">
                    Transaction
                  </th>
                  {COLUMNS.map((column) => (
                    <th
                      key={column.key}
                      scope="col"
                      aria-sort={
                        sortKey === column.key
                          ? sortDirection === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                      className={joinClassNames(
                        "py-3",
                        column.numeric ? "text-right" : "text-left",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => toggleSort(column.key)}
                        className={joinClassNames(
                          "mono-label inline-flex items-center gap-1.5 hover:text-ink",
                          sortKey === column.key && "text-ink",
                        )}
                      >
                        {column.label}
                        {sortKey === column.key ? <SortIcon /> : null}
                      </button>
                    </th>
                  ))}
                  <th scope="col" className="mono-label py-3 pl-6 text-left">
                    Priority
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const note = seededNote(row.transaction);
                  return (
                    <tr
                      key={row.transaction.transaction_id}
                      onClick={() => openTransaction(row.transaction.transaction_id)}
                      className="cursor-pointer border-b border-line align-baseline transition-colors duration-quick hover:bg-paper-deep"
                    >
                      <td className="py-3.5 pr-4">
                        <span className="flex items-center gap-2.5">
                          <span
                            aria-hidden="true"
                            className={joinClassNames(
                              "inline-block h-3.5 w-[2px] shrink-0",
                              row.transaction.is_anomaly ? "bg-crimson" : "bg-transparent",
                            )}
                          />
                          <Link
                            to={`/investigations/${row.transaction.transaction_id}`}
                            className="font-mono text-mono text-ink underline decoration-line decoration-1 underline-offset-4 hover:decoration-crimson"
                          >
                            {row.transaction.transaction_id}
                          </Link>
                        </span>
                        <span className="mt-1 block pl-[18px] font-mono text-micro uppercase text-muted">
                          {row.transaction.is_anomaly ? "Flagged" : "Not flagged"}
                          {note === null ? "" : ` · ${note}`}
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-mono text-mono tabular text-crimson">
                        {formatScore(row.transaction.anomaly_score)}
                      </td>
                      <td className="py-3.5 pl-6 font-mono text-mono tabular text-ink-soft">
                        {formatDate(row.transaction.date)}
                      </td>
                      <td className="py-3.5 pl-6 font-serif text-body text-ink">
                        {row.transaction.merchant}
                      </td>
                      <td className="py-3.5 pl-6 font-mono text-mono text-ink-soft">
                        {row.transaction.category}
                      </td>
                      <td className="py-3.5 pl-6 text-right font-mono text-mono-lg tabular text-ink">
                        {formatCurrency(row.transaction.amount)}
                      </td>
                      <td className="py-3.5 pl-6 font-mono text-micro uppercase text-muted">
                        {row.reviewOrder}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Record list, below md */}
          <ul className="mt-6 list-none p-0 md:hidden">
            {rows.map((row) => {
              const note = seededNote(row.transaction);
              return (
                <li
                  key={row.transaction.transaction_id}
                  className={joinClassNames(
                    "border-t border-line py-4",
                    row.transaction.is_anomaly && "border-l-2 border-l-crimson pl-3",
                  )}
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <Link
                      to={`/investigations/${row.transaction.transaction_id}`}
                      className="font-mono text-mono-lg text-ink underline decoration-line underline-offset-4"
                    >
                      {row.transaction.transaction_id}
                    </Link>
                    <span className="font-mono text-mono-lg tabular text-ink">
                      {formatCurrency(row.transaction.amount)}
                    </span>
                  </div>

                  <p className="mt-1 font-serif text-body text-ink">{row.transaction.merchant}</p>

                  <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <dt className="font-mono text-micro uppercase text-muted">Date</dt>
                      <dd className="font-mono text-micro tabular text-ink-soft">
                        {formatDate(row.transaction.date)}
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-2">
                      <dt className="font-mono text-micro uppercase text-muted">Category</dt>
                      <dd className="font-mono text-micro text-ink-soft">
                        {row.transaction.category}
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-2">
                      <dt className="font-mono text-micro uppercase text-muted">Score</dt>
                      <dd className="font-mono text-micro tabular text-crimson">
                        {formatScore(row.transaction.anomaly_score)}
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-2">
                      <dt className="font-mono text-micro uppercase text-muted">Priority</dt>
                      <dd className="font-mono text-micro uppercase text-muted">{row.reviewOrder}</dd>
                    </div>
                  </dl>

                  <p className="mt-2 font-mono text-micro uppercase text-muted">
                    {row.transaction.is_anomaly ? "Flagged" : "Not flagged"}
                    {note === null ? "" : ` · ${note}`}
                  </p>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <p className="mt-6 max-w-measure border-t border-line pt-4 font-serif text-caption italic leading-relaxed text-muted">
        Priority is derived from anomaly-score rank inside the reviewed set and is a presentation aid,
        not a backend field. “Flagged” records an Isolation Forest outlier; it is not a finding of
        fraud{transactions.some((transaction) => transaction.known_anomaly)
          ? ", and the seeded dataset note is a label written by the demo generator rather than a model output."
          : ". The note column is empty because no labels are attached to this dataset."}{" "}
        {pluralize(transactions.length, "transaction")} reviewed.
      </p>
    </div>
  );
}
