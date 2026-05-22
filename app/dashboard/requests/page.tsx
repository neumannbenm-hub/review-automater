"use client";

import { useState, useTransition, useEffect } from "react";
import { sendReviewRequest, getRequestUsage } from "@/app/actions/requests";
import { EXTRA_REQUESTS_PACK_SIZE, EXTRA_REQUESTS_PACK_PRICE } from "@/lib/plans";
import type { Platform, Method, SendRequestResponse } from "@/lib/api";

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: "google", label: "Google" },
  { value: "yelp", label: "Yelp" },
  { value: "facebook", label: "Facebook" },
  { value: "tripadvisor", label: "TripAdvisor" },
  { value: "custom", label: "Custom" },
];

const METHODS: { value: Method; label: string; desc: string }[] = [
  { value: "sms", label: "SMS", desc: "Text message via Twilio" },
  { value: "email", label: "Email", desc: "HTML email via SendGrid" },
  { value: "qr", label: "QR Code", desc: "Trackable link + QR image" },
];

interface Usage {
  used: number;
  limit: number;
  extraRequests: number;
  planId: string | null;
  pricePerExtraRequest: number;
}

export default function SendRequestPage() {
  const [method, setMethod] = useState<Method>("sms");
  const [platform, setPlatform] = useState<Platform>("google");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<SendRequestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const isLimitExceeded = error === "LIMIT_EXCEEDED";

  // Show success banner when redirected back after purchasing extra requests
  const [showExtraSuccess, setShowExtraSuccess] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("extra") === "1") {
      setShowExtraSuccess(true);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    getRequestUsage().then(setUsage).catch(() => null);
  }, [result]); // refresh after each successful send

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const base = {
      business: fd.get("business") as string,
      name: fd.get("name") as string,
      platform,
      destinationUrl: fd.get("destinationUrl") as string,
    };

    const payload =
      method === "sms"
        ? { ...base, method: "sms" as const, phone: fd.get("phone") as string }
        : method === "email"
        ? { ...base, method: "email" as const, email: fd.get("email") as string }
        : { ...base, method: "qr" as const };

    setResult(null);
    setError(null);

    startTransition(async () => {
      try {
        const res = await sendReviewRequest(payload);
        setResult(res);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Something went wrong";
        setError(msg);
      }
    });
  }

  const usagePercent = usage ? Math.min((usage.used / usage.limit) * 100, 100) : 0;
  const isAtLimit = usage ? usage.used >= usage.limit : false;

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Send a review request</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Send a one-off request to a customer via SMS, email, or generate a QR code.
        </p>
      </div>

      {/* Extra requests purchase success */}
      {showExtraSuccess && (
        <div className="mb-6 bg-green-50 border border-green-100 rounded-2xl p-4 text-sm text-green-800 flex items-center justify-between">
          <span>✓ {EXTRA_REQUESTS_PACK_SIZE} extra requests added to your account.</span>
          <button onClick={() => setShowExtraSuccess(false)} className="text-green-600 hover:text-green-800 ml-4">✕</button>
        </div>
      )}

      {/* Usage bar */}
      {usage && (
        <div className="mb-6 bg-white border border-gray-100 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Monthly requests</span>
            <span className="text-sm text-gray-500">
              {usage.used.toLocaleString()} / {usage.limit.toLocaleString()}
              {usage.extraRequests > 0 && (
                <span className="ml-2 text-brand-600 font-medium">
                  +{usage.extraRequests} extra
                </span>
              )}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isAtLimit ? "bg-red-400" : usagePercent >= 80 ? "bg-amber-400" : "bg-brand-500"
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          {usage.extraRequests > 0 && (
            <p className="text-xs text-gray-400 mt-2">
              Extra requests are used after your monthly limit is reached.
            </p>
          )}
        </div>
      )}

      {/* Over-limit state */}
      {isLimitExceeded ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <h2 className="font-semibold text-amber-900 mb-1">Monthly limit reached</h2>
          <p className="text-sm text-amber-800 mb-4">
            You&apos;ve used all {usage?.limit.toLocaleString()} of your monthly requests.
            Keep sending at <strong>${(EXTRA_REQUESTS_PACK_PRICE / EXTRA_REQUESTS_PACK_SIZE).toFixed(2)}/request</strong> — buy a pack of {EXTRA_REQUESTS_PACK_SIZE} for ${EXTRA_REQUESTS_PACK_PRICE}.
          </p>
          <form action="/api/billing/extra-requests" method="POST">
            <button
              type="submit"
              className="bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors"
            >
              Buy {EXTRA_REQUESTS_PACK_SIZE} extra requests — ${EXTRA_REQUESTS_PACK_PRICE}
            </button>
          </form>
          <button
            onClick={() => setError(null)}
            className="mt-3 text-xs text-amber-700 underline"
          >
            Dismiss
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Method selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Method</label>
            <div className="grid grid-cols-3 gap-2">
              {METHODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMethod(m.value)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    method === m.value
                      ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className="font-semibold text-sm text-gray-900">{m.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Common fields */}
          <Field label="Customer name" name="name" placeholder="Sarah" required />
          <Field label="Business name" name="business" placeholder="Acme Rentals" required />

          {/* Method-specific contact */}
          {method === "sms" && (
            <Field label="Phone number" name="phone" placeholder="+15551234567" required />
          )}
          {method === "email" && (
            <Field label="Email address" name="email" type="email" placeholder="sarah@example.com" required />
          )}

          {/* Platform */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Review platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as Platform)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {PLATFORMS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <Field
            label="Review URL"
            name="destinationUrl"
            type="url"
            placeholder="https://g.page/r/your-review-link"
            required
          />

          {/* Overage notice when approaching limit */}
          {usage && isAtLimit && usage.extraRequests > 0 && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
              You&apos;re over your monthly limit. This request will use one of your {usage.extraRequests} extra credits.
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-brand-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-brand-700 transition-colors disabled:opacity-60"
          >
            {isPending ? "Sending…" : `Send via ${method.toUpperCase()}`}
          </button>
        </form>
      )}

      {/* Result */}
      {result && (
        <div className="mt-6 bg-green-50 border border-green-100 rounded-2xl p-5">
          <p className="font-semibold text-green-800 mb-3">✓ Sent successfully</p>
          <div className="space-y-1 text-sm text-green-700">
            <p>
              Short URL:{" "}
              <a href={result.shortUrl} target="_blank" rel="noreferrer" className="underline font-mono">
                {result.shortUrl}
              </a>
            </p>
            {result.sid && <p>Twilio SID: <span className="font-mono">{result.sid}</span></p>}
            {result.messageId && <p>Message ID: <span className="font-mono">{result.messageId}</span></p>}
            {result.qrImageUrl && (
              <div className="mt-3">
                <p className="mb-2 font-medium text-green-800">QR Code:</p>
                <img src={result.qrImageUrl} alt="QR Code" className="w-40 h-40 rounded-xl border border-green-200" />
              </div>
            )}
          </div>
        </div>
      )}

      {!isLimitExceeded && error && (
        <div className="mt-6 bg-red-50 border border-red-100 rounded-2xl p-5 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-gray-300"
      />
    </div>
  );
}
