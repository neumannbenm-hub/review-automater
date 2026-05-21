"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createCampaign, deleteCampaign, type CampaignStep } from "@/lib/api";

export async function createCampaignAction(data: {
  name: string;
  steps: Omit<CampaignStep, "stepNumber">[];
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const campaign = await createCampaign({ ...data, businessId: userId });
  revalidatePath("/dashboard/campaigns");
  return campaign;
}

export async function deleteCampaignAction(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const result = await deleteCampaign(id);
  revalidatePath("/dashboard/campaigns");
  return result;
}
