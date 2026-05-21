export const dynamic = "force-dynamic";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: "▦" },
  { href: "/dashboard/requests", label: "Send Request", icon: "↗" },
  { href: "/dashboard/campaigns", label: "Campaigns", icon: "◈" },
  { href: "/dashboard/enrollments", label: "Enrollments", icon: "⊞" },
  { href: "/dashboard/billing", label: "Billing", icon: "◎" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col fixed inset-y-0">
        <div className="h-16 px-5 flex items-center border-b border-gray-100">
          <Link href="/" className="font-bold text-lg text-gray-900">
            Review<span className="text-brand-600">Automater</span>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors group"
            >
              <span className="text-base w-5 text-center text-gray-400 group-hover:text-brand-500 transition-colors">
                {icon}
              </span>
              {label}
            </Link>
          ))}
        </nav>

        <div className="h-16 px-5 flex items-center border-t border-gray-100">
          <UserButton afterSignOutUrl="/" />
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-56 min-h-screen">
        <div className="max-w-5xl mx-auto px-8 py-10">{children}</div>
      </main>
    </div>
  );
}
