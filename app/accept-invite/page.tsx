import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase";
import Link from "next/link";
import { acceptInvite } from "./actions";

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string }>;
}) {
  const { token, email } = await searchParams;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid invite link</h1>
          <p className="text-gray-500">This link is missing a token.</p>
        </div>
      </div>
    );
  }

  // Validate the invite token
  const db = createServiceClient();
  const { data: invite } = await db
    .from("tenant_invites")
    .select("id, tenant_id, role, accepted_at, expires_at, tenants(name, branding)")
    .eq("token", token)
    .maybeSingle();

  if (!invite) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invite not found</h1>
          <p className="text-gray-500">This invite link is invalid or has already been used.</p>
        </div>
      </div>
    );
  }

  if (invite.accepted_at) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Already accepted</h1>
          <p className="text-gray-500 mb-4">This invite has already been used.</p>
          <Link href="/dashboard" className="text-brand-600 hover:underline text-sm">
            Go to dashboard →
          </Link>
        </div>
      </div>
    );
  }

  if (new Date(invite.expires_at) < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invite expired</h1>
          <p className="text-gray-500">This link expired on {new Date(invite.expires_at).toLocaleDateString()}.</p>
        </div>
      </div>
    );
  }

  // If user is not signed in, send them to sign up / in with a return URL
  const { userId } = await auth();

  const tenantRecord = invite.tenants as unknown as { name: string; branding: { app_name: string } } | null;
  const appName = tenantRecord?.branding?.app_name ?? tenantRecord?.name ?? "ReviewAutomater";

  if (!userId) {
    const returnUrl = `/accept-invite?token=${token}${email ? `&email=${encodeURIComponent(email)}` : ""}`;
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl border border-gray-100 p-10 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            You&apos;re invited to {appName}
          </h1>
          <p className="text-gray-500 mb-8 text-sm">
            Sign in or create an account to accept this invitation.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href={`/sign-up?redirect_url=${encodeURIComponent(returnUrl)}${email ? `&email=${encodeURIComponent(email)}` : ""}`}
              className="bg-brand-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors"
            >
              Create account
            </Link>
            <Link
              href={`/sign-in?redirect_url=${encodeURIComponent(returnUrl)}`}
              className="border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // User is signed in — check they're not already in this tenant
  const { data: existing } = await db
    .from("tenant_accounts")
    .select("id, status")
    .eq("tenant_id", invite.tenant_id)
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (existing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Already a member</h1>
          <p className="text-gray-500 mb-4">Your account is already linked to this tenant.</p>
          <Link href="/dashboard" className="text-brand-600 hover:underline text-sm">
            Go to dashboard →
          </Link>
        </div>
      </div>
    );
  }

  // Signed in + valid invite — show accept confirmation
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl border border-gray-100 p-10 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Join {appName}
        </h1>
        <p className="text-gray-500 mb-8 text-sm">
          You have been invited as a <strong>{invite.role.replace("_", " ")}</strong>.
          Accept to link your account.
        </p>
        <form action={acceptInvite}>
          <input type="hidden" name="token" value={token} />
          <button
            type="submit"
            className="w-full bg-brand-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors"
          >
            Accept invitation
          </button>
        </form>
      </div>
    </div>
  );
}
