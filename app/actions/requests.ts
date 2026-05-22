"use server";

import { sendRequest, type SendRequestPayload } from "@/lib/api";

const BUSINESS_ID = process.env.BUSINESS_ID ?? "default";

function gateUrl(destinationUrl: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const params = new URLSearchParams({ dest: destinationUrl, bid: BUSINESS_ID });
  return `${appUrl}/gate?${params}`;
}

export async function sendReviewRequest(payload: SendRequestPayload) {
  const data = {
    ...payload,
    businessId: BUSINESS_ID,
    destinationUrl: gateUrl(payload.destinationUrl),
  };
  return sendRequest(data);
}
