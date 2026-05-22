import { NextRequest, NextResponse } from "next/server";
import { sendFeedbackEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { name, email, message } = body as {
    name?: string;
    email?: string;
    message?: string;
  };

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }

  const ownerEmail = process.env.FEEDBACK_TO_EMAIL ?? null;

  if (ownerEmail) {
    await sendFeedbackEmail({
      to: ownerEmail,
      customerName: name,
      customerEmail: email,
      message: message ?? "(no message provided)",
    });
  } else {
    console.warn("[feedback] FEEDBACK_TO_EMAIL not set — feedback not delivered:", { name, email, message });
  }

  return NextResponse.json({ success: true });
}
