"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServiceClient, type TenantBranding, type TenantPricing } from "@/lib/supabase";

// ── Guard ──────────────────────────────────────────────────────────────────────

async function requireSuperAdmin() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const user = await currentUser();
  if (user?.privateMetadata?.isSuperAdmin !== true) throw new Error("Forbidden");
}

// ── Create tenant ──────────────────────────────────────────────────────────────

export async function createTenant(formData: FormData) {
  await requireSuperAdmin();

  const db = createServiceClient();

  const slug = (formData.get("slug") as string).toLowerCase().replace(/[^a-z0-9-]/g, "-");
  const name = formData.get("name") as string;
  const customDomain = (formData.get("custom_domain") as string) || null;
  const appName = (formData.get("app_name") as string) || name;
  const primaryColor = (formData.get("primary_color") as string) || "#4f46e5";
  const wholesaleRate = parseFloat((formData.get("wholesale_rate") as string) || "0");
  const retailRate = parseFloat((formData.get("retail_rate") as string) || "0");
  const maxSeats = parseInt((formData.get("max_seats") as string) || "10", 10);

  const branding: TenantBranding = {
    primary_color: primaryColor,
    secondary_color: "#6366f1",
    logo_url: null,
    favicon_url: null,
    font_family: "Inter, sans-serif",
    app_name: appName,
  };

  const pricing: TenantPricing = {
    monthly_price_per_seat: retailRate || wholesaleRate,
    billing_model: retailRate > 0 ? "resell" : "wholesale",
    trial_days: 14,
    max_seats: maxSeats,
  };

  const { error } = await db.from("tenants").insert({
    slug,
    name,
    custom_domain: customDomain,
    branding,
    pricing,
    wholesale_rate: wholesaleRate,
    retail_rate: retailRate,
  });

  if (error) throw new Error(`Failed to create tenant: ${error.message}`);

  revalidatePath("/super-admin/tenants");
  redirect("/super-admin/tenants?created=1");
}

// ── Update branding ───────────────────────────────────────────────────────────

export async function updateTenantBranding(formData: FormData) {
  await requireSuperAdmin();

  const db = createServiceClient();
  const tenantId = formData.get("tenantId") as string;

  const branding: TenantBranding = {
    app_name: formData.get("app_name") as string,
    primary_color: formData.get("primary_color") as string,
    secondary_color: formData.get("secondary_color") as string,
    font_family: formData.get("font_family") as string,
    logo_url: (formData.get("logo_url") as string) || null,
    favicon_url: (formData.get("favicon_url") as string) || null,
  };

  const { error } = await db
    .from("tenants")
    .update({ branding })
    .eq("id", tenantId);

  if (error) throw new Error(`Failed to update branding: ${error.message}`);

  // Branding change takes effect on next cache miss (up to 5 min for middleware cache)
  revalidatePath("/super-admin/tenants");
}

// ── Update pricing ────────────────────────────────────────────────────────────

export async function updateTenantPricing(formData: FormData) {
  await requireSuperAdmin();

  const db = createServiceClient();
  const tenantId = formData.get("tenantId") as string;

  const pricing: TenantPricing = {
    monthly_price_per_seat: parseFloat(formData.get("monthly_price_per_seat") as string),
    billing_model: formData.get("billing_model") as "wholesale" | "resell",
    trial_days: parseInt(formData.get("trial_days") as string, 10),
    max_seats: parseInt(formData.get("max_seats") as string, 10),
  };

  const { error } = await db
    .from("tenants")
    .update({
      pricing,
      wholesale_rate: parseFloat(formData.get("wholesale_rate") as string),
      retail_rate: parseFloat(formData.get("retail_rate") as string),
      status: formData.get("status") as string,
    })
    .eq("id", tenantId);

  if (error) throw new Error(`Failed to update pricing: ${error.message}`);

  revalidatePath("/super-admin/tenants");
}

// ── Generate onboarding link ──────────────────────────────────────────────────

export async function generateOnboardingLink(formData: FormData) {
  await requireSuperAdmin();

  const db = createServiceClient();
  const tenantId = formData.get("tenantId") as string;

  // Create a tenant_admin invite
  const { data: invite, error } = await db
    .from("tenant_invites")
    .insert({ tenant_id: tenantId, role: "tenant_admin" })
    .select("token")
    .single();

  if (error || !invite) throw new Error("Failed to generate onboarding link");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const url = `${appUrl}/accept-invite?token=${invite.token}`;

  revalidatePath("/super-admin/tenants");
  redirect(`/super-admin/tenants?onboardUrl=${encodeURIComponent(url)}`);
}
