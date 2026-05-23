"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCampaignAction } from "@/app/actions/campaigns";
import type { Method, CampaignStep } from "@/lib/api";

type StepDraft = Omit<CampaignStep, "stepNumber">;

const EMPTY_STEP: StepDraft = {
  method: "sms",
  delayDays: 0,
  delayFrom: "visit",
  template: "Hi {name}! Thanks for visiting {business}. Mind leaving us a quick review? {link}",
  subject: null,
};

export default function NewCampaignPage() {
  const router = useRouter();
  const [name, setName] = useState("My Campaign");
  const [steps, setSteps] = useState<StepDraft[]>([{ ...EMPTY_STEP }]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function addStep() {
    setSteps((prev) => [...prev, { ...EMPTY_STEP, delayDays: prev.length * 3 }]);
  }

  function removeStep(i: number) {
    setSteps((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateStep(i: number, patch: Partial<StepDraft>) {
    setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await createCampaignAction({ name, steps });
        router.push("/dashboard/campaigns");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create campaign");
      }
    });
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">New campaign</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Build a timed sequence of SMS and email messages.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Campaign name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Steps */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Steps</h2>
            <button
              type="button"
              onClick={addStep}
              disabled={steps.length >= 10}
              className="text-sm text-brand-600 hover:text-brand-700 font-medium disabled:opacity-40"
            >
              + Add step
            </button>
          </div>

          <div className="space-y-4">
            {steps.map((step, i) => (
              <StepCard
                key={i}
                index={i}
                step={step}
                onChange={(patch) => updateStep(i, patch)}
                onRemove={steps.length > 1 ? () => removeStep(i) : undefined}
              />
            ))}
          </div>
        </div>

        {/* Template reference */}
        <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-1">
          <p className="font-medium text-gray-700 mb-2">Template variables</p>
          {[
            ["{name}", "Customer first name"],
            ["{business}", "Business name"],
            ["{link}", "Short review URL"],
            ["{platform}", "Platform (e.g. Google)"],
          ].map(([token, desc]) => (
            <div key={token} className="flex gap-3">
              <code className="text-brand-600 w-24 flex-shrink-0">{token}</code>
              <span>{desc}</span>
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 bg-brand-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-brand-700 transition-colors disabled:opacity-60"
          >
            {isPending ? "Creating…" : "Create campaign"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function StepCard({
  index,
  step,
  onChange,
  onRemove,
}: {
  index: number;
  step: StepDraft;
  onChange: (patch: Partial<StepDraft>) => void;
  onRemove?: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 text-xs font-bold flex items-center justify-center">
            {index + 1}
          </span>
          <span className="text-sm font-medium text-gray-700">Step {index + 1}</span>
        </div>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            Remove
          </button>
        )}
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mb-4">
        {/* Method */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Method</label>
          <select
            value={step.method}
            onChange={(e) => {
              const method = e.target.value as Method;
              onChange({
                method,
                template: method !== "email" ? (step.template ?? EMPTY_STEP.template) : null,
                subject: method === "email" ? (step.subject ?? "How was your experience at {business}?") : null,
              });
            }}
            className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="sms">SMS</option>
            <option value="email">Email</option>
            <option value="qr">QR Code</option>
            <option value="letter">Letter (+$3.00/letter add-on)</option>
          </select>
        </div>

        {/* Delay */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Delay (days)</label>
          <input
            type="number"
            min={0}
            max={365}
            value={step.delayDays}
            onChange={(e) => onChange({ delayDays: Number(e.target.value) })}
            className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Delay from */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Relative to</label>
          <select
            value={step.delayFrom}
            onChange={(e) => onChange({ delayFrom: e.target.value as "visit" | "previous_step" })}
            className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="visit">Visit date</option>
            <option value="previous_step">Previous step</option>
          </select>
        </div>
      </div>

      {/* Template / Subject */}
      {step.method === "sms" && (
        <div>
          <label className="block text-xs text-gray-500 mb-1">Message template</label>
          <textarea
            value={step.template ?? ""}
            onChange={(e) => onChange({ template: e.target.value })}
            rows={2}
            maxLength={320}
            className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">{step.template?.length ?? 0}/320 chars</p>
        </div>
      )}

      {step.method === "email" && (
        <div>
          <label className="block text-xs text-gray-500 mb-1">Email subject</label>
          <input
            value={step.subject ?? ""}
            onChange={(e) => onChange({ subject: e.target.value })}
            maxLength={200}
            className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      )}

      {step.method === "qr" && (
        <p className="text-xs text-gray-400 italic">QR steps generate a tracked link — no message sent.</p>
      )}

      {step.method === "letter" && (
        <div>
          <label className="block text-xs text-gray-500 mb-1">Letter body</label>
          <textarea
            value={step.template ?? ""}
            onChange={(e) => onChange({ template: e.target.value })}
            rows={3}
            maxLength={1000}
            placeholder="Dear {name}, we hope you enjoyed your visit to {business}. Please leave us a review at {link}."
            className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">{step.template?.length ?? 0}/1000 chars</p>
        </div>
      )}
    </div>
  );
}
