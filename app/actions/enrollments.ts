"use server";

import { revalidatePath } from "next/cache";
import { enrollCustomer, stopEnrollment, type Platform } from "@/lib/api";

const BUSINESS_ID = process.env.BUSINESS_ID ?? "default";

function gateUrl(destinationUrl: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const params = new URLSearchParams({ dest: destinationUrl, bid: BUSINESS_ID });
  return `${appUrl}/gate?${params}`;
}

export async function enrollCustomerAction(data: {
  campaignId: string;
  contact: { name: string; phone?: string; email?: string };
  platform: Platform;
  destinationUrl: string;
  visitDate?: string;
}) {
  const enrollment = await enrollCustomer({
    ...data,
    businessId: BUSINESS_ID,
    destinationUrl: gateUrl(data.destinationUrl),
  });
  revalidatePath("/dashboard/enrollments");
  return enrollment;
}

export async function stopEnrollmentAction(id: string) {
  const result = await stopEnrollment(id);
  revalidatePath("/dashboard/enrollments");
  return result;
}
