"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { enrollCustomer, stopEnrollment, type Platform } from "@/lib/api";

function gateUrl(destinationUrl: string, businessId: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const params = new URLSearchParams({ dest: destinationUrl, bid: businessId });
  return `${appUrl}/gate?${params}`;
}

export async function enrollCustomerAction(data: {
  campaignId: string;
  contact: { name: string; phone?: string; email?: string };
  platform: Platform;
  destinationUrl: string;
  visitDate?: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const enrollment = await enrollCustomer({
    ...data,
    businessId: userId,
    destinationUrl: gateUrl(data.destinationUrl, userId),
  });
  revalidatePath("/dashboard/enrollments");
  return enrollment;
}

export async function stopEnrollmentAction(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const result = await stopEnrollment(id);
  revalidatePath("/dashboard/enrollments");
  return result;
}
