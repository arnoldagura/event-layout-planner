"use client"

import { useState, useMemo } from "react"
import Fuse from "fuse.js"
import { Search, MapPin, X, DollarSign, Gavel, Users } from "lucide-react"

interface CanvasElement {
  id: string
  type: string
  name: string
  properties?: Record<string, unknown> | null
}

interface Props {
  elements: CanvasElement[]
  onHighlight: (id: string | null) => void
  highlightedId: string | null
  onBidClick?: (elementId: string) => void
}

export function BoothSearch({ elements, onHighlight, highlightedId, onBidClick }: Props) {
  const [query, setQuery] = useState("")

  const searchItems = useMemo(
    () =>
      elements.map((el) => ({
        id: el.id,
        name: el.name,
        type: el.type,
        vendorName: (el.properties as any)?.vendorName ?? "",
        category: (el.properties as any)?.category ?? "",
        forRent: Boolean((el.properties as any)?.forRent),
        askingPrice: (el.properties as any)?.askingPrice as number | undefined,
        rentStatus: (el.properties as any)?.status as string | undefined,
        attendeeName: (el.properties as any)?.attendeeName as string | undefined ?? "",
      })),
    [elements]
  )

  const fuse = useMemo(
    () =>
      new Fuse(searchItems, {
        keys: ["name", "vendorName", "category", "type", "attendeeName"],
        threshold: 0.35,
        includeScore: true,
      }),
    [searchItems]
  )

  const results = useMemo(() => {
    if (!query.trim()) return []
    return fuse.search(query).slice(0, 8)
  }, [query, fuse])

  const handleSelect = (id: string) => {
    onHighlight(id === highlightedId ? null : id)
  }

  const handleClear = () => {
    setQuery("")
    onHighlight(null)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            if (!e.target.value) onHighlight(null)
          }}
          placeholder="SEARCH BOOTHS, ATTENDEES, VENDORS..."
          className="w-full rounded-none border border-border bg-background py-2 pr-8 pl-9 text-xs font-mono uppercase tracking-widest placeholder:text-muted-foreground focus:border-transparent focus:ring-1 focus:ring-foreground focus:outline-none"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {results.length > 0 && (
        <div className="overflow-hidden rounded-none border border-border bg-card shadow-sm">
          {results.map(({ item }) => (
            <div
              key={item.id}
              className={`flex items-start gap-3 border-b border-border px-3 py-2.5 last:border-0 ${highlightedId === item.id ? "bg-muted" : "hover:bg-muted/50"
                }`}
            >
              <button
                onClick={() => handleSelect(item.id)}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                <div className="mt-0.5 shrink-0">
                  <MapPin
                    className={`h-4 w-4 ${highlightedId === item.id ? "text-foreground" : "text-muted-foreground"
                      }`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="truncate text-sm font-mono tracking-widest uppercase font-bold text-foreground">{item.name}</span>
                    {item.forRent && item.rentStatus !== "rented" && (
                      <span className="shrink-0 rounded-none border border-success bg-success/10 px-1.5 py-0.5 text-[9px] font-mono tracking-widest uppercase font-bold text-success">
                        FOR RENT
                      </span>
                    )}
                    {item.forRent && item.rentStatus === "rented" && (
                      <span className="shrink-0 rounded-none border border-border bg-muted/50 px-1.5 py-0.5 text-[9px] font-mono tracking-widest uppercase font-bold text-muted-foreground">
                        RENTED
                      </span>
                    )}
                  </div>
                  {item.vendorName && (
                    <div className="truncate text-xs font-mono tracking-widest uppercase text-muted-foreground">{item.vendorName}</div>
                  )}
                  {item.attendeeName && (
                    <div className="flex items-start gap-1.5 mt-1.5 text-[10px] font-mono tracking-widest uppercase font-bold text-info">
                      <Users className="h-3 w-3 mt-0.5 shrink-0" />
                      <div className="flex flex-wrap gap-1">
                        {item.attendeeName
                          .split("\n")
                          .filter((n) => n.trim())
                          .map((n, i, arr) => (
                            <span key={i}>
                              {n.trim()}
                              {i < arr.length - 1 && ","}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                  {item.forRent && item.askingPrice && (
                    <div className="flex items-center gap-0.5 text-xs font-mono tracking-widest uppercase text-muted-foreground">
                      <DollarSign className="h-3 w-3" />
                      {item.askingPrice.toLocaleString()} ASKING
                    </div>
                  )}
                </div>
              </button>

              <div className="flex shrink-0 items-center gap-1.5 self-center">
                <span className="rounded-none border border-border bg-muted/50 px-2 py-0.5 text-[9px] font-mono tracking-widest text-muted-foreground uppercase">
                  {item.type}
                </span>
                {item.forRent && item.rentStatus !== "rented" && onBidClick && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onBidClick(item.id)
                    }}
                    className="flex items-center gap-1 rounded-none border border-foreground bg-foreground px-2 py-1 text-[9px] font-mono tracking-widest font-bold text-background transition-colors hover:bg-background hover:text-foreground"
                  >
                    <Gavel className="h-3 w-3" />
                    BID
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {query.trim() && results.length === 0 && (
        <p className="py-2 text-center text-sm text-zinc-500">
          No results for &ldquo;{query}&rdquo;
        </p>
      )}
    </div>
  )
}
