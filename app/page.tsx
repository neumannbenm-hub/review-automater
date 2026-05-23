import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { PLANS } from "@/lib/plans";

export default async function LandingPage() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-bold text-xl text-gray-900">
            Review<span className="text-brand-600">Automater</span>
          </span>
          <div className="flex items-center gap-4">
            {userId ? (
              <Link
                href="/dashboard"
                className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
              >
                Dashboard →
              </Link>
            ) : (
              <>
                <Link href="/sign-in" className="text-sm text-gray-600 hover:text-gray-900">
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
                >
                  Get started free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-600 text-sm font-medium px-3 py-1 rounded-full mb-6">
          <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
          SMS + Email + QR — fully automated
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight mb-6">
          More 5-star reviews.
          <br />
          <span className="text-brand-600">On autopilot.</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          ReviewAutomater sends perfectly timed SMS and email follow-ups after every
          customer visit — and stops the moment they leave a review.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/sign-up"
            className="bg-brand-600 text-white px-8 py-3.5 rounded-xl text-base font-semibold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-100"
          >
            Start free trial
          </Link>
          <a
            href="#how-it-works"
            className="border border-gray-200 text-gray-700 px-8 py-3.5 rounded-xl text-base font-semibold hover:bg-gray-50 transition-colors"
          >
            See how it works
          </a>
        </div>
        <p className="mt-4 text-sm text-gray-400">No credit card required · 14-day free trial</p>
      </section>

      {/* Stats bar */}
      <section className="border-y border-gray-100 bg-gray-50 py-10">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8 text-center">
          {[
            { value: "3.2×", label: "more reviews on average" },
            { value: "< 30s", label: "to set up a campaign" },
            { value: "$0–15/mo", label: "infrastructure cost" },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
          Up and running in minutes
        </h2>
        <p className="text-gray-500 text-center mb-16">
          Connect once. ReviewAutomater handles everything after that.
        </p>
        <div className="grid md:grid-cols-3 gap-10">
          {[
            {
              step: "01",
              title: "Trigger on a visit",
              body: "Call our API when a customer checks out — from your POS, booking system, or CRM. Takes one webhook.",
            },
            {
              step: "02",
              title: "Campaign sends automatically",
              body: "A timed sequence of SMS and emails goes out — asking for a review at exactly the right moment.",
            },
            {
              step: "03",
              title: "Reviews roll in",
              body: "As soon as someone leaves a review, the sequence stops. No spam. More conversions.",
            },
          ].map(({ step, title, body }) => (
            <div key={step} className="relative">
              <div className="text-5xl font-black text-brand-50 mb-4 select-none">{step}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
            Everything you need, nothing you don&apos;t
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "💬",
                title: "SMS via Twilio",
                body: "High open rates. Messages feel personal. Only ~$0.008/text.",
              },
              {
                icon: "📧",
                title: "Email via SendGrid",
                body: "Beautiful HTML emails with your brand color. Free up to 100/day.",
              },
              {
                icon: "📷",
                title: "QR codes",
                body: "Perfect for in-store. Print once, scan forever. Tracked clicks included.",
              },
              {
                icon: "⏱️",
                title: "Timed sequences",
                body: "Set up multi-step campaigns — Day 0 SMS, Day 3 email, Day 7 nudge.",
              },
              {
                icon: "🛑",
                title: "Smart stop",
                body: "The moment a customer clicks your review link, the sequence stops automatically.",
              },
              {
                icon: "📊",
                title: "Click analytics",
                body: "See click rates and conversions per campaign, per location.",
              },
            ].map(({ icon, title, body }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="text-3xl mb-3">{icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Competitor comparison */}
      <section id="compare" className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
          How we stack up
        </h2>
        <p className="text-gray-500 text-center mb-16">
          ReviewAutomater vs. the alternatives — at a glance.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="text-left font-semibold text-gray-500 py-3 px-4 bg-gray-50 rounded-tl-xl border border-gray-200 border-r-0 w-1/4">
                  Feature
                </th>
                {[
                  { name: "ReviewAutomater", highlight: true },
                  { name: "Birdeye", highlight: false },
                  { name: "Podium", highlight: false },
                  { name: "Grade.us", highlight: false },
                ].map(({ name, highlight }, i) => (
                  <th
                    key={name}
                    className={`text-center font-semibold py-3 px-4 border border-gray-200 border-l-0 ${
                      i === 3 ? "rounded-tr-xl" : ""
                    } ${
                      highlight
                        ? "bg-brand-600 text-white"
                        : "bg-gray-50 text-gray-700"
                    }`}
                  >
                    {highlight ? (
                      <span className="flex flex-col items-center gap-0.5">
                        {name}
                        <span className="text-[10px] font-normal bg-white/20 px-1.5 py-0.5 rounded-full">
                          You&apos;re here
                        </span>
                      </span>
                    ) : (
                      name
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                {
                  feature: "Starting price",
                  values: ["$29 / mo", "~$299 / mo", "~$399 / mo", "~$110 / mo"],
                },
                {
                  feature: "SMS automation",
                  values: [true, true, true, false],
                },
                {
                  feature: "Email automation",
                  values: [true, true, true, true],
                },
                {
                  feature: "QR code campaigns",
                  values: [true, false, false, true],
                },
                {
                  feature: "Auto-stop after review",
                  values: [true, false, false, false],
                },
                {
                  feature: "API / webhook enrollment",
                  values: [true, true, false, false],
                },
                {
                  feature: "No per-location fees",
                  values: [true, false, false, false],
                },
                {
                  feature: "Setup time",
                  values: ["< 30 min", "2–4 weeks", "1–2 weeks", "1–3 days"],
                },
              ].map(({ feature, values }, rowIdx) => {
                const isLast = rowIdx === 7;
                return (
                  <tr key={feature} className="group">
                    <td
                      className={`py-3.5 px-4 font-medium text-gray-700 bg-gray-50 border border-gray-200 border-t-0 border-r-0 ${
                        isLast ? "rounded-bl-xl" : ""
                      }`}
                    >
                      {feature}
                    </td>
                    {values.map((val, colIdx) => {
                      const isHighlight = colIdx === 0;
                      const isLastCol = colIdx === 3;
                      return (
                        <td
                          key={colIdx}
                          className={`py-3.5 px-4 text-center border border-gray-200 border-t-0 border-l-0 ${
                            isLast && isLastCol ? "rounded-br-xl" : ""
                          } ${
                            isHighlight
                              ? "bg-brand-50 text-brand-700 font-semibold"
                              : "text-gray-600 group-hover:bg-gray-50/60"
                          }`}
                        >
                          {typeof val === "boolean" ? (
                            val ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600 mx-auto">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-400 mx-auto">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </span>
                            )
                          ) : (
                            val
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 text-center mt-4">
          Competitor pricing based on publicly listed plans as of 2025. Features verified from public documentation.
        </p>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
          Simple, transparent pricing
        </h2>
        <p className="text-gray-500 text-center mb-16">
          Start free for 14 days. No credit card required.
        </p>
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {PLANS.map((plan, i) => (
            <div
              key={plan.id}
              className={`rounded-2xl p-8 border ${
                i === 1
                  ? "border-brand-500 bg-brand-600 text-white shadow-xl shadow-brand-100"
                  : "border-gray-200 bg-white"
              }`}
            >
              {i === 1 && (
                <div className="inline-block bg-white/20 text-white text-xs font-semibold px-2 py-0.5 rounded-full mb-4">
                  Most popular
                </div>
              )}
              <h3 className={`text-xl font-bold mb-1 ${i === 1 ? "text-white" : "text-gray-900"}`}>
                {plan.name}
              </h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className={`text-4xl font-black ${i === 1 ? "text-white" : "text-gray-900"}`}>
                  ${plan.price}
                </span>
                <span className={i === 1 ? "text-white/70" : "text-gray-400"}>/mo</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <svg
                      className={`w-4 h-4 flex-shrink-0 ${i === 1 ? "text-white" : "text-brand-500"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className={i === 1 ? "text-white/90" : "text-gray-600"}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className={`block text-center py-3 rounded-xl font-semibold text-sm transition-colors ${
                  i === 1
                    ? "bg-white text-brand-600 hover:bg-brand-50"
                    : "bg-brand-600 text-white hover:bg-brand-700"
                }`}
              >
                Start free trial
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-600 py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to grow your reviews?
          </h2>
          <p className="text-brand-100 mb-8">
            Join hundreds of local businesses automating their review collection.
          </p>
          <Link
            href="/sign-up"
            className="inline-block bg-white text-brand-600 px-8 py-3.5 rounded-xl font-semibold hover:bg-brand-50 transition-colors"
          >
            Get started free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-bold text-gray-900">
            Review<span className="text-brand-600">Automater</span>
          </span>
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} ReviewAutomater. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
