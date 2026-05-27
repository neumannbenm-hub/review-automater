"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { randomBytes } from "crypto";
import { createServiceClient } from "@/lib/supabase";
import { getCurrentTenantIdForUser } from "@/lib/tenant";

export type ReviewSiteEntry = {
  id: string;
  display_name: string | null;
  platform: string;
  url: string;
  sort_order: number;
};

export async function generateWebhookKeyAction(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const key = `wh_${randomBytes(24).toString("hex")}`;
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);

  await clerk.users.updateUserMetadata(userId, {
    privateMetadata: {
      ...(user.privateMetadata as object),
      webhookApiKey: key,
    },
  });

  return key;
}

export async function saveCustomVariablesAction(names: string[]): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);

  const sanitized = names
    .map((n) => n.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_"))
    .filter(Boolean);

  await clerk.users.updateUserMetadata(userId, {
    privateMetadata: {
      ...(user.privateMetadata as object),
      customVariableNames: sanitized,
    },
  });
}

export async function getReviewSitesAction(): Promise<ReviewSiteEntry[]> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const tenantId = await getCurrentTenantIdForUser(userId);
  if (!tenantId) return [];
  const db = createServiceClient();
  const { data } = await db
    .from("review_sites")
    .select("id, display_name, platform, url, sort_order")
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function upsertReviewSiteAction(data: {
  id?: string;
  name: string;
  url: string;
}): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const tenantId = await getCurrentTenantIdForUser(userId);
  if (!tenantId) throw new Error("No tenant context");
  const db = createServiceClient();

  const platform = data.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "custom";

  if (data.id) {
    await db
      .from("review_sites")
      .update({ display_name: data.name.trim(), platform, url: data.url.trim() })
      .eq("id", data.id)
      .eq("tenant_id", tenantId);
  } else {
    const { data: last } = await db
      .from("review_sites")
      .select("sort_order")
      .eq("tenant_id", tenantId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    await db.from("review_sites").insert({
      tenant_id: tenantId,
      platform,
      display_name: data.name.trim(),
      url: data.url.trim(),
      is_active: true,
      sort_order: (last?.sort_order ?? -1) + 1,
    });
  }
}

export async function deleteReviewSiteAction(id: string): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const tenantId = await getCurrentTenantIdForUser(userId);
  if (!tenantId) throw new Error("No tenant context");
  const db = createServiceClient();
  await db.from("review_sites").delete().eq("id", id).eq("tenant_id", tenantId);
}

export async function getSettingsAction(): Promise<{
  webhookApiKey: string | null;
  customVariableNames: string[];
}> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const meta = user.privateMetadata as Record<string, unknown>;

  return {
    webhookApiKey: (meta.webhookApiKey as string | undefined) ?? null,
    customVariableNames: (meta.customVariableNames as string[] | undefined) ?? [],
  };
}
