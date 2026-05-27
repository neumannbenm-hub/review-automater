"use client";

import { useState, useTransition } from "react";
import {
  generateWebhookKeyAction,
  saveCustomVariablesAction,
  getReviewSitesAction,
  upsertReviewSiteAction,
  deleteReviewSiteAction,
  type ReviewSiteEntry,
} from "@/app/actions/settings";

export function SettingsClient({
  initialKey,
  initialVars,
  initialSites,
  webhookUrl,
}: {
  initialKey: string | null;
  initialVars: string[];
  initialSites: ReviewSiteEntry[];
  webhookUrl: string;
}) {
  const [apiKey, setApiKey] = useState<string | null>(initialKey);
  const [copied, setCopied] = useState<"key" | "url" | null>(null);
  const [vars, setVars] = useState<string[]>(initialVars);
  const [newVar, setNewVar] = useState("");
  const [varError, setVarError] = useState<string | null>(null);
  const [isPendingKey, startKeyTransition] = useTransition();
  const [isPendingVars, startVarsTransition] = useTransition();

  // Review links state
  const [sites, setSites] = useState<ReviewSiteEntry[]>(initialSites);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", url: "" });
  const [newSite, setNewSite] = useState({ name: "", url: "" });
  const [siteError, setSiteError] = useState<string | null>(null);
  const [isPendingSites, startSitesTransition] = useTransition();

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

  function addSite() {
    const name = newSite.name.trim();
    const url = newSite.url.trim();
    if (!name) { setSiteError("Name is required"); return; }
    if (!url) { setSiteError("URL is required"); return; }
    try { new URL(url); } catch { setSiteError("Enter a valid URL"); return; }
    setSiteError(null);
    setNewSite({ name: "", url: "" });
    startSitesTransition(async () => {
      await upsertReviewSiteAction({ name, url });
      setSites(await getReviewSitesAction());
    });
  }

  function startEdit(site: ReviewSiteEntry) {
    setEditingId(site.id);
    setEditForm({ name: site.display_name ?? site.platform, url: site.url });
  }

  function saveEdit(id: string) {
    const name = editForm.name.trim();
    const url = editForm.url.trim();
    if (!name || !url) return;
    setSites(sites.map((s) => s.id === id ? { ...s, display_name: name, url } : s));
    setEditingId(null);
    startSitesTransition(async () => {
      await upsertReviewSiteAction({ id, name, url });
    });
  }

  function removeSite(id: string) {
    setSites(sites.filter((s) => s.id !== id));
    startSitesTransition(async () => {
      await deleteReviewSiteAction(id);
    });
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Review links */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-1">Review links</h2>
        <p className="text-sm text-gray-500 mb-5">
          Add links to your review profiles on Google, Yelp, or any platform. Use any custom name.
        </p>

        {sites.length > 0 && (
          <div className="space-y-2 mb-5">
            {sites.map((site) =>
              editingId === site.id ? (
                <div key={site.id} className="flex gap-2 items-center">
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Name"
                    className="w-36 border border-brand-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <input
                    value={editForm.url}
                    onChange={(e) => setEditForm((f) => ({ ...f, url: e.target.value }))}
                    placeholder="https://..."
                    className="flex-1 border border-brand-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <button
                    onClick={() => saveEdit(site.id)}
                    disabled={isPendingSites}
                    className="px-3 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-60"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div key={site.id} className="flex items-center gap-3 border border-gray-100 rounded-xl px-4 py-3 group">
                  <span className="text-sm font-medium text-gray-800 w-36 truncate">
                    {site.display_name ?? site.platform}
                  </span>
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-sm text-brand-600 truncate hover:underline"
                  >
                    {site.url}
                  </a>
                  <button
                    onClick={() => startEdit(site)}
                    className="text-xs text-gray-400 hover:text-gray-700 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => removeSite(site.id)}
                    disabled={isPendingSites}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    Remove
                  </button>
                </div>
              )
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={newSite.name}
            onChange={(e) => { setNewSite((s) => ({ ...s, name: e.target.value })); setSiteError(null); }}
            onKeyDown={(e) => e.key === "Enter" && addSite()}
            placeholder="Name (e.g. Google)"
            className="w-full sm:w-36 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <input
            value={newSite.url}
            onChange={(e) => { setNewSite((s) => ({ ...s, url: e.target.value })); setSiteError(null); }}
            onKeyDown={(e) => e.key === "Enter" && addSite()}
            placeholder="https://..."
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            onClick={addSite}
            disabled={isPendingSites}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-60"
          >
            Add
          </button>
        </div>
        {siteError && <p className="text-xs text-red-600 mt-1.5">{siteError}</p>}
        {sites.length === 0 && !siteError && (
          <p className="text-xs text-gray-400 mt-3">No review links yet. Add one above.</p>
        )}
      </section>

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
