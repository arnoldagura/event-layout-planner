"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { format } from "date-fns"
import {
  Search,
  MapPin,
  SlidersHorizontal,
  Terminal,
  Database,
  Shield,
  Cpu,
  LogOut,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { MarketplaceEvent } from "./page"

function formatPrice(min: number | null, max: number | null): string {
  if (min === null) return "VARIES"
  if (min === max) return `$${min.toLocaleString()}`
  if (max === null) return `FROM $${min.toLocaleString()}`
  return `$${min.toLocaleString()} - $${max.toLocaleString()}`
}

function EventCard({ event }: { event: MarketplaceEvent }) {
  const dateStr = (() => {
    try {
      return format(new Date(event.eventDate), "yyyy.MM.dd")
    } catch {
      return "UNKNOWN"
    }
  })()

  const visibleCats = event.categories.slice(0, 3)
  const extraCats = event.categories.length - 3

  const priceLabel = formatPrice(event.minPrice, event.maxPrice)
  const isPriceKnown = event.minPrice !== null

  return (
    <div className="group relative flex flex-col border border-border bg-card shadow-none transition-colors hover:border-foreground">
      <div className="h-1 w-full bg-muted transition-colors group-hover:bg-success" />

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-start justify-between">
          <div className="mb-1 max-w-[80%] overflow-hidden font-mono text-[10px] tracking-widest text-ellipsis whitespace-nowrap text-muted-foreground uppercase">
            HOST: {event.id.split("-")[0]}
          </div>
          <Shield className="h-3.5 w-3.5 text-success" />
        </div>

        <Link
          href={`/e/${event.shareToken}`}
          className="mb-3 line-clamp-2 text-lg font-bold tracking-tight text-foreground uppercase transition-colors group-hover:text-info"
        >
          {event.title}
        </Link>

        {event.venue && (
          <p className="mb-4 flex items-center gap-2 font-mono text-xs text-muted-foreground uppercase">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">{event.venue}</span>
          </p>
        )}

        {event.description && (
          <p className="mb-4 line-clamp-2 text-sm text-foreground/80">{event.description}</p>
        )}

        <div className="my-2 h-[1px] w-full bg-border" />

        <div className="mt-2 grid grid-cols-[auto_1fr] items-baseline gap-x-4 gap-y-2 font-mono text-xs">
          <span className="text-[10px] tracking-widest text-muted-foreground uppercase">DATE</span>
          <span className="text-right font-medium text-foreground">{dateStr}</span>

          <span className="text-[10px] tracking-widest text-muted-foreground uppercase">TYPE</span>
          <span className="truncate text-right text-foreground">
            {event.eventType?.toUpperCase() || "UNKNOWN"}
          </span>

          <span className="text-[10px] tracking-widest text-muted-foreground uppercase">
            AVAILABLE
          </span>
          <span className="text-right font-medium text-success">{event.availableBooths}</span>

          <span className="text-[10px] tracking-widest text-muted-foreground uppercase">PRICE</span>
          <span
            className={`text-right font-medium ${isPriceKnown ? "text-foreground" : "text-muted-foreground"}`}
          >
            {priceLabel}
          </span>
        </div>

        {event.categories.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {visibleCats.map((cat) => (
              <span
                key={cat}
                className="border border-border px-1.5 py-0.5 font-mono text-[9px] tracking-widest text-muted-foreground uppercase"
              >
                {cat}
              </span>
            ))}
            {extraCats > 0 && (
              <span className="border border-border px-1.5 py-0.5 font-mono text-[9px] tracking-widest text-muted-foreground uppercase">
                +{extraCats} MORE
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex h-10 border-t border-border bg-muted/20 transition-colors group-hover:border-foreground">
        <Link
          href={`/e/${event.shareToken}`}
          className="flex flex-1 items-center justify-center font-mono text-[10px] tracking-widest text-muted-foreground uppercase transition-colors group-hover:bg-foreground group-hover:text-background"
        >
          VIEW EVENT
        </Link>
      </div>
    </div>
  )
}

export function MarketplaceClient({
  events,
  user,
  plan,
}: {
  events: MarketplaceEvent[]
  user?: any
  plan?: any
}) {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("__all__")
  const [catFilter, setCatFilter] = useState("__all__")
  const [maxPrice, setMaxPrice] = useState("")

  const allTypes = useMemo(() => {
    const s = new Set<string>()
    events.forEach((e) => {
      if (e.eventType) s.add(e.eventType)
    })
    return Array.from(s).sort()
  }, [events])

  const allCategories = useMemo(() => {
    const s = new Set<string>()
    events.forEach((e) => e.categories.forEach((c) => s.add(c)))
    return Array.from(s).sort()
  }, [events])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const maxNum = maxPrice !== "" ? parseFloat(maxPrice) : null

    return events.filter((e) => {
      if (q && !e.title.toLowerCase().includes(q) && !(e.venue ?? "").toLowerCase().includes(q))
        return false
      if (typeFilter !== "__all__" && e.eventType !== typeFilter) return false
      if (catFilter !== "__all__" && !e.categories.includes(catFilter)) return false
      if (maxNum !== null) {
        if (e.minPrice !== null && e.minPrice > maxNum) return false
      }
      return true
    })
  }, [events, search, typeFilter, catFilter, maxPrice])

  const activeFilters = [
    search.trim() !== "",
    typeFilter !== "__all__",
    catFilter !== "__all__",
    maxPrice !== "",
  ].filter(Boolean).length

  function clearAll() {
    setSearch("")
    setTypeFilter("__all__")
    setCatFilter("__all__")
    setMaxPrice("")
  }

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground selection:bg-foreground selection:text-background">
      {!user && (
        <header className="z-10 flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-6 font-mono text-[10px] tracking-widest uppercase">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center bg-foreground text-sm leading-none font-bold tracking-tighter text-background shadow-sm">
              V
            </div>
            <div className="hidden sm:block">
              <div className="mb-1 font-mono text-[9px] leading-none tracking-[0.2em] text-muted-foreground uppercase">
                Event Layout
              </div>
              <div className="text-sm leading-none font-bold tracking-tight uppercase">Planner</div>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/signin"
              className="tracking-widest text-muted-foreground uppercase transition-colors hover:text-foreground"
            >
              SIGN IN
            </Link>
            <ThemeToggle />
          </div>
        </header>
      )}

      {user && (
        <header className="z-10 flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-6 font-mono text-[10px] tracking-widest uppercase">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center bg-foreground text-sm leading-none font-bold tracking-tighter text-background shadow-sm">
                V
              </div>
              <div className="hidden sm:block">
                <div className="mb-1 font-mono text-[9px] leading-none tracking-[0.2em] text-muted-foreground uppercase">
                  Event Layout
                </div>
                <div className="text-sm leading-none font-bold tracking-tight uppercase">
                  Planner
                </div>
              </div>
            </Link>

            <div className="hidden h-6 w-[1px] bg-border md:block" />

            <nav className="flex items-center gap-6">
              <Link
                href="/dashboard"
                className="group flex items-center gap-2 tracking-widest text-muted-foreground uppercase transition-colors hover:text-foreground"
              >
                <Database className="h-3.5 w-3.5 transition-colors group-hover:text-foreground" />
                <span>Events</span>
              </Link>
              <Link
                href="/marketplace"
                className="group relative flex items-center gap-2 font-bold tracking-widest text-foreground uppercase"
              >
                <Cpu className="h-3.5 w-3.5" />
                <span>Marketplace</span>
                <div className="absolute -bottom-[19px] left-0 h-[2px] w-full bg-foreground" />
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden items-center gap-2 md:flex">
              <span className="text-muted-foreground">PLAN:</span>
              <span
                className={`border px-1.5 py-0.5 font-bold ${plan === "pro" ? "border-warning bg-warning/10 text-warning" : "border-muted-foreground text-muted-foreground"} tracking-widest`}
              >
                {plan}
              </span>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <span className="text-muted-foreground">USER:</span>
              <span className="max-w-[120px] truncate border-b border-foreground font-bold text-foreground select-all lg:max-w-none">
                {user.email || user.name}
              </span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              className="flex items-center gap-2 border-l border-border py-1 pl-2 tracking-widest text-muted-foreground uppercase transition-colors hover:text-destructive"
              title="Log Out"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden lg:inline">LOG OUT</span>
            </button>
            <ThemeToggle />
          </div>
        </header>
      )}

      <div className="mx-auto flex w-full max-w-6xl items-end justify-between border-b border-border px-6 pt-8 pb-6">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-foreground uppercase">
            <Database className="h-6 w-6" /> MARKETPLACE
          </h1>
          <p className="mt-2 font-mono text-xs tracking-widest text-muted-foreground uppercase">
            DISCOVER NETWORKING EVENTS AND RESERVE YOUR BOOTH.
          </p>
        </div>
        <div className="hidden text-right font-mono text-[10px] tracking-widest text-muted-foreground uppercase md:block">
          <div className="mb-1">
            RESULTS: <span className="font-bold text-foreground">{events.length} EVENTS</span>
          </div>
          <div>
            STATUS: <span className="font-bold text-success">ONLINE</span>
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-10 w-full border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-6 py-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="SEARCH EVENTS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 rounded-none border-foreground bg-background pl-10 font-mono text-xs uppercase focus-visible:ring-1 focus-visible:ring-foreground"
            />
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-10 w-[180px] rounded-none border-foreground bg-background font-mono text-xs uppercase">
              <SelectValue placeholder="ALL TYPES" />
            </SelectTrigger>
            <SelectContent className="rounded-none border-black font-mono text-[10px] uppercase">
              <SelectItem
                value="__all__"
                className="cursor-pointer rounded-none focus:bg-black focus:text-white"
              >
                ALL TYPES
              </SelectItem>
              {allTypes.map((t) => (
                <SelectItem
                  key={t}
                  value={t}
                  className="cursor-pointer rounded-none focus:bg-black focus:text-white"
                >
                  {t.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="h-10 w-[180px] rounded-none border-black font-mono text-xs uppercase">
              <SelectValue placeholder="ALL CATEGORIES" />
            </SelectTrigger>
            <SelectContent className="rounded-none border-black font-mono text-[10px] uppercase">
              <SelectItem
                value="__all__"
                className="cursor-pointer rounded-none focus:bg-black focus:text-white"
              >
                ALL CATEGORIES
              </SelectItem>
              {allCategories.map((c) => (
                <SelectItem
                  key={c}
                  value={c}
                  className="cursor-pointer rounded-none focus:bg-black focus:text-white"
                >
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative w-[150px]">
            <span className="absolute top-1/2 left-3 -translate-y-1/2 font-mono text-xs text-[#999]">
              $
            </span>
            <Input
              type="number"
              min={0}
              placeholder="MAX PRICE"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="h-10 rounded-none border-black pl-6 font-mono text-xs uppercase focus-visible:ring-1 focus-visible:ring-black"
            />
          </div>

          {activeFilters > 0 && (
            <div className="flex shrink-0 items-center gap-2 border border-foreground bg-card pl-2">
              <span className="font-mono text-[10px] font-bold text-info">
                {activeFilters} FILTERS
              </span>
              <button
                onClick={clearAll}
                className="h-10 bg-foreground px-3 font-mono text-[10px] text-background uppercase transition-colors hover:bg-destructive"
              >
                CLEAR
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Results area ────────────────────────────────────────────────── */}
      <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        {events.length === 0 && (
          <div className="mt-12 flex flex-col items-center justify-center border border-dashed border-border bg-card p-16 text-center">
            <Terminal className="mb-4 h-8 w-8 text-muted-foreground" />
            <p className="mb-2 font-mono text-sm font-bold tracking-widest text-muted-foreground uppercase">
              NO EVENTS FOUND
            </p>
            <p className="mx-auto max-w-sm font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
              THERE ARE CURRENTLY NO PUBLISHED EVENTS IN THE MARKETPLACE.
            </p>
          </div>
        )}

        {events.length > 0 && filtered.length === 0 && (
          <div className="mt-12 flex flex-col items-center justify-center border border-dashed border-border bg-card p-16 text-center">
            <SlidersHorizontal className="mb-4 h-8 w-8 text-muted-foreground" />
            <p className="mb-2 font-mono text-sm font-bold tracking-widest text-destructive uppercase">
              NO MATCHING RESULTS FOUND
            </p>
            <Button
              variant="outline"
              onClick={clearAll}
              className="mt-4 rounded-none border-foreground font-mono text-xs text-foreground uppercase"
            >
              CLEAR FILTERS
            </Button>
          </div>
        )}

        {filtered.length > 0 && (
          <>
            <div className="mb-4 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
              {filtered.length} EVENTS FOUND
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
