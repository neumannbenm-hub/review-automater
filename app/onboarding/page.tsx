import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCurrentTenantId } from "@/lib/tenant";
import { createServiceClient } from "@/lib/supabase";
import { OnboardingWizard } from "./OnboardingWizard";

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const tenantId = await getCurrentTenantId();
  if (!tenantId) redirect("/dashboard");

  const db = createServiceClient();

  // Skip onboarding if already completed
  const { data: account } = await db
    .from("tenant_accounts")
    .select("onboarding_completed_at")
    .eq("tenant_id", tenantId)
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (account?.onboarding_completed_at) redirect("/dashboard");

  const [profileResult, sitesResult] = await Promise.all([
    db.from("business_profiles").select("*").eq("tenant_id", tenantId).maybeSingle(),
    db.from("review_sites").select("*").eq("tenant_id", tenantId).order("sort_order"),
  ]);

  return (
    <OnboardingWizard
      tenantId={tenantId}
      profile={profileResult.data ?? null}
      existingSites={sitesResult.data ?? []}
    />
  );
}
