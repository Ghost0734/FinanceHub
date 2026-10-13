import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import {
    EmptyPanel,
    ErrorPanel,
    LoadingPanel,
} from "../components/StatePanel";
import { FindingsList } from "../components/FindingsList";
import { TransactionIndex } from "../components/TransactionIndex";

import { useReportData } from "../lib/useReportData";
import { api } from "../lib/api";

import type {
    InvestigationResponse,
    Transaction,
} from "../lib/types";

export default function InvestigationsPage() {
    const { transactionId } = useParams<{ transactionId: string }>();

    const [selectedId, setSelectedId] = useState<string | null>(
        transactionId ?? null,
    );

    useEffect(() => {
        setSelectedId(transactionId ?? null);
    }, [transactionId]);

    const {
        data: transactions,
        error: transactionsError,
        isLoading: transactionsLoading,
        reload: reloadTransactions,
    } = useReportData<Transaction[]>("investigation-transactions", () =>
        api.transactions({ limit: 100 }),
    );

    const {
        data: investigation,
        error: investigationError,
        isLoading: investigationLoading,
        reload: reloadInvestigation,
    } = useReportData<InvestigationResponse>(
        `investigation-${selectedId ?? "none"}`,
        () =>
            selectedId
                ? api.investigate(selectedId)
                : Promise.reject(
                    new Error("Select a transaction to investigate."),
                ),
    );

    const selectedTransaction = useMemo(
        () =>
            transactions?.find(
                (transaction) =>
                    transaction.transaction_id === selectedId,
            ),
        [transactions, selectedId],
    );

    const findings = useMemo(() => {
        if (!investigation) return [];

        return [
            {
                id: "01",
                title: "Investigation summary",
                body:
                    investigation.summary ||
                    "No narrative summary was returned.",
                tone: investigation.transaction.is_anomaly
                    ? ("attention" as const)
                    : ("plain" as const),
            },
            {
                id: "02",
                title: "Verification flags",
                body:
                    investigation.verification.flags.length > 0
                        ? investigation.verification.flags.join("; ")
                        : "No verification flags were returned.",
            },
            {
                id: "03",
                title: "Policy references",
                body:
                    investigation.policies.length > 0
                        ? investigation.policies
                            .map(
                                (policy) =>
                                    `${policy.policy_id}: ${policy.text}`,
                            )
                            .join("\n\n")
                        : "No matching policy documents were returned.",
            },
            {
                id: "04",
                title: "Evidence",
                body:
                    investigation.evidence.length > 0
                        ? investigation.evidence
                            .map(
                                (item) => `${item.type}: ${item.detail}`,
                            )
                            .join("\n\n")
                        : "No additional evidence was returned.",
            },
        ];
    }, [investigation]);

    return (
        <main className="report-shell py-12 md:py-16">
            {/* Page introduction */}
            <header className="border-b border-line pb-8 md:pb-10">
                <p className="mono-label text-crimson">
                    02.0 / Investigations
                </p>

                <h1 className="mt-4 max-w-4xl font-display text-display-lg text-navy">
                    Transaction investigations
                </h1>

                <p className="mt-4 max-w-measure font-serif text-body leading-relaxed text-ink-soft">
                    Review unusual transactions, examine supporting evidence, and
                    investigate flagged spending. Statistical anomalies are indicators
                    for review, not proof of fraud or policy violations.
                </p>
            </header>

            {/* Transaction index */}
            <section
                id="transaction-index"
                className="scroll-mt-28 pt-8 md:pt-12"
            >
                <div className="border-t border-line pt-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
                        <h2 className="font-display text-display-md text-navy">
                            Find a transaction
                        </h2>

                        <p className="font-mono text-micro uppercase tracking-wider text-muted">
                            Search, review, investigate
                        </p>
                    </div>

                    <p className="mt-3 max-w-measure font-serif text-caption leading-relaxed text-ink-soft">
                        Search by transaction ID or merchant, review flagged expenses,
                        and select a transaction to examine its investigation findings.
                    </p>
                </div>

                <div className="mt-8">
                    {transactionsLoading && (
                        <LoadingPanel resource="transactions" />
                    )}

                    {transactionsError && (
                        <ErrorPanel
                            title="Transactions could not be loaded"
                            message={String(transactionsError)}
                            onRetry={reloadTransactions}
                        />
                    )}

                    {!transactionsLoading &&
                        !transactionsError &&
                        (!transactions || transactions.length === 0) && (
                            <EmptyPanel
                                title="No transactions available"
                                message="Load transaction data before starting an investigation."
                            />
                        )}

                    {transactions && transactions.length > 0 && (
                        <>
                            <TransactionIndex
                                transactions={transactions}
                                scopeNote="Select a transaction ID to open its investigation"
                            />

                            <div className="mt-8 border-t border-line pt-5">
                                <label
                                    htmlFor="transaction-id"
                                    className="mono-label block pb-3"
                                >
                                    Investigate by transaction ID
                                </label>

                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <select
                                        id="transaction-id"
                                        value={selectedId ?? ""}
                                        onChange={(event) =>
                                            setSelectedId(event.target.value || null)
                                        }
                                        className="min-w-0 flex-1 border border-line bg-paper-white px-3 py-3 font-mono text-mono text-ink"
                                    >
                                        <option value="">
                                            Choose a transaction
                                        </option>

                                        {transactions.map((transaction) => (
                                            <option
                                                key={transaction.transaction_id}
                                                value={transaction.transaction_id}
                                            >
                                                {transaction.transaction_id} —{" "}
                                                {transaction.merchant}
                                            </option>
                                        ))}
                                    </select>

                                    <button
                                        type="button"
                                        onClick={reloadInvestigation}
                                        disabled={!selectedId || investigationLoading}
                                        className="border border-navy bg-navy px-5 py-3 font-mono text-label uppercase tracking-wider text-paper-white transition-colors disabled:opacity-50"
                                    >
                                        {investigationLoading
                                            ? "Investigating…"
                                            : "Run investigation"}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* Investigation findings */}
            {selectedId && (
                <section
                    id="investigation-findings"
                    className="scroll-mt-28 pt-12 md:pt-16"
                >
                    <div className="border-t border-line pt-4">
                        <p className="mono-label text-crimson">
                            02.1 / Investigation findings
                        </p>

                        <h2 className="mt-3 break-words font-display text-display-md text-navy">
                            {selectedTransaction
                                ? selectedTransaction.merchant
                                : "Transaction investigation"}
                        </h2>

                        <p className="mt-2 font-mono text-micro uppercase tracking-wider text-muted">
                            Transaction ID: {selectedId}
                        </p>
                    </div>

                    <div className="mt-8">
                        {investigationLoading && (
                            <LoadingPanel resource="the investigation" />
                        )}

                        {investigationError && (
                            <ErrorPanel
                                title="Investigation could not be completed"
                                message={String(investigationError)}
                                onRetry={reloadInvestigation}
                            />
                        )}

                        {!investigationLoading &&
                            !investigationError &&
                            investigation && (
                                <>
                                    <dl className="grid grid-cols-1 gap-6 border-y border-line py-6 sm:grid-cols-3 sm:gap-8">
                                        <div>
                                            <dt className="mono-label">
                                                Transaction amount
                                            </dt>

                                            <dd className="mt-3 break-words font-mono text-mono-lg text-ink">
                                                {new Intl.NumberFormat("en-IN", {
                                                    style: "currency",
                                                    currency: "INR",
                                                    maximumFractionDigits: 2,
                                                }).format(investigation.transaction.amount)}
                                            </dd>
                                        </div>

                                        <div>
                                            <dt className="mono-label">
                                                Anomaly status
                                            </dt>

                                            <dd className="mt-3 font-mono text-mono-lg text-ink">
                                                {investigation.transaction.is_anomaly
                                                    ? "Flagged"
                                                    : "Not flagged"}
                                            </dd>
                                        </div>

                                        <div>
                                            <dt className="mono-label">
                                                Heuristic confidence score
                                            </dt>

                                            <dd className="mt-3 font-mono text-mono-lg text-ink">
                                                {(
                                                    investigation.verification.confidence * 100
                                                ).toFixed(0)}
                                                %
                                            </dd>
                                        </div>
                                    </dl>

                                    <div className="mt-8">
                                        <FindingsList findings={findings} />
                                    </div>

                                    <p className="mt-6 max-w-measure font-serif text-caption italic leading-relaxed text-muted">
                                        The confidence score is a heuristic assessment score,
                                        not a calibrated probability. Retrieved policy
                                        references are relevance matches and do not, by
                                        themselves, establish that a policy was violated.
                                    </p>
                                </>
                            )}
                    </div>
                </section>
            )}
        </main>
    );
}