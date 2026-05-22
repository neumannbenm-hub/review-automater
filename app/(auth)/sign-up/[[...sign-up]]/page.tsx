import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center max-w-sm w-full">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Sign up coming soon</h1>
        <p className="text-sm text-gray-400 mb-6">
          Authentication will be available shortly.
        </p>
        <Link
          href="/dashboard"
          className="inline-block bg-brand-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
