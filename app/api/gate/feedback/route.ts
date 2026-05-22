import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { sendFeedbackEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { name, email, message, businessId } = body as {
    name?: string;
    email?: string;
    message?: string;
    businessId?: string;
  };

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }

  let ownerEmail: string | null = null;

  if (businessId) {
    try {
      const clerk = await clerkClient();
      const user = await clerk.users.getUser(businessId);
      ownerEmail =
        user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
          ?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? null;
    } catch {
      // If Clerk lookup fails, fall through to env fallback
    }
  }

  ownerEmail ??= process.env.FEEDBACK_TO_EMAIL ?? null;

  if (ownerEmail) {
    await sendFeedbackEmail({
      to: ownerEmail,
      customerName: name,
      customerEmail: email,
      message: message ?? "(no message provided)",
    });
  } else {
    console.warn("[feedback] No owner email found; feedback not delivered:", { name, email, message });
  }

  return NextResponse.json({ success: true });
}
