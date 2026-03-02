'use client'

import { useState, useMemo } from 'react'
import Fuse from 'fuse.js'
import { Search, MapPin, X, DollarSign, Gavel } from 'lucide-react'

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
  const [query, setQuery] = useState('')

  const searchItems = useMemo(
    () =>
      elements.map((el) => ({
        id: el.id,
        name: el.name,
        type: el.type,
        vendorName: (el.properties as any)?.vendorName ?? '',
        category: (el.properties as any)?.category ?? '',
        forRent: Boolean((el.properties as any)?.forRent),
        askingPrice: (el.properties as any)?.askingPrice as number | undefined,
        rentStatus: (el.properties as any)?.status as string | undefined,
      })),
    [elements]
  )

  const fuse = useMemo(
    () =>
      new Fuse(searchItems, {
        keys: ['name', 'vendorName', 'category', 'type'],
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
    setQuery('')
    onHighlight(null)
  }

  return (
    <div className='flex flex-col gap-2'>
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none' />
        <input
          type='text'
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            if (!e.target.value) onHighlight(null)
          }}
          placeholder='Search booths, vendors, services...'
          className='w-full pl-9 pr-8 py-2 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-zinc-400'
        />
        {query && (
          <button
            onClick={handleClear}
            className='absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors'
          >
            <X className='w-4 h-4' />
          </button>
        )}
      </div>

      {results.length > 0 && (
        <div className='bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-sm'>
          {results.map(({ item }) => (
            <div
              key={item.id}
              className={`flex items-start gap-3 px-3 py-2.5 border-b last:border-0 border-zinc-100 ${
                highlightedId === item.id ? 'bg-amber-50' : 'hover:bg-zinc-50'
              }`}
            >
              <button
                onClick={() => handleSelect(item.id)}
                className='flex items-center gap-3 flex-1 min-w-0 text-left'
              >
                <div className='shrink-0 mt-0.5'>
                  <MapPin
                    className={`w-4 h-4 ${
                      highlightedId === item.id ? 'text-amber-500' : 'text-zinc-400'
                    }`}
                  />
                </div>
                <div className='min-w-0 flex-1'>
                  <div className='flex items-center gap-1.5 flex-wrap'>
                    <span className='text-sm font-medium text-zinc-900 truncate'>{item.name}</span>
                    {item.forRent && item.rentStatus !== 'rented' && (
                      <span className='text-[10px] font-medium px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded border border-emerald-200 shrink-0'>
                        For Rent
                      </span>
                    )}
                    {item.forRent && item.rentStatus === 'rented' && (
                      <span className='text-[10px] font-medium px-1.5 py-0.5 bg-zinc-100 text-zinc-500 rounded border border-zinc-200 shrink-0'>
                        Rented
                      </span>
                    )}
                  </div>
                  {item.vendorName && (
                    <div className='text-xs text-zinc-500 truncate'>{item.vendorName}</div>
                  )}
                  {item.forRent && item.askingPrice && (
                    <div className='flex items-center gap-0.5 text-xs text-zinc-500'>
                      <DollarSign className='w-3 h-3' />
                      {item.askingPrice.toLocaleString()} asking
                    </div>
                  )}
                </div>
              </button>

              <div className='flex items-center gap-1.5 shrink-0 self-center'>
                <span className='text-xs text-zinc-400 capitalize bg-zinc-100 px-2 py-0.5 rounded-full'>
                  {item.type}
                </span>
                {item.forRent && item.rentStatus !== 'rented' && onBidClick && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onBidClick(item.id)
                    }}
                    className='flex items-center gap-1 text-xs font-medium px-2 py-0.5 bg-zinc-900 text-white rounded hover:bg-zinc-700 transition-colors'
                  >
                    <Gavel className='w-3 h-3' />
                    Bid
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {query.trim() && results.length === 0 && (
        <p className='text-sm text-zinc-500 text-center py-2'>No results for &ldquo;{query}&rdquo;</p>
      )}
    </div>
  )
}
