"use client";

import { useState, useTransition } from "react";
import { enrollCustomerAction } from "@/app/actions/enrollments";
import type { Campaign, Platform } from "@/lib/api";

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: "google", label: "Google" },
  { value: "yelp", label: "Yelp" },
  { value: "facebook", label: "Facebook" },
  { value: "tripadvisor", label: "TripAdvisor" },
  { value: "custom", label: "Custom" },
];

export function EnrollForm({ campaigns }: { campaigns: Campaign[] }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (campaigns.length === 0) return null;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      try {
        await enrollCustomerAction({
          campaignId: fd.get("campaignId") as string,
          contact: {
            name: fd.get("name") as string,
            phone: (fd.get("phone") as string) || undefined,
            email: (fd.get("email") as string) || undefined,
          },
          platform: fd.get("platform") as Platform,
          destinationUrl: fd.get("destinationUrl") as string,
        });
        setOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to enroll");
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors"
      >
        + Enroll customer
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Enroll customer</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Campaign</label>
                <select
                  name="campaignId"
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Customer name</label>
                <input name="name" required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                  <input name="phone" placeholder="+15551234567" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                  <input name="email" type="email" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Platform</label>
                <select name="platform" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                  {PLATFORMS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Review URL</label>
                <input name="destinationUrl" type="url" required placeholder="https://g.page/r/..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-brand-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-60"
              >
                {isPending ? "Enrolling…" : "Enroll customer"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
