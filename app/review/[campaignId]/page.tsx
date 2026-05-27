import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase";
import type { Metadata } from "next";

interface ReviewSite {
  id: string;
  display_name: string | null;
  platform: string;
  url: string;
  sort_order: number;
}

async function getCampaignLandingData(campaignId: string): Promise<{
  businessName: string;
  sites: ReviewSite[];
} | null> {
  try {
    const db = createServiceClient();

    const { data: crsRows } = await db
      .from("campaign_review_sites")
      .select("tenant_id, sort_order, review_sites ( id, display_name, platform, url, sort_order )")
      .eq("campaign_id", campaignId)
      .order("sort_order", { ascending: true });

    if (!crsRows || crsRows.length === 0) return null;

    const sites = (crsRows as unknown as Array<{ review_sites: ReviewSite | null }>)
      .map((r) => r.review_sites)
      .filter((s): s is ReviewSite => s !== null);

    const tenantId = (crsRows[0] as { tenant_id: string }).tenant_id;
    const { data: bp } = await db
      .from("business_profiles")
      .select("business_name")
      .eq("tenant_id", tenantId)
      .maybeSingle();

    return {
      businessName: bp?.business_name ?? "Us",
      sites,
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}): Promise<Metadata> {
  const { campaignId } = await params;
  const data = await getCampaignLandingData(campaignId);
  return {
    title: data ? `Leave a review for ${data.businessName}` : "Leave a review",
  };
}

const PLATFORM_ICONS: Record<string, string> = {
  google: "G",
  yelp: "Y",
  facebook: "f",
  tripadvisor: "T",
};

const PLATFORM_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  google: { bg: "bg-white", text: "text-[#4285F4]", border: "border-[#4285F4]/30" },
  yelp: { bg: "bg-white", text: "text-[#D32323]", border: "border-[#D32323]/30" },
  facebook: { bg: "bg-white", text: "text-[#1877F2]", border: "border-[#1877F2]/30" },
  tripadvisor: { bg: "bg-white", text: "text-[#34E0A1]", border: "border-[#34E0A1]/30" },
  custom: { bg: "bg-white", text: "text-gray-700", border: "border-gray-200" },
};

export default async function ReviewLandingPage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = await params;
  const data = await getCampaignLandingData(campaignId);

  if (!data || data.sites.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <p className="text-gray-500 text-sm">This review link is no longer available.</p>
        </div>
      </div>
    );
  }

  if (data.sites.length === 1) {
    redirect(data.sites[0].url);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600 text-white text-2xl font-bold mb-4 shadow-lg">
            ★
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Leave a review for</h1>
          <p className="text-xl font-semibold text-brand-600 mt-1">{data.businessName}</p>
          <p className="text-sm text-gray-500 mt-3">
            Choose where you&apos;d like to share your experience:
          </p>
        </div>

        <div className="space-y-3">
          {data.sites.map((site) => {
            const platformKey = site.platform.toLowerCase();
            const colors = PLATFORM_COLORS[platformKey] ?? PLATFORM_COLORS.custom;
            const icon = PLATFORM_ICONS[platformKey];
            const label = site.display_name ?? site.platform;

            return (
              <a
                key={site.id}
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl border-2 ${colors.bg} ${colors.border} shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-150 group`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0 ${colors.text} border ${colors.border}`}
                >
                  {icon ?? label.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-base">{label}</p>
                  <p className="text-xs text-gray-400 truncate">{site.url}</p>
                </div>
                <svg
                  className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            );
          })}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          Your feedback helps {data.businessName} grow. Thank you!
        </p>
      </div>
    </div>
  );
}
