"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase";
import { getCurrentTenantId } from "@/lib/tenant";

async function requireAuthAndTenant() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const tenantId = await getCurrentTenantId();
  if (!tenantId) throw new Error("No tenant context");
  return { userId, tenantId };
}

// ── Step 1: Business info ──────────────────────────────────────────────────────

export async function saveBusinessInfo(data: {
  businessName: string;
  businessType: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  website: string;
}) {
  const { tenantId } = await requireAuthAndTenant();
  const db = createServiceClient();

  const { error } = await db.from("business_profiles").upsert(
    {
      tenant_id: tenantId,
      business_name: data.businessName.trim(),
      business_type: data.businessType || null,
      phone: data.phone.trim() || null,
      address: data.address.trim() || null,
      city: data.city.trim() || null,
      state: data.state || null,
      zip: data.zip.trim() || null,
      website: data.website.trim() || null,
    },
    { onConflict: "tenant_id" }
  );

  if (error) throw new Error(`Failed to save business info: ${error.message}`);
  return { success: true };
}

// ── Step 2: Admin info ─────────────────────────────────────────────────────────

export async function saveAdminInfo(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  title: string;
}) {
  const { tenantId } = await requireAuthAndTenant();
  const db = createServiceClient();

  // Try update first; if no row exists yet, upsert with empty business_name as placeholder
  const { data: existing } = await db
    .from("business_profiles")
    .select("id")
    .eq("tenant_id", tenantId)
    .maybeSingle();

  const payload = {
    admin_first_name: data.firstName.trim() || null,
    admin_last_name: data.lastName.trim() || null,
    admin_email: data.email.trim() || null,
    admin_phone: data.phone.trim() || null,
    admin_title: data.title.trim() || null,
  };

  let error;
  if (existing) {
    ({ error } = await db
      .from("business_profiles")
      .update(payload)
      .eq("tenant_id", tenantId));
  } else {
    ({ error } = await db
      .from("business_profiles")
      .insert({ tenant_id: tenantId, business_name: "", ...payload }));
  }

  if (error) throw new Error(`Failed to save admin info: ${error.message}`);
  return { success: true };
}

// ── Step 3: Review sites ───────────────────────────────────────────────────────

export async function saveReviewSites(
  sites: Array<{ platform: string; displayName: string; url: string; sortOrder: number }>
) {
  const { tenantId } = await requireAuthAndTenant();
  const db = createServiceClient();

  // Replace all existing sites for this tenant
  await db.from("review_sites").delete().eq("tenant_id", tenantId);

  if (sites.length > 0) {
    const { error } = await db.from("review_sites").insert(
      sites.map((s) => ({
        tenant_id: tenantId,
        platform: s.platform,
        display_name: s.displayName.trim() || null,
        url: s.url.trim(),
        is_active: true,
        sort_order: s.sortOrder,
      }))
    );
    if (error) throw new Error(`Failed to save review sites: ${error.message}`);
  }

  return { success: true };
}

// ── Step 4: Team invites ───────────────────────────────────────────────────────

export async function createTeamInvites(
  invites: Array<{ email: string; role: string }>
): Promise<{ inviteLinks: Array<{ email: string; url: string }> }> {
  const { tenantId } = await requireAuthAndTenant();
  const db = createServiceClient();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const results: Array<{ email: string; url: string }> = [];

  for (const invite of invites) {
    if (!invite.email.trim()) continue;

    const { data, error } = await db
      .from("tenant_invites")
      .insert({ tenant_id: tenantId, role: invite.role })
      .select("token")
      .single();

    if (error || !data) continue;

    results.push({
      email: invite.email.trim(),
      url: `${appUrl}/accept-invite?token=${data.token}&email=${encodeURIComponent(invite.email.trim())}`,
    });
  }

  return { inviteLinks: results };
}

// ── Step 5: Complete onboarding ────────────────────────────────────────────────

export async function completeOnboarding() {
  const { userId, tenantId } = await requireAuthAndTenant();
  const db = createServiceClient();

  await db
    .from("tenant_accounts")
    .update({ onboarding_completed_at: new Date().toISOString() })
    .eq("tenant_id", tenantId)
    .eq("clerk_user_id", userId);

  redirect("/dashboard");
}
