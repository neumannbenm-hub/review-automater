import { getCurrentTenantId, getTenantById, getTenantAccounts } from "@/lib/tenant";
import type { TenantAccount } from "@/lib/supabase";
import { provisionAccount, suspendAccount, removeAccount } from "./actions";

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function relativeTime(iso: string | null): string {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
}

function shortId(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

// ── Seat growth chart (SVG, server-rendered) ───────────────────────────────────

function SeatGrowthChart({ accounts }: { accounts: TenantAccount[] }) {
  const months: Record<string, number> = {};
  const now = new Date();

  // Build 6-month buckets
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months[key] = 0;
  }

  for (const acct of accounts) {
    const d = new Date(acct.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (key in months) months[key] += acct.seat_count;
  }

  const labels = Object.keys(months).map((k) => {
    const [y, m] = k.split("-");
    return new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString("en-US", { month: "short" });
  });
  const values = Object.values(months);
  const max = Math.max(...values, 1);
  const w = 480;
  const h = 120;
  const barWidth = 40;
  const gap = (w - barWidth * 6) / 7;

  return (
    <svg viewBox={`0 0 ${w} ${h + 24}`} className="w-full" aria-label="Seat growth by month">
      {values.map((v, i) => {
        const barH = Math.max((v / max) * h, 2);
        const x = gap + i * (barWidth + gap);
        const y = h - barH;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barH}
              rx={4}
              fill="var(--color-primary, #4f46e5)"
              opacity={0.85}
            />
            <text
              x={x + barWidth / 2}
              y={h + 18}
              textAnchor="middle"
              fontSize={11}
              fill="#9ca3af"
            >
              {labels[i]}
            </text>
            {v > 0 && (
              <text
                x={x + barWidth / 2}
                y={y - 4}
                textAnchor="middle"
                fontSize={10}
                fill="#6b7280"
              >
                {v}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ── Status badge ───────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-green-50 text-green-700",
    suspended: "bg-yellow-50 text-yellow-700",
    removed: "bg-red-50 text-red-600",
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status] ?? "bg-gray-100 text-gray-500"}`}
    >
      {status}
    </span>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function TenantAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const tenantId = await getCurrentTenantId();
  if (!tenantId) return null;

  const [tenant, accounts] = await Promise.all([
    getTenantById(tenantId),
    getTenantAccounts(tenantId),
  ]);

  if (!tenant) return null;

  const activeAccounts = accounts.filter((a) => a.status === "active");
  const totalSeats = activeAccounts.reduce((s, a) => s + a.seat_count, 0);
  const maxSeats = tenant.pricing.max_seats;

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const addedThisMonth = accounts.filter((a) => a.created_at.startsWith(thisMonth)).length;

  const wholesaleMonthlyCost = (tenant.wholesale_rate * totalSeats).toFixed(2);
  const retailMonthlyRevenue =
    tenant.pricing.billing_model === "resell"
      ? (tenant.retail_rate * totalSeats).toFixed(2)
      : null;
  const margin =
    retailMonthlyRevenue && tenant.retail_rate > 0
      ? Math.round(((tenant.retail_rate - tenant.wholesale_rate) / tenant.retail_rate) * 100)
      : null;

  const isFinancial = tab === "financial";

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isFinancial ? "Financials" : "Accounts"}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {isFinancial
              ? "Cost, revenue, and seat growth for your plan."
              : "Manage sub-accounts under your partner plan."}
          </p>
        </div>
        {/* Tab switcher */}
        <div className="flex gap-2">
          <a
            href="/tenant-admin"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!isFinancial ? "bg-brand-600 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >
            Accounts
          </a>
          <a
            href="/tenant-admin?tab=financial"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isFinancial ? "bg-brand-600 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >
            Financials
          </a>
        </div>
      </div>

      {/* ── Accounts panel ── */}
      {!isFinancial && (
        <>
          {/* Aggregate metrics */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Total accounts", value: accounts.length },
              { label: "Active seats", value: `${totalSeats} / ${maxSeats}` },
              { label: "Added this month", value: addedThisMonth },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5">
                <p className="text-sm text-gray-500 mb-1">{label}</p>
                <p className="text-3xl font-bold text-gray-900">{value}</p>
              </div>
            ))}
          </div>

          {/* Seat limit warning */}
          {totalSeats >= maxSeats && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
              Seat limit reached ({maxSeats} seats). Contact support to increase your limit.
            </div>
          )}

          {/* Provision form */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">Provision new account</h2>
            <form action={provisionAccount} className="flex items-end gap-3">
              <input type="hidden" name="tenantId" value={tenantId} />
              <div className="flex-1">
                <label className="block text-sm text-gray-500 mb-1">Email address</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="partner@example.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Role</label>
                <select
                  name="role"
                  className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="member">Member</option>
                  <option value="tenant_admin">Admin</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={totalSeats >= maxSeats}
                className="bg-brand-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Send invite
              </button>
            </form>
          </div>

          {/* Accounts table */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-6 py-3 text-gray-500 font-medium">Account ID</th>
                  <th className="px-6 py-3 text-gray-500 font-medium">Plan</th>
                  <th className="px-6 py-3 text-gray-500 font-medium">Seats</th>
                  <th className="px-6 py-3 text-gray-500 font-medium">Status</th>
                  <th className="px-6 py-3 text-gray-500 font-medium">Created</th>
                  <th className="px-6 py-3 text-gray-500 font-medium">Last active</th>
                  <th className="px-6 py-3 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {accounts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                      No accounts yet. Send an invite above.
                    </td>
                  </tr>
                ) : (
                  accounts.map((acct) => (
                    <tr key={acct.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-3 font-mono text-gray-700 text-xs">{shortId(acct.id)}</td>
                      <td className="px-6 py-3 text-gray-500">{acct.plan ?? "—"}</td>
                      <td className="px-6 py-3 text-gray-900">{acct.seat_count}</td>
                      <td className="px-6 py-3">
                        <StatusBadge status={acct.status} />
                      </td>
                      <td className="px-6 py-3 text-gray-500">{formatDate(acct.created_at)}</td>
                      <td className="px-6 py-3 text-gray-500">{relativeTime(acct.last_active_at)}</td>
                      <td className="px-6 py-3">
                        {acct.status === "active" ? (
                          <form action={suspendAccount} className="inline">
                            <input type="hidden" name="accountId" value={acct.id} />
                            <input type="hidden" name="tenantId" value={tenantId} />
                            <button
                              type="submit"
                              className="text-xs text-yellow-600 hover:underline"
                            >
                              Suspend
                            </button>
                          </form>
                        ) : acct.status === "suspended" ? (
                          <form action={removeAccount} className="inline">
                            <input type="hidden" name="accountId" value={acct.id} />
                            <input type="hidden" name="tenantId" value={tenantId} />
                            <button
                              type="submit"
                              className="text-xs text-red-600 hover:underline"
                            >
                              Remove
                            </button>
                          </form>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── Financial panel ── */}
      {isFinancial && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Monthly cost", value: `$${wholesaleMonthlyCost}`, sub: "wholesale rate × seats" },
              retailMonthlyRevenue
                ? { label: "Est. revenue", value: `$${retailMonthlyRevenue}`, sub: "retail rate × seats" }
                : null,
              margin !== null ? { label: "Implied margin", value: `${margin}%`, sub: "retail − wholesale" } : null,
              { label: "Active seats", value: String(totalSeats), sub: `of ${maxSeats} max` },
            ]
              .filter(Boolean)
              .map((stat) => (
                <div key={stat!.label} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <p className="text-sm text-gray-500 mb-1">{stat!.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat!.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{stat!.sub}</p>
                </div>
              ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-6">Seat growth — last 6 months</h2>
            <SeatGrowthChart accounts={accounts} />
          </div>

          <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Plan details</h2>
            <dl className="grid grid-cols-2 gap-y-3 text-sm">
              <dt className="text-gray-500">Billing model</dt>
              <dd className="text-gray-900 capitalize">{tenant.pricing.billing_model}</dd>
              <dt className="text-gray-500">Wholesale rate</dt>
              <dd className="text-gray-900">${tenant.wholesale_rate}/seat/mo</dd>
              {tenant.pricing.billing_model === "resell" && (
                <>
                  <dt className="text-gray-500">Retail rate</dt>
                  <dd className="text-gray-900">${tenant.retail_rate}/seat/mo</dd>
                </>
              )}
              <dt className="text-gray-500">Max seats</dt>
              <dd className="text-gray-900">{tenant.pricing.max_seats}</dd>
              <dt className="text-gray-500">Trial days</dt>
              <dd className="text-gray-900">{tenant.pricing.trial_days}</dd>
            </dl>
          </div>
        </>
      )}
    </div>
  );
}
