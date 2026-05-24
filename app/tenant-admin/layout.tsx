"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCurrentTenantId, getTenantAccountRole, getTenantById } from "@/lib/tenant";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default async function TenantAdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const tenantId = await getCurrentTenantId();
  if (!tenantId) redirect("/dashboard");

  const role = await getTenantAccountRole(tenantId, userId);
  if (role !== "tenant_admin") redirect("/dashboard");

  const tenant = await getTenantById(tenantId);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col fixed inset-y-0">
        <div className="h-16 px-5 flex items-center border-b border-gray-100">
          <Link href="/tenant-admin" className="font-bold text-lg text-gray-900">
            {tenant?.branding.app_name ?? "Partner Admin"}
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <Link
            href="/tenant-admin"
            className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <span className="text-base w-5 text-center text-gray-400">⊞</span>
            Accounts
          </Link>
          <Link
            href="/tenant-admin?tab=financial"
            className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <span className="text-base w-5 text-center text-gray-400">◎</span>
            Financials
          </Link>
        </nav>
        <div className="h-16 px-5 flex items-center border-t border-gray-100">
          <UserButton afterSignOutUrl="/" />
        </div>
      </aside>
      <main className="flex-1 ml-56 min-h-screen">
        <div className="max-w-5xl mx-auto px-8 py-10">{children}</div>
      </main>
    </div>
  );
}
