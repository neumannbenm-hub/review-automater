import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { enrollCustomer, type Platform } from "@/lib/api";
import { isSubscriptionActive } from "@/lib/subscription";

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) {
    return NextResponse.json({ error: "Missing X-Api-Key header" }, { status: 401 });
  }

  // Find the user whose webhookApiKey matches
  const clerk = await clerkClient();
  const { data: users } = await clerk.users.getUserList({ limit: 500 });
  const user = users.find(
    (u) => (u.privateMetadata as Record<string, unknown>)?.webhookApiKey === apiKey
  );

  if (!user) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const meta = user.privateMetadata as Record<string, unknown>;
  const isActive = isSubscriptionActive(meta);

  if (!isActive) {
    return NextResponse.json({ error: "Account does not have an active subscription" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    campaignId,
    contact,
    platform,
    destinationUrl,
    visitDate,
  } = body as {
    campaignId?: string;
    contact?: {
      name?: string;
      phone?: string;
      email?: string;
      customVariables?: Record<string, string>;
    };
    platform?: string;
    destinationUrl?: string;
    visitDate?: string;
  };

  if (!campaignId) return NextResponse.json({ error: "campaignId is required" }, { status: 400 });
  if (!contact?.name) return NextResponse.json({ error: "contact.name is required" }, { status: 400 });
  if (!platform) return NextResponse.json({ error: "platform is required" }, { status: 400 });
  if (!destinationUrl) return NextResponse.json({ error: "destinationUrl is required" }, { status: 400 });

  const validPlatforms: Platform[] = ["google", "yelp", "facebook", "tripadvisor", "custom"];
  if (!validPlatforms.includes(platform as Platform)) {
    return NextResponse.json(
      { error: `platform must be one of: ${validPlatforms.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const enrollment = await enrollCustomer({
      campaignId,
      businessId: user.id,
      contact: {
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        customVariables: contact.customVariables,
      },
      platform: platform as Platform,
      destinationUrl,
      visitDate,
    });

    return NextResponse.json(enrollment, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Enrollment failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
