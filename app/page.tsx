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
            Get started
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
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
          Simple, transparent pricing
        </h2>
        <p className="text-gray-500 text-center mb-16">
          Subscribe and start automating review collection today.
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
                Get started
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
