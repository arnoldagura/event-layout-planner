'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Calendar, MapPin, Users, Layers } from 'lucide-react'
import { PublicEventCanvas } from '@/components/canvas/PublicEventCanvas'
import { BoothSearch } from '@/components/public/BoothSearch'

interface CanvasElement {
  id: string
  type: string
  name: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  properties?: Record<string, unknown> | null
}

interface Event {
  id: string
  title: string
  description: string | null
  eventDate: string
  startTime: string | null
  endTime: string | null
  venue: string | null
  capacity: number | null
  eventType: string | null
  elements: CanvasElement[]
}

interface Props {
  event: Event
}

export function PublicEventView({ event }: Props) {
  const [highlightedId, setHighlightedId] = useState<string | null>(null)

  return (
    <div className='h-screen flex flex-col bg-zinc-100'>
      {/* Header */}
      <header className='bg-white border-b px-4 py-3 shrink-0'>
        <div className='max-w-screen-xl mx-auto flex items-center justify-between'>
          <div>
            <div className='flex items-center gap-2'>
              <h1 className='font-semibold text-zinc-900 text-lg'>{event.title}</h1>
              {event.eventType && (
                <span className='text-xs capitalize bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full border border-zinc-200'>
                  {event.eventType}
                </span>
              )}
            </div>
            <div className='flex items-center gap-3 text-xs text-zinc-500 mt-0.5'>
              {event.eventDate && (
                <span className='flex items-center gap-1'>
                  <Calendar className='w-3 h-3' />
                  {format(new Date(event.eventDate), 'MMM d, yyyy')}
                  {event.startTime && ` · ${event.startTime}`}
                  {event.endTime && ` – ${event.endTime}`}
                </span>
              )}
              {event.venue && (
                <span className='flex items-center gap-1'>
                  <MapPin className='w-3 h-3' />
                  {event.venue}
                </span>
              )}
              {event.capacity && (
                <span className='flex items-center gap-1'>
                  <Users className='w-3 h-3' />
                  {event.capacity} capacity
                </span>
              )}
            </div>
          </div>

          <div className='text-xs text-zinc-400 flex items-center gap-1'>
            <Layers className='w-3 h-3' />
            {event.elements.length} element{event.elements.length !== 1 ? 's' : ''}
          </div>
        </div>
      </header>

      <div className='flex-1 flex overflow-hidden'>
        {/* Sidebar: Search */}
        <aside className='w-72 bg-white border-r flex flex-col p-4 gap-4 overflow-y-auto shrink-0'>
          <div>
            <h2 className='text-sm font-semibold text-zinc-900 mb-1'>Find on Layout</h2>
            <p className='text-xs text-zinc-500 mb-3'>
              Search by booth name, vendor, or type to locate it on the map.
            </p>
            <BoothSearch
              elements={event.elements}
              onHighlight={setHighlightedId}
              highlightedId={highlightedId}
            />
          </div>

          {event.description && (
            <div className='border-t pt-4'>
              <h2 className='text-sm font-semibold text-zinc-900 mb-1'>About this Event</h2>
              <p className='text-xs text-zinc-500 leading-relaxed'>{event.description}</p>
            </div>
          )}
        </aside>

        {/* Canvas */}
        <div className='flex-1 overflow-hidden'>
          <PublicEventCanvas
            elements={event.elements}
            highlightedId={highlightedId}
          />
        </div>
      </div>
    </div>
  )
}
