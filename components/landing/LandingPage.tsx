"use client"

import Link from "next/link"
import { Cormorant_Garamond } from "next/font/google"
import {
  Sparkles,
  Globe,
  History,
  Download,
  ShoppingBag,
  MousePointer2,
  Check,
  ArrowRight,
  Zap,
} from "lucide-react"

const playfair = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
})

// ─── Static canvas preview mockup ────────────────────────────────────────────

function CanvasPreview() {
  return (
    <div
      className="relative select-none overflow-hidden rounded-xl border border-white/10 shadow-2xl"
      style={{
        width: 520,
        height: 340,
        background: "#18181b",
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        transform: "perspective(1200px) rotateY(-8deg) rotateX(4deg)",
        transformOrigin: "right center",
      }}
    >
      {/* Stage */}
      <div
        className="absolute flex items-center justify-center rounded bg-orange-500/80 text-xs font-semibold tracking-wide text-white shadow-lg"
        style={{ left: 40, top: 30, width: 200, height: 60 }}
      >
        MAIN STAGE
      </div>

      {/* Booths row 1 */}
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="absolute flex items-center justify-center rounded border border-emerald-400/30 bg-emerald-500/20 text-[10px] font-medium text-emerald-300"
          style={{ left: 40 + i * 70, top: 120, width: 58, height: 58 }}
        >
          B{i + 1}
        </div>
      ))}

      {/* Tables */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute rounded-full border border-sky-400/30 bg-sky-500/20"
          style={{ left: 48 + i * 90, top: 210, width: 64, height: 64 }}
        />
      ))}

      {/* Entrance */}
      <div
        className="absolute flex items-center justify-center rounded border border-amber-400/30 bg-amber-500/20 text-[10px] font-medium text-amber-300"
        style={{ left: 380, top: 200, width: 100, height: 110 }}
      >
        ENTRANCE
      </div>

      {/* Speaker area */}
      <div
        className="absolute rounded border border-rose-400/30 bg-rose-500/20"
        style={{ left: 280, top: 30, width: 80, height: 60 }}
      />

      {/* Selection ring */}
      <div
        className="absolute rounded-sm ring-2 ring-amber-400 ring-offset-0"
        style={{ left: 40, top: 120, width: 58, height: 58 }}
      />

      {/* Properties panel hint */}
      <div className="absolute right-3 top-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[9px] text-zinc-400 backdrop-blur-sm">
        <div className="mb-1 font-semibold text-zinc-200">Booth B1</div>
        <div>Category: Tech</div>
        <div>Price: $500</div>
        <div className="mt-1 text-emerald-400">● For Rent</div>
      </div>

      {/* Toolbar hint */}
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-3 py-1.5 backdrop-blur-sm">
        {["⬅", "↔", "➡", "⬆", "⬇"].map((icon, i) => (
          <span key={i} className="text-[10px] text-zinc-400">
            {icon}
          </span>
        ))}
        <span className="mx-1 h-3 w-px bg-white/20" />
        <span className="text-[9px] text-amber-400">AI Suggest</span>
      </div>
    </div>
  )
}

// ─── Features ─────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI Layout Generation",
    desc: "Describe your event and watch our AI arrange the perfect floor plan in seconds.",
    accent: "text-orange-500",
    bg: "bg-orange-50",
  },
  {
    icon: History,
    title: "Version History",
    desc: "Every save creates a snapshot. Roll back to any previous layout with one click.",
    accent: "text-sky-500",
    bg: "bg-sky-50",
  },
  {
    icon: ShoppingBag,
    title: "Booth Marketplace",
    desc: "Publish your event and let vendors discover and bid on available booth spaces.",
    accent: "text-emerald-500",
    bg: "bg-emerald-50",
  },
  {
    icon: Globe,
    title: "Public Sharing",
    desc: "Share a read-only link with attendees or sponsors with optional expiry dates.",
    accent: "text-amber-500",
    bg: "bg-amber-50",
  },
  {
    icon: Download,
    title: "PNG Export",
    desc: "Export a pixel-perfect 2000×1500 floor plan PNG for print or presentation.",
    accent: "text-rose-500",
    bg: "bg-rose-50",
  },
  {
    icon: MousePointer2,
    title: "Precision Canvas",
    desc: "Multi-select, snap-to-grid, alignment tools, and resize handles for pixel control.",
    accent: "text-teal-500",
    bg: "bg-teal-50",
  },
]

// ─── Pricing ──────────────────────────────────────────────────────────────────

const FREE_FEATURES = [
  "Up to 3 events",
  "Drag-and-drop canvas editor",
  "Public sharing links",
  "Booth marketplace listings",
  "PNG export",
]

const PRO_FEATURES = [
  "Unlimited events",
  "AI layout generation",
  "Version history (20 snapshots)",
  "Email notifications to vendors",
  "Priority support",
  "Everything in Free",
]

