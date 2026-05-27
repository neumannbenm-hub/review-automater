import { headers } from "next/headers";
import { getSettingsAction, getReviewSitesAction } from "@/app/actions/settings";
import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage() {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const proto = host.startsWith("localhost") ? "http" : "https";
  const webhookUrl = `${proto}://${host}/api/webhooks/enroll`;

  const [{ webhookApiKey, customVariableNames }, reviewSites] = await Promise.all([
    getSettingsAction(),
    getReviewSitesAction(),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Manage your review links, webhook key, and custom template variables.
        </p>
      </div>
      <SettingsClient
        initialKey={webhookApiKey}
        initialVars={customVariableNames}
        initialSites={reviewSites}
        webhookUrl={webhookUrl}
      />
    </div>
  );
}
