"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase";

export async function acceptInvite(formData: FormData) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const token = formData.get("token") as string;
  if (!token) throw new Error("Missing token");

  const db = createServiceClient();

  // Fetch and validate invite (re-validates server-side regardless of page state)
  const { data: invite } = await db
    .from("tenant_invites")
    .select("id, tenant_id, role, accepted_at, expires_at")
    .eq("token", token)
    .maybeSingle();

  if (!invite) throw new Error("Invalid invite token");
  if (invite.accepted_at) redirect("/dashboard");
  if (new Date(invite.expires_at) < new Date()) throw new Error("Invite expired");

  // Idempotency: if account already exists, just mark invite accepted and redirect
  const { data: existing } = await db
    .from("tenant_accounts")
    .select("id")
    .eq("tenant_id", invite.tenant_id)
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (!existing) {
    const { error } = await db.from("tenant_accounts").insert({
      tenant_id: invite.tenant_id,
      clerk_user_id: userId,
      role: invite.role,
      status: "active",
    });
    if (error) throw new Error(`Failed to create account: ${error.message}`);
  }

  // Mark invite consumed
  await db
    .from("tenant_invites")
    .update({ accepted_at: new Date().toISOString() })
    .eq("id", invite.id);

  // Redirect to appropriate dashboard based on role
  if (invite.role === "tenant_admin") {
    redirect("/tenant-admin");
  } else {
    redirect("/dashboard");
  }
}
