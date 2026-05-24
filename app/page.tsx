import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { PLANS, ADD_ONS } from "@/lib/plans";

const CHECK = (
  <svg className="w-5 h-5 flex-shrink-0 text-brand-500" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const CHECK_WHITE = (
  <svg className="w-5 h-5 flex-shrink-0 text-white" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

export default async function LandingPage() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-white">

      {/* Nav */}
      <nav className="border-b border-gray-100 bg-white/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-bold text-xl text-gray-900">
            Review<span className="text-brand-600">Automater</span>
          </span>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#why-us" className="hover:text-gray-900 transition-colors">Why Us</a>
            <a href="#how-it-works" className="hover:text-gray-900 transition-colors">How It Works</a>
            <a href="#channels" className="hover:text-gray-900 transition-colors">Channels</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
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
                  Start free trial
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-8 border border-green-100">
          <span className="w-2 h-2 bg-green-500 rounded-full" />
          Most affordable reputation management platform on the market
        </div>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6">
          Get more 5-star reviews
          <br />
          <span className="text-brand-600">without lifting a finger.</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-4">
          ReviewAutomater automatically follows up with every customer across more channels than any other platform — SMS, email, QR codes, voicemail drops, and physical mail.
        </p>
        <p className="text-base text-gray-400 max-w-xl mx-auto mb-10">
          Starting at <strong className="text-gray-600">$39/mo</strong>. Every paid plan includes a free 15-minute setup call with our US-based team.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <Link
            href="/sign-up"
            className="bg-brand-600 text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-100"
          >
            Start your free 14-day trial →
          </Link>
          <a
            href="#how-it-works"
            className="border border-gray-200 text-gray-700 px-8 py-4 rounded-xl text-base font-semibold hover:bg-gray-50 transition-colors"
          >
            See how it works
          </a>
        </div>
        <p className="text-sm text-gray-400">No credit card required · Cancel anytime · Free onboarding call included</p>
      </section>

      {/* Stats bar */}
      <section className="border-y border-gray-100 bg-gray-50 py-10">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "3.2×", label: "more reviews on average" },
            { value: "5", label: "ways to reach customers" },
            { value: "$39", label: "starting price per month" },
            { value: "< 30s", label: "to launch a campaign" },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Us — 3 big differentiators */}
      <section id="why-us" className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
          Why businesses choose ReviewAutomater
        </h2>
        <p className="text-gray-500 text-center mb-16 max-w-xl mx-auto">
          We built the tool we wished existed — powerful enough to actually move the needle, simple enough that you don&apos;t need a marketing team to run it.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: "💰",
              title: "Most affordable on the market",
              body: "At $39/mo you get everything — unlimited locations, unlimited campaigns, unlimited review sites. Competitors charge 3–5× more for the same features and nickel-and-dime you for every location.",
              highlight: "Starting at $39/mo",
            },
            {
              icon: "📡",
              title: "More ways to reach customers",
              body: "No other platform reaches customers across SMS, email, QR codes, voicemail drops, and physical mailed letters. Meet your customers wherever they are — not just in their inbox.",
              highlight: "5 outreach channels",
            },
            {
              icon: "🤝",
              title: "A real team behind you",
              body: "Every paid plan comes with a free 15-minute onboarding call with our US-based team. We make sure your account is set up correctly from day one — not left to a help article.",
              highlight: "Free setup call included",
            },
          ].map(({ icon, title, body, highlight }) => (
            <div key={title} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="text-4xl mb-4">{icon}</div>
              <div className="inline-block bg-brand-50 text-brand-700 text-xs font-bold px-2.5 py-1 rounded-full mb-3">
                {highlight}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Onboarding call callout */}
      <section className="bg-brand-600 py-16">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center gap-10">
          <div className="text-5xl flex-shrink-0">📞</div>
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-white mb-3">
              Free 15-minute onboarding call — included with every plan
            </h2>
            <p className="text-brand-100 leading-relaxed mb-0">
              When you subscribe, you&apos;ll schedule a quick call with our US-based team. We&apos;ll connect your review sites, configure your first campaign, and make sure everything is firing correctly before you leave. No tutorials, no fumbling through settings on your own.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Link
              href="/sign-up"
              className="inline-block bg-white text-brand-600 px-6 py-3.5 rounded-xl font-semibold text-sm hover:bg-brand-50 transition-colors whitespace-nowrap"
            >
              Claim your call →
            </Link>
          </div>
        </div>
      </section>

      {/* Channels */}
      <section id="channels" className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
          Reach customers 5 different ways
        </h2>
        <p className="text-gray-500 text-center mb-16 max-w-xl mx-auto">
          Most platforms stop at email. ReviewAutomater meets your customers where they actually are.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: "💬",
              title: "SMS",
              badge: "Standard",
              body: "Text messages have a 98% open rate. Short, personal follow-ups that feel like they came from you — not a robot.",
            },
            {
              icon: "📧",
              title: "Email",
              badge: "Standard",
              body: "Branded HTML emails with your logo and colors. Set up multi-step drip sequences that escalate if there's no response.",
            },
            {
              icon: "📷",
              title: "QR Codes",
              badge: "Standard",
              body: "Print and place anywhere — front desk, receipt, table tent. One scan takes customers straight to your review page.",
            },
            {
              icon: "📞",
              title: "Voicemail Drops",
              badge: "Premium",
              body: "Leave a pre-recorded voicemail without the phone ringing. High response rates, zero awkwardness. 50 drops for $10.",
            },
            {
              icon: "✉️",
              title: "Mailed Letters",
              badge: "Premium",
              body: "A physical letter stands out in a world full of digital noise. Hand-addressed feel, automated delivery. 50 letters for $150.",
            },
            {
              icon: "🛑",
              title: "Smart Stop",
              badge: "Built-in",
              body: "The moment a customer clicks your review link, every pending follow-up stops. No over-messaging. More conversions.",
            },
          ].map(({ icon, title, badge, body }) => (
            <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="text-3xl">{icon}</div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  badge === "Premium"
                    ? "bg-amber-50 text-amber-700"
                    : badge === "Built-in"
                    ? "bg-gray-100 text-gray-600"
                    : "bg-brand-50 text-brand-700"
                }`}>
                  {badge}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
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
                body: "Call our API when a customer checks out — from your POS, booking system, or CRM. One webhook, done.",
              },
              {
                step: "02",
                title: "Sequences send automatically",
                body: "A timed campaign goes out across the channels you choose — SMS, email, voicemail, mail — at exactly the right moment.",
              },
              {
                step: "03",
                title: "Reviews roll in",
                body: "The moment a customer leaves a review, their sequence stops. No spam. Just results.",
              },
            ].map(({ step, title, body }) => (
              <div key={step}>
                <div className="text-5xl font-black text-brand-100 mb-4 select-none">{step}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Everything included */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
          Everything included. No surprises.
        </h2>
        <p className="text-gray-500 text-center mb-16">
          Every plan includes the same full feature set — not locked behind a higher tier.
        </p>
        <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-4">
          {[
            "Unlimited locations",
            "Unlimited campaigns",
            "Unlimited review sites",
            "SMS, email & QR outreach",
            "Smart stop (auto-cancel on click)",
            "Click tracking & analytics",
            "Free 15-min onboarding call",
            "Priority US-based support",
            "Monthly webinars",
            "Rollover unused sequences",
            "Premium channels available as add-ons",
            "No per-location fees",
          ].map((item) => (
            <div key={item} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
              {CHECK}
              <span className="text-sm text-gray-700 font-medium">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-gray-500 text-center mb-16">
            One plan. Everything included. No contracts.
          </p>

          {/* Base plan */}
          <div className="max-w-lg mx-auto mb-12">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className="rounded-2xl p-8 border-2 border-brand-500 bg-brand-600 text-white shadow-2xl shadow-brand-100"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most affordable on the market
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-5xl font-black text-white">${plan.price}</span>
                  <span className="text-white/70 text-lg">/mo</span>
                </div>
                <p className="text-white/60 text-sm mb-8">Billed monthly. Cancel anytime.</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      {CHECK_WHITE}
                      <span className="text-white/90">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/sign-up"
                  className="block text-center py-4 rounded-xl font-bold text-sm bg-white text-brand-600 hover:bg-brand-50 transition-colors"
                >
                  Start free 14-day trial →
                </Link>
                <p className="text-center text-white/50 text-xs mt-3">No credit card required</p>
              </div>
            ))}
          </div>

          {/* Add-ons */}
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Premium Add-ons</h3>
            <p className="text-sm text-gray-500 text-center mb-8">
              Extend your reach with premium outreach channels. All packs roll over and auto-repurchase when depleted.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {ADD_ONS.map((addon) => (
                <div key={addon.id} className="rounded-2xl p-6 border border-gray-200 bg-white shadow-sm">
                  <h4 className="font-bold text-gray-900 mb-1">{addon.name}</h4>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl font-black text-gray-900">${addon.price}</span>
                    <span className="text-gray-400 text-sm">/ {addon.quantity} {addon.unit}</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-4">
                    ${(addon.price / addon.quantity).toFixed(2)} per {addon.unit.replace(/s$/, "")}
                  </p>
                  <ul className="space-y-2 text-sm text-gray-500">
                    <li className="flex items-center gap-2">
                      {CHECK}
                      Unused {addon.unit} roll over
                    </li>
                    <li className="flex items-center gap-2">
                      {CHECK}
                      Auto-repurchases when used
                    </li>
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Start getting more reviews today
          </h2>
          <p className="text-gray-500 text-lg mb-10">
            Join local businesses that have made review collection completely hands-off. 14-day free trial. Your onboarding call is waiting.
          </p>
          <Link
            href="/sign-up"
            className="inline-block bg-brand-600 text-white px-10 py-4 rounded-xl font-bold text-base hover:bg-brand-700 transition-colors shadow-lg shadow-brand-100"
          >
            Start free trial — includes onboarding call →
          </Link>
          <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            <span className="flex items-center gap-1.5">{CHECK} No credit card required</span>
            <span className="flex items-center gap-1.5">{CHECK} Cancel anytime</span>
            <span className="flex items-center gap-1.5">{CHECK} US-based support</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-bold text-gray-900 text-lg">
            Review<span className="text-brand-600">Automater</span>
          </span>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <a href="#pricing" className="hover:text-gray-600">Pricing</a>
            <Link href="/sign-in" className="hover:text-gray-600">Sign in</Link>
            <Link href="/sign-up" className="hover:text-gray-600">Get started</Link>
          </div>
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} ReviewAutomater. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}
