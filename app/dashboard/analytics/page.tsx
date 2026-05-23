import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import {
  listEnrollments,
  listLinks,
  listCampaigns,
  getAnalytics,
  type Enrollment,
  type Campaign,
  type ReviewLink,
  type GlobalAnalytics,
} from "@/lib/api";

function pct(n: number, d: number) {
  return d > 0 ? Math.round((n / d) * 100) : 0;
}

function campaignStats(enrollments: Enrollment[], campaign: Campaign) {
  const es = enrollments.filter((e) => e.campaignId === campaign.id);
  const converted = es.filter((e) => e.converted).length;
  const stopped = es.filter(
    (e) => e.status === "stopped" || e.status === "unsubscribed"
  ).length;
  return { total: es.length, converted, stopped };
}

interface StatCard {
  label: string;
  value: string;
  sub: string;
  valueColor: string;
}

function buildStatCards(
  enrollments: Enrollment[],
  links: ReviewLink[],
  sentiment: GlobalAnalytics | null
): StatCard[] {
  const total = enrollments.length;
  const converted = enrollments.filter((e) => e.converted).length;

  const notClickedLinks = links.filter((l) => l.clicks === 0).length;
  const totalLinks = links.length;

  return [
    {
      label: "Converted",
      value: `${pct(converted, total)}%`,
      sub: `${converted} of ${total} enrolled`,
      valueColor: "text-green-600",
    },
    {
      label: "Not Clicked",
      value: `${pct(notClickedLinks, totalLinks)}%`,
      sub: `${notClickedLinks} of ${totalLinks} links unopened`,
      valueColor: "text-gray-600",
    },
    {
      label: "Positive",
      value: sentiment ? `${pct(sentiment.totalPositive, total)}%` : "—",
      sub: sentiment
        ? `${sentiment.totalPositive} rated positive`
        : "Live once sentiment gate active",
      valueColor: "text-brand-600",
    },
    {
      label: "Negative",
      value: sentiment ? `${pct(sentiment.totalNegative, total)}%` : "—",
      sub: sentiment
        ? `${sentiment.totalNegative} rated negative`
        : "Live once sentiment gate active",
      valueColor: "text-red-500",
    },
    {
      label: "Clicked, Not Converted",
      value: sentiment ? `${pct(sentiment.totalClickedNotConverted, total)}%` : "—",
      sub: sentiment
        ? `${sentiment.totalClickedNotConverted} warm leads`
        : "Live once sentiment gate active",
      valueColor: "text-amber-500",
    },
  ];
}

export default async function AnalyticsPage() {
  const { userId } = await auth();

  let enrollments: Enrollment[] = [];
  let campaigns: Campaign[] = [];
  let links: ReviewLink[] = [];
  let sentiment: GlobalAnalytics | null = null;

  try {
    const [enrollmentsRes, campaignsRes, linksRes, sentimentRes] = await Promise.all([
      listEnrollments(userId!),
      listCampaigns(userId!),
      listLinks(userId!),
      getAnalytics(userId!),
    ]);
    enrollments = enrollmentsRes.enrollments;
    campaigns = campaignsRes;
    links = linksRes.links;
    sentiment = sentimentRes;
  } catch {
    // API may not be running — show empty state
  }

  const statCards = buildStatCards(enrollments, links, sentiment);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Funnel performance across all campaigns.
        </p>
      </div>

      {/* Global stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        {statCards.map(({ label, value, sub, valueColor }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <p className={`text-3xl font-bold ${valueColor}`}>{value}</p>
            <p className="text-xs text-gray-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Per-campaign table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Campaign Performance</h2>
        </div>

        {campaigns.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">
            No campaigns yet.{" "}
            <Link href="/dashboard/campaigns/new" className="text-brand-600 hover:underline">
              Create one
            </Link>{" "}
            to see analytics.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-6 py-3 text-gray-500 font-medium">Campaign</th>
                <th className="px-6 py-3 text-gray-500 font-medium">Steps</th>
                <th className="px-6 py-3 text-gray-500 font-medium">Enrolled</th>
                <th className="px-6 py-3 text-gray-500 font-medium">Converted</th>
                <th className="px-6 py-3 text-gray-500 font-medium">Conv. Rate</th>
                <th className="px-6 py-3 text-gray-500 font-medium">Stopped</th>
                <th className="px-6 py-3 text-gray-500 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {campaigns.map((campaign) => {
                const stats = campaignStats(enrollments, campaign);
                const rate = pct(stats.converted, stats.total);
                return (
                  <tr key={campaign.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-3 font-medium text-gray-900">{campaign.name}</td>
                    <td className="px-6 py-3 text-gray-500">{campaign.steps.length}</td>
                    <td className="px-6 py-3 text-gray-600">{stats.total}</td>
                    <td className="px-6 py-3 text-green-600 font-medium">{stats.converted}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`font-medium ${
                          rate >= 50
                            ? "text-green-600"
                            : rate >= 20
                            ? "text-amber-600"
                            : "text-gray-400"
                        }`}
                      >
                        {stats.total > 0 ? `${rate}%` : "—"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-400">{stats.stopped}</td>
                    <td className="px-6 py-3 text-right">
                      <Link
                        href={`/dashboard/analytics/${campaign.id}`}
                        className="text-brand-600 text-xs hover:underline"
                      >
                        View funnel →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
