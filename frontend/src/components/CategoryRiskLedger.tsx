import type { CategoryProfile } from "@/lib/analysis";
import { formatCurrency, formatDateShort, formatPercent, pluralize } from "@/lib/format";

interface CategoryRiskLedgerProps {
  profiles: CategoryProfile[];
}

/**
 * Flagged spend by category, as a ranked ruled ledger.
 *
 * A ranked list of a few categories does not need a plotted chart: aligned
 * columns with a proportional rule communicate the same comparison with far
 * less ink. The rule is `aria-hidden` because the value it encodes is printed
 * beside it — shape is never the only carrier of the figure.
 */
export function CategoryRiskLedger({ profiles }: CategoryRiskLedgerProps) {
  if (profiles.length === 0) {
    return null;
  }

  const largest = Math.max(...profiles.map((profile) => profile.flaggedSpend));

  return (
    <div>
      <div className="hidden grid-cols-[minmax(0,14rem)_minmax(0,1fr)_minmax(0,10rem)] gap-x-8 pb-2 lg:grid">
        <span className="mono-label">Category</span>
        <span className="mono-label">Relative flagged exposure</span>
        <span className="mono-label text-right">Flagged spend</span>
      </div>

      <ul className="list-none p-0">
        {profiles.map((profile) => {
          const span =
            profile.firstFlaggedDate && profile.lastFlaggedDate
              ? profile.firstFlaggedDate === profile.lastFlaggedDate
                ? formatDateShort(profile.firstFlaggedDate)
                : `${formatDateShort(profile.firstFlaggedDate)} – ${formatDateShort(
                    profile.lastFlaggedDate,
                  )}`
              : "No flagged date in the reviewed set";

          return (
            <li
              key={profile.category}
              className="grid grid-cols-1 gap-x-8 gap-y-3 border-t border-line py-4 lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)_minmax(0,10rem)]"
            >
              <div>
                <p className="font-serif text-serif-lg font-semibold leading-snug text-ink">
                  {profile.category}
                </p>
                <p className="mt-1 font-mono text-micro uppercase text-muted">
                  {profile.flaggedCount} flagged {pluralize(profile.flaggedCount, "transaction")}
                </p>
                <p className="mt-0.5 font-mono text-micro uppercase text-muted">{span}</p>
              </div>

              <div className="flex items-center" aria-hidden="true">
                <span className="block h-1.5 w-full bg-paper-deep">
                  <span
                    className="block h-full bg-crimson"
                    style={{ width: `${largest > 0 ? (profile.flaggedSpend / largest) * 100 : 0}%` }}
                  />
                </span>
              </div>

              <div className="lg:text-right">
                <p className="font-mono text-mono-lg tabular text-ink">
                  {formatCurrency(profile.flaggedSpend)}
                </p>
                <p className="mt-0.5 font-mono text-micro uppercase text-muted">
                  {formatPercent(profile.shareOfFlaggedSpend)} of flagged total
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
