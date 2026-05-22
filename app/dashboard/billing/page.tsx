import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { PLANS, EXTRA_REQUESTS_PACK_SIZE, EXTRA_REQUESTS_PACK_PRICE } from "@/lib/plans";

export default async function BillingPage() {
  const { userId } = await auth();
  const user = await currentUser();

  const planId = (user?.privateMetadata?.stripePlan as string | undefined) ?? null;
  const subscriptionId = user?.privateMetadata?.stripeSubscriptionId as string | undefined;
  const extraRequests = (user?.privateMetadata?.extraRequests as number | undefined) ?? 0;
  const currentPlan = PLANS.find((p) => p.id === planId);
  const isActive = !!subscriptionId && !!planId;
  const plan = PLANS[0];

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="text-gray-500 mt-1 text-sm">Manage your subscription and usage.</p>
      </div>

      {/* Current plan */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Current plan</h2>
        {isActive && currentPlan ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-gray-900">{currentPlan.name}</p>
              <p className="text-sm text-gray-400">
                ${currentPlan.price}/mo · {currentPlan.requestsPerMonth.toLocaleString()} requests/mo
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                ${currentPlan.pricePerExtraRequest.toFixed(2)}/request after limit
              </p>
            </div>
            <form action="/api/billing/portal" method="POST">
              <input type="hidden" name="userId" value={userId!} />
              <button
                type="submit"
                className="border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Manage subscription
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-2">You&apos;re on the free trial.</p>
            <p className="text-sm text-gray-400 mb-6">
              Upgrade to unlock all features after your trial ends.
            </p>
          </div>
        )}
      </div>

      {/* Extra requests balance */}
      {isActive && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Extra request credits</h2>
              <p className="text-sm text-gray-400 mt-0.5">
                Used after your monthly {currentPlan?.requestsPerMonth.toLocaleString()} limit is reached.
              </p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{extraRequests.toLocaleString()}</p>
          </div>
          <form action="/api/billing/extra-requests" method="POST" className="mt-4">
            <button
              type="submit"
              className="border border-brand-200 text-brand-700 bg-brand-50 px-4 py-2 rounded-xl text-sm font-medium hover:bg-brand-100 transition-colors"
            >
              Buy {EXTRA_REQUESTS_PACK_SIZE} more — ${EXTRA_REQUESTS_PACK_PRICE}
            </button>
          </form>
        </div>
      )}

      {/* Upgrade card for trial users */}
      {!isActive && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-3xl font-black text-gray-900">${plan.price}</span>
            <span className="text-gray-400 text-sm">/mo</span>
          </div>
          <ul className="space-y-2 mb-6">
            {plan.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-brand-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
          <CheckoutButton priceId={plan.priceId} label={`Upgrade to ${plan.name}`} />
        </div>
      )}
    </div>
  );
}

function CheckoutButton({ priceId, label }: { priceId: string; label: string }) {
  return (
    <form action="/api/billing/checkout" method="POST">
      <input type="hidden" name="priceId" value={priceId} />
      <button
        type="submit"
        className="w-full bg-brand-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors"
      >
        {label}
      </button>
    </form>
  );
}
