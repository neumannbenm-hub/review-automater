import Link from "next/link";
import { PLANS } from "@/lib/plans";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-bold text-xl text-gray-900">
            Review<span className="text-brand-600">Automater</span>
          </span>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
            >
              Dashboard →
            </Link>
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
            href="/dashboard"
            className="bg-brand-600 text-white px-8 py-3.5 rounded-xl text-base font-semibold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-100"
          >
            Go to Dashboard
          </Link>
          <a
            href="#how-it-works"
            className="border border-gray-200 text-gray-700 px-8 py-3.5 rounded-xl text-base font-semibold hover:bg-gray-50 transition-colors"
          >
            See how it works
          </a>
        </div>
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

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">

          {/* Header */}
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Start free for 14 days — no credit card required. Upgrade or cancel any time.
            </p>
          </div>

          {/* Testimonials */}
          <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto mb-14">
            {[
              {
                quote: "ReviewAutomater tripled our Google reviews in the first month. Setup was under 20 minutes.",
                name: "Sarah K.",
                role: "Salon owner",
              },
              {
                quote: "We went from 12 to 87 Google reviews in 6 weeks. Customers respond way better to the SMS than I expected.",
                name: "Marcus T.",
                role: "Restaurant owner",
              },
            ].map(({ quote, name, role }) => (
              <figure key={name} className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="text-sm text-gray-700 leading-relaxed mb-4">
                  &ldquo;{quote}&rdquo;
                </blockquote>
                <figcaption className="text-sm font-semibold text-gray-900">
                  {name} <span className="font-normal text-gray-400">· {role}</span>
                </figcaption>
              </figure>
            ))}
          </div>

          {/* Plan cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-14">
            {/* Starter */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 flex flex-col">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Starter</p>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-5xl font-black text-gray-900">$29</span>
                  <span className="text-gray-400">/mo</span>
                </div>
                <p className="text-sm text-gray-500">Perfect for a single location just getting started.</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {PLANS[0].features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-brand-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/dashboard"
                className="block text-center py-3 rounded-xl font-semibold text-sm bg-gray-900 text-white hover:bg-gray-800 transition-colors"
              >
                Start free trial
              </Link>
            </div>

            {/* Pro */}
            <div className="relative bg-brand-600 rounded-2xl p-8 flex flex-col shadow-2xl shadow-brand-100">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
                  MOST POPULAR
                </span>
              </div>
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-200 mb-2">Pro</p>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-5xl font-black text-white">$79</span>
                  <span className="text-brand-200">/mo</span>
                </div>
                <p className="text-sm text-brand-100">For growing businesses that want the full toolkit.</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {PLANS[1].features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-white/90">
                    <svg className="w-4 h-4 text-brand-200 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/dashboard"
                className="block text-center py-3 rounded-xl font-semibold text-sm bg-white text-brand-600 hover:bg-brand-50 transition-colors"
              >
                Start free trial
              </Link>
            </div>
          </div>

          {/* Feature comparison table */}
          <div className="max-w-3xl mx-auto mb-14">
            <h3 className="text-lg font-bold text-gray-900 text-center mb-6">Compare plans</h3>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-4 text-gray-500 font-medium w-1/2">Feature</th>
                    <th className="text-center px-6 py-4 text-gray-900 font-semibold">Starter</th>
                    <th className="text-center px-6 py-4 text-brand-600 font-semibold">Pro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[
                    { label: "Review requests / month", starter: "500", pro: "2,000" },
                    { label: "Campaigns", starter: "3", pro: "Unlimited" },
                    { label: "SMS via Twilio", starter: true, pro: true },
                    { label: "Email via SendGrid", starter: true, pro: true },
                    { label: "QR codes", starter: true, pro: true },
                    { label: "Click tracking", starter: true, pro: true },
                    { label: "Review gatekeeping page", starter: true, pro: true },
                    { label: "Advanced analytics", starter: false, pro: true },
                    { label: "Email support", starter: true, pro: true },
                    { label: "Priority support", starter: false, pro: true },
                  ].map(({ label, starter, pro }) => (
                    <tr key={label} className="hover:bg-gray-50/50">
                      <td className="px-6 py-3.5 text-gray-600">{label}</td>
                      <td className="px-6 py-3.5 text-center">
                        <TableCell value={starter} />
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <TableCell value={pro} pro />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ */}
          <div className="max-w-2xl mx-auto">
            <h3 className="text-lg font-bold text-gray-900 text-center mb-6">Frequently asked questions</h3>
            <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 overflow-hidden">
              {[
                {
                  q: "What happens after my free trial?",
                  a: "After 14 days you can choose a paid plan to keep going. If you don't upgrade, your account is paused — your data is safe and you can come back any time.",
                },
                {
                  q: "Can I cancel anytime?",
                  a: "Yes. Cancel with one click from the billing page. You won't be charged again and you keep access until the end of your billing period.",
                },
                {
                  q: "What counts as a review request?",
                  a: "Each SMS, email, or QR code send counts as one request. Multi-step campaigns count each step individually — so a 3-step campaign for one customer uses 3 requests.",
                },
                {
                  q: "Is SMS usage included in the price?",
                  a: "ReviewAutomater uses your own Twilio account for SMS, so you pay Twilio's rates directly (around $0.008/text). This keeps costs transparent and gives you full control.",
                },
                {
                  q: "Can I switch plans?",
                  a: "Absolutely. Upgrade or downgrade any time. Upgrades take effect immediately; downgrades apply at your next renewal date.",
                },
              ].map(({ q, a }) => (
                <details key={q} className="group px-6">
                  <summary className="flex items-center justify-between py-4 cursor-pointer select-none list-none font-medium text-gray-900 hover:text-brand-600 transition-colors">
                    {q}
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="pb-4 text-sm text-gray-500 leading-relaxed">{a}</p>
                </details>
              ))}
            </div>
          </div>

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
            href="/dashboard"
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

function TableCell({ value, pro = false }: { value: boolean | string; pro?: boolean }) {
  if (typeof value === "string") {
    return <span className={`font-medium ${pro ? "text-brand-600" : "text-gray-900"}`}>{value}</span>;
  }
  if (value) {
    return (
      <svg className={`w-5 h-5 mx-auto ${pro ? "text-brand-500" : "text-gray-400"}`} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    );
  }
  return <span className="text-gray-300 select-none">—</span>;
}
