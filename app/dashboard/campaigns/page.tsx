import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { listCampaigns } from "@/lib/api";
import { DeleteCampaignButton } from "./DeleteCampaignButton";

export default async function CampaignsPage() {
  const { userId } = await auth();
  let campaigns: Awaited<ReturnType<typeof listCampaigns>> = [];

  try {
    campaigns = await listCampaigns(userId!);
  } catch {
    // API not running — show empty state
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Multi-step SMS + email sequences that run automatically.
          </p>
        </div>
        <Link
          href="/dashboard/campaigns/new"
          className="bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors"
        >
          + New campaign
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <div className="text-4xl mb-4">◈</div>
          <h2 className="font-semibold text-gray-900 mb-2">No campaigns yet</h2>
          <p className="text-sm text-gray-400 mb-6">
            Create a campaign to start automating review requests.
          </p>
          <Link
            href="/dashboard/campaigns/new"
            className="inline-block bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors"
          >
            Create your first campaign
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-gray-900">{c.name}</h2>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {c.steps.length} step{c.steps.length !== 1 ? "s" : ""} ·{" "}
                    Created {new Date(c.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <DeleteCampaignButton id={c.id} />
              </div>

              {/* Steps preview */}
              <div className="mt-4 flex flex-wrap gap-2">
                {c.steps.map((step) => (
                  <div
                    key={step.stepNumber}
                    className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-3 py-1.5 text-xs text-gray-600"
                  >
                    <span className="font-mono text-gray-400">#{step.stepNumber}</span>
                    <span className="uppercase font-medium text-brand-600">{step.method}</span>
                    <span>+{step.delayDays}d</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
