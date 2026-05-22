"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { sendRequest, type SendRequestPayload } from "@/lib/api";
import { getPlanById, FREE_TRIAL_REQUESTS } from "@/lib/plans";

interface UsageMetadata {
  requestsUsed?: number;
  requestsResetAt?: string;
  extraRequests?: number;
  stripePlan?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

function getNextResetDate(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}

function resolveUsage(metadata: UsageMetadata): { used: number; isNewPeriod: boolean } {
  const now = new Date();
  const resetAt = metadata.requestsResetAt ? new Date(metadata.requestsResetAt) : null;
  const isNewPeriod = !resetAt || now >= resetAt;
  return { used: isNewPeriod ? 0 : (metadata.requestsUsed ?? 0), isNewPeriod };
}

export async function getRequestUsage() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const metadata = user.privateMetadata as UsageMetadata;

  const plan = metadata.stripePlan ? getPlanById(metadata.stripePlan) : null;
  const limit = plan ? plan.requestsPerMonth : FREE_TRIAL_REQUESTS;
  const { used } = resolveUsage(metadata);

  return {
    used,
    limit,
    extraRequests: metadata.extraRequests ?? 0,
    planId: metadata.stripePlan ?? null,
    pricePerExtraRequest: plan?.pricePerExtraRequest ?? 0.10,
  };
}

export async function sendReviewRequest(payload: SendRequestPayload) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const metadata = user.privateMetadata as UsageMetadata;

  const plan = metadata.stripePlan ? getPlanById(metadata.stripePlan) : null;
  const limit = plan ? plan.requestsPerMonth : FREE_TRIAL_REQUESTS;
  const { used, isNewPeriod } = resolveUsage(metadata);
  const extraRequests = metadata.extraRequests ?? 0;

  if (used >= limit && extraRequests <= 0) {
    throw new Error("LIMIT_EXCEEDED");
  }

  // Send the request first; only update counters on success
  const data = { ...payload, businessId: userId };
  const result = await sendRequest(data);

  const nextResetAt = getNextResetDate();
  const usingExtra = used >= limit;

  await client.users.updateUserMetadata(userId, {
    privateMetadata: {
      ...(metadata as object),
      requestsUsed: used + 1,
      requestsResetAt: isNewPeriod ? nextResetAt.toISOString() : metadata.requestsResetAt,
      ...(usingExtra ? { extraRequests: extraRequests - 1 } : {}),
    },
  });

  return result;
}
