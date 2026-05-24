import { getAllTenants, getTenantSeatCounts } from "@/lib/tenant";
import type { Tenant } from "@/lib/supabase";
import {
  createTenant,
  updateTenantBranding,
  updateTenantPricing,
  generateOnboardingLink,
} from "./actions";

// ── Helpers ────────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-green-50 text-green-700",
    suspended: "bg-yellow-50 text-yellow-700",
    churned: "bg-gray-100 text-gray-500",
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status] ?? "bg-gray-100 text-gray-500"}`}
    >
      {status}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ── Expandable tenant row ──────────────────────────────────────────────────────

function TenantRow({
  tenant,
  seats,
}: {
  tenant: Tenant;
  seats: { total: number; active: number };
}) {
  return (
    <details className="group">
      <summary className="cursor-pointer list-none">
        <tr className="hover:bg-gray-50/50 cursor-pointer">
          <td className="px-6 py-3 font-medium text-gray-900">{tenant.name}</td>
          <td className="px-6 py-3 font-mono text-xs text-gray-500">{tenant.slug}</td>
          <td className="px-6 py-3 text-gray-500 text-xs">{tenant.custom_domain ?? "—"}</td>
          <td className="px-6 py-3">
            <StatusBadge status={tenant.status} />
          </td>
          <td className="px-6 py-3 text-gray-900">
            {seats.active} <span className="text-gray-400">/ {tenant.pricing.max_seats}</span>
          </td>
          <td className="px-6 py-3 text-gray-500">{formatDate(tenant.created_at)}</td>
          <td className="px-6 py-3">
            <span className="text-xs text-brand-600">Edit ▾</span>
          </td>
        </tr>
      </summary>
      {/* Edit panel — rendered as a table row via a workaround div */}
      <div className="bg-gray-50 border-t border-gray-100 px-6 py-6 grid grid-cols-2 gap-8">
        {/* Branding editor */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-4">Branding</h3>
          <form action={updateTenantBranding} className="space-y-3">
            <input type="hidden" name="tenantId" value={tenant.id} />
            {(
              [
                { name: "app_name", label: "App name", type: "text", value: tenant.branding.app_name },
                { name: "primary_color", label: "Primary color", type: "color", value: tenant.branding.primary_color },
                { name: "secondary_color", label: "Secondary color", type: "color", value: tenant.branding.secondary_color },
                { name: "font_family", label: "Font family", type: "text", value: tenant.branding.font_family },
                { name: "logo_url", label: "Logo URL", type: "url", value: tenant.branding.logo_url ?? "" },
                { name: "favicon_url", label: "Favicon URL", type: "url", value: tenant.branding.favicon_url ?? "" },
              ] as const
            ).map(({ name, label, type, value }) => (
              <div key={name}>
                <label className="block text-xs text-gray-500 mb-1">{label}</label>
                <input
                  name={name}
                  type={type}
                  defaultValue={value}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            ))}
            <button
              type="submit"
              className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
            >
              Save branding
            </button>
          </form>
        </div>

        {/* Pricing editor */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-4">Pricing & Limits</h3>
          <form action={updateTenantPricing} className="space-y-3">
            <input type="hidden" name="tenantId" value={tenant.id} />
            {(
              [
                { name: "wholesale_rate", label: "Wholesale rate ($/seat/mo)", value: tenant.wholesale_rate },
                { name: "retail_rate", label: "Retail rate ($/seat/mo)", value: tenant.retail_rate },
                { name: "monthly_price_per_seat", label: "Price per seat ($/mo)", value: tenant.pricing.monthly_price_per_seat },
                { name: "max_seats", label: "Max seats", value: tenant.pricing.max_seats },
                { name: "trial_days", label: "Trial days", value: tenant.pricing.trial_days },
              ] as const
            ).map(({ name, label, value }) => (
              <div key={name}>
                <label className="block text-xs text-gray-500 mb-1">{label}</label>
                <input
                  name={name}
                  type="number"
                  step="0.01"
                  defaultValue={value}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Billing model</label>
              <select
                name="billing_model"
                defaultValue={tenant.pricing.billing_model}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="wholesale">Wholesale</option>
                <option value="resell">Resell</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Status</label>
              <select
                name="status"
                defaultValue={tenant.status}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="churned">Churned</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
            >
              Save pricing
            </button>
          </form>

          {/* Onboarding link */}
          <div className="mt-6">
            <h3 className="font-semibold text-gray-700 mb-3">Onboarding link</h3>
            <p className="text-xs text-gray-500 mb-3">
              Generate a one-time link to onboard this tenant&apos;s first admin account.
            </p>
            <form action={generateOnboardingLink}>
              <input type="hidden" name="tenantId" value={tenant.id} />
              <button
                type="submit"
                className="border border-brand-500 text-brand-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-50 transition-colors"
              >
                Generate link
              </button>
            </form>
          </div>
        </div>
      </div>
    </details>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function SuperAdminTenantsPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; onboardUrl?: string }>;
}) {
  const { created, onboardUrl } = await searchParams;
  const [tenants, seatCounts] = await Promise.all([getAllTenants(), getTenantSeatCounts()]);

  const totalActive = tenants.filter((t) => t.status === "active").length;
  const totalSeats = Object.values(seatCounts).reduce((s, v) => s + v.active, 0);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
        <p className="text-gray-500 mt-1 text-sm">
          {totalActive} active tenant{totalActive !== 1 ? "s" : ""} · {totalSeats} total active seats
        </p>
      </div>

      {/* Success banners */}
      {created && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
          Tenant created successfully.
        </div>
      )}
      {onboardUrl && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 break-all">
          <p className="font-medium mb-1">Onboarding link (share once, expires in 7 days):</p>
          <code>{decodeURIComponent(onboardUrl)}</code>
        </div>
      )}

      {/* Create tenant form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
        <h2 className="font-semibold text-gray-900 mb-5">Create new tenant</h2>
        <form action={createTenant} className="grid grid-cols-2 gap-4">
          {(
            [
              { name: "name", label: "Partner name", type: "text", placeholder: "Acme Agency" },
              { name: "slug", label: "Slug (subdomain)", type: "text", placeholder: "acme" },
              { name: "custom_domain", label: "Custom domain (optional)", type: "text", placeholder: "app.acmeagency.com" },
              { name: "app_name", label: "App name", type: "text", placeholder: "Acme Reviews" },
              { name: "primary_color", label: "Primary color", type: "color", placeholder: "#4f46e5" },
              { name: "wholesale_rate", label: "Wholesale rate ($/seat/mo)", type: "number", placeholder: "29" },
              { name: "retail_rate", label: "Retail rate ($/seat/mo)", type: "number", placeholder: "49" },
              { name: "max_seats", label: "Max seats", type: "number", placeholder: "10" },
            ] as const
          ).map(({ name, label, type, placeholder }) => (
            <div key={name}>
              <label className="block text-sm text-gray-500 mb-1">{label}</label>
              <input
                name={name}
                type={type}
                placeholder={placeholder}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          ))}
          <div className="col-span-2">
            <button
              type="submit"
              className="bg-brand-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors"
            >
              Create tenant
            </button>
          </div>
        </form>
      </div>

      {/* Tenants table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-6 py-3 text-gray-500 font-medium">Name</th>
              <th className="px-6 py-3 text-gray-500 font-medium">Slug</th>
              <th className="px-6 py-3 text-gray-500 font-medium">Custom domain</th>
              <th className="px-6 py-3 text-gray-500 font-medium">Status</th>
              <th className="px-6 py-3 text-gray-500 font-medium">Seats</th>
              <th className="px-6 py-3 text-gray-500 font-medium">Created</th>
              <th className="px-6 py-3 text-gray-500 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {tenants.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                  No tenants yet. Create one above.
                </td>
              </tr>
            ) : (
              tenants.map((t) => (
                <TenantRow
                  key={t.id}
                  tenant={t}
                  seats={seatCounts[t.id] ?? { total: 0, active: 0 }}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
