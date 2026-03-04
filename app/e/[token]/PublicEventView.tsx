'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Calendar, MapPin, Users, DollarSign, X, Search, ChevronDown } from 'lucide-react'
import { PublicEventCanvas } from '@/components/canvas/PublicEventCanvas'
import { BoothSearch } from '@/components/public/BoothSearch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

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
  shareToken: string
}

export function PublicEventView({ event, shareToken }: Props) {
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const [selectedBooth, setSelectedBooth] = useState<CanvasElement | null>(null)
  const [showMobilePanel, setShowMobilePanel] = useState(false)

  const [vendorName, setVendorName] = useState('')
  const [vendorEmail, setVendorEmail] = useState('')
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleBoothClick = (element: CanvasElement) => {
    setShowMobilePanel(false) // close search panel when a booth is tapped
    setSelectedBooth(element)
    setVendorName('')
    setVendorEmail('')
    setAmount('')
    setMessage('')
  }

  const handleBidSubmit = async () => {
    if (!selectedBooth) return
    const props = (selectedBooth.properties ?? {}) as Record<string, unknown>
    const boothId = props.boothId as string | undefined
    if (!boothId) return

    setIsSubmitting(true)
    try {
      const res = await fetch(
        `/api/public/events/${shareToken}/booths/${boothId}/bids`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vendorName, vendorEmail, amount: Number(amount), message }),
        }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit bid')
      toast.success('Bid submitted successfully!')
      setSelectedBooth(null)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit bid')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedBoothProps = (selectedBooth?.properties ?? {}) as Record<string, unknown>
  const askingPrice = selectedBoothProps.askingPrice as number | undefined
  const boothCategory = selectedBoothProps.category as string | undefined
  const boothDescription = selectedBoothProps.description as string | undefined
  const boothIsForRent = Boolean(selectedBoothProps.forRent)
  const boothIsRented = selectedBoothProps.status === 'rented'

  // Sidebar content — rendered in both desktop aside and mobile bottom sheet
  const sidebarContent = (
    <div className='flex flex-col gap-4'>
      <div>
        <h2 className='text-sm font-semibold text-zinc-900 mb-1'>Find on Layout</h2>
        <p className='text-xs text-zinc-500 mb-3'>
          Search by booth name, vendor, or type to locate it on the map.
        </p>
        <BoothSearch
          elements={event.elements}
          onHighlight={(id) => {
            setHighlightedId(id)
            if (id) setShowMobilePanel(false) // close panel and fly to element
          }}
          highlightedId={highlightedId}
          onBidClick={(elementId) => {
            const el = event.elements.find((e) => e.id === elementId)
            if (el) handleBoothClick(el)
          }}
        />
      </div>

      {event.description && (
        <div className='border-t pt-4'>
          <h2 className='text-sm font-semibold text-zinc-900 mb-1'>About this Event</h2>
          <p className='text-xs text-zinc-500 leading-relaxed'>{event.description}</p>
        </div>
      )}

      <div className='border-t pt-4'>
        <p className='text-xs text-zinc-400 leading-relaxed'>
          Green-outlined booths are available for rent. Tap a booth on the map or use
          the &ldquo;Bid&rdquo; button in search results to submit a bid.
        </p>
      </div>
    </div>
  )

  return (
    <div className='h-screen flex flex-col bg-zinc-100'>
      {/* ── Header ── */}
      <header className='bg-white border-b px-4 py-2.5 shrink-0'>
        <div className='max-w-screen-xl mx-auto flex items-start justify-between gap-3'>
          <div className='min-w-0'>
            <div className='flex items-center gap-2 flex-wrap'>
              <h1 className='font-semibold text-zinc-900 text-base sm:text-lg truncate max-w-[55vw] sm:max-w-none'>
                {event.title}
              </h1>
              {event.eventType && (
                <span className='text-xs capitalize bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full border border-zinc-200 shrink-0'>
                  {event.eventType}
                </span>
              )}
            </div>
            <div className='flex items-center gap-3 text-xs text-zinc-500 mt-0.5 flex-wrap'>
              {event.eventDate && (
                <span className='flex items-center gap-1'>
                  <Calendar className='w-3 h-3 shrink-0' />
                  {format(new Date(event.eventDate), 'MMM d, yyyy')}
                  {event.startTime && ` · ${event.startTime}`}
                  {event.endTime && ` – ${event.endTime}`}
                </span>
              )}
              {event.venue && (
                <span className='flex items-center gap-1'>
                  <MapPin className='w-3 h-3 shrink-0' />
                  <span className='truncate max-w-[40vw] sm:max-w-none'>{event.venue}</span>
                </span>
              )}
              {event.capacity && (
                <span className='hidden sm:flex items-center gap-1'>
                  <Users className='w-3 h-3' />
                  {event.capacity} capacity
                </span>
              )}
            </div>
          </div>

          {/* Mobile: Search toggle button in header */}
          <button
            className='md:hidden shrink-0 flex items-center gap-1.5 text-xs font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-lg transition-colors mt-0.5'
            onClick={() => setShowMobilePanel((v) => !v)}
          >
            <Search className='w-3.5 h-3.5' />
            Search
          </button>
        </div>
      </header>

      <div className='flex-1 flex overflow-hidden relative'>
        {/* ── Desktop sidebar ── */}
        <aside className='hidden md:flex w-72 bg-white border-r flex-col p-4 overflow-y-auto shrink-0'>
          {sidebarContent}
        </aside>

        {/* ── Canvas ── */}
        <div className='flex-1 overflow-hidden'>
          <PublicEventCanvas
            elements={event.elements}
            highlightedId={highlightedId}
            onBoothClick={handleBoothClick}
          />
        </div>

        {/* ── Mobile backdrop ── */}
        {showMobilePanel && (
          <div
            className='fixed inset-0 bg-black/30 z-20 md:hidden'
            onClick={() => setShowMobilePanel(false)}
          />
        )}

        {/* ── Mobile bottom sheet ── */}
        <div
          className={`fixed inset-x-0 bottom-0 z-30 bg-white rounded-t-2xl shadow-2xl border-t transform transition-transform duration-300 ease-in-out md:hidden ${
            showMobilePanel ? 'translate-y-0' : 'translate-y-full'
          }`}
          style={{ maxHeight: '72vh' }}
        >
          {/* Drag handle + close */}
          <div className='flex items-center justify-between px-4 pt-3 pb-2'>
            <div className='w-10 h-1 bg-zinc-300 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-3' />
            <span className='text-sm font-semibold text-zinc-900'>Search & Info</span>
            <button
              onClick={() => setShowMobilePanel(false)}
              className='p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors'
            >
              <ChevronDown className='w-5 h-5' />
            </button>
          </div>
          <div
            className='overflow-y-auto px-4 pb-8'
            style={{ maxHeight: 'calc(72vh - 52px)' }}
          >
            {sidebarContent}
          </div>
        </div>
      </div>

      {/* ── Bid Dialog ── */}
      <Dialog open={!!selectedBooth} onOpenChange={(open) => !open && setSelectedBooth(null)}>
        <DialogContent className='sm:max-w-sm max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>{selectedBooth?.name}</DialogTitle>
          </DialogHeader>

          {selectedBooth && !boothIsForRent && (
            <div className='py-2 space-y-2 text-center'>
              <p className='text-sm text-zinc-600'>This booth is not available for rent.</p>
              <Button variant='outline' className='w-full' onClick={() => setSelectedBooth(null)}>
                Close
              </Button>
            </div>
          )}

          {selectedBooth && boothIsForRent && boothIsRented && (
            <div className='py-2 space-y-2 text-center'>
              <p className='text-sm text-zinc-600'>This booth has already been rented.</p>
              <Button variant='outline' className='w-full' onClick={() => setSelectedBooth(null)}>
                Close
              </Button>
            </div>
          )}

          {selectedBooth && boothIsForRent && !boothIsRented && (
            <>
              {(boothCategory || askingPrice || boothDescription) && (
                <div className='bg-zinc-50 rounded-lg p-3 space-y-1 text-xs text-zinc-600 border'>
                  {boothCategory && (
                    <p><span className='font-medium'>Category:</span> {boothCategory}</p>
                  )}
                  {askingPrice && (
                    <p className='flex items-center gap-1'>
                      <span className='font-medium'>Asking Price:</span>
                      <DollarSign className='w-3 h-3' />
                      {askingPrice.toLocaleString()}
                    </p>
                  )}
                  {boothDescription && (
                    <p className='text-zinc-500 italic'>{boothDescription}</p>
                  )}
                </div>
              )}

              <div className='space-y-3'>
                <div className='space-y-1.5'>
                  <Label htmlFor='bid-name' className='text-xs'>Your Name *</Label>
                  <Input
                    id='bid-name'
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    placeholder='Business or full name'
                    className='h-9 text-sm'
                  />
                </div>

                <div className='space-y-1.5'>
                  <Label htmlFor='bid-email' className='text-xs'>Email *</Label>
                  <Input
                    id='bid-email'
                    type='email'
                    value={vendorEmail}
                    onChange={(e) => setVendorEmail(e.target.value)}
                    placeholder='you@example.com'
                    className='h-9 text-sm'
                  />
                </div>

                <div className='space-y-1.5'>
                  <Label htmlFor='bid-amount' className='text-xs'>Bid Amount ($) *</Label>
                  <Input
                    id='bid-amount'
                    type='number'
                    min={1}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={askingPrice ? String(askingPrice) : 'e.g. 500'}
                    className='h-9 text-sm'
                  />
                </div>

                <div className='space-y-1.5'>
                  <Label htmlFor='bid-message' className='text-xs'>Message (optional)</Label>
                  <Textarea
                    id='bid-message'
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder='Tell the organizer about your business...'
                    rows={2}
                    className='text-sm resize-none'
                  />
                </div>
              </div>

              <div className='flex gap-2 pt-1'>
                <Button variant='outline' className='flex-1' onClick={() => setSelectedBooth(null)}>
                  <X className='w-4 h-4' />
                  Cancel
                </Button>
                <Button
                  className='flex-1'
                  onClick={handleBidSubmit}
                  disabled={isSubmitting || !vendorName.trim() || !vendorEmail.trim() || !amount}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Bid'}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
