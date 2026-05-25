"use client";

import { useState, useTransition } from "react";
import { generateWebhookKeyAction, saveCustomVariablesAction } from "@/app/actions/settings";

export function SettingsClient({
  initialKey,
  initialVars,
  webhookUrl,
}: {
  initialKey: string | null;
  initialVars: string[];
  webhookUrl: string;
}) {
  const [apiKey, setApiKey] = useState<string | null>(initialKey);
  const [copied, setCopied] = useState<"key" | "url" | null>(null);
  const [vars, setVars] = useState<string[]>(initialVars);
  const [newVar, setNewVar] = useState("");
  const [varError, setVarError] = useState<string | null>(null);
  const [isPendingKey, startKeyTransition] = useTransition();
  const [isPendingVars, startVarsTransition] = useTransition();

  function copy(text: string, which: "key" | "url") {
    navigator.clipboard.writeText(text);
    setCopied(which);
    setTimeout(() => setCopied(null), 2000);
  }

  function handleGenerate() {
    startKeyTransition(async () => {
      const key = await generateWebhookKeyAction();
      setApiKey(key);
    });
  }

  function addVar() {
    const name = newVar.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");
    if (!name) return;
    const reserved = ["name", "business", "link", "platform", "phone", "email"];
    if (reserved.includes(name)) {
      setVarError(`"${name}" is a reserved variable name`);
      return;
    }
    if (vars.includes(name)) {
      setVarError("Already exists");
      return;
    }
    setVarError(null);
    const updated = [...vars, name];
    setVars(updated);
    setNewVar("");
    startVarsTransition(async () => {
      await saveCustomVariablesAction(updated);
    });
  }

  function removeVar(name: string) {
    const updated = vars.filter((v) => v !== name);
    setVars(updated);
    startVarsTransition(async () => {
      await saveCustomVariablesAction(updated);
    });
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Webhook */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-1">Webhook enrollment</h2>
        <p className="text-sm text-gray-500 mb-5">
          Send a <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">POST</code> request
          to enroll customers programmatically from your CRM, POS, or other system.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Endpoint URL</label>
            <div className="flex gap-2">
              <input
                readOnly
                value={webhookUrl}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 font-mono text-gray-700"
              />
              <button
                onClick={() => copy(webhookUrl, "url")}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {copied === "url" ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">API key</label>
            <div className="flex gap-2">
              <input
                readOnly
                value={apiKey ?? ""}
                placeholder="No key generated yet"
                type="password"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 font-mono text-gray-700"
              />
              {apiKey && (
                <button
                  onClick={() => copy(apiKey, "key")}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  {copied === "key" ? "Copied!" : "Copy"}
                </button>
              )}
              <button
                onClick={handleGenerate}
                disabled={isPendingKey}
                className="px-3 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-60"
              >
                {isPendingKey ? "Generating…" : apiKey ? "Regenerate" : "Generate"}
              </button>
            </div>
            {apiKey && (
              <p className="text-xs text-amber-600 mt-1.5">
                Treat this like a password — it grants access to enroll customers on your behalf.
              </p>
            )}
          </div>
        </div>

        {/* Payload reference */}
        <div className="mt-5 bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-medium text-gray-700 mb-2">Example request</p>
          <pre className="text-xs text-gray-600 overflow-x-auto whitespace-pre-wrap">{`POST ${webhookUrl}
X-Api-Key: <your-api-key>
Content-Type: application/json

{
  "campaignId": "camp_123",
  "contact": {
    "name": "Jane Smith",
    "phone": "+15551234567",
    "email": "jane@example.com"${vars.length > 0 ? `,\n    "customVariables": {\n${vars.map((v) => `      "${v}": "value"`).join(",\n")}\n    }` : ""}
  },
  "platform": "google",
  "destinationUrl": "https://g.page/r/...",
  "visitDate": "2026-05-25"
}`}</pre>
        </div>
      </section>

      {/* Custom variables */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-1">Custom variables</h2>
        <p className="text-sm text-gray-500 mb-5">
          Define extra variables you can use in campaign templates and pass when enrolling customers.
          Use them in templates as <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{`{varname}`}</code>.
        </p>

        {vars.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {vars.map((v) => (
              <div
                key={v}
                className="flex items-center gap-1.5 bg-brand-50 border border-brand-100 rounded-lg px-2.5 py-1 text-sm"
              >
                <code className="text-brand-700 font-mono text-xs">{`{${v}}`}</code>
                <button
                  onClick={() => removeVar(v)}
                  disabled={isPendingVars}
                  className="text-brand-400 hover:text-red-500 transition-colors text-xs leading-none"
                  aria-label={`Remove ${v}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            value={newVar}
            onChange={(e) => {
              setNewVar(e.target.value);
              setVarError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addVar())}
            placeholder="e.g. technician"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            onClick={addVar}
            disabled={!newVar.trim() || isPendingVars}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-60"
          >
            Add
          </button>
        </div>
        {varError && <p className="text-xs text-red-600 mt-1.5">{varError}</p>}
        {vars.length === 0 && (
          <p className="text-xs text-gray-400 mt-3">
            No custom variables yet. Add one above to get started.
          </p>
        )}
      </section>
    </div>
  );
}
