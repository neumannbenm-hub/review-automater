import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { PLANS, ADD_ONS } from "@/lib/plans";

export default async function BillingPage() {
  const { userId } = await auth();
  const user = await currentUser();

  const planId = (user?.privateMetadata?.stripePlan as string | undefined) ?? null;
  const subscriptionId = user?.privateMetadata?.stripeSubscriptionId as string | undefined;
  const currentPlan = PLANS.find((p) => p.id === planId);
  const isActive = !!subscriptionId && !!planId;

  const meta = (user?.privateMetadata ?? {}) as Record<string, unknown>;

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
              Upgrade to unlock full features after your trial ends.
            </p>
          </div>
        )}
      </div>

      {/* Plan comparison */}
      {!isActive && (
        <div className="grid sm:grid-cols-2 gap-4">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-2xl border border-gray-100 p-6"
            >
              <h3 className="font-bold text-gray-900 text-lg mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-5">
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
          ))}
        </div>
      )}

      {/* Add-ons */}
      <div className="mt-8">
        <h2 className="font-semibold text-gray-900 mb-4">Add-ons</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {ADD_ONS.map((addOn) => {
            const isEnabled = !!meta[addOn.metadataKey];
            return (
              <div key={addOn.id} className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-0.5">{addOn.name}</h3>
                    <p className="text-sm text-gray-500">{addOn.description}</p>
                  </div>
                  {isEnabled && (
                    <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-100 rounded-full px-2.5 py-1">
                      Active
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-3xl font-black text-gray-900">${addOn.price}</span>
                  <span className="text-gray-400 text-sm">/mo</span>
                </div>
                {isEnabled ? (
                  <form action="/api/billing/portal" method="POST">
                    <input type="hidden" name="userId" value={userId!} />
                    <button
                      type="submit"
                      className="w-full border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      Manage add-on
                    </button>
                  </form>
                ) : (
                  <CheckoutButton priceId={addOn.priceId} label={`Add ${addOn.name}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
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
