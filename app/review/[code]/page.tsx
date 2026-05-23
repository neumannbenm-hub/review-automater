import { notFound } from "next/navigation";
import SentimentGate from "./SentimentGate";

interface ReviewLinkPublic {
  destination: string;
  platform: string;
  businessName?: string;
}

async function getReviewLink(code: string): Promise<ReviewLinkPublic | null> {
  const BASE = process.env.REVIEWBOOST_API_URL ?? "http://localhost:3001";
  try {
    const res = await fetch(`${BASE}/api/review/${code}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const link = await getReviewLink(code);
  if (!link) notFound();

  return (
    <SentimentGate
      code={code}
      platform={link.platform}
      businessName={link.businessName}
      destination={link.destination}
    />
  );
}
