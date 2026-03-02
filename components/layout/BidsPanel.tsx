'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCanvasStore } from '@/lib/store'
import { Gavel, Loader2, Check, X, DollarSign } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

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
  pending:  'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-zinc-100 text-zinc-500 border-zinc-200',
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

  const handleAction = async (bidId: string, status: 'approved' | 'rejected') => {
    setActioningId(bidId)
    try {
      const res = await fetch(`/api/events/${eventId}/bids/${bidId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed to update bid')
      toast.success(status === 'approved' ? 'Bid approved' : 'Bid rejected')
      await fetchBids()
      router.refresh()
    } catch {
      toast.error('Failed to update bid')
    } finally {
      setActioningId(null)
    }
  }

  // Group bids by boothId
  const grouped = bids.reduce<Record<string, Bid[]>>((acc, bid) => {
    if (!acc[bid.boothId]) acc[bid.boothId] = []
    acc[bid.boothId].push(bid)
    return acc
  }, {})

  const getBoothName = (boothId: string) => {
    const el = elements.find(
      (e) => e.type === 'booth' && (e.properties as Record<string, unknown>)?.boothId === boothId
    )
    return el?.name ?? boothId.slice(0, 8)
  }

  return (
    <>
      {/* Header */}
      <div className="p-4 border-b shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center">
            <Gavel className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-zinc-900">Booth Bids</h2>
            <p className="text-xs text-zinc-500">Approve or reject vendor bids</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
          </div>
        ) : bids.length === 0 ? (
          <div className="text-center py-8 px-4">
            <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-3">
              <Gavel className="w-5 h-5 text-zinc-400" />
            </div>
            <p className="text-sm text-zinc-500 mb-1">No bids yet</p>
            <p className="text-xs text-zinc-400">
              Vendors can submit bids from the public event page.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {Object.entries(grouped).map(([boothId, boothBids]) => (
              <div key={boothId} className="p-4 space-y-2">
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">
                    {getBoothName(boothId)}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {boothBids.length} bid{boothBids.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {boothBids.map((bid) => (
                  <div
                    key={bid.id}
                    className="bg-zinc-50 rounded-lg border border-zinc-100 p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-900 truncate">
                          {bid.vendorName}
                        </p>
                        <p className="text-xs text-zinc-500 truncate">{bid.vendorEmail}</p>
                      </div>
                      <Badge className={`text-xs shrink-0 ${statusColors[bid.status] ?? ''}`}>
                        {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1 text-sm font-semibold text-zinc-900">
                      <DollarSign className="w-3.5 h-3.5 text-zinc-400" />
                      {bid.amount.toLocaleString()}
                    </div>

                    {bid.message && (
                      <p className="text-xs text-zinc-500 italic">&ldquo;{bid.message}&rdquo;</p>
                    )}

                    <p className="text-[10px] text-zinc-400">
                      {format(new Date(bid.createdAt), 'MMM d, h:mm a')}
                    </p>

                    {bid.status === 'pending' && (
                      <div className="flex gap-1.5 pt-1">
                        <Button
                          size="sm"
                          className="flex-1 h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
                          disabled={actioningId === bid.id}
                          onClick={() => handleAction(bid.id, 'approved')}
                        >
                          <Check className="w-3 h-3" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
                          disabled={actioningId === bid.id}
                          onClick={() => handleAction(bid.id, 'rejected')}
                        >
                          <X className="w-3 h-3" />
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
