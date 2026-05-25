"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { BusinessProfile, ReviewSite } from "@/lib/supabase";
import {
  saveBusinessInfo,
  saveAdminInfo,
  saveReviewSites,
  createTeamInvites,
  completeOnboarding,
} from "./actions";

// ── Platform definitions ───────────────────────────────────────────────────────

interface PlatformDef {
  id: string;
  name: string;
  badgeBg: string;
  badgeText: string;
  letter: string;
  placeholder: string;
  popular: boolean;
}

const PLATFORMS: PlatformDef[] = [
  { id: "google",       name: "Google",       badgeBg: "#E8F0FE", badgeText: "#4285F4", letter: "G", placeholder: "https://g.page/r/...",                                    popular: true  },
  { id: "yelp",         name: "Yelp",         badgeBg: "#FFF0F0", badgeText: "#E00707", letter: "y", placeholder: "https://www.yelp.com/biz/...",                             popular: true  },
  { id: "facebook",     name: "Facebook",     badgeBg: "#E7F3FF", badgeText: "#1877F2", letter: "f", placeholder: "https://www.facebook.com/.../reviews/",                    popular: true  },
  { id: "tripadvisor",  name: "TripAdvisor",  badgeBg: "#E5F7F2", badgeText: "#00AA6C", letter: "T", placeholder: "https://www.tripadvisor.com/...",                          popular: true  },
  { id: "trustpilot",   name: "Trustpilot",   badgeBg: "#E5F9F2", badgeText: "#00B67A", letter: "t", placeholder: "https://www.trustpilot.com/review/...",                    popular: false },
  { id: "bbb",          name: "BBB",          badgeBg: "#E5EAF0", badgeText: "#003893", letter: "B", placeholder: "https://www.bbb.org/us/...",                               popular: false },
  { id: "angi",         name: "Angi",         badgeBg: "#FFF0E8", badgeText: "#FF6020", letter: "A", placeholder: "https://www.angi.com/companylist/...",                     popular: false },
  { id: "homeadvisor",  name: "HomeAdvisor",  badgeBg: "#FEF0E6", badgeText: "#F96302", letter: "H", placeholder: "https://www.homeadvisor.com/rated.../",                    popular: false },
  { id: "houzz",        name: "Houzz",        badgeBg: "#EDF9E5", badgeText: "#4DBC15", letter: "H", placeholder: "https://www.houzz.com/pro/...",                            popular: false },
  { id: "nextdoor",     name: "Nextdoor",     badgeBg: "#E5F7EE", badgeText: "#00B151", letter: "N", placeholder: "https://nextdoor.com/pages/...",                           popular: false },
  { id: "zillow",       name: "Zillow",       badgeBg: "#E5EEFF", badgeText: "#006AFF", letter: "Z", placeholder: "https://www.zillow.com/profile/...",                       popular: false },
  { id: "healthgrades", name: "Healthgrades", badgeBg: "#E5F5F8", badgeText: "#01A0B4", letter: "H", placeholder: "https://www.healthgrades.com/physician/dr-...",            popular: false },
  { id: "zocdoc",       name: "Zocdoc",       badgeBg: "#E8ECFC", badgeText: "#2C4DBE", letter: "Z", placeholder: "https://www.zocdoc.com/doctor/...",                        popular: false },
  { id: "g2",           name: "G2",           badgeBg: "#FFEEE9", badgeText: "#FF492C", letter: "G", placeholder: "https://www.g2.com/products/.../reviews",                  popular: false },
  { id: "capterra",     name: "Capterra",     badgeBg: "#ECEEF4", badgeText: "#3B4A6B", letter: "C", placeholder: "https://www.capterra.com/p/XXXXX/...",                     popular: false },
  { id: "apple_maps",   name: "Apple Maps",   badgeBg: "#F0F0F0", badgeText: "#1C1C1E", letter: "A", placeholder: "https://maps.apple.com/?auid=...",                         popular: false },
];

const BUSINESS_TYPES = [
  "Restaurant / Food & Beverage",
  "Retail",
  "Healthcare / Medical",
  "Legal Services",
  "Home Services",
  "Automotive",
  "Beauty / Salon",
  "Fitness / Wellness",
  "Real Estate",
  "Financial Services",
  "Education",
  "Hospitality / Travel",
  "Technology / Software",
  "Professional Services",
  "Other",
];

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC",
];

// ── Types ──────────────────────────────────────────────────────────────────────

