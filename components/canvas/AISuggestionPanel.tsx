'use client'

import React, { useState } from 'react'
import { Sparkles, Loader2, Check, Lightbulb, LayoutGrid } from 'lucide-react'
import { useCanvasStore, CanvasElement } from '@/lib/store'
import { Button } from '@/components/ui/button'

const CANVAS_W = 2000
const CANVAS_H = 1500
const GAP = 12

function rectsOverlap(a: CanvasElement, b: CanvasElement): boolean {
  return !(
    a.x + a.width + GAP <= b.x ||
    b.x + b.width + GAP <= a.x ||
    a.y + a.height + GAP <= b.y ||
    b.y + b.height + GAP <= a.y
  )
}

function clampToCanvas(el: CanvasElement): CanvasElement {
  return {
    ...el,
    x: Math.max(20, Math.min(CANVAS_W - el.width - 20, el.x)),
    y: Math.max(20, Math.min(CANVAS_H - el.height - 20, el.y)),
  }
}

// Type priority: anchors placed first so they keep their AI positions
const TYPE_PRIORITY = ['stage', 'entrance', 'exit', 'registration', 'restroom', 'bar', 'booth', 'table', 'chair']

function resolveOverlaps(elements: CanvasElement[]): CanvasElement[] {
  const sorted = [...elements].sort(
    (a, b) => (TYPE_PRIORITY.indexOf(a.type) ?? 99) - (TYPE_PRIORITY.indexOf(b.type) ?? 99)
  )

  const placed: CanvasElement[] = []

  for (const el of sorted) {
    const clamped = clampToCanvas(el)

    if (!placed.some((p) => rectsOverlap(clamped, p))) {
      placed.push(clamped)
      continue
    }

    // Search for a free position in an expanding grid spiral
    const stepX = clamped.width + GAP
    const stepY = clamped.height + GAP
    let found = false

    outer: for (let ring = 1; ring <= 20; ring++) {
      for (let dx = -ring; dx <= ring; dx++) {
        for (let dy = -ring; dy <= ring; dy++) {
          // Only check the perimeter of the current ring
          if (Math.abs(dx) !== ring && Math.abs(dy) !== ring) continue

          const candidate = clampToCanvas({
            ...clamped,
            x: clamped.x + dx * stepX,
            y: clamped.y + dy * stepY,
          })

          if (!placed.some((p) => rectsOverlap(candidate, p))) {
            placed.push(candidate)
            found = true
            break outer
          }
        }
      }
    }

    if (!found) {
      // Last resort: place at end of canvas row
      placed.push(clamped)
    }
  }

  return placed
}

interface Props {
  eventId: string
  eventData: {
    title: string
    eventType?: string
    capacity?: number
    venue?: string
  }
}

interface AISuggestion {
  elements?: CanvasElement[]
  reasoning?: string
  alternatives?: string[]
}

export const AISuggestionPanel: React.FC<Props> = ({ eventId, eventData }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null)
  const { setElements, elements } = useCanvasStore()

  const generateSuggestion = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/layouts/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          eventType: eventData.eventType || 'conference',
          capacity: eventData.capacity || 100,
          venue: eventData.venue,
          existingElements: elements.map((el) => ({
            type: el.type,
            name: el.name,
          })),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to generate suggestion')
      }

      const data = await response.json()
      setSuggestion(data.suggestion)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const applySuggestion = async () => {
    if (suggestion?.elements) {
      const hasNoSavedElements = elements.length === 0

      const canvasWidth = 2000
      const canvasHeight = 1500

      const minX = Math.min(...suggestion.elements.map((el) => el.x))
      const minY = Math.min(...suggestion.elements.map((el) => el.y))
      const maxX = Math.max(...suggestion.elements.map((el) => el.x + el.width))
      const maxY = Math.max(...suggestion.elements.map((el) => el.y + el.height))

      const layoutWidth = maxX - minX
      const layoutHeight = maxY - minY

      const offsetX = (canvasWidth - layoutWidth) / 2 - minX
      const offsetY = (canvasHeight - layoutHeight) / 2 - minY

      const centered = suggestion.elements.map((el, index) => ({
        ...el,
        id: el.id || `ai-element-${Date.now()}-${index}`,
      }))

      const elementsWithIds = resolveOverlaps(centered)

      setElements(elementsWithIds)
      setSuggestion(null)

      if (hasNoSavedElements) {
        try {
          for (const element of elementsWithIds) {
            await fetch(`/api/events/${eventId}/elements`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(element),
            })
          }
        } catch (err) {
          console.error('Failed to auto-save layout:', err)
        }
      }
    }
  }

  return (
    <div className="w-72 bg-white border-l flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-zinc-900">AI Assistant</h2>
            <p className="text-xs text-zinc-500">Auto-generate layouts</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Event context */}
        <div className="mb-4 p-3 bg-zinc-50 rounded-lg">
          <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Event Details</h3>
          <div className="space-y-1 text-sm">
            <p className="text-zinc-700">
              <span className="text-zinc-500">Type:</span>{' '}
              <span className="capitalize">{eventData.eventType || 'Not specified'}</span>
            </p>
            <p className="text-zinc-700">
              <span className="text-zinc-500">Capacity:</span>{' '}
              {eventData.capacity ? `${eventData.capacity} guests` : 'Not specified'}
            </p>
          </div>
        </div>

        {/* Generate button */}
        <Button
          onClick={generateSuggestion}
          disabled={isLoading}
          className="w-full mb-4"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <LayoutGrid className="w-4 h-4" />
              Generate Layout
            </>
          )}
        </Button>

        {/* Error state */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Suggestion result */}
        {suggestion && (
          <div className="space-y-4">
            {/* Reasoning */}
            {suggestion.reasoning && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-amber-800">{suggestion.reasoning}</p>
                </div>
              </div>
            )}

            {/* Elements preview */}
            <div className="p-3 bg-zinc-50 rounded-lg">
              <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                Generated Elements
              </h4>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {suggestion.elements?.slice(0, 8).map((el, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-white border rounded text-xs text-zinc-600"
                  >
                    {el.name}
                  </span>
                ))}
                {(suggestion.elements?.length || 0) > 8 && (
                  <span className="px-2 py-1 bg-zinc-100 rounded text-xs text-zinc-500">
                    +{(suggestion.elements?.length || 0) - 8} more
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 mb-3">
                {suggestion.elements?.length || 0} elements total
              </p>
              <Button onClick={applySuggestion} className="w-full" size="sm">
                <Check className="w-4 h-4" />
                Apply Layout
              </Button>
            </div>

            {/* Alternatives */}
            {suggestion.alternatives && suggestion.alternatives.length > 0 && (
              <div className="p-3 bg-zinc-50 rounded-lg">
                <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                  Alternative Ideas
                </h4>
                <ul className="space-y-2">
                  {suggestion.alternatives.map((alt: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-zinc-600">
                      <span className="text-zinc-400">•</span>
                      {alt}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!suggestion && !isLoading && !error && (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-5 h-5 text-zinc-400" />
            </div>
            <p className="text-sm text-zinc-500 mb-1">No layout generated yet</p>
            <p className="text-xs text-zinc-400">
              Click the button above to generate a suggested layout based on your event details.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t bg-zinc-50">
        <p className="text-xs text-zinc-500 text-center">
          AI suggestions are starting points. Customize as needed.
        </p>
      </div>
    </div>
  )
}
