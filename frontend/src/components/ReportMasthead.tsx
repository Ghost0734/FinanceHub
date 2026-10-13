import { Link, NavLink } from "react-router-dom";
import { joinClassNames } from "@/lib/format";

const NAV_ITEMS = [
  { to: "/", label: "Overview", end: true },
  { to: "/investigations", label: "Investigations", end: false },
  { to: "/forecast", label: "Forecast", end: false },
];

/**
 * The masthead: brand on the left, report sections on the right, one hairline
 * beneath. It stays pinned so section navigation is always reachable, and uses
 * a solid paper fill rather than a translucent blur.
 *
 * The active section is marked by a crimson rule *and* `aria-current`, so the
 * state never depends on colour alone.
 */
export function ReportMasthead() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper">
      <div className="report-shell flex h-14 items-center justify-between gap-6">
        <Link to="/" className="flex items-baseline gap-3" aria-label="FinanceHub — financial overview">
          <span className="font-display text-[1.0625rem] font-extrabold uppercase tracking-[0.01em] text-navy">
            FinanceHub
          </span>
          <span className="mono-label hidden lg:inline">Investigative financial report</span>
        </Link>

        <nav aria-label="Report sections">
          <ul className="flex list-none items-center gap-5 p-0 sm:gap-8">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    joinClassNames(
                      "mono-label block border-b-2 pb-1 pt-1 transition-colors duration-quick",
                      isActive
                        ? "border-crimson text-ink"
                        : "border-transparent text-muted hover:text-ink",
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
