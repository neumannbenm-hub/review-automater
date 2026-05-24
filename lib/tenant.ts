import { headers } from "next/headers";
import { createServiceClient, type TenantBranding, type Tenant, type TenantAccount } from "./supabase";

// ── Defaults ───────────────────────────────────────────────────────────────────

export const DEFAULT_BRANDING: TenantBranding = {
  primary_color: "#4f46e5",
  secondary_color: "#6366f1",
  logo_url: null,
  favicon_url: null,
  font_family: "Inter, sans-serif",
  app_name: "ReviewAutomater",
};

// ── Request-scoped helpers ─────────────────────────────────────────────────────
// Read tenant context injected by middleware into request headers.

export async function getCurrentTenantId(): Promise<string | null> {
  const h = await headers();
  return h.get("x-tenant-id");
}

export async function getCurrentTenantSlug(): Promise<string | null> {
  const h = await headers();
  return h.get("x-tenant-slug");
}

export async function getCurrentBranding(): Promise<TenantBranding> {
  const h = await headers();
  const raw = h.get("x-tenant-branding");
  if (!raw) return DEFAULT_BRANDING;
  try {
    return { ...DEFAULT_BRANDING, ...(JSON.parse(raw) as Partial<TenantBranding>) };
  } catch {
    return DEFAULT_BRANDING;
  }
}

// ── DB helpers (server-side, service role) ─────────────────────────────────────

export async function getTenantById(id: string): Promise<Tenant | null> {
  const db = createServiceClient();
  const { data } = await db.from("tenants").select("*").eq("id", id).single();
  return data ?? null;
}

export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  const db = createServiceClient();
  const { data } = await db.from("tenants").select("*").eq("slug", slug).single();
  return data ?? null;
}

export async function getTenantAccountRole(
  tenantId: string,
  clerkUserId: string
): Promise<string | null> {
  const db = createServiceClient();
  const { data } = await db
    .from("tenant_accounts")
    .select("role")
    .eq("tenant_id", tenantId)
    .eq("clerk_user_id", clerkUserId)
    .eq("status", "active")
    .maybeSingle();
  return data?.role ?? null;
}

export async function getTenantAccounts(tenantId: string): Promise<TenantAccount[]> {
  const db = createServiceClient();
  const { data } = await db
    .from("tenant_accounts")
    .select("*")
    .eq("tenant_id", tenantId)
    .neq("status", "removed")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getAllTenants(): Promise<Tenant[]> {
  const db = createServiceClient();
  const { data } = await db
    .from("tenants")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getTenantSeatCounts(): Promise<
  Record<string, { total: number; active: number }>
> {
  const db = createServiceClient();
  const { data } = await db
    .from("tenant_accounts")
    .select("tenant_id, seat_count, status");
  if (!data) return {};
  return data.reduce<Record<string, { total: number; active: number }>>((acc, row) => {
    if (!acc[row.tenant_id]) acc[row.tenant_id] = { total: 0, active: 0 };
    acc[row.tenant_id].total += row.seat_count ?? 1;
    if (row.status === "active") acc[row.tenant_id].active += row.seat_count ?? 1;
    return acc;
  }, {});
}
