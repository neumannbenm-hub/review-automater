import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { SendRequestForm } from "./SendRequestForm";

export default async function SendRequestPage() {
  const user = await currentUser();

  const isActive =
    !!(user?.privateMetadata?.stripeSubscriptionId) &&
    !!(user?.privateMetadata?.stripePlan);

  if (!isActive) {
    return (
      <div className="max-w-xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Send a review request</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Send a one-off request to a customer via SMS, email, or generate a QR code.
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="text-4xl mb-4">◎</div>
          <h2 className="font-semibold text-gray-900 mb-2">Subscription required</h2>
          <p className="text-sm text-gray-400 mb-6">
            Subscribe to send review requests to your customers.
          </p>
          <Link
            href="/dashboard/billing"
            className="inline-block bg-brand-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors"
          >
            View plans
          </Link>
        </div>
      </div>
    );
  }

  return <SendRequestForm />;
}
