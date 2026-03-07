"use client"

import Link from "next/link"
import { ArrowRight, Zap, Loader2, CheckSquare } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

const FREE_FEATURES = [
  "MANAGE UP TO 3 ACTIVE EVENTS",
  "ACCESS TO CORE LAYOUT BUILDER",
  "READ-ONLY PUBLIC LINKS",
  "MARKETPLACE LISTINGS",
  "HIGH-RES PNG EXPORTS",
]

const PRO_FEATURES = [
  "UNLIMITED EVENTS",
  "AI LAYOUT GENERATION ENABLED",
  "EXTENDED VERSION HISTORY (20 SAVES)",
  "PRIORITY SUPPORT",
  "ALL FREE TIER FEATURES",
]

export function PricingPage({
  isLoggedIn,
  currentPlan,
}: {
  isLoggedIn: boolean
  currentPlan: "free" | "pro"
}) {
  const [loading, setLoading] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)

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
      toast.error("SYSTEM ERROR: Failed to initialize checkout protocol.")
    } finally {
      setLoading(false)
    }
  }

  const handlePortal = async () => {
    setPortalLoading(true)
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" })
      if (!res.ok) throw new Error()
      const { url } = await res.json()
      window.location.href = url
    } catch {
      toast.error("SYSTEM ERROR: Failed to access billing portal.")
    } finally {
      setPortalLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-black font-mono text-white selection:bg-white selection:text-black">
      {/* ── Navbar ── */}
      <header className="border-b border-[#333] bg-black">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center border border-white text-sm font-bold shadow-[2px_2px_0_0_#fff]">
              V
            </div>
            <div className="flex flex-col">
              <div className="mb-1 text-[10px] leading-none tracking-[0.2em] text-[#999] uppercase">
                Event Layout
              </div>
              <div className="text-lg leading-none font-bold tracking-tight uppercase">Planner</div>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 border border-[#333] bg-[#111] px-4 py-2 text-[10px] font-bold tracking-widest text-[#ccc] uppercase transition-colors hover:bg-[#222] hover:text-white"
              >
                ACCESS DASHBOARD
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="text-[10px] font-bold tracking-widest text-[#999] uppercase transition-colors hover:text-white"
                >
                  SIGN IN
                </Link>
                <Link
                  href="/auth/signup"
                  className="flex items-center gap-2 border border-white bg-white px-4 py-2 text-[10px] font-bold tracking-widest text-black uppercase shadow-[2px_2px_0_0_#fff] transition-all hover:bg-black hover:text-white hover:shadow-none"
                >
                  INITIALIZE ACCOUNT
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="relative z-10 flex w-full flex-1 flex-col items-center overflow-hidden px-6 py-20">
        {/* Background Grid */}
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 w-full max-w-5xl">
          <div className="mb-20 text-center">
            <div className="mb-6 inline-flex items-center gap-2 border border-[#333] bg-[#111] px-3 py-1 font-mono text-[9px] font-bold tracking-widest text-[#999] uppercase">
              <span className="h-1.5 w-1.5 animate-pulse bg-[#0055ff]" />
              SYSTEM MODULE: PRICING
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tighter text-white uppercase sm:text-5xl">
              PRICING PLANS
            </h1>
            <p className="font-mono text-xs tracking-widest text-[#666] uppercase">
              SELECT THE APPROPRIATE PLAN FOR YOUR EVENT SCALE.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Free Plan */}
            <div className="relative flex flex-col border border-[#333] bg-[#050505] p-10 transition-all hover:bg-[#111]">
              <div className="mb-8 border-b border-[#333] pb-8">
                <p className="mb-2 text-[10px] font-bold tracking-widest text-[#666] uppercase">
                  PLAN: FREE
                </p>
                <div className="flex items-baseline gap-2 text-white">
                  <span className="font-mono text-5xl font-bold tracking-tight">FREE</span>
                </div>
                <p className="mt-4 text-[10px] leading-relaxed tracking-widest text-[#999] uppercase">
                  STANDARD FEATURES. PERFECT FOR SMALL EVENTS.
                </p>
              </div>

              <ul className="mb-10 flex flex-col gap-4 font-mono text-[10px] tracking-widest uppercase">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <div className="mt-[1px] h-3 w-3 flex-shrink-0 border border-[#666] bg-transparent" />
                    <span className="text-[#ccc]">{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                {currentPlan === "free" && isLoggedIn ? (
                  <div className="flex items-center justify-center gap-2 border border-[#333] bg-[#111] px-5 py-4 text-xs font-bold tracking-widest text-[#999] uppercase">
                    CURRENT PROTOCOL
                  </div>
                ) : (
                  <Link
                    href="/auth/signup"
                    className="flex items-center justify-center gap-2 border border-[#333] bg-transparent px-5 py-4 text-xs font-bold tracking-widest text-white uppercase transition-colors hover:bg-white hover:text-black"
                  >
                    START FOR FREE <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>

            {/* Pro Plan */}
            <div className="relative flex flex-col border border-[#0055ff] bg-[#00051a] p-10 shadow-[8px_8px_0_0_#0055ff] transition-all">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 border border-[#0055ff] bg-[#0055ff] px-4 py-1 text-[10px] font-bold tracking-widest text-white uppercase">
                RECOMMENDED PROTOCOL
              </div>
              <div className="mb-8 border-b border-[#333] pb-8">
                <p className="mb-2 text-[10px] font-bold tracking-widest text-[#0055ff] uppercase">
                  PLAN: PRO
                </p>
                <div className="flex items-baseline gap-2 text-white">
                  <span className="font-mono text-5xl font-bold tracking-tight">$19</span>
                  <span className="text-xs tracking-widest text-[#999] uppercase">/MONTH</span>
                </div>
                <p className="mt-4 text-[10px] leading-relaxed tracking-widest text-[#999] uppercase">
                  FULL PLATFORM UNLOCKED. FOR PROFESSIONAL EVENT ORGANIZERS.
                </p>
              </div>

              <ul className="mb-10 flex flex-col gap-4 font-mono text-[10px] tracking-widest uppercase">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <div className="mt-[1px] h-3 w-3 flex-shrink-0 border border-[#0055ff] bg-[#0055ff]/20" />
                    <span className="text-[#ccc]">{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                {currentPlan === "pro" && isLoggedIn ? (
                  <div className="flex items-center justify-center gap-2 border border-[#0055ff] bg-[#0055ff]/10 px-5 py-4 text-xs font-bold tracking-widest text-[#0055ff] uppercase">
                    <Zap className="h-4 w-4" />
                    CURRENT PROTOCOL
                  </div>
                ) : (
                  <button
                    onClick={handleUpgrade}
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 border border-white bg-white px-5 py-4 text-xs font-bold tracking-widest text-black uppercase shadow-[4px_4px_0_0_#333] transition-all hover:bg-black hover:text-white hover:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> INITIALIZING...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        UPGRADE TO PRO <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Data Note */}
          <div className="mt-16 border-t border-[#333] pt-8 text-center font-mono text-[10px] tracking-widest text-[#666] uppercase">
            <p className="mb-4">
              SECURE TRANSACTION PROTOCOL // POWERED BY STRIPE.
              <br />
              NO LONG-TERM CONTRACTS. CANCEL ANYTIME.
            </p>
            {isLoggedIn && currentPlan === "pro" && (
              <button
                onClick={handlePortal}
                disabled={portalLoading}
                className="group inline-flex items-center justify-center gap-2 font-bold text-white transition-colors hover:text-[#0055ff] disabled:opacity-50"
              >
                {portalLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <CheckSquare className="h-3 w-3" />
                )}
                ACCESS BILLING PORTAL{" "}
                <span className="opacity-0 transition-opacity group-hover:opacity-100">→</span>
              </button>
            )}
          </div>
        </div>
      </main>

      {/* ── System Status Footer ── */}
      <div className="relative z-20 flex items-center justify-between border-t border-[#333] bg-[#0a0a0a] px-6 py-4 font-mono text-[10px] tracking-widest text-[#666] uppercase">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#009944]" />
            STATUS / <span className="font-bold text-[#009944]">OPERATIONAL</span>
          </div>
          <div className="hidden items-center gap-2 sm:flex">WORKSPACE / SECURE</div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden sm:block">VERSION / 2.0.0</div>
          <div>TERMINAL / SECURE_CONNECT</div>
        </div>
      </div>
    </div>
  )
}
