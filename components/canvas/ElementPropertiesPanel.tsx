'use client'

import { useEffect, useState } from 'react'
import { Store } from 'lucide-react'
import { useCanvasStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

interface Props {
  elementId: string
  bidCount: number
}

export function ElementPropertiesPanel({ elementId, bidCount }: Props) {
  const { elements, updateElement } = useCanvasStore()
  const element = elements.find((e) => e.id === elementId)

  const props = (element?.properties ?? {}) as Record<string, unknown>

  const [forRent, setForRent] = useState(Boolean(props.forRent))
  const [askingPrice, setAskingPrice] = useState(String(props.askingPrice ?? ''))
  const [category, setCategory] = useState(String(props.category ?? ''))
  const [description, setDescription] = useState(String(props.description ?? ''))

  // Sync local state when element changes
  useEffect(() => {
    if (!element) return
    const p = (element.properties ?? {}) as Record<string, unknown>

    // Auto-generate boothId if missing
    if (!p.boothId) {
      updateElement(elementId, {
        properties: { ...p, boothId: crypto.randomUUID() },
      })
    }

    setForRent(Boolean(p.forRent))
    setAskingPrice(String(p.askingPrice ?? ''))
    setCategory(String(p.category ?? ''))
    setDescription(String(p.description ?? ''))
  }, [elementId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!element) return null

  const rentStatus = String(props.status ?? 'available')

  const handleSave = () => {
    const existing = (element.properties ?? {}) as Record<string, unknown>
    updateElement(elementId, {
      properties: {
        ...existing,
        forRent,
        askingPrice: forRent && askingPrice ? Number(askingPrice) : undefined,
        category: category.trim() || undefined,
        description: description.trim() || undefined,
        status: existing.status ?? (forRent ? 'available' : undefined),
      },
    })
  }

  const statusColor =
    rentStatus === 'rented'
      ? 'text-zinc-500 bg-zinc-100 border-zinc-200'
      : rentStatus === 'pending'
      ? 'text-amber-700 bg-amber-50 border-amber-200'
      : 'text-emerald-700 bg-emerald-50 border-emerald-200'

  return (
    <div className="border-b bg-zinc-50 shrink-0">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b bg-white">
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-zinc-500" />
          <span className="text-sm font-medium text-zinc-900">Booth Properties</span>
        </div>
        <div className="flex items-center gap-2">
          {forRent && (
            <Badge className={`text-xs ${statusColor}`}>
              {rentStatus.charAt(0).toUpperCase() + rentStatus.slice(1)}
            </Badge>
          )}
          {bidCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {bidCount} bid{bidCount !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </div>

      {/* Fields */}
      <div className="p-3 space-y-3">
        {/* For Rent toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor={`for-rent-${elementId}`} className="text-xs font-medium text-zinc-700">
            For Rent
          </Label>
          <button
            id={`for-rent-${elementId}`}
            role="switch"
            aria-checked={forRent}
            onClick={() => setForRent(!forRent)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
              forRent ? 'bg-zinc-900' : 'bg-zinc-300'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                forRent ? 'translate-x-4' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {forRent && (
          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-600">Asking Price ($)</Label>
            <Input
              type="number"
              min={0}
              value={askingPrice}
              onChange={(e) => setAskingPrice(e.target.value)}
              placeholder="e.g. 500"
              className="h-7 text-xs"
            />
          </div>
        )}

        <div className="space-y-1.5">
          <Label className="text-xs text-zinc-600">Category</Label>
          <Input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Technology, Food"
            className="h-7 text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-zinc-600">Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Booth details..."
            rows={2}
            className="text-xs resize-none"
          />
        </div>

        <Button size="sm" className="w-full h-7 text-xs" onClick={handleSave}>
          Apply to Canvas
        </Button>
        <p className="text-[10px] text-zinc-400 text-center">
          Changes persist on next &ldquo;Save Layout&rdquo;
        </p>
      </div>
    </div>
  )
}
