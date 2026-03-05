"use client"

import Link from "next/link"
import { Server, Terminal, Database, Shield, ArrowRight, Cpu } from "lucide-react"

// ─── Static canvas preview mockup ────────────────────────────────────────────

function CanvasPreview() {
  return (
    <div
      className="relative overflow-hidden border border-[#333] bg-black shadow-[8px_8px_0_0_#111] select-none"
      style={{
        width: 520,
        height: 340,
        backgroundImage:
          "linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)",
        backgroundSize: "20px 20px",
        transform: "perspective(1200px) rotateY(-8deg) rotateX(4deg)",
        transformOrigin: "right center",
      }}
    >
      {/* Stage */}
      <div
        className="absolute flex items-center justify-center border border-white bg-white text-[10px] font-bold tracking-widest text-black uppercase"
        style={{ left: 40, top: 30, width: 200, height: 60 }}
      >
        EVENT CANVAS
      </div>

      {/* Nodes row 1 */}
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="absolute flex flex-col items-center justify-center border border-[#009944] bg-[#009944]/10 font-mono text-[9px] font-bold text-[#009944]"
          style={{ left: 40 + i * 70, top: 120, width: 58, height: 58 }}
        >
          <span>SEC-{i + 1}</span>
          <span className="text-[7px]">ACTIVE</span>
        </div>
      ))}

      {/* Circular Nodes */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute border border-[#0055ff] bg-[#0055ff]/10"
          style={{ left: 48 + i * 90, top: 210, width: 64, height: 64 }}
        />
      ))}

      {/* Gateway */}
      <div
        className="absolute flex items-center justify-center border border-[#ffb300] bg-[#ffb300]/10 font-mono text-[10px] font-bold text-[#ffb300] uppercase"
        style={{ left: 380, top: 200, width: 100, height: 110 }}
      >
        ENTRANCE
      </div>

      {/* Auxiliary Node */}
      <div
        className="absolute border border-[#cc0000] bg-[#cc0000]/10"
        style={{ left: 280, top: 30, width: 80, height: 60 }}
      />

      {/* Selection ring */}
      <div
        className="absolute border-2 border-[#0055ff]"
        style={{ left: 40, top: 120, width: 58, height: 58 }}
      />

      {/* Properties panel hint */}
      <div className="absolute top-3 right-3 border border-[#333] bg-black p-3 font-mono text-[9px] tracking-widest text-[#999] uppercase">
        <div className="mb-2 border-b border-[#333] pb-1 font-bold text-white">BOOTH SEC-1</div>
        <div className="flex justify-between gap-4">
          <span>TYPE</span> <span className="text-white">SPONSOR</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>SIZE</span> <span className="text-white">10x10</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 font-bold text-[#009944]">
          <span className="h-1.5 w-1.5 animate-pulse bg-[#009944]" /> RESERVED
        </div>
      </div>

      {/* Toolbar hint */}
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 border border-[#333] bg-black px-4 py-2 text-[9px] tracking-widest text-[#999] uppercase">
        <span>X:14</span>
        <span>Y:92</span>
        <span className="mx-2 h-3 w-[1px] bg-[#333]" />
        <span className="font-bold text-[#0055ff]">AUTO-ALIGN</span>
      </div>
    </div>
  )
}

// ─── Features ─────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Cpu,
    title: "AI GENERATION",
    desc: "USE ARTIFICIAL INTELLIGENCE TO ARRANGE OPTIMAL EVENT LAYOUTS IN SECONDS.",
  },
  {
    icon: Database,
    title: "VERSION HISTORY",
    desc: "AUTOMATIC SAVES FOR EVERY CHANGE. RESTORE PREVIOUS VERSIONS INSTANTLY.",
  },
  {
    icon: Server,
    title: "MARKETPLACE",
    desc: "PUBLISH YOUR EVENT LAYOUT. ALLOW EXHIBITORS TO RESERVE THEIR SPACES.",
  },
  {
    icon: Shield,
    title: "SECURE SHARING",
    desc: "SHARE PUBLIC READ-ONLY LINKS WITH OPTIONAL EXPIRATION DATES.",
  },
  {
    icon: Terminal,
    title: "EXPORT PLANS",
    desc: "DOWNLOAD HIGH-RESSOLUTION PNG MAPS FOR PRINTING AND DISTRIBUTION.",
  },
]

