import Link from "next/link";

export default function DashboardPage() {
  const stats = [
    { label: "Requests sent", value: 0 },
    { label: "Total clicks", value: 0 },
    { label: "Click rate", value: "0%" },
    { label: "Converted", value: 0 },
  ];

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
            desc: "0 active right now",
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
        <div className="px-6 py-12 text-center text-gray-400 text-sm">
          No enrollments yet.{" "}
          <Link href="/dashboard/campaigns" className="text-brand-600 hover:underline">
            Create a campaign
          </Link>{" "}
          to get started.
        </div>
      </div>
    </div>
  );
}
