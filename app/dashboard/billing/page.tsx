import { PLANS } from "@/lib/plans";

export default function BillingPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="text-gray-500 mt-1 text-sm">Manage your subscription and usage.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-6 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-50 mb-4">
          <span className="text-brand-600 text-xl">◎</span>
        </div>
        <h2 className="font-semibold text-gray-900 mb-2">Billing coming soon</h2>
        <p className="text-sm text-gray-400 max-w-sm mx-auto">
          Subscription management will be available once account sign-in is set up.
          You&apos;re currently on a free trial with full access.
        </p>
      </div>

      {/* Plan comparison — informational only */}
      <div className="grid sm:grid-cols-2 gap-4">
        {PLANS.map((plan) => (
          <div key={plan.id} className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 text-lg mb-1">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mb-5">
              <span className="text-3xl font-black text-gray-900">${plan.price}</span>
              <span className="text-gray-400 text-sm">/mo</span>
            </div>
            <ul className="space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-brand-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
