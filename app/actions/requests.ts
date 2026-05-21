"use server";

import { auth } from "@clerk/nextjs/server";
import { sendRequest, type SendRequestPayload } from "@/lib/api";

export async function sendReviewRequest(payload: SendRequestPayload) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const data = { ...payload, businessId: userId };
  return sendRequest(data);
}
