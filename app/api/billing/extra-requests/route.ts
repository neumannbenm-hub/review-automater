import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { EXTRA_REQUESTS_PACK_SIZE, EXTRA_REQUESTS_PACK_PRICE } from "@/lib/plans";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${EXTRA_REQUESTS_PACK_SIZE} Extra Review Requests`,
            description: `Top up with ${EXTRA_REQUESTS_PACK_SIZE} additional review requests at $${(EXTRA_REQUESTS_PACK_PRICE / EXTRA_REQUESTS_PACK_SIZE).toFixed(2)} each. Credits never expire.`,
          },
          unit_amount: EXTRA_REQUESTS_PACK_PRICE * 100,
        },
        quantity: 1,
      },
    ],
    customer_email: email,
    client_reference_id: userId,
    success_url: `${appUrl}/dashboard/requests?extra=1`,
    cancel_url: `${appUrl}/dashboard/requests`,
    metadata: {
      userId,
      type: "extra_requests",
      packSize: String(EXTRA_REQUESTS_PACK_SIZE),
    },
  });

  return NextResponse.redirect(session.url!, 303);
}
