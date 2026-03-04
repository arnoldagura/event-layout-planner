"use client"

import Link from "next/link"
import { Cormorant_Garamond } from "next/font/google"
import { Check, ArrowRight, Zap } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

const playfair = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
})

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

export function PricingPage({
  isLoggedIn,
  currentPlan,
}: {
  isLoggedIn: boolean
  currentPlan: "free" | "pro"
}) {
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    if (!isLoggedIn) {
      window.location.href = "/auth/signup"
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/billing/checkout", { method: "POST" })
      if (!res.ok) throw new Error()
      const { url } = await res.json()
      window.location.href = url
    } catch {
      toast.error("Failed to start checkout. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      {/* Navbar */}
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500">
              <span className="text-sm font-bold text-white">E</span>
            </div>
            <span className={`${playfair.className} text-lg font-bold text-zinc-900`}>
              EventPlanner
            </span>
          </Link>
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-700"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/auth/signin" className="text-sm text-zinc-500 hover:text-zinc-900">
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-400"
                >
                  Get started free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="px-6 py-20 text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-amber-600">Pricing</p>
        <h1 className={`${playfair.className} mb-4 text-5xl font-bold text-zinc-900`}>
          Simple, honest pricing.
        </h1>
        <p className="text-lg text-zinc-500">Start free. Upgrade when you need more power.</p>
      </div>

      {/* Cards */}
      <div className="mx-auto max-w-4xl px-6 pb-24">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Free */}
          <div className="flex flex-col rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200">
            <p className="mb-1 text-sm font-semibold uppercase tracking-widest text-amber-600">Free</p>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-bold text-zinc-900">Free</span>
            </div>
            <p className="mt-2 text-sm text-zinc-500">Perfect for getting started.</p>

            <ul className="my-8 flex flex-col gap-3">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                  <span className="text-zinc-600">{f}</span>
                </li>
              ))}
            </ul>

            <div className="mt-auto">
              {currentPlan === "free" && isLoggedIn ? (
                <div className="flex items-center justify-center gap-2 rounded-lg bg-zinc-100 px-5 py-3 text-sm font-semibold text-zinc-500">
                  Current plan
                </div>
              ) : (
                <Link
                  href="/auth/signup"
                  className="flex items-center justify-center gap-2 rounded-lg bg-zinc-100 px-5 py-3 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-200"
                >
                  Get started free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>

          {/* Pro */}
          <div className="relative flex flex-col rounded-2xl bg-zinc-900 p-8 shadow-2xl ring-2 ring-amber-500">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white">
              Most Popular
            </div>
            <p className="mb-1 text-sm font-semibold uppercase tracking-widest text-amber-400">Pro</p>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-bold text-white">$19</span>
              <span className="text-sm text-zinc-400">/month</span>
            </div>
            <p className="mt-2 text-sm text-zinc-400">For professional event organizers.</p>

            <ul className="my-8 flex flex-col gap-3">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400" />
                  <span className="text-zinc-300">{f}</span>
                </li>
              ))}
            </ul>

            <div className="mt-auto">
              {currentPlan === "pro" && isLoggedIn ? (
                <div className="flex items-center justify-center gap-2 rounded-lg bg-amber-500/20 px-5 py-3 text-sm font-semibold text-amber-300">
                  <Zap className="h-4 w-4" />
                  Current plan
                </div>
              ) : (
                <button
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-400 disabled:opacity-60"
                >
                  {loading ? "Redirecting…" : "Upgrade to Pro"}
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Trust note */}
        <p className="mt-10 text-center text-sm text-zinc-400">
          Payments are processed securely via Stripe. Cancel anytime — no lock-in.
          {isLoggedIn && currentPlan === "pro" && (
            <>
              {" "}
              <button
                onClick={async () => {
                  const res = await fetch("/api/billing/portal", { method: "POST" })
                  if (res.ok) {
                    const { url } = await res.json()
                    window.location.href = url
                  }
                }}
                className="underline hover:text-zinc-600"
              >
                Manage your subscription →
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
