"use client"

import { useState, useMemo } from "react"
import Fuse from "fuse.js"
import { Search, MapPin, X, DollarSign, Gavel } from "lucide-react"

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
      })),
    [elements]
  )

  const fuse = useMemo(
    () =>
      new Fuse(searchItems, {
        keys: ["name", "vendorName", "category", "type"],
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
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            if (!e.target.value) onHighlight(null)
          }}
          placeholder="Search booths, vendors, services..."
          className="w-full rounded-lg border border-zinc-200 bg-white py-2 pr-8 pl-9 text-sm placeholder:text-zinc-400 focus:border-transparent focus:ring-2 focus:ring-purple-500 focus:outline-none"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute top-1/2 right-2.5 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-700"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {results.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
          {results.map(({ item }) => (
            <div
              key={item.id}
              className={`flex items-start gap-3 border-b border-zinc-100 px-3 py-2.5 last:border-0 ${
                highlightedId === item.id ? "bg-amber-50" : "hover:bg-zinc-50"
              }`}
            >
              <button
                onClick={() => handleSelect(item.id)}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                <div className="mt-0.5 shrink-0">
                  <MapPin
                    className={`h-4 w-4 ${
                      highlightedId === item.id ? "text-amber-500" : "text-zinc-400"
                    }`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="truncate text-sm font-medium text-zinc-900">{item.name}</span>
                    {item.forRent && item.rentStatus !== "rented" && (
                      <span className="shrink-0 rounded border border-emerald-200 bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                        For Rent
                      </span>
                    )}
                    {item.forRent && item.rentStatus === "rented" && (
                      <span className="shrink-0 rounded border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500">
                        Rented
                      </span>
                    )}
                  </div>
                  {item.vendorName && (
                    <div className="truncate text-xs text-zinc-500">{item.vendorName}</div>
                  )}
                  {item.forRent && item.askingPrice && (
                    <div className="flex items-center gap-0.5 text-xs text-zinc-500">
                      <DollarSign className="h-3 w-3" />
                      {item.askingPrice.toLocaleString()} asking
                    </div>
                  )}
                </div>
              </button>

              <div className="flex shrink-0 items-center gap-1.5 self-center">
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-400 capitalize">
                  {item.type}
                </span>
                {item.forRent && item.rentStatus !== "rented" && onBidClick && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onBidClick(item.id)
                    }}
                    className="flex items-center gap-1 rounded bg-zinc-900 px-2 py-0.5 text-xs font-medium text-white transition-colors hover:bg-zinc-700"
                  >
                    <Gavel className="h-3 w-3" />
                    Bid
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
