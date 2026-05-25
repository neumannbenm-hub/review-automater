"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { enrollCustomer, stopEnrollment, type Platform } from "@/lib/api";

export async function enrollCustomerAction(data: {
  campaignId: string;
  contact: { name: string; phone?: string; email?: string; customVariables?: Record<string, string> };
  platform: Platform;
  destinationUrl: string;
  visitDate?: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const enrollment = await enrollCustomer({ ...data, businessId: userId });
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
