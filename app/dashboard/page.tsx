import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { listLinks, listEnrollments } from "@/lib/api";

export default async function DashboardPage() {
  const { userId } = await auth();

  let links: Awaited<ReturnType<typeof listLinks>> | null = null;
  let enrollments: Awaited<ReturnType<typeof listEnrollments>> | null = null;

  try {
    [links, enrollments] = await Promise.all([
      listLinks(userId!),
      listEnrollments(userId!),
    ]);
  } catch {
    // API may not be running yet — show empty state
  }

  const totalSent = links?.total ?? 0;
  const totalClicks = links?.links.reduce((sum, l) => sum + l.clicks, 0) ?? 0;
  const clickRate = totalSent > 0 ? Math.round((totalClicks / totalSent) * 100) : 0;
  const converted = enrollments?.enrollments.filter((e) => e.converted).length ?? 0;
  const activeEnrollments = enrollments?.enrollments.filter((e) => e.status === "active").length ?? 0;

  const stats = [
    { label: "Requests sent", value: totalSent },
    { label: "Total clicks", value: totalClicks },
    { label: "Click rate", value: `${clickRate}%` },
    { label: "Converted", value: converted },
  ];

  const recent = enrollments?.enrollments.slice(0, 5) ?? [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-gray-500 mt-1 text-sm">Your review campaign performance at a glance.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        {[
          {
            href: "/dashboard/requests",
            title: "Send a request",
            desc: "One-off SMS, email, or QR",
            color: "bg-brand-50 hover:bg-brand-100",
            textColor: "text-brand-700",
          },
          {
            href: "/dashboard/campaigns",
            title: "Manage campaigns",
            desc: "Create multi-step sequences",
            color: "bg-indigo-50 hover:bg-indigo-100",
            textColor: "text-indigo-700",
          },
          {
            href: "/dashboard/enrollments",
            title: "View enrollments",
            desc: `${activeEnrollments} active right now`,
            color: "bg-purple-50 hover:bg-purple-100",
            textColor: "text-purple-700",
          },
        ].map(({ href, title, desc, color, textColor }) => (
          <Link
            key={href}
            href={href}
            className={`rounded-2xl p-5 ${color} transition-colors group`}
          >
            <p className={`font-semibold ${textColor} mb-1`}>{title}</p>
            <p className="text-sm text-gray-500">{desc}</p>
          </Link>
        ))}
      </div>

      {/* Recent enrollments */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent enrollments</h2>
          <Link href="/dashboard/enrollments" className="text-sm text-brand-600 hover:underline">
            View all →
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">
            No enrollments yet.{" "}
            <Link href="/dashboard/campaigns" className="text-brand-600 hover:underline">
              Create a campaign
            </Link>{" "}
            to get started.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-6 py-3 text-gray-500 font-medium">Customer</th>
                <th className="px-6 py-3 text-gray-500 font-medium">Platform</th>
                <th className="px-6 py-3 text-gray-500 font-medium">Status</th>
                <th className="px-6 py-3 text-gray-500 font-medium">Converted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recent.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-3 font-medium text-gray-900">{e.contact.name}</td>
                  <td className="px-6 py-3 text-gray-500 capitalize">{e.platform}</td>
                  <td className="px-6 py-3">
                    <StatusBadge status={e.status} />
                  </td>
                  <td className="px-6 py-3">
                    {e.converted ? (
                      <span className="text-green-600 font-medium">✓ Yes</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
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
