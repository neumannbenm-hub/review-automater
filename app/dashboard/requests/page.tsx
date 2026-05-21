"use client";

import { useState, useTransition } from "react";
import { sendReviewRequest } from "@/app/actions/requests";
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

export default function SendRequestPage() {
  const [method, setMethod] = useState<Method>("sms");
  const [platform, setPlatform] = useState<Platform>("google");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<SendRequestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Send a review request</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Send a one-off request to a customer via SMS, email, or generate a QR code.
        </p>
      </div>

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

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-brand-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-brand-700 transition-colors disabled:opacity-60"
        >
          {isPending ? "Sending…" : `Send via ${method.toUpperCase()}`}
        </button>
      </form>

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

      {error && (
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
