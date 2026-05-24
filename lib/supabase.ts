import { createClient } from "@supabase/supabase-js";

// ── Types ──────────────────────────────────────────────────────────────────────

export type TenantStatus = "active" | "suspended" | "churned";
export type TenantAccountRole = "tenant_admin" | "member";
export type TenantAccountStatus = "active" | "suspended" | "removed";
export type BillingModel = "wholesale" | "resell";

export interface TenantBranding {
  primary_color: string;
  secondary_color: string;
  logo_url: string | null;
  favicon_url: string | null;
  font_family: string;
  app_name: string;
}

export interface TenantPricing {
  monthly_price_per_seat: number;
  billing_model: BillingModel;
  trial_days: number;
  max_seats: number;
}

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  status: TenantStatus;
  custom_domain: string | null;
  branding: TenantBranding;
  pricing: TenantPricing;
  wholesale_rate: number;
  retail_rate: number;
  created_at: string;
  updated_at: string;
}

export interface TenantAccount {
  id: string;
  tenant_id: string;
  clerk_user_id: string;
  role: TenantAccountRole;
  plan: string | null;
  seat_count: number;
  status: TenantAccountStatus;
  created_at: string;
  last_active_at: string | null;
}

export interface TenantInvite {
  id: string;
  tenant_id: string;
  role: TenantAccountRole;
  token: string;
  accepted_at: string | null;
  expires_at: string;
  created_at: string;
}

// ── Client factory ─────────────────────────────────────────────────────────────
// Server-side only. Uses the service-role key which bypasses RLS.
// All queries must include explicit tenant_id filters for data isolation.

export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars not configured");
  return createClient(url, key, { auth: { persistSession: false } });
}

// ── Color utilities ────────────────────────────────────────────────────────────

export function hexToRgbChannels(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return "79 70 229"; // fallback indigo-600
  return `${r} ${g} ${b}`;
}

// Adjust lightness by percent: positive = darken, negative = lighten.
export function darkenHex(hex: string, percent: number): string {
  const clean = hex.replace("#", "");
  const r0 = parseInt(clean.slice(0, 2), 16);
  const g0 = parseInt(clean.slice(2, 4), 16);
  const b0 = parseInt(clean.slice(4, 6), 16);
  if (isNaN(r0) || isNaN(g0) || isNaN(b0)) return "67 56 202"; // fallback indigo-700
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const delta = Math.round(255 * (percent / 100));
  return `${clamp(r0 - delta)} ${clamp(g0 - delta)} ${clamp(b0 - delta)}`;
}
