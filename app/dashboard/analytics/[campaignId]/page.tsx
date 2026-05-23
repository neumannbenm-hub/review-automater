import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  listEnrollments,
  getCampaign,
  getCampaignAnalytics,
  type Enrollment,
  type Campaign,
  type CampaignAnalytics,
} from "@/lib/api";

function currentStage(enrollment: Enrollment): string {
  if (enrollment.converted) return "Converted";
  if (enrollment.status === "stopped") return "Stopped";
  if (enrollment.status === "unsubscribed") return "Unsubscribed";
  const nextPending = enrollment.steps
    .filter((s) => s.status === "pending")
    .sort((a, b) => a.stepNumber - b.stepNumber)[0];
  if (nextPending) return `Waiting — Step ${nextPending.stepNumber}`;
  const anySent = enrollment.steps.some((s) => s.sentAt !== null);
  return anySent ? "Awaiting Review" : "Just Enrolled";
}

function lastSentStep(enrollment: Enrollment): number | null {
  const sent = enrollment.steps
    .filter((s) => s.sentAt !== null)
    .sort((a, b) => b.stepNumber - a.stepNumber);
  return sent[0]?.stepNumber ?? null;
}

function buildStageOrder(campaign: Campaign): string[] {
  return [
    "Just Enrolled",
    ...campaign.steps.map((s) => `Waiting — Step ${s.stepNumber}`),
    "Awaiting Review",
    "Converted",
    "Stopped",
    "Unsubscribed",
  ];
}

export default async function CampaignAnalyticsPage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = await params;
  const { userId } = await auth();

  let campaign: Campaign | null = null;
  let enrollments: Enrollment[] = [];
  let sentiment: CampaignAnalytics | null = null;

  try {
    const [campaignData, enrollmentsRes, sentimentRes] = await Promise.all([
      getCampaign(campaignId),
      listEnrollments(userId!),
      getCampaignAnalytics(campaignId, userId!),
    ]);
    campaign = campaignData;
    enrollments = enrollmentsRes.enrollments.filter((e) => e.campaignId === campaignId);
    sentiment = sentimentRes;
  } catch {
    // API may not be running
  }

  if (!campaign) notFound();

  // Stage distribution
  const stageCounts: Record<string, number> = {};
  for (const e of enrollments) {
    const stage = currentStage(e);
    stageCounts[stage] = (stageCounts[stage] ?? 0) + 1;
  }
  const stageOrder = buildStageOrder(campaign).filter((s) => stageCounts[s] !== undefined);
  const maxStageCount = Math.max(...Object.values(stageCounts), 1);

  // Step conversion analysis: last sent step for each converted enrollment
  const stepConvertedCount: Record<number, number> = {};
  const stepSentCount: Record<number, number> = {};
  for (const e of enrollments) {
    for (const s of e.steps) {
      if (s.sentAt !== null) {
        stepSentCount[s.stepNumber] = (stepSentCount[s.stepNumber] ?? 0) + 1;
      }
    }
    if (e.converted) {
      const step = lastSentStep(e);
      if (step !== null) {
        stepConvertedCount[step] = (stepConvertedCount[step] ?? 0) + 1;
      }
    }
  }
  const maxConversions = Math.max(...campaign.steps.map((s) => stepConvertedCount[s.stepNumber] ?? 0), 1);

  const totalEnrolled = enrollments.length;
  const totalConverted = enrollments.filter((e) => e.converted).length;
  const convRate = totalEnrolled > 0 ? Math.round((totalConverted / totalEnrolled) * 100) : 0;

  return (
    <div>
      <div className="mb-8">
        <Link href="/dashboard/analytics" className="text-sm text-gray-500 hover:text-gray-700">
          ← Analytics
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">{campaign.name}</h1>
        <p className="text-gray-500 text-sm mt-1">
          {totalEnrolled} enrolled &middot; {totalConverted} converted &middot; {convRate}%
          conversion rate
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Stage funnel */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Stage Distribution</h2>
          <p className="text-xs text-gray-400 mb-5">Where enrollments are right now.</p>

          {stageOrder.length === 0 ? (
            <p className="text-sm text-gray-400">No enrollments yet.</p>
          ) : (
            <div className="space-y-3">
              {stageOrder.map((stage) => {
                const count = stageCounts[stage] ?? 0;
                const barWidth = Math.round((count / maxStageCount) * 100);
                const isConverted = stage === "Converted";
                const isStopped = stage === "Stopped" || stage === "Unsubscribed";
                return (
                  <div key={stage}>
                    <div className="flex justify-between text-sm mb-1">
                      <span
                        className={
                          isConverted
                            ? "text-green-700 font-medium"
                            : isStopped
                            ? "text-gray-400"
                            : "text-gray-700"
                        }
                      >
                        {stage}
                      </span>
                      <span className="font-medium text-gray-900">{count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isConverted
                            ? "bg-green-500"
                            : isStopped
                            ? "bg-gray-300"
                            : "bg-brand-500"
                        }`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Step conversion analysis */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Step Conversion Analysis</h2>
          <p className="text-xs text-gray-400 mb-5">
            Which step drove the final conversion for each customer.
          </p>

          {campaign.steps.length === 0 ? (
            <p className="text-sm text-gray-400">No steps configured.</p>
          ) : (
            <div className="space-y-3">
              {campaign.steps.map((step) => {
                const conversions = stepConvertedCount[step.stepNumber] ?? 0;
                const sent = stepSentCount[step.stepNumber] ?? 0;
                const rate = sent > 0 ? Math.round((conversions / sent) * 100) : 0;
                const barWidth = Math.round((conversions / maxConversions) * 100);
                return (
                  <div key={step.stepNumber}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">
                        Step {step.stepNumber}{" "}
                        <span className="text-gray-400 capitalize">· {step.method}</span>
                      </span>
                      <span className="text-gray-500 text-xs">
                        {conversions} converted · {rate}% of sent
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-brand-500"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Sentiment breakdown (available once sentiment gate is live) */}
          {sentiment && (
            <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Positive</p>
                <p className="font-bold text-green-600">{sentiment.totalPositive}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Negative</p>
                <p className="font-bold text-red-500">{sentiment.totalNegative}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Clicked, Not Conv.</p>
                <p className="font-bold text-amber-500">{sentiment.totalClickedNotConverted}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
