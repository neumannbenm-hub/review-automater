"use server";

import { revalidatePath } from "next/cache";
import { createCampaign, deleteCampaign, type CampaignStep } from "@/lib/api";

const BUSINESS_ID = process.env.BUSINESS_ID ?? "default";

export async function createCampaignAction(data: {
  name: string;
  steps: Omit<CampaignStep, "stepNumber">[];
}) {
  const campaign = await createCampaign({ ...data, businessId: BUSINESS_ID });
  revalidatePath("/dashboard/campaigns");
  return campaign;
}

export async function deleteCampaignAction(id: string) {
  const result = await deleteCampaign(id);
  revalidatePath("/dashboard/campaigns");
  return result;
}
