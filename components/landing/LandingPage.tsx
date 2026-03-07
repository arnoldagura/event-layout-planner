"use client"

import Link from "next/link"
import { Server, Terminal, Database, Shield, ArrowRight, Cpu } from "lucide-react"

// ─── Static canvas preview mockup ────────────────────────────────────────────

function CanvasPreview() {
  return (
    <div
      className="relative overflow-hidden border border-border bg-card shadow-sm select-none"
      style={{
        width: 520,
        height: 340,
        backgroundImage:
          "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
        transform: "perspective(1200px) rotateY(-8deg) rotateX(4deg)",
        transformOrigin: "right center",
      }}
    >
      {/* Stage */}
      <div
        className="absolute flex items-center justify-center border border-foreground bg-foreground text-[10px] font-bold tracking-widest text-background uppercase"
        style={{ left: 40, top: 30, width: 200, height: 60 }}
      >
        EVENT CANVAS
      </div>

      {/* Nodes row 1 */}
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="absolute flex flex-col items-center justify-center border border-success bg-success/10 font-mono text-[9px] font-bold text-success"
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
          className="absolute border border-info bg-info/10"
          style={{ left: 48 + i * 90, top: 210, width: 64, height: 64 }}
        />
      ))}

      {/* Gateway */}
      <div
        className="absolute flex items-center justify-center border border-warning bg-warning/10 font-mono text-[10px] font-bold text-warning uppercase"
        style={{ left: 380, top: 200, width: 100, height: 110 }}
      >
        ENTRANCE
      </div>

      {/* Auxiliary Node */}
      <div
        className="absolute border border-destructive bg-destructive/10"
        style={{ left: 280, top: 30, width: 80, height: 60 }}
      />

      {/* Selection ring */}
      <div
        className="absolute border-2 border-info"
        style={{ left: 40, top: 120, width: 58, height: 58 }}
      />

      {/* Properties panel hint */}
      <div className="absolute top-3 right-3 border border-border bg-background p-3 font-mono text-[9px] tracking-widest text-muted-foreground uppercase">
        <div className="mb-2 border-b border-border pb-1 font-bold text-foreground">BOOTH SEC-1</div>
        <div className="flex justify-between gap-4">
          <span>TYPE</span> <span className="text-foreground">SPONSOR</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>SIZE</span> <span className="text-foreground">10x10</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 font-bold text-success">
          <span className="h-1.5 w-1.5 animate-pulse bg-success" /> RESERVED
        </div>
      </div>

      {/* Toolbar hint */}
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 border border-border bg-background px-4 py-2 text-[9px] tracking-widest text-muted-foreground uppercase">
        <span>X:14</span>
        <span>Y:92</span>
        <span className="mx-2 h-3 w-[1px] bg-border" />
        <span className="font-bold text-info">AUTO-ALIGN</span>
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
      className={`relative flex flex-col border p-8 ${highlight ? "border-info bg-info/10" : "border-border bg-background"} transition-all hover:bg-muted`}
    >
      {highlight && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 border border-info bg-info px-4 py-1 text-[10px] font-bold tracking-widest text-primary-foreground uppercase">
          RECOMMENDED PROTOCOL
        </div>
      )}
      <div className="mb-8 border-b border-border pb-6">
        <p
          className={`mb-2 text-[10px] font-bold tracking-widest uppercase ${highlight ? "text-info" : "text-muted-foreground"}`}
        >
          PLAN: {plan}
        </p>
        <div className="flex items-baseline gap-2 text-foreground">
          <span className="font-mono text-4xl font-bold tracking-tight">{price}</span>
          {price !== "FREE" && (
            <span className="text-xs tracking-widest text-muted-foreground uppercase">/MONTH</span>
          )}
        </div>
        <p className="mt-4 text-[10px] leading-relaxed tracking-widest text-muted-foreground uppercase">
          {description}
        </p>
      </div>

      <ul className="mb-10 flex flex-col gap-4 font-mono text-[10px] tracking-widest uppercase">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-3">
            <div
              className={`mt-[1px] h-3 w-3 border ${highlight ? "border-info bg-info/20" : "border-muted-foreground bg-transparent"}`}
            />
            <span className="text-muted-foreground">{f}</span>
          </li>
        ))}
      </ul>

      <Link
        href={href}
        className={`mt-auto flex items-center justify-center gap-2 px-6 py-4 text-[10px] font-bold tracking-widest uppercase transition-all ${highlight
          ? "border border-info bg-info text-primary-foreground shadow-[4px_4px_0_0_var(--foreground)] hover:bg-info/90"
          : "border border-foreground bg-foreground text-background hover:bg-foreground/80"
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
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground selection:bg-foreground selection:text-background">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="relative z-10 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center border border-foreground text-sm font-bold shadow-sm">
              V
            </div>
            <div className="flex flex-col">
              <div className="mb-1 text-[10px] leading-none tracking-[0.2em] text-muted-foreground uppercase">
                Event Layout
              </div>
              <div className="text-lg leading-none font-bold tracking-tight uppercase text-foreground">Planner</div>
            </div>
          </Link>
          <nav className="flex items-center gap-8 font-mono text-[10px] font-bold tracking-widest uppercase">
            <Link href="/marketplace" className="text-muted-foreground transition-colors hover:text-foreground">
              MARKETPLACE
            </Link>
            <Link href="/pricing" className="text-muted-foreground transition-colors hover:text-foreground">
              PRICING
            </Link>
            <Link
              href="/auth/signin"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              SIGN IN
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative flex min-h-[80vh] items-center overflow-hidden border-b border-border px-6 pt-24 pb-24">
        {/* Background Grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-10 dark:opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative mx-auto flex w-full max-w-7xl items-center justify-between gap-16">
          {/* Left: text */}
          <div className="max-w-2xl flex-1">
            <div className="mb-6 inline-flex items-center gap-2 border border-success bg-success/10 px-3 py-1 font-mono text-[9px] font-bold tracking-widest text-success uppercase">
              <span className="h-1.5 w-1.5 animate-pulse bg-success" />
              SYSTEM ONLINE
            </div>

            <h1 className="mb-8 text-5xl leading-[0.9] font-black tracking-tighter text-foreground uppercase lg:text-[72px]">
              INTELLIGENT
              <br />
              <span className="text-muted-foreground">EVENT SPACE</span>
              <br />
              ORCHESTRATION
            </h1>

            <p className="mb-10 max-w-lg border-l-2 border-border pl-4 font-mono text-sm leading-relaxed tracking-widest text-muted-foreground uppercase">
              {">"} PRECISION-ENGINEERED FLOOR PLANS.
              <br />
              {">"} AI-OPTIMIZED SPACE UTILIZATION.
              <br />
              {">"} SEAMLESS VENDOR MONETIZATION.
            </p>

            <div className="flex items-center gap-6">
              <Link
                href="/auth/signup"
                className="flex items-center gap-3 border border-foreground bg-foreground px-8 py-4 text-xs font-bold tracking-widest text-background uppercase transition-all hover:bg-foreground/80 hover:text-background shadow-sm"
              >
                GET STARTED <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/marketplace"
                className="flex items-center gap-3 text-xs font-bold tracking-widest text-muted-foreground uppercase transition-colors hover:text-foreground"
              >
                VIEW MARKETPLACE <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase">
              // FREE TIER AVAILABLE
            </div>
          </div>

          {/* Right: canvas preview */}
          <div className="hidden flex-shrink-0 lg:block pointer-events-none">
            <CanvasPreview />
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="overflow-hidden border-b border-border bg-card px-6 py-6 font-mono">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 text-[10px] tracking-widest text-muted-foreground uppercase">
          {[
            { id: "STATUS", val: "OPERATIONAL" },
            { id: "WORKSPACE", val: "SECURE" },
            { id: "EVENTS", val: "SYNCED" },
            { id: "MARKETPLACE", val: "LIVE" },
            { id: "VERSION", val: "2.0.0" },
          ].map(({ id, val }) => (
            <div key={id} className="flex items-center gap-3">
              <span className="font-bold text-foreground">{id} /</span>
              <span className={val === "OPERATIONAL" ? "text-success" : ""}>{val}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="border-b border-border bg-background px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-20 flex items-end gap-12 border-b border-border pb-8">
            <h2 className="text-4xl font-bold tracking-tighter text-foreground uppercase">
              PLATFORM FEATURES
            </h2>
            <p className="mb-1.5 max-w-xs font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
              // POWERFUL TOOLS.
              <br />
              // MINIMALIST DESIGN.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, desc }, idx) => (
              <div
                key={title}
                className="group relative border border-border bg-card p-8 transition-colors hover:border-foreground"
              >
                <div className="absolute top-0 left-0 h-2 w-2 bg-border transition-colors group-hover:bg-foreground" />
                <div className="mb-6 flex items-start justify-between">
                  <div className="inline-flex h-12 w-12 items-center justify-center border border-border bg-background text-muted-foreground transition-colors group-hover:text-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground group-hover:text-foreground">
                    0{idx + 1}
                  </div>
                </div>
                <h3 className="mb-4 font-mono text-sm font-bold tracking-widest text-foreground uppercase">
                  {title}
                </h3>
                <p className="font-mono text-[10px] leading-relaxed tracking-widest text-muted-foreground uppercase">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="border-b border-border bg-card px-6 py-32">
        <div className="mx-auto max-w-5xl">
          <div className="mb-20 text-center">
            <h2 className="mb-4 text-4xl font-bold tracking-tighter text-foreground uppercase">
              PRICING PLANS
            </h2>
            <div className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
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
      <section className="relative overflow-hidden bg-background px-6 py-32">
        <div
          className="absolute inset-0 z-0 opacity-10 dark:opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle at 50% 50%, currentColor 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 mx-auto max-w-3xl border border-border bg-card p-16 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border border-border bg-muted">
            <div className="flex h-8 w-8 items-center justify-center bg-foreground text-background">
              <ArrowRight className="h-5 w-5 -rotate-45" />
            </div>
          </div>
          <h2 className="mb-6 text-4xl font-bold tracking-tighter text-foreground uppercase">
            READY TO START?
          </h2>
          <p className="mx-auto mb-10 max-w-lg font-mono text-[10px] leading-loose tracking-widest text-muted-foreground uppercase">
            CREATE YOUR FIRST EVENT, DESIGN THE LAYOUT, AND PUBLISH TO THE MARKETPLACE.
          </p>
          <div className="flex justify-center">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-3 border border-foreground bg-foreground px-10 py-5 text-sm font-bold tracking-widest text-background uppercase shadow-sm transition-all hover:bg-foreground/80 hover:text-background"
            >
              GET STARTED NOW
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-background px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center border border-foreground bg-foreground">
              <span className="font-mono text-sm font-bold text-background">V</span>
            </div>
            <div className="flex flex-col">
              <span className="leading-none font-bold tracking-tight text-foreground uppercase">
                EVENT PLANNER
              </span>
              <span className="mt-1 font-mono text-[8px] tracking-widest text-muted-foreground uppercase">
                SERIOUS_OS STYLE
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-8 font-mono text-[9px] font-bold tracking-widest text-muted-foreground uppercase">
            <Link href="/marketplace" className="transition-colors hover:text-foreground">
              MARKETPLACE
            </Link>
            <Link href="/pricing" className="transition-colors hover:text-foreground">
              PRICING
            </Link>
            <Link href="/auth/signin" className="transition-colors hover:text-foreground">
              SIGN IN
            </Link>
          </div>

          <p className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase">
            © {new Date().getFullYear()} EVENT PLANNER.
          </p>
        </div>
      </footer>
    </div>
  )
}
