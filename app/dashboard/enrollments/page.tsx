import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { listEnrollments, listCampaigns, type Enrollment } from "@/lib/api";
import { EnrollForm } from "./EnrollForm";

export default async function EnrollmentsPage() {
  const { userId } = await auth();
  const user = await currentUser();

  const isActive =
    !!(user?.privateMetadata?.stripeSubscriptionId) &&
    !!(user?.privateMetadata?.stripePlan);

  if (!isActive) {
    return (
      <div className="max-w-xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Enrollments</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Customers currently in a campaign sequence.
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="text-4xl mb-4">◎</div>
          <h2 className="font-semibold text-gray-900 mb-2">Subscription required</h2>
          <p className="text-sm text-gray-400 mb-6">
            Subscribe to enroll customers into campaigns and start automating review collection.
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

  let enrollments: Enrollment[] = [];
  let campaigns: Awaited<ReturnType<typeof listCampaigns>> = [];

  try {
    const [enResult, cResult] = await Promise.all([
      listEnrollments(userId!),
      listCampaigns(userId!),
    ]);
    enrollments = enResult.enrollments;
    campaigns = cResult;
  } catch {
    // API not running
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enrollments</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Customers currently in a campaign sequence.
          </p>
        </div>
        <EnrollForm campaigns={campaigns} />
      </div>

      {enrollments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <div className="text-4xl mb-4">⊞</div>
          <h2 className="font-semibold text-gray-900 mb-2">No enrollments yet</h2>
          <p className="text-sm text-gray-400">
            Enroll a customer into a campaign to start their review sequence.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-5 py-3 text-gray-500 font-medium">Customer</th>
                <th className="px-5 py-3 text-gray-500 font-medium">Platform</th>
                <th className="px-5 py-3 text-gray-500 font-medium">Progress</th>
                <th className="px-5 py-3 text-gray-500 font-medium">Status</th>
                <th className="px-5 py-3 text-gray-500 font-medium">Converted</th>
                <th className="px-5 py-3 text-gray-500 font-medium">Enrolled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {enrollments.map((e) => {
                const sent = e.steps.filter((s) => s.status === "sent").length;
                const total = e.steps.length;
                return (
                  <tr key={e.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-900">{e.contact.name}</p>
                      <p className="text-xs text-gray-400">
                        {e.contact.phone ?? e.contact.email}
                      </p>
                    </td>
                    <td className="px-5 py-3 capitalize text-gray-500">{e.platform}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-100 rounded-full h-1.5">
                          <div
                            className="bg-brand-500 h-1.5 rounded-full"
                            style={{ width: `${(sent / total) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">
                          {sent}/{total}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={e.status} />
                    </td>
                    <td className="px-5 py-3">
                      {e.converted ? (
                        <span className="text-green-600 font-medium text-xs">✓ Yes</span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">
                      {new Date(e.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-green-50 text-green-700",
    completed: "bg-blue-50 text-blue-700",
    stopped: "bg-gray-100 text-gray-500",
    unsubscribed: "bg-red-50 text-red-600",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status] ?? "bg-gray-100 text-gray-500"}`}>
      {status}
    </span>
  );
}
