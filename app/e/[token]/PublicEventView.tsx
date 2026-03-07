"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Calendar, MapPin, Users, DollarSign, X, Search, ChevronDown } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/ThemeToggle"
import { PublicEventCanvas } from "@/components/canvas/PublicEventCanvas"
import { BoothSearch } from "@/components/public/BoothSearch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"

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

  const [vendorName, setVendorName] = useState("")
  const [vendorEmail, setVendorEmail] = useState("")
  const [amount, setAmount] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleBoothClick = (element: CanvasElement) => {
    setShowMobilePanel(false) // close search panel when a booth is tapped
    setSelectedBooth(element)
    setVendorName("")
    setVendorEmail("")
    setAmount("")
    setMessage("")
  }

  const handleBidSubmit = async () => {
    if (!selectedBooth) return
    const props = (selectedBooth.properties ?? {}) as Record<string, unknown>
    const boothId = props.boothId as string | undefined
    if (!boothId) return

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/public/events/${shareToken}/booths/${boothId}/bids`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorName, vendorEmail, amount: Number(amount), message }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to submit bid")
      toast.success("Bid submitted successfully!")
      setSelectedBooth(null)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to submit bid")
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedBoothProps = (selectedBooth?.properties ?? {}) as Record<string, unknown>
  const askingPrice = selectedBoothProps.askingPrice as number | undefined
  const boothCategory = selectedBoothProps.category as string | undefined
  const boothDescription = selectedBoothProps.description as string | undefined
  const boothIsForRent = Boolean(selectedBoothProps.forRent)
  const boothIsRented = selectedBoothProps.status === "rented"

  // Sidebar content — rendered in both desktop aside and mobile bottom sheet
  const sidebarContent = (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="mb-1 text-sm font-semibold text-foreground">Find on Layout</h2>
        <p className="mb-3 text-xs text-muted-foreground">
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
        <div className="border-t border-border pt-4">
          <h2 className="mb-1 text-sm font-semibold text-foreground">About this Event</h2>
          <p className="text-xs leading-relaxed text-muted-foreground">{event.description}</p>
        </div>
      )}

      <div className="border-t border-border pt-4">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Green-outlined booths are available for rent. Tap a booth on the map or use the
          &ldquo;Bid&rdquo; button in search results to submit a bid.
        </p>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* ── Header ── */}
      <header className="z-10 shrink-0 border-b border-border bg-card px-4 py-2.5">
        <div className="mx-auto flex max-w-screen-xl items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="max-w-[55vw] truncate text-base font-semibold sm:max-w-none sm:text-lg">
                {event.title}
              </h1>
              {event.eventType && (
                <span className="shrink-0 rounded-none border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground uppercase tracking-widest font-mono">
                  {event.eventType}
                </span>
              )}
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {event.eventDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 shrink-0" />
                  {format(new Date(event.eventDate), "MMM d, yyyy")}
                  {event.startTime && ` · ${event.startTime}`}
                  {event.endTime && ` – ${event.endTime}`}
                </span>
              )}
              {event.venue && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="max-w-[40vw] truncate sm:max-w-none">{event.venue}</span>
                </span>
              )}
              {event.capacity && (
                <span className="hidden items-center gap-1 sm:flex">
                  <Users className="h-3 w-3" />
                  {event.capacity} capacity
                </span>
              )}
            </div>
          </div>

          <div className="mt-0.5 flex shrink-0 items-center gap-2">
            <ThemeToggle />
            <button
              className="flex items-center gap-1.5 rounded-none bg-muted px-3 py-1.5 text-xs font-mono tracking-widest uppercase font-medium text-foreground transition-colors hover:bg-muted/80 md:hidden border border-border"
              onClick={() => setShowMobilePanel((v) => !v)}
            >
              <Search className="h-3.5 w-3.5" />
              Search
            </button>
          </div>
        </div>
      </header>

      <div className="relative flex flex-1 overflow-hidden">
        {/* ── Desktop sidebar ── */}
        <aside className="hidden w-72 shrink-0 flex-col overflow-y-auto border-r border-border bg-card p-4 md:flex">
          {sidebarContent}
        </aside>

        {/* ── Canvas ── */}
        <div className="flex-1 overflow-hidden">
          <PublicEventCanvas
            elements={event.elements}
            highlightedId={highlightedId}
            onBoothClick={handleBoothClick}
          />
        </div>

        {/* ── Mobile backdrop ── */}
        {showMobilePanel && (
          <div
            className="fixed inset-0 z-20 bg-background/80 backdrop-blur-sm md:hidden"
            onClick={() => setShowMobilePanel(false)}
          />
        )}

        {/* ── Mobile bottom sheet ── */}
        <div
          className={`fixed inset-x-0 bottom-0 z-30 transform rounded-none border-t border-border bg-card shadow-lg transition-transform duration-300 ease-in-out md:hidden ${showMobilePanel ? "translate-y-0" : "translate-y-full"
            }`}
          style={{ maxHeight: "72vh" }}
        >
          {/* Drag handle + close */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-border bg-muted">
            <span className="text-sm font-mono tracking-widest uppercase font-semibold">Search & Info</span>
            <button
              onClick={() => setShowMobilePanel(false)}
              className="rounded-none p-1 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            >
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>
          <div className="overflow-y-auto px-4 pt-4 pb-8 bg-background" style={{ maxHeight: "calc(72vh - 52px)" }}>
            {sidebarContent}
          </div>
        </div>
      </div>

      {/* ── Bid Dialog ── */}
      <Dialog open={!!selectedBooth} onOpenChange={(open) => !open && setSelectedBooth(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-sm rounded-none border-2 border-border shadow-lg bg-card">
          <DialogHeader className="border-b border-border pb-2 bg-muted px-4 pt-4 -mx-6 -mt-6 mb-4">
            <DialogTitle className="font-mono text-sm uppercase tracking-widest">{selectedBooth?.name}</DialogTitle>
          </DialogHeader>

          {selectedBooth && !boothIsForRent && (
            <div className="space-y-4 py-2 text-center">
              <p className="text-xs font-mono tracking-widest uppercase text-muted-foreground">Booth Not Available</p>
              <Button variant="outline" className="w-full rounded-none font-mono tracking-widest uppercase" onClick={() => setSelectedBooth(null)}>
                Close
              </Button>
            </div>
          )}

          {selectedBooth && boothIsForRent && boothIsRented && (
            <div className="space-y-4 py-2 text-center">
              <p className="text-xs font-mono tracking-widest uppercase text-muted-foreground">Booth Rented Out</p>
              <Button variant="outline" className="w-full rounded-none font-mono tracking-widest uppercase" onClick={() => setSelectedBooth(null)}>
                Close
              </Button>
            </div>
          )}

          {selectedBooth && boothIsForRent && !boothIsRented && (
            <>
              {(boothCategory || askingPrice || boothDescription) && (
                <div className="space-y-2 rounded-none border border-border bg-muted p-4 text-xs font-mono text-muted-foreground uppercase tracking-widest">
                  {boothCategory && (
                    <p>
                      <span className="font-bold text-foreground">CAT:</span> {boothCategory}
                    </p>
                  )}
                  {askingPrice && (
                    <p className="flex items-center gap-1">
                      <span className="font-bold text-foreground">ASKING:</span>
                      ${askingPrice.toLocaleString()}
                    </p>
                  )}
                  {boothDescription && <p className="text-muted-foreground mt-2 border-t border-border pt-2 leading-relaxed normal-case tracking-normal font-sans">{boothDescription}</p>}
                </div>
              )}

              <div className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="bid-name" className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                    Vendor Identity *
                  </Label>
                  <Input
                    id="bid-name"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    placeholder="ENTER VENDOR NAME..."
                    className="h-10 text-sm rounded-none border-border focus-visible:ring-1 focus-visible:ring-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="bid-email" className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                    Comms Uplink (Email) *
                  </Label>
                  <Input
                    id="bid-email"
                    type="email"
                    value={vendorEmail}
                    onChange={(e) => setVendorEmail(e.target.value)}
                    placeholder="SYSTEM.OPERATOR@GMAIL.COM"
                    className="h-10 text-sm rounded-none border-border focus-visible:ring-1 focus-visible:ring-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="bid-amount" className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                    Proposal Value ($) *
                  </Label>
                  <Input
                    id="bid-amount"
                    type="number"
                    min={1}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={askingPrice ? String(askingPrice) : "0"}
                    className="h-10 text-sm rounded-none border-border focus-visible:ring-1 focus-visible:ring-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="bid-message" className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                    Auxiliary Data (Optional)
                  </Label>
                  <Textarea
                    id="bid-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="INPUT ADDITIONAL PARAMETERS..."
                    rows={2}
                    className="resize-none text-sm rounded-none border-border focus-visible:ring-1 focus-visible:ring-foreground"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 mt-2 border-t border-border">
                <Button variant="outline" className="flex-1 rounded-none font-mono tracking-widest uppercase text-xs h-10 border-border hover:bg-muted" onClick={() => setSelectedBooth(null)}>
                  ABORT
                </Button>
                <Button
                  className="flex-1 rounded-none font-mono tracking-widest uppercase text-xs h-10 bg-foreground text-background hover:bg-foreground/90"
                  onClick={handleBidSubmit}
                  disabled={isSubmitting || !vendorName.trim() || !vendorEmail.trim() || !amount}
                >
                  {isSubmitting ? "TRANSMITTING..." : "AUTHORIZE BID"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
