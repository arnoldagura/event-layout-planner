'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Calendar, MapPin, Users, Layers, DollarSign, X } from 'lucide-react'
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

  const [vendorName, setVendorName] = useState('')
  const [vendorEmail, setVendorEmail] = useState('')
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleBoothClick = (element: CanvasElement) => {
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

  return (
    <div className='h-screen flex flex-col bg-zinc-100'>
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
              Green-outlined booths are available for rent. Click a booth on the map or use
              the &ldquo;Bid&rdquo; button in search results to submit a bid.
            </p>
          </div>
        </aside>

        <div className='flex-1 overflow-hidden'>
          <PublicEventCanvas
            elements={event.elements}
            highlightedId={highlightedId}
            onBoothClick={handleBoothClick}
          />
        </div>
      </div>

      <Dialog open={!!selectedBooth} onOpenChange={(open) => !open && setSelectedBooth(null)}>
        <DialogContent className='sm:max-w-sm'>
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
                className='h-8 text-sm'
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
                className='h-8 text-sm'
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
                className='h-8 text-sm'
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
