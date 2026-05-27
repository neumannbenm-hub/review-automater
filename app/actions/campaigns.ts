"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createCampaign, deleteCampaign, type CampaignStep } from "@/lib/api";
import { createServiceClient } from "@/lib/supabase";
import { getCurrentTenantIdForUser } from "@/lib/tenant";
import type { ReviewSiteEntry } from "@/app/actions/settings";

export async function createCampaignAction(data: {
  name: string;
  steps: Omit<CampaignStep, "stepNumber">[];
  reviewSiteIds?: string[];
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { reviewSiteIds, ...campaignData } = data;
  const campaign = await createCampaign({ ...campaignData, businessId: userId });

  if (reviewSiteIds && reviewSiteIds.length > 0) {
    const tenantId = await getCurrentTenantIdForUser(userId);
    if (tenantId) {
      const db = createServiceClient();
      await db.from("campaign_review_sites").insert(
        reviewSiteIds.map((siteId, i) => ({
          campaign_id: campaign.id,
          tenant_id: tenantId,
          review_site_id: siteId,
          sort_order: i,
        }))
      );
    }
  }

  revalidatePath("/dashboard/campaigns");
  return campaign;
}

export async function deleteCampaignAction(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const db = createServiceClient();
  await db.from("campaign_review_sites").delete().eq("campaign_id", id);

  const result = await deleteCampaign(id);
  revalidatePath("/dashboard/campaigns");
  return result;
}

export async function getCampaignReviewSitesAction(
  campaignId: string
): Promise<ReviewSiteEntry[]> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const db = createServiceClient();
  const { data } = await db
    .from("campaign_review_sites")
    .select("review_site_id, sort_order, review_sites(id, display_name, platform, url, sort_order)")
    .eq("campaign_id", campaignId)
    .order("sort_order", { ascending: true });

  if (!data) return [];
  return data
    .map((row) => {
      const site = row.review_sites as unknown as ReviewSiteEntry | null;
      return site;
    })
    .filter((s): s is ReviewSiteEntry => s !== null);
}

export async function getCampaignReviewSitesMapAction(
  campaignIds: string[]
): Promise<Record<string, ReviewSiteEntry[]>> {
  if (campaignIds.length === 0) return {};
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const db = createServiceClient();
  const { data } = await db
    .from("campaign_review_sites")
    .select("campaign_id, sort_order, review_sites(id, display_name, platform, url, sort_order)")
    .in("campaign_id", campaignIds)
    .order("sort_order", { ascending: true });

  if (!data) return {};

  const map: Record<string, ReviewSiteEntry[]> = {};
  for (const row of data) {
    const site = row.review_sites as unknown as ReviewSiteEntry | null;
    if (!site) continue;
    if (!map[row.campaign_id]) map[row.campaign_id] = [];
    map[row.campaign_id].push(site);
  }
  return map;
}
