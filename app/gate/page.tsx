"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function StarIcon({ filled, hovered }: { filled: boolean; hovered: boolean }) {
  const color = hovered || filled ? "#f59e0b" : "#d1d5db";
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-12 h-12 transition-colors duration-100"
      fill={color}
      aria-hidden="true"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function GateContent() {
  const searchParams = useSearchParams();
  const dest = searchParams.get("dest") ?? "";
  const bid = searchParams.get("bid") ?? "";

  const [rating, setRating] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleRating(r: number) {
    setRating(r);
    if (r >= 4) {
      setRedirecting(true);
      if (dest) {
        window.location.href = dest;
      }
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setIsPending(true);
    setError(null);

    try {
      const res = await fetch("/api/gate/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          message: fd.get("message"),
          businessId: bid,
          dest,
        }),
      });

      if (!res.ok) throw new Error("Submission failed");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-5">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank you for your feedback.</h1>
        <p className="text-gray-500 text-base">Our team will be in contact with you shortly.</p>
      </div>
    );
  }

  const showFeedbackForm = rating !== null && rating < 4;

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">How was your experience?</h1>
        <p className="text-gray-500 text-sm">Your feedback helps us improve our service.</p>
      </div>

      {/* Star rating */}
      <div className="flex justify-center gap-2 mb-8" role="group" aria-label="Rate your experience">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            aria-label={`${star} star${star !== 1 ? "s" : ""}`}
            onClick={() => handleRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(null)}
            disabled={rating !== null}
            className="focus:outline-none disabled:cursor-default"
          >
            <StarIcon
              filled={rating !== null ? star <= rating : false}
              hovered={hovered !== null ? star <= hovered : false}
            />
          </button>
        ))}
      </div>

      {redirecting && (
        <p className="text-center text-sm text-gray-500 animate-pulse">
          Taking you to leave a review…
        </p>
      )}

      {showFeedbackForm && (
        <div className="mt-2">
          <div className="text-center mb-6">
            <p className="text-gray-700 font-medium">We&apos;re sorry to hear that.</p>
            <p className="text-gray-500 text-sm mt-1">
              Please share more details so we can make it right.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Your name <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                type="text"
                required
                placeholder="Sarah"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Your email <span className="text-red-500">*</span>
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="sarah@example.com"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tell us what happened
              </label>
              <textarea
                name="message"
                rows={4}
                placeholder="Describe your experience…"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-gray-300 resize-none"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-brand-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-brand-700 transition-colors disabled:opacity-60"
            >
              {isPending ? "Sending…" : "Send Feedback"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function GatePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8">
        <Suspense fallback={<div className="text-center text-gray-400 text-sm">Loading…</div>}>
          <GateContent />
        </Suspense>
      </div>
    </div>
  );
}
