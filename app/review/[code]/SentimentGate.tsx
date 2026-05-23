"use client";
import { useState } from "react";

const PLATFORM_LABELS: Record<string, string> = {
  google: "Google",
  yelp: "Yelp",
  facebook: "Facebook",
  tripadvisor: "TripAdvisor",
};

interface Props {
  code: string;
  platform: string;
  businessName?: string;
  destination: string;
}

export default function SentimentGate({ code, platform, businessName, destination }: Props) {
  const [state, setState] = useState<"idle" | "loading" | "negative_thanks">("idle");

  async function handleRating(rating: "positive" | "negative") {
    setState("loading");
    try {
      await fetch("/api/sentiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, rating }),
      });
    } catch {
      // best-effort recording — don't block the redirect
    }
    if (rating === "positive") {
      window.location.href = destination;
    } else {
      setState("negative_thanks");
    }
  }

  if (state === "negative_thanks") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-10 max-w-md w-full text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-3">Thank you for your feedback</h1>
          <p className="text-gray-500 text-sm">
            We&apos;re sorry to hear your experience wasn&apos;t perfect. Your feedback helps us
            improve.
          </p>
        </div>
      </div>
    );
  }

  const platformLabel = PLATFORM_LABELS[platform] ?? null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-10 max-w-md w-full text-center">
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          How was your experience{businessName ? ` at ${businessName}` : ""}?
        </h1>
        <p className="text-gray-500 text-sm mb-8">Your feedback means a lot to us.</p>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleRating("positive")}
            disabled={state === "loading"}
            className="py-4 rounded-xl bg-green-50 hover:bg-green-100 text-green-700 font-semibold transition-colors disabled:opacity-50"
          >
            Great!
          </button>
          <button
            onClick={() => handleRating("negative")}
            disabled={state === "loading"}
            className="py-4 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 font-semibold transition-colors disabled:opacity-50"
          >
            Not great
          </button>
        </div>

        {state === "loading" && (
          <p className="text-xs text-gray-400 mt-6">Recording your response...</p>
        )}
        {state === "idle" && platformLabel && (
          <p className="text-xs text-gray-400 mt-6">
            Positive responses are directed to {platformLabel}
          </p>
        )}
      </div>
    </div>
  );
}
