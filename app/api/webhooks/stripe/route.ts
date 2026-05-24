import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { clerkClient } from "@clerk/nextjs/server";
import { getPlanByPriceId } from "@/lib/plans";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[stripe webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const clerk = await clerkClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId ?? session.client_reference_id;
      if (!userId) break;

      const subscriptionId = session.subscription as string;
      const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
      const priceId = subscription.items.data[0]?.price.id;
      const plan = priceId ? getPlanByPriceId(priceId) : undefined;

      await clerk.users.updateUserMetadata(userId, {
        privateMetadata: {
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: subscriptionId,
          stripePlan: plan?.id ?? "pro",
        },
      });
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;

      // Find Clerk user by stripeCustomerId stored in private metadata
      const { data: users } = await clerk.users.getUserList({ limit: 500 });
      const user = users.find(
        (u) => (u.privateMetadata as Record<string, unknown>)?.stripeCustomerId === customerId
      );
      if (!user) break;

      const priceId = sub.items.data[0]?.price.id;
      const plan = priceId ? getPlanByPriceId(priceId) : undefined;
      const isActive = sub.status === "active";

      await clerk.users.updateUserMetadata(user.id, {
        privateMetadata: {
          ...(user.privateMetadata as object),
          stripeSubscriptionId: isActive ? sub.id : null,
          stripePlan: isActive ? (plan?.id ?? null) : null,
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;

      const { data: users } = await clerk.users.getUserList({ limit: 500 });
      const user = users.find(
        (u) => (u.privateMetadata as Record<string, unknown>)?.stripeCustomerId === customerId
      );
      if (!user) break;

      await clerk.users.updateUserMetadata(user.id, {
        privateMetadata: {
          ...(user.privateMetadata as object),
          stripeSubscriptionId: null,
          stripePlan: null,
        },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
