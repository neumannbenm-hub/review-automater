"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { randomBytes } from "crypto";

export async function generateWebhookKeyAction(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const key = `wh_${randomBytes(24).toString("hex")}`;
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);

  await clerk.users.updateUserMetadata(userId, {
    privateMetadata: {
      ...(user.privateMetadata as object),
      webhookApiKey: key,
    },
  });

  return key;
}

export async function saveCustomVariablesAction(names: string[]): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);

  const sanitized = names
    .map((n) => n.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_"))
    .filter(Boolean);

  await clerk.users.updateUserMetadata(userId, {
    privateMetadata: {
      ...(user.privateMetadata as object),
      customVariableNames: sanitized,
    },
  });
}

export async function getSettingsAction(): Promise<{
  webhookApiKey: string | null;
  customVariableNames: string[];
}> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const meta = user.privateMetadata as Record<string, unknown>;

  return {
    webhookApiKey: (meta.webhookApiKey as string | undefined) ?? null,
    customVariableNames: (meta.customVariableNames as string[] | undefined) ?? [],
  };
}
