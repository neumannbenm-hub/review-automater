import { auth, clerkClient } from "@clerk/nextjs/server";
import NewCampaignClient from "./NewCampaignClient";
import { getReviewSitesAction } from "@/app/actions/settings";

export default async function NewCampaignPage() {
  const { userId } = await auth();
  let customVariableNames: string[] = [];

  if (userId) {
    try {
      const clerk = await clerkClient();
      const user = await clerk.users.getUser(userId);
      customVariableNames =
        ((user.privateMetadata as Record<string, unknown>).customVariableNames as string[]) ?? [];
    } catch {
      // non-critical
    }
  }

  let reviewSites: Awaited<ReturnType<typeof getReviewSitesAction>> = [];
  try {
    reviewSites = await getReviewSitesAction();
  } catch {
    // non-critical
  }

  return (
    <NewCampaignClient
      customVariableNames={customVariableNames}
      reviewSites={reviewSites}
    />
  );
}