interface Props {
  tenantId: string;
  profile: BusinessProfile | null;
  existingSites: ReviewSite[];
}

interface InviteRow {
  email: string;
  role: "member" | "tenant_admin";
}

interface CustomSite {
  name: string;
  url: string;
}

// ── Small reusable input ───────────────────────────────────────────────────────

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  hint,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-gray-300"
      />
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

// ── Step progress indicator ────────────────────────────────────────────────────

const STEP_LABELS = ["Business", "Admin", "Review Sites", "Team", "Done"];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 mb-10">
      {STEP_LABELS.map((label, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <div key={step} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  done
                    ? "bg-brand-600 text-white"
                    : active
                    ? "bg-brand-600 text-white ring-4 ring-brand-100"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {done ? "✓" : step}
              </div>
              <span
                className={`text-sm font-medium hidden sm:block ${
                  active ? "text-gray-900" : done ? "text-brand-600" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`h-px w-6 sm:w-10 ${done ? "bg-brand-400" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Platform badge ─────────────────────────────────────────────────────────────

function PlatformBadge({ platform }: { platform: PlatformDef }) {
  return (
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black select-none"
      style={{ backgroundColor: platform.badgeBg, color: platform.badgeText }}
    >
      {platform.letter}
    </div>
  );
}

// ── Main wizard ────────────────────────────────────────────────────────────────

export function OnboardingWizard({ profile, existingSites }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Step 1 state
  const [bizName, setBizName] = useState(profile?.business_name ?? "");
  const [bizType, setBizType] = useState(profile?.business_type ?? "");
  const [bizPhone, setBizPhone] = useState(profile?.phone ?? "");
  const [bizAddress, setBizAddress] = useState(profile?.address ?? "");
  const [bizCity, setBizCity] = useState(profile?.city ?? "");
  const [bizState, setBizState] = useState(profile?.state ?? "");
  const [bizZip, setBizZip] = useState(profile?.zip ?? "");
  const [bizWebsite, setBizWebsite] = useState(profile?.website ?? "");

  // Step 2 state
  const [adminFirst, setAdminFirst] = useState(profile?.admin_first_name ?? "");
  const [adminLast, setAdminLast] = useState(profile?.admin_last_name ?? "");
  const [adminEmail, setAdminEmail] = useState(profile?.admin_email ?? "");
  const [adminPhone, setAdminPhone] = useState(profile?.admin_phone ?? "");
  const [adminTitle, setAdminTitle] = useState(profile?.admin_title ?? "");

  // Step 3 state
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(() =>
    existingSites.filter((s) => s.platform !== "custom").map((s) => s.platform)
  );
  const [siteUrls, setSiteUrls] = useState<Record<string, string>>(() =>
    Object.fromEntries(existingSites.filter((s) => s.platform !== "custom").map((s) => [s.platform, s.url]))
  );
  const [customSites, setCustomSites] = useState<CustomSite[]>(() =>
    existingSites
      .filter((s) => s.platform === "custom")
      .map((s) => ({ name: s.display_name ?? "", url: s.url }))
  );
  const [showAllPlatforms, setShowAllPlatforms] = useState(false);

  // Step 4 state
  const [invites, setInvites] = useState<InviteRow[]>([{ email: "", role: "member" }]);
  const [inviteLinks, setInviteLinks] = useState<Array<{ email: string; url: string }>>([]);

  function run(fn: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try {
        await fn();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      }
    });
  }

  // ── Step 1: Business Info ────────────────────────────────────────────────────

  function handleBusinessNext() {
    if (!bizName.trim()) {
      setError("Business name is required.");
      return;
    }
    run(async () => {
      await saveBusinessInfo({
        businessName: bizName,
        businessType: bizType,
        phone: bizPhone,
        address: bizAddress,
        city: bizCity,
        state: bizState,
        zip: bizZip,
        website: bizWebsite,
      });
      setStep(2);
    });
  }

  // ── Step 2: Admin Info ───────────────────────────────────────────────────────

  function handleAdminNext() {
    if (!adminEmail.trim()) {
      setError("Email address is required.");
      return;
    }
    run(async () => {
      await saveAdminInfo({
        firstName: adminFirst,
        lastName: adminLast,
        email: adminEmail,
        phone: adminPhone,
        title: adminTitle,
      });
      setStep(3);
    });
  }

  // ── Step 3: Review Sites ─────────────────────────────────────────────────────

  function togglePlatform(id: string) {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  function addCustomSite() {
    if (customSites.length >= 5) return;
    setCustomSites((prev) => [...prev, { name: "", url: "" }]);
  }

  function updateCustomSite(i: number, field: "name" | "url", value: string) {
    setCustomSites((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  }

  function removeCustomSite(i: number) {
    setCustomSites((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleSitesNext() {
    const missingUrl = selectedPlatforms.find((id) => !siteUrls[id]?.trim());
    if (missingUrl) {
      const p = PLATFORMS.find((p) => p.id === missingUrl);
      setError(`Please enter the URL for ${p?.name ?? missingUrl}.`);
      return;
    }
    for (const cs of customSites) {
      if (cs.name.trim() && !cs.url.trim()) {
        setError(`Please enter a URL for the custom site "${cs.name}".`);
        return;
      }
      if (cs.url.trim() && !cs.name.trim()) {
        setError("Please enter a name for each custom site.");
        return;
      }
    }
    run(async () => {
      const sites = [
        ...selectedPlatforms.map((id, i) => ({
          platform: id,
          displayName: PLATFORMS.find((p) => p.id === id)?.name ?? id,
          url: siteUrls[id] ?? "",
          sortOrder: i,
        })),
        ...customSites
          .filter((s) => s.name.trim() && s.url.trim())
          .map((s, i) => ({
            platform: "custom",
            displayName: s.name,
            url: s.url,
            sortOrder: selectedPlatforms.length + i,
          })),
      ];
      await saveReviewSites(sites);
      setStep(4);
    });
  }

  // ── Step 4: Team Invites ─────────────────────────────────────────────────────

  function addInviteRow() {
    setInvites((prev) => [...prev, { email: "", role: "member" }]);
  }

  function updateInvite(i: number, field: keyof InviteRow, value: string) {
    setInvites((prev) =>
      prev.map((row, idx) =>
        idx === i ? { ...row, [field]: value as InviteRow[typeof field] } : row
      )
    );
  }

  function removeInviteRow(i: number) {
    setInvites((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleInvitesNext() {
    const filledInvites = invites.filter((r) => r.email.trim());
    run(async () => {
      if (filledInvites.length > 0) {
        const res = await createTeamInvites(filledInvites);
        setInviteLinks(res.inviteLinks);
      }
      setStep(5);
    });
  }

  function handleSkipInvites() {
    run(async () => {
      setStep(5);
    });
  }

  // ── Step 5: Complete ─────────────────────────────────────────────────────────

  function handleFinish() {
    run(async () => {
      await completeOnboarding();
      router.push("/dashboard");
    });
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  const visiblePlatforms = showAllPlatforms ? PLATFORMS : PLATFORMS.filter((p) => p.popular);

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome to <span className="text-brand-600">ReviewAutomater</span>
          </h1>
          <p className="text-gray-500 mt-2">Let&apos;s get your account set up in a few quick steps.</p>
        </div>

        <StepIndicator current={step} />

        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          {/* ── Step 1: Business Info ── */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Business Information</h2>
              <p className="text-sm text-gray-500 mb-6">Tell us about your business.</p>

              <div className="space-y-5">
                <Field
                  label="Business name"
                  name="businessName"
                  value={bizName}
                  onChange={setBizName}
                  placeholder="Acme Cleaning Co."
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Business type
                  </label>
                  <select
                    value={bizType}
                    onChange={(e) => setBizType(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700"
                  >
                    <option value="">Select a type…</option>
                    {BUSINESS_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <Field
                  label="Business phone"
                  name="bizPhone"
                  value={bizPhone}
                  onChange={setBizPhone}
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                />

                <Field
                  label="Street address"
                  name="bizAddress"
                  value={bizAddress}
                  onChange={setBizAddress}
                  placeholder="123 Main St"
                />

                <div className="grid grid-cols-6 gap-3">
                  <div className="col-span-3">
                    <Field
                      label="City"
                      name="bizCity"
                      value={bizCity}
                      onChange={setBizCity}
                      placeholder="Springfield"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                    <select
                      value={bizState}
                      onChange={(e) => setBizState(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700"
                    >
                      <option value="">—</option>
                      {US_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-1">
                    <Field
                      label="ZIP"
                      name="bizZip"
                      value={bizZip}
                      onChange={setBizZip}
                      placeholder="62701"
                    />
                  </div>
                </div>

                <Field
                  label="Website"
                  name="bizWebsite"
                  value={bizWebsite}
                  onChange={setBizWebsite}
                  type="url"
                  placeholder="https://www.yourbusiness.com"
                  hint="Optional — helps customers find you."
                />
              </div>
            </div>
          )}

          {/* ── Step 2: Admin Info ── */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Admin Information</h2>
              <p className="text-sm text-gray-500 mb-6">Who is the primary administrator for this account?</p>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <Field
                    label="First name"
                    name="adminFirst"
                    value={adminFirst}
                    onChange={setAdminFirst}
                    placeholder="Jane"
                  />
                  <Field
                    label="Last name"
                    name="adminLast"
                    value={adminLast}
                    onChange={setAdminLast}
                    placeholder="Doe"
                  />
                </div>

                <Field
                  label="Email address"
                  name="adminEmail"
                  value={adminEmail}
                  onChange={setAdminEmail}
                  type="email"
                  placeholder="jane@yourbusiness.com"
                  required
                />

                <Field
                  label="Direct phone"
                  name="adminPhone"
                  value={adminPhone}
                  onChange={setAdminPhone}
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                />

                <Field
                  label="Job title"
                  name="adminTitle"
                  value={adminTitle}
                  onChange={setAdminTitle}
                  placeholder="General Manager"
                />
              </div>
            </div>
          )}

          {/* ── Step 3: Review Sites ── */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Review Sites</h2>
              <p className="text-sm text-gray-500 mb-6">
                Select the platforms you collect reviews on, then paste in your profile URL for each one.
              </p>

              {/* Platform grid */}
              <div className="mb-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  {showAllPlatforms ? "All Platforms" : "Popular Platforms"}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {visiblePlatforms.map((p) => {
                    const isSelected = selectedPlatforms.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => togglePlatform(p.id)}
                        className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-center ${
                          isSelected
                            ? "border-brand-500 bg-brand-50 ring-0"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-brand-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            ✓
                          </span>
                        )}
                        <PlatformBadge platform={p} />
                        <span className="text-xs font-medium text-gray-700 leading-tight">{p.name}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setShowAllPlatforms((v) => !v)}
                  className="mt-3 text-sm text-brand-600 hover:text-brand-700 font-medium"
                >
                  {showAllPlatforms ? "Show fewer platforms" : `Show all ${PLATFORMS.length} platforms →`}
                </button>
              </div>

              {/* URL inputs for selected platforms */}
              {selectedPlatforms.length > 0 && (
                <div className="mt-6 space-y-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Your Profile URLs</p>
                  {selectedPlatforms.map((id) => {
                    const p = PLATFORMS.find((pl) => pl.id === id)!;
                    return (
                      <div key={id} className="flex items-center gap-3">
                        <div className="shrink-0">
                          <PlatformBadge platform={p} />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-500 mb-1">{p.name}</label>
                          <input
                            type="url"
                            value={siteUrls[id] ?? ""}
                            onChange={(e) =>
                              setSiteUrls((prev) => ({ ...prev, [id]: e.target.value }))
                            }
                            placeholder={p.placeholder}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-gray-300"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => togglePlatform(id)}
                          className="shrink-0 text-gray-300 hover:text-red-400 transition-colors text-lg leading-none"
                          title="Remove"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Custom sites */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Custom Sites {customSites.length > 0 && `(${customSites.length}/5)`}
                  </p>
                  {customSites.length < 5 && (
                    <button
                      type="button"
                      onClick={addCustomSite}
                      className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                    >
                      + Add custom site
                    </button>
                  )}
                </div>

                {customSites.length === 0 && (
                  <p className="text-sm text-gray-400 italic">
                    Have a review site not listed above? Add up to 5 custom platforms.
                  </p>
                )}

                <div className="space-y-3">
                  {customSites.map((cs, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={cs.name}
                          onChange={(e) => updateCustomSite(i, "name", e.target.value)}
                          placeholder="Platform name (e.g. Clutch)"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-gray-300 bg-white"
                        />
                        <input
                          type="url"
                          value={cs.url}
                          onChange={(e) => updateCustomSite(i, "url", e.target.value)}
                          placeholder="https://clutch.co/profile/..."
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-gray-300 bg-white"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCustomSite(i)}
                        className="mt-2 text-gray-300 hover:text-red-400 transition-colors text-lg leading-none"
                        title="Remove"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 4: Team Members ── */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Invite Team Members</h2>
              <p className="text-sm text-gray-500 mb-6">
                Add your team. Each person will receive a unique invite link to create their account.
                You can always add more from your admin dashboard.
              </p>

              <div className="space-y-3">
                {invites.map((row, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <input
                      type="email"
                      value={row.email}
                      onChange={(e) => updateInvite(i, "email", e.target.value)}
                      placeholder="teammate@company.com"
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-gray-300"
                    />
                    <select
                      value={row.role}
                      onChange={(e) => updateInvite(i, "role", e.target.value)}
                      className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700"
                    >
                      <option value="member">Member</option>
                      <option value="tenant_admin">Admin</option>
                    </select>
                    {invites.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeInviteRow(i)}
                        className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addInviteRow}
                className="mt-3 text-sm text-brand-600 hover:text-brand-700 font-medium"
              >
                + Add another
              </button>
            </div>
          )}

          {/* ── Step 5: Complete ── */}
          {step === 5 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                ✓
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">You&apos;re all set!</h2>
              <p className="text-sm text-gray-500 mb-8">
                Your account is configured. You can update any of this later from your dashboard.
              </p>

              {/* Summary */}
              <div className="text-left space-y-4 mb-8">
                <SummaryRow
                  label="Business"
                  value={bizName || "—"}
                />
                <SummaryRow
                  label="Admin"
                  value={[adminFirst, adminLast].filter(Boolean).join(" ") || adminEmail || "—"}
                />
                <SummaryRow
                  label="Review sites"
                  value={
                    selectedPlatforms.length + customSites.filter((s) => s.name && s.url).length === 0
                      ? "None added"
                      : `${selectedPlatforms.length + customSites.filter((s) => s.name && s.url).length} configured`
                  }
                />
                {inviteLinks.length > 0 && (
                  <SummaryRow
                    label="Invites sent"
                    value={`${inviteLinks.length} team member${inviteLinks.length > 1 ? "s" : ""}`}
                  />
                )}
              </div>

              {/* Invite links (for admin to copy & send) */}
              {inviteLinks.length > 0 && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-left">
                  <p className="text-sm font-semibold text-blue-800 mb-3">Invite Links</p>
                  <p className="text-xs text-blue-600 mb-3">
                    Share these links with your team members to complete their sign-up:
                  </p>
                  <div className="space-y-2">
                    {inviteLinks.map((link, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-xs text-blue-700 font-medium min-w-0 truncate flex-1">
                          {link.email}
                        </span>
                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(link.url)}
                          className="shrink-0 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded-lg transition-colors"
                        >
                          Copy link
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Error ── */}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* ── Navigation ── */}
          <div className={`mt-8 flex ${step > 1 && step < 5 ? "justify-between" : "justify-end"}`}>
            {step > 1 && step < 5 && (
              <button
                type="button"
                onClick={() => { setError(null); setStep((s) => (s - 1) as typeof step); }}
                disabled={isPending}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium disabled:opacity-40"
              >
                ← Back
              </button>
            )}

            {step === 1 && (
              <button
                type="button"
                onClick={handleBusinessNext}
                disabled={isPending}
                className="bg-brand-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-60"
              >
                {isPending ? "Saving…" : "Next: Admin Info →"}
              </button>
            )}

            {step === 2 && (
              <button
                type="button"
                onClick={handleAdminNext}
                disabled={isPending}
                className="bg-brand-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-60"
              >
                {isPending ? "Saving…" : "Next: Review Sites →"}
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                onClick={handleSitesNext}
                disabled={isPending}
                className="bg-brand-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-60"
              >
                {isPending ? "Saving…" : "Next: Team Members →"}
              </button>
            )}

            {step === 4 && (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleSkipInvites}
                  disabled={isPending}
                  className="text-sm text-gray-500 hover:text-gray-700 font-medium disabled:opacity-40"
                >
                  Skip for now
                </button>
                <button
                  type="button"
                  onClick={handleInvitesNext}
                  disabled={isPending}
                  className="bg-brand-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-60"
                >
                  {isPending ? "Creating invites…" : "Send Invites →"}
                </button>
              </div>
            )}

            {step === 5 && (
              <button
                type="button"
                onClick={handleFinish}
                disabled={isPending}
                className="bg-brand-600 text-white px-8 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-60"
              >
                {isPending ? "Going to dashboard…" : "Go to Dashboard →"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500 w-28 shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}
