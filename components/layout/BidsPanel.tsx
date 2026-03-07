"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useCanvasStore } from "@/lib/store"
import { Gavel, Loader2, Check, X, DollarSign } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface Bid {
  id: string
  boothId: string
  vendorName: string
  vendorEmail: string
  amount: number
  message: string | null
  status: string
  createdAt: string
}

interface Props {
  eventId: string
  onBidsLoaded?: (bids: Bid[]) => void
}

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning",
  approved: "bg-success/10 text-success border-success",
  rejected: "bg-muted text-muted-foreground border-border",
}

export function BidsPanel({ eventId, onBidsLoaded }: Props) {
  const router = useRouter()
  const { elements } = useCanvasStore()
  const [bids, setBids] = useState<Bid[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actioningId, setActioningId] = useState<string | null>(null)

  const fetchBids = async () => {
    try {
      const res = await fetch(`/api/events/${eventId}/bids`)
      const data = await res.json()
      const loaded: Bid[] = data.bids ?? []
      setBids(loaded)
      onBidsLoaded?.(loaded)
    } catch {
      setBids([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBids()
  }, [eventId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAction = async (bidId: string, status: "approved" | "rejected") => {
    setActioningId(bidId)
    try {
      const res = await fetch(`/api/events/${eventId}/bids/${bidId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error("Failed to update bid")
      toast.success(status === "approved" ? "Bid approved" : "Bid rejected")
      await fetchBids()
      router.refresh()
    } catch {
      toast.error("Failed to update bid")
    } finally {
      setActioningId(null)
    }
  }

  const grouped = bids.reduce<Record<string, Bid[]>>((acc, bid) => {
    if (!acc[bid.boothId]) acc[bid.boothId] = []
    acc[bid.boothId].push(bid)
    return acc
  }, {})

  const getBoothName = (boothId: string) => {
    const el = elements.find(
      (e) => e.type === "booth" && (e.properties as Record<string, unknown>)?.boothId === boothId
    )
    return el?.name ?? boothId.slice(0, 8)
  }

  return (
    <>
      <div className="shrink-0 border-b border-border p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-none bg-foreground">
            <Gavel className="h-4 w-4 text-background" />
          </div>
          <div>
            <h2 className="font-mono text-xs font-bold tracking-widest text-foreground uppercase">
              Booth Bids
            </h2>
            <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
              Approve or reject vendor bids
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : bids.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-none border border-border bg-muted">
              <Gavel className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="mb-1 font-mono text-[10px] font-bold tracking-widest text-foreground uppercase">
              No bids yet
            </p>
            <p className="font-mono text-[9px] leading-relaxed tracking-widest text-muted-foreground uppercase">
              Vendors can submit bids from the public event page.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {Object.entries(grouped).map(([boothId, boothBids]) => (
              <div key={boothId} className="space-y-4 p-4">
                <div className="mb-3 flex items-center gap-1.5">
                  <span className="font-mono text-[10px] font-bold tracking-widest text-foreground uppercase">
                    {getBoothName(boothId)}
                  </span>
                  <span className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase">
                    {boothBids.length} bid{boothBids.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {boothBids.map((bid) => (
                  <div
                    key={bid.id}
                    className="space-y-3 rounded-none border border-border bg-muted/30 p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-mono text-[10px] font-bold tracking-widest text-foreground uppercase">
                          {bid.vendorName}
                        </p>
                        <p className="truncate font-mono text-[9px] tracking-widest text-muted-foreground lowercase">
                          {bid.vendorEmail}
                        </p>
                      </div>
                      <Badge
                        className={`shrink-0 rounded-none border font-mono text-[9px] tracking-widest uppercase ${statusColors[bid.status] ?? ""}`}
                      >
                        {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1 font-mono text-[10px] font-bold tracking-widest text-foreground">
                      <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                      {bid.amount.toLocaleString()}
                    </div>

                    {bid.message && (
                      <p className="font-mono text-[9px] leading-relaxed tracking-widest text-muted-foreground uppercase">
                        &ldquo;{bid.message}&rdquo;
                      </p>
                    )}

                    <p className="font-mono text-[8px] tracking-widest text-muted-foreground uppercase">
                      {format(new Date(bid.createdAt), "MMM d, h:mm a")}
                    </p>

                    {bid.status === "pending" && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          className="h-8 flex-1 rounded-none border border-success bg-success font-mono text-[9px] tracking-widest text-white uppercase shadow-none hover:bg-success/90"
                          disabled={actioningId === bid.id}
                          onClick={() => handleAction(bid.id, "approved")}
                        >
                          <Check className="mr-1.5 h-3 w-3" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="hover:text-destructive-foreground h-8 flex-1 rounded-none border-destructive font-mono text-[9px] tracking-widest text-destructive uppercase shadow-none hover:bg-destructive"
                          disabled={actioningId === bid.id}
                          onClick={() => handleAction(bid.id, "rejected")}
                        >
                          <X className="mr-1.5 h-3 w-3" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
