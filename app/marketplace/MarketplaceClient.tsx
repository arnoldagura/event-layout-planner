'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Search, MapPin, Store, SlidersHorizontal, X, Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import type { MarketplaceEvent } from './page'

// ─── Event type color map ────────────────────────────────────────────────────

const EVENT_TYPE_COLORS: Record<string, string> = {
  conference:  'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
  trade_show:  'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
  expo:        'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800',
  festival:    'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
  market:      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  summit:      'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
}

function getEventTypeColor(type: string | null): string {
  if (!type) return 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
  return EVENT_TYPE_COLORS[type.toLowerCase()] ?? 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
}

// ─── Price formatting ─────────────────────────────────────────────────────────

function formatPrice(min: number | null, max: number | null): string {
  if (min === null) return 'Price on request'
  if (min === max) return `$${min.toLocaleString()}`
  if (max === null) return `from $${min.toLocaleString()}`
  return `$${min.toLocaleString()} – $${max.toLocaleString()}`
}

// ─── Single event card ────────────────────────────────────────────────────────

function EventCard({ event }: { event: MarketplaceEvent }) {
  const dateStr = (() => {
    try { return format(new Date(event.eventDate), 'MMM d, yyyy') }
    catch { return '—' }
  })()

  const visibleCats = event.categories.slice(0, 3)
  const extraCats   = event.categories.length - 3

  const priceLabel  = formatPrice(event.minPrice, event.maxPrice)
  const isPriceKnown = event.minPrice !== null

  return (
    <Card className="group relative flex flex-col overflow-hidden border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-teal-400 dark:hover:border-teal-600 hover:shadow-lg hover:shadow-teal-500/5 transition-all duration-200 gap-0 py-0">
      {/* Top accent stripe — visible on hover */}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      <CardHeader className="px-5 pt-5 pb-0 gap-3 grid-rows-none">
        {/* Type badge + date row */}
        <div className="flex items-center justify-between gap-2">
          {event.eventType && (
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-wide capitalize ${getEventTypeColor(event.eventType)}`}>
              {event.eventType.replace(/_/g, ' ')}
            </span>
          )}
          <span className="ml-auto flex items-center gap-1 text-[11px] text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
            <Calendar className="size-3 shrink-0" />
            {dateStr}
          </span>
        </div>

        {/* Title */}
        <Link
          href={`/e/${event.shareToken}`}
          className="block font-semibold text-[15px] leading-snug text-zinc-900 dark:text-zinc-50 hover:text-teal-600 dark:hover:text-teal-400 transition-colors line-clamp-2"
        >
          {event.title}
        </Link>

        {/* Venue */}
        {event.venue && (
          <p className="flex items-center gap-1.5 text-[13px] text-zinc-500 dark:text-zinc-400">
            <MapPin className="size-3.5 shrink-0 text-zinc-400 dark:text-zinc-500" />
            <span className="truncate">{event.venue}</span>
          </p>
        )}
      </CardHeader>

      <CardContent className="px-5 pt-4 pb-0 flex flex-col gap-3">
        {/* Description */}
        {event.description && (
          <p className="text-[13px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-4">
          {/* Available booths */}
          <div className="flex items-center gap-1.5">
            <Store className="size-3.5 text-teal-500 shrink-0" />
            <span className="text-[13px] font-medium text-teal-700 dark:text-teal-400">
              {event.availableBooths} booth{event.availableBooths !== 1 ? 's' : ''} available
            </span>
          </div>

          {/* Price */}
          <div className="ml-auto text-right">
            <span className={`text-[13px] font-medium ${isPriceKnown ? 'text-zinc-700 dark:text-zinc-200' : 'text-zinc-400 dark:text-zinc-500 italic'}`}>
              {priceLabel}
            </span>
          </div>
        </div>

        {/* Category pills */}
        {event.categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {visibleCats.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 capitalize"
              >
                {cat}
              </span>
            ))}
            {extraCats > 0 && (
              <span className="inline-flex items-center rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                +{extraCats} more
              </span>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="px-5 pt-4 pb-5 mt-auto">
        <Button
          asChild
          size="sm"
          className="w-full bg-teal-600 hover:bg-teal-700 text-white border-0 font-medium text-[13px] h-8 rounded-lg transition-colors"
        >
          <Link href={`/e/${event.shareToken}`}>
            View Booths
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function MarketplaceClient({ events }: { events: MarketplaceEvent[] }) {
  const [search,   setSearch]   = useState('')
  const [typeFilter, setTypeFilter] = useState('__all__')
  const [catFilter,  setCatFilter]  = useState('__all__')
  const [maxPrice,   setMaxPrice]   = useState('')

  // Derive unique filter options
  const allTypes = useMemo(() => {
    const s = new Set<string>()
    events.forEach((e) => { if (e.eventType) s.add(e.eventType) })
    return Array.from(s).sort()
  }, [events])

  const allCategories = useMemo(() => {
    const s = new Set<string>()
    events.forEach((e) => e.categories.forEach((c) => s.add(c)))
    return Array.from(s).sort()
  }, [events])

  // Apply filters
  const filtered = useMemo(() => {
    const q        = search.trim().toLowerCase()
    const maxNum   = maxPrice !== '' ? parseFloat(maxPrice) : null

    return events.filter((e) => {
      if (q && !e.title.toLowerCase().includes(q) && !(e.venue ?? '').toLowerCase().includes(q)) return false
      if (typeFilter !== '__all__' && e.eventType !== typeFilter) return false
      if (catFilter  !== '__all__' && !e.categories.includes(catFilter)) return false
      if (maxNum !== null) {
        // Show events where minPrice <= maxNum, or minPrice is null
        if (e.minPrice !== null && e.minPrice > maxNum) return false
      }
      return true
    })
  }, [events, search, typeFilter, catFilter, maxPrice])

  // Active filter count
  const activeFilters = [
    search.trim() !== '',
    typeFilter !== '__all__',
    catFilter  !== '__all__',
    maxPrice   !== '',
  ].filter(Boolean).length

  function clearAll() {
    setSearch('')
    setTypeFilter('__all__')
    setCatFilter('__all__')
    setMaxPrice('')
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-1">
              <Store className="size-5 text-teal-500" />
              <span className="text-xs font-semibold tracking-widest uppercase text-teal-600 dark:text-teal-400">
                Marketplace
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Booth Marketplace
            </h1>
            <p className="text-[15px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              Find available booths at upcoming events and connect with organizers.
            </p>
          </div>
        </div>
      </div>

      {/* ── Filter bar ──────────────────────────────────────────────────── */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-10 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400 pointer-events-none" />
              <Input
                placeholder="Search by event name or venue…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 focus-visible:ring-teal-500/30 focus-visible:border-teal-400"
              />
            </div>

            {/* Event type */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-9 text-sm w-full sm:w-44 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All types</SelectItem>
                {allTypes.map((t) => (
                  <SelectItem key={t} value={t} className="capitalize">
                    {t.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category */}
            <Select value={catFilter} onValueChange={setCatFilter}>
              <SelectTrigger className="h-9 text-sm w-full sm:w-44 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All categories</SelectItem>
                {allCategories.map((c) => (
                  <SelectItem key={c} value={c} className="capitalize">
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Max price */}
            <div className="relative w-full sm:w-36">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 pointer-events-none select-none">$</span>
              <Input
                type="number"
                min={0}
                placeholder="Max price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="pl-6 h-9 text-sm bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 focus-visible:ring-teal-500/30 focus-visible:border-teal-400"
              />
            </div>

            {/* Active filter indicator + clear */}
            {activeFilters > 0 && (
              <div className="flex items-center gap-1.5 shrink-0">
                <Badge className="h-6 px-2 text-[11px] font-semibold bg-teal-600 hover:bg-teal-600 text-white border-0 rounded-full">
                  <SlidersHorizontal className="size-2.5 mr-1" />
                  {activeFilters}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="h-7 px-2 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 gap-1"
                >
                  <X className="size-3" />
                  Clear all
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Results area ────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Result count */}
        {events.length > 0 && (
          <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mb-5">
            {filtered.length === 0
              ? 'No events match your filters'
              : `${filtered.length} event${filtered.length !== 1 ? 's' : ''} found`}
          </p>
        )}

        {/* ── No events at all ── */}
        {events.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
              <Store className="size-6 text-zinc-400" />
            </div>
            <h3 className="text-base font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              No booths available yet
            </h3>
            <p className="text-sm text-zinc-400 dark:text-zinc-500 max-w-xs leading-relaxed">
              Events with available booths will appear here once organizers publish their layouts.
            </p>
          </div>
        )}

        {/* ── Events exist, but none match filters ── */}
        {events.length > 0 && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
              <Search className="size-6 text-zinc-400" />
            </div>
            <h3 className="text-base font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              No events match your filters
            </h3>
            <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-5 max-w-xs leading-relaxed">
              Try adjusting your search terms or removing some filters.
            </p>
            <Button variant="outline" size="sm" onClick={clearAll} className="gap-1.5 text-sm">
              <X className="size-3.5" />
              Clear filters
            </Button>
          </div>
        )}

        {/* ── Event grid ── */}
        {filtered.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