function PricingCard({
  plan,
  price,
  description,
  features,
  cta,
  href,
  highlight,
}: {
  plan: string
  price: string
  description: string
  features: string[]
  cta: string
  href: string
  highlight?: boolean
}) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl p-8 ${
        highlight
          ? "bg-zinc-900 text-white shadow-2xl ring-2 ring-amber-500"
          : "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200"
      }`}
    >
      {highlight && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white">
          Most Popular
        </div>
      )}
      <div className="mb-6">
        <p
          className={`mb-1 text-sm font-semibold uppercase tracking-widest ${highlight ? "text-amber-400" : "text-amber-600"}`}
        >
          {plan}
        </p>
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-bold">{price}</span>
          {price !== "Free" && (
            <span className={`text-sm ${highlight ? "text-zinc-400" : "text-zinc-500"}`}>/month</span>
          )}
        </div>
        <p className={`mt-2 text-sm ${highlight ? "text-zinc-400" : "text-zinc-500"}`}>{description}</p>
      </div>

      <ul className="mb-8 flex flex-col gap-3">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm">
            <Check
              className={`mt-0.5 h-4 w-4 flex-shrink-0 ${highlight ? "text-amber-400" : "text-amber-600"}`}
            />
            <span className={highlight ? "text-zinc-300" : "text-zinc-600"}>{f}</span>
          </li>
        ))}
      </ul>

      <Link
        href={href}
        className={`mt-auto flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition-all ${
          highlight
            ? "bg-amber-500 text-white hover:bg-amber-400"
            : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200"
        }`}
      >
        {cta}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500">
              <span className="text-sm font-bold text-white">E</span>
            </div>
            <span className={`${playfair.className} text-lg font-bold text-white`}>EventPlanner</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/marketplace" className="text-sm text-zinc-400 transition-colors hover:text-white">
              Marketplace
            </Link>
            <Link href="/pricing" className="text-sm text-zinc-400 transition-colors hover:text-white">
              Pricing
            </Link>
            <Link
              href="/auth/signin"
              className="text-sm text-zinc-400 transition-colors hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-400"
            >
              Get started free
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden bg-zinc-950 px-6 pb-24 pt-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(245,158,11,0.10) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(251,191,36,0.06) 0%, transparent 40%)",
        }}
      >
        {/* Dot grid */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative mx-auto flex max-w-6xl items-center gap-16">
          {/* Left: text */}
          <div className="flex-1">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-medium text-amber-300">
              <Sparkles className="h-3.5 w-3.5" />
              AI-powered floor planning
            </div>

            <h1
              className={`${playfair.className} mb-6 text-5xl font-black leading-[1.1] text-white lg:text-6xl`}
            >
              Design beautiful
              <br />
              <span className="italic text-amber-400">event spaces</span>
              <br />
              in minutes.
            </h1>

            <p className="mb-10 max-w-md text-lg leading-relaxed text-zinc-400">
              Drag-and-drop floor planning for conferences, weddings, and corporate events.
              AI-powered layouts, booth marketplace, and real-time collaboration.
            </p>

            <div className="flex items-center gap-4">
              <Link
                href="/auth/signup"
                className="flex items-center gap-2 rounded-lg bg-amber-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-900/30 transition-all hover:bg-amber-400"
              >
                Start for free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/marketplace"
                className="flex items-center gap-2 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
              >
                Browse marketplace
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <p className="mt-4 text-xs text-zinc-600">
              No credit card required · Free forever plan available
            </p>
          </div>

          {/* Right: canvas preview */}
          <div className="hidden flex-shrink-0 lg:block">
            <CanvasPreview />
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-b border-zinc-100 bg-zinc-50 px-6 py-8">
        <div className="mx-auto flex max-w-4xl items-center justify-around gap-6 text-center">
          {[
            { value: "Free", label: "Forever plan available" },
            { value: "20+", label: "Canvas element types" },
            { value: "AI", label: "Powered layout generation" },
            { value: "PNG", label: "One-click floor plan export" },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className={`${playfair.className} text-3xl font-bold text-zinc-900`}>{value}</div>
              <div className="mt-0.5 text-sm text-zinc-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-amber-600">
              Features
            </p>
            <h2 className={`${playfair.className} text-4xl font-bold text-zinc-900`}>
              Everything you need to plan
              <br />
              <span className="italic">the perfect event.</span>
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, desc, accent, bg }) => (
              <div
                key={title}
                className="group rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
                  <Icon className={`h-5 w-5 ${accent}`} />
                </div>
                <h3 className="mb-2 font-semibold text-zinc-900">{title}</h3>
                <p className="text-sm leading-relaxed text-zinc-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="bg-zinc-50 px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-amber-600">
              Pricing
            </p>
            <h2 className={`${playfair.className} text-4xl font-bold text-zinc-900`}>
              Simple, transparent pricing.
            </h2>
            <p className="mt-4 text-zinc-500">Start free. Upgrade when you need more.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <PricingCard
              plan="Free"
              price="Free"
              description="Perfect for getting started with event planning."
              features={FREE_FEATURES}
              cta="Get started free"
              href="/auth/signup"
            />
            <PricingCard
              plan="Pro"
              price="$19"
              description="For professional organizers who need the full toolkit."
              features={PRO_FEATURES}
              cta="Upgrade to Pro"
              href="/pricing"
              highlight
            />
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section
        className="px-6 py-24"
        style={{
          background: "linear-gradient(135deg, #09090b 0%, #18181b 50%, #09090b 100%)",
        }}
      >
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20">
            <Zap className="h-6 w-6 text-amber-400" />
          </div>
          <h2 className={`${playfair.className} mb-4 text-4xl font-bold text-white`}>
            Ready to plan your
            <span className="italic text-amber-400"> next event?</span>
          </h2>
          <p className="mb-8 text-zinc-400">
            Join thousands of organizers who design beautiful event spaces with EventPlanner.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-amber-900/30 transition-all hover:bg-amber-400"
          >
            Start planning for free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-zinc-800 bg-zinc-950 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-amber-500">
              <span className="text-xs font-bold text-white">E</span>
            </div>
            <span className={`${playfair.className} font-bold text-white`}>EventPlanner</span>
          </div>
          <div className="flex gap-6 text-sm text-zinc-500">
            <Link href="/marketplace" className="hover:text-zinc-300">
              Marketplace
            </Link>
            <Link href="/pricing" className="hover:text-zinc-300">
              Pricing
            </Link>
            <Link href="/auth/signin" className="hover:text-zinc-300">
              Sign in
            </Link>
          </div>
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} EventPlanner. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
