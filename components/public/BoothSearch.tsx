'use client'

import { useState, useMemo } from 'react'
import Fuse from 'fuse.js'
import { Search, MapPin, X } from 'lucide-react'

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
}

export function BoothSearch({ elements, onHighlight, highlightedId }: Props) {
  const [query, setQuery] = useState('')

  // Build searchable list from all elements
  const searchItems = useMemo(
    () =>
      elements.map((el) => ({
        id: el.id,
        name: el.name,
        type: el.type,
        vendorName: (el.properties as any)?.vendorName ?? '',
        category: (el.properties as any)?.category ?? '',
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
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-zinc-50 transition-colors border-b last:border-0 border-zinc-100 ${
                highlightedId === item.id ? 'bg-amber-50' : ''
              }`}
            >
              <div className='shrink-0'>
                <MapPin
                  className={`w-4 h-4 ${
                    highlightedId === item.id ? 'text-amber-500' : 'text-zinc-400'
                  }`}
                />
              </div>
              <div className='min-w-0'>
                <div className='text-sm font-medium text-zinc-900 truncate'>{item.name}</div>
                {item.vendorName && (
                  <div className='text-xs text-zinc-500 truncate'>{item.vendorName}</div>
                )}
              </div>
              <div className='ml-auto shrink-0'>
                <span className='text-xs text-zinc-400 capitalize bg-zinc-100 px-2 py-0.5 rounded-full'>
                  {item.type}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {query.trim() && results.length === 0 && (
        <p className='text-sm text-zinc-500 text-center py-2'>No results for &ldquo;{query}&rdquo;</p>
      )}
    </div>
  )
}
