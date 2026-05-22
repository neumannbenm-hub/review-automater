"use server";

import { auth } from "@clerk/nextjs/server";
import { sendRequest, type SendRequestPayload } from "@/lib/api";

function gateUrl(destinationUrl: string, businessId: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const params = new URLSearchParams({ dest: destinationUrl, bid: businessId });
  return `${appUrl}/gate?${params}`;
}

export async function sendReviewRequest(payload: SendRequestPayload) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const data = {
    ...payload,
    businessId: userId,
    destinationUrl: gateUrl(payload.destinationUrl, userId),
  };
  return sendRequest(data);
}