// ─── Pricing ──────────────────────────────────────────────────────────────────

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
      className={`relative flex flex-col border p-8 ${highlight ? "border-[#0055ff] bg-[#00051a]" : "border-[#333] bg-black"} transition-all hover:bg-[#111]`}
    >
      {highlight && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 border border-[#0055ff] bg-[#0055ff] px-4 py-1 text-[10px] font-bold tracking-widest text-white uppercase">
          RECOMMENDED PROTOCOL
        </div>
      )}
      <div className="mb-8 border-b border-[#333] pb-6">
        <p
          className={`mb-2 text-[10px] font-bold tracking-widest uppercase ${highlight ? "text-[#0055ff]" : "text-[#666]"}`}
        >
          PLAN: {plan}
        </p>
        <div className="flex items-baseline gap-2 text-white">
          <span className="font-mono text-4xl font-bold tracking-tight">{price}</span>
          {price !== "FREE" && (
            <span className="text-xs tracking-widest text-[#999] uppercase">/MONTH</span>
          )}
        </div>
        <p className="mt-4 text-[10px] leading-relaxed tracking-widest text-[#999] uppercase">
          {description}
        </p>
      </div>

      <ul className="mb-10 flex flex-col gap-4 font-mono text-[10px] tracking-widest uppercase">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-3">
            <div
              className={`mt-[1px] h-3 w-3 border ${highlight ? "border-[#0055ff] bg-[#0055ff]/20" : "border-[#666] bg-transparent"}`}
            />
            <span className="text-[#ccc]">{f}</span>
          </li>
        ))}
      </ul>

      <Link
        href={href}
        className={`mt-auto flex items-center justify-center gap-2 px-6 py-4 text-[10px] font-bold tracking-widest uppercase transition-all ${highlight
          ? "border border-[#0055ff] bg-[#0055ff] text-white shadow-[4px_4px_0_0_#fff] hover:bg-[#0033cc]"
          : "border border-white bg-white text-black hover:bg-[#ccc]"
          }`}
      >
        {cta}
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function LandingPage() {
  return (
    <div className="min-h-screen bg-black font-sans text-white selection:bg-white selection:text-black">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 border-b border-[#333] bg-black/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="relative z-10 flex items-center gap-3">
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
          <nav className="flex items-center gap-8 font-mono text-[10px] font-bold tracking-widest uppercase">
            <Link href="/marketplace" className="text-[#999] transition-colors hover:text-white">
              MARKETPLACE
            </Link>
            <Link href="/pricing" className="text-[#999] transition-colors hover:text-white">
              PRICING
            </Link>
            <Link
              href="/auth/signin"
              className="text-[#999] transition-colors hover:text-[#0055ff]"
            >
              SIGN IN
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative flex min-h-[80vh] items-center overflow-hidden border-b border-[#333] px-6 pt-24 pb-24">
        {/* Background Grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative mx-auto flex w-full max-w-7xl items-center justify-between gap-16">
          {/* Left: text */}
          <div className="max-w-2xl flex-1">
            <div className="mb-6 inline-flex items-center gap-2 border border-[#009944] bg-[#009944]/10 px-3 py-1 font-mono text-[9px] font-bold tracking-widest text-[#009944] uppercase">
              <span className="h-1.5 w-1.5 animate-pulse bg-[#009944]" />
              SYSTEM ONLINE
            </div>

            <h1 className="mb-8 text-5xl leading-[0.9] font-black tracking-tighter text-white uppercase lg:text-[72px]">
              INTELLIGENT
              <br />
              <span className="text-[#666]">EVENT SPACE</span>
              <br />
              ORCHESTRATION
            </h1>

            <p className="mb-10 max-w-lg border-l-2 border-[#333] pl-4 font-mono text-sm leading-relaxed tracking-widest text-[#999] uppercase">
              {">"} PRECISION-ENGINEERED FLOOR PLANS.
              <br />
              {">"} AI-OPTIMIZED SPACE UTILIZATION.
              <br />
              {">"} SEAMLESS VENDOR MONETIZATION.
            </p>

            <div className="flex items-center gap-6">
              <Link
                href="/auth/signup"
                className="flex items-center gap-3 border border-white bg-white px-8 py-4 text-xs font-bold tracking-widest text-black uppercase transition-all hover:bg-black hover:text-white hover:shadow-[4px_4px_0_0_#fff]"
              >
                GET STARTED <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/marketplace"
                className="flex items-center gap-3 text-xs font-bold tracking-widest text-[#999] uppercase transition-colors hover:text-white"
              >
                VIEW MARKETPLACE <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 font-mono text-[9px] tracking-[0.2em] text-[#666] uppercase">
              // FREE TIER AVAILABLE
            </div>
          </div>

          {/* Right: canvas preview */}
          <div className="hidden flex-shrink-0 border border-[#333] bg-[#111] p-4 lg:block">
            <div className="mb-4 flex items-center justify-between border-b border-[#333] pb-2">
              <div className="font-mono text-[9px] tracking-widest text-[#999]">LIVE PREVIEW</div>
              <div className="flex gap-2">
                <div className="h-2 w-2 rounded-full border border-white" />
                <div className="h-2 w-2 rounded-full border border-white" />
                <div className="h-2 w-2 bg-white" />
              </div>
            </div>
            <CanvasPreview />
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="overflow-hidden border-b border-[#333] bg-[#0a0a0a] px-6 py-6 font-mono">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 text-[10px] tracking-widest text-[#666] uppercase">
          {[
            { id: "STATUS", val: "OPERATIONAL" },
            { id: "WORKSPACE", val: "SECURE" },
            { id: "EVENTS", val: "SYNCED" },
            { id: "MARKETPLACE", val: "LIVE" },
            { id: "VERSION", val: "2.0.0" },
          ].map(({ id, val }) => (
            <div key={id} className="flex items-center gap-3">
              <span className="font-bold text-white">{id} /</span>
              <span className={val === "OPERATIONAL" ? "text-[#009944]" : ""}>{val}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="border-b border-[#333] bg-black px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-20 flex items-end gap-12 border-b border-[#333] pb-8">
            <h2 className="text-4xl font-bold tracking-tighter text-white uppercase">
              PLATFORM FEATURES
            </h2>
            <p className="mb-1.5 max-w-xs font-mono text-[10px] tracking-widest text-[#999] uppercase">
              // POWERFUL TOOLS.
              <br />
              // MINIMALIST DESIGN.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, desc }, idx) => (
              <div
                key={title}
                className="group relative border border-[#333] bg-[#0a0a0a] p-8 transition-colors hover:border-white"
              >
                <div className="absolute top-0 left-0 h-2 w-2 bg-[#333] transition-colors group-hover:bg-white" />
                <div className="mb-6 flex items-start justify-between">
                  <div className="inline-flex h-12 w-12 items-center justify-center border border-[#333] bg-black text-[#999] transition-colors group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="font-mono text-[10px] font-bold tracking-widest text-[#333] group-hover:text-[#666]">
                    0{idx + 1}
                  </div>
                </div>
                <h3 className="mb-4 font-mono text-sm font-bold tracking-widest text-white uppercase">
                  {title}
                </h3>
                <p className="font-mono text-[10px] leading-relaxed tracking-widest text-[#666] uppercase">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="border-b border-[#333] bg-[#050505] px-6 py-32">
        <div className="mx-auto max-w-5xl">
          <div className="mb-20 text-center">
            <h2 className="mb-4 text-4xl font-bold tracking-tighter text-white uppercase">
              PRICING PLANS
            </h2>
            <div className="font-mono text-[10px] tracking-widest text-[#666] uppercase">
              SELECT THE APPROPRIATE PLAN FOR YOUR EVENT SCALE.
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <PricingCard
              plan="FREE"
              price="FREE"
              description="STANDARD FEATURES. PERFECT FOR SMALL EVENTS."
              features={[
                "MANAGE UP TO 3 ACTIVE EVENTS",
                "ACCESS TO CORE LAYOUT BUILDER",
                "READ-ONLY PUBLIC LINKS",
                "MARKETPLACE LISTINGS",
                "HIGH-RES PNG EXPORTS",
              ]}
              cta="START FOR FREE"
              href="/auth/signup"
            />
            <PricingCard
              plan="PRO"
              price="$19"
              description="FULL PLATFORM UNLOCKED. FOR PROFESSIONAL EVENT ORGANIZERS."
              features={[
                "UNLIMITED EVENTS",
                "AI LAYOUT GENERATION ENABLED",
                "EXTENDED VERSION HISTORY (20 SAVES)",
                "PRIORITY SUPPORT",
                "ALL FREE TIER FEATURES",
              ]}
              cta="UPGRADE TO PRO"
              href="/pricing"
              highlight
            />
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="relative overflow-hidden bg-black px-6 py-32">
        <div
          className="absolute inset-0 z-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 50% 50%, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 mx-auto max-w-3xl border border-[#333] bg-[#0a0a0a] p-16 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border border-white">
            <div className="flex h-8 w-8 items-center justify-center bg-white text-black">
              <ArrowRight className="h-5 w-5 -rotate-45" />
            </div>
          </div>
          <h2 className="mb-6 text-4xl font-bold tracking-tighter text-white uppercase">
            READY TO START?
          </h2>
          <p className="mx-auto mb-10 max-w-lg font-mono text-[10px] leading-loose tracking-widest text-[#999] uppercase">
            CREATE YOUR FIRST EVENT, DESIGN THE LAYOUT, AND PUBLISH TO THE MARKETPLACE.
          </p>
          <div className="flex justify-center">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-3 border border-white bg-white px-10 py-5 text-sm font-bold tracking-widest text-black uppercase shadow-[6px_6px_0_0_#333] transition-all hover:bg-black hover:text-white"
            >
              GET STARTED NOW
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#333] bg-black px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center border border-white bg-white">
              <span className="font-mono text-sm font-bold text-black">V</span>
            </div>
            <div className="flex flex-col">
              <span className="leading-none font-bold tracking-tight text-white uppercase">
                EVENT PLANNER
              </span>
              <span className="mt-1 font-mono text-[8px] tracking-widest text-[#666] uppercase">
                SERIOUS_OS STYLE
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-8 font-mono text-[9px] font-bold tracking-widest text-[#999] uppercase">
            <Link href="/marketplace" className="transition-colors hover:text-white">
              MARKETPLACE
            </Link>
            <Link href="/pricing" className="transition-colors hover:text-white">
              PRICING
            </Link>
            <Link href="/auth/signin" className="transition-colors hover:text-white">
              SIGN IN
            </Link>
          </div>

          <p className="font-mono text-[9px] tracking-widest text-[#666] uppercase">
            © {new Date().getFullYear()} EVENT PLANNER.
          </p>
        </div>
      </footer>
    </div>
  )
}
