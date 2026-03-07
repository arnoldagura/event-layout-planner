"use client"

import React, { useState } from "react"
import { Sparkles, Loader2, Check, Lightbulb, LayoutGrid } from "lucide-react"
import { useCanvasStore, CanvasElement } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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

const TYPE_PRIORITY = [
  "stage",
  "entrance",
  "exit",
  "registration",
  "restroom",
  "bar",
  "booth",
  "table",
  "chair",
]

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

    const stepX = clamped.width + GAP
    const stepY = clamped.height + GAP
    let found = false

    outer: for (let ring = 1; ring <= 20; ring++) {
      for (let dx = -ring; dx <= ring; dx++) {
        for (let dy = -ring; dy <= ring; dy++) {
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
  className?: string
}

interface AISuggestion {
  elements?: CanvasElement[]
  reasoning?: string
  alternatives?: string[]
}

export const AISuggestionPanel: React.FC<Props> = ({ eventId, eventData, className }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null)
  const { setElements, elements } = useCanvasStore()

  const generateSuggestion = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/layouts/suggest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId,
          eventType: eventData.eventType || "conference",
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
        throw new Error(data.error || "Failed to generate suggestion")
      }

      const data = await response.json()
      setSuggestion(data.suggestion)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
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
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(element),
            })
          }
        } catch (err) {
          console.error("Failed to auto-save layout:", err)
        }
      }
    }
  }

  return (
    <div className={cn("flex w-72 flex-col border-l border-border bg-card", className)}>
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-none bg-foreground">
            <Sparkles className="h-4 w-4 text-background" />
          </div>
          <div>
            <h2 className="font-mono text-xs font-bold tracking-widest text-foreground uppercase">
              AI Assistant
            </h2>
            <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
              Auto-generate layouts
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4 rounded-none bg-muted p-3">
          <h3 className="mb-2 font-mono text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
            Event Details
          </h3>
          <div className="space-y-1 font-mono text-[10px] tracking-widest uppercase">
            <p className="text-foreground">
              <span className="text-muted-foreground">Type:</span>{" "}
              <span>{eventData.eventType || "Not specified"}</span>
            </p>
            <p className="text-foreground">
              <span className="text-muted-foreground">Capacity:</span>{" "}
              {eventData.capacity ? `${eventData.capacity} guests` : "Not specified"}
            </p>
          </div>
        </div>

        <Button
          onClick={generateSuggestion}
          disabled={isLoading}
          className="mb-4 w-full rounded-none border border-foreground font-mono text-xs tracking-widest uppercase shadow-none transition-colors"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <LayoutGrid className="mr-2 h-4 w-4" />
              Generate Layout
            </>
          )}
        </Button>

        {error && (
          <div className="mb-4 rounded-none border border-destructive bg-destructive/10 p-3 text-destructive">
            <p className="font-mono text-[10px] font-bold tracking-widest uppercase">{error}</p>
          </div>
        )}

        {suggestion && (
          <div className="space-y-4">
            {suggestion.reasoning && (
              <div className="rounded-none border border-warning bg-warning/10 p-3">
                <div className="flex items-start gap-2">
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                  <p className="text-warning-foreground font-mono text-[10px] tracking-widest uppercase">
                    {suggestion.reasoning}
                  </p>
                </div>
              </div>
            )}

            <div className="rounded-none bg-muted p-3">
              <h4 className="mb-2 font-mono text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                Generated Elements
              </h4>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {suggestion.elements?.slice(0, 8).map((el, idx) => (
                  <span
                    key={idx}
                    className="rounded-none border border-border bg-background px-2 py-1 font-mono text-[9px] tracking-widest text-foreground uppercase"
                  >
                    {el.name}
                  </span>
                ))}
                {(suggestion.elements?.length || 0) > 8 && (
                  <span className="rounded-none border border-border bg-muted-foreground/10 px-2 py-1 font-mono text-[9px] tracking-widest text-muted-foreground uppercase">
                    +{(suggestion.elements?.length || 0) - 8} more
                  </span>
                )}
              </div>
              <p className="mb-3 font-mono text-[9px] tracking-widest text-muted-foreground uppercase">
                {suggestion.elements?.length || 0} elements total
              </p>
              <Button
                onClick={applySuggestion}
                className="w-full rounded-none border border-foreground font-mono text-xs tracking-widest shadow-none"
                size="sm"
              >
                <Check className="mr-2 h-4 w-4" />
                Apply Layout
              </Button>
            </div>

            {suggestion.alternatives && suggestion.alternatives.length > 0 && (
              <div className="rounded-none border border-border bg-background p-3">
                <h4 className="mb-2 font-mono text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                  Alternative Ideas
                </h4>
                <ul className="space-y-2">
                  {suggestion.alternatives.map((alt: string, idx: number) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 font-mono text-[9px] leading-relaxed tracking-widest text-foreground uppercase"
                    >
                      <span className="font-bold text-muted-foreground">•</span>
                      {alt}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {!suggestion && !isLoading && !error && (
          <div className="py-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-none border border-border bg-muted">
              <Sparkles className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="mb-1 font-mono text-[10px] font-bold tracking-widest text-foreground uppercase">
              No layout generated yet
            </p>
            <p className="font-mono text-[9px] leading-relaxed tracking-widest text-muted-foreground uppercase">
              Click the button above to generate a suggested layout based on your event details.
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-border bg-muted p-3">
        <p className="text-center font-mono text-[9px] leading-relaxed tracking-widest text-muted-foreground uppercase">
          AI suggestions are starting points. Customize as needed.
        </p>
      </div>
    </div>
  )
}
