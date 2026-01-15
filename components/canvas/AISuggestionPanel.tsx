'use client'

import React, { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { useCanvasStore, CanvasElement } from '@/lib/store'

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
      setElements(suggestion.elements)
      setSuggestion(null)

      if (hasNoSavedElements) {
        try {
          for (const element of suggestion.elements) {
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
    <div className="w-72 bg-white border-l border-slate-200 p-4 overflow-y-auto">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-slate-600" />
        <h2 className="text-sm font-medium text-slate-900">AI Assistant</h2>
      </div>

      <div className="space-y-3">
        <p className="text-xs text-slate-500">
          Generate a layout based on your event type and capacity.
        </p>

        <button
          onClick={generateSuggestion}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-slate-900 text-white rounded hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              Generate Layout
            </>
          )}
        </button>

        {error && (
          <div className="p-2 bg-red-50 rounded">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {suggestion && (
          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded">
              <p className="text-xs text-slate-600 mb-3">{suggestion.reasoning}</p>
              <button
                onClick={applySuggestion}
                className="w-full px-3 py-1.5 bg-slate-900 text-white text-xs rounded hover:bg-slate-800 transition-colors"
              >
                Apply Layout
              </button>
            </div>

            {suggestion.alternatives && suggestion.alternatives.length > 0 && (
              <div className="p-3 bg-slate-50 rounded">
                <h4 className="text-xs font-medium text-slate-700 mb-2">
                  Alternatives
                </h4>
                <ul className="space-y-1">
                  {suggestion.alternatives.map((alt: string, idx: number) => (
                    <li key={idx} className="text-xs text-slate-500">
                      • {alt}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-3 bg-slate-50 rounded">
              <h4 className="text-xs font-medium text-slate-700 mb-2">
                Elements ({suggestion.elements?.length || 0})
              </h4>
              <ul className="space-y-1 max-h-32 overflow-y-auto">
                {suggestion.elements?.map((el, idx) => (
                  <li key={idx} className="text-xs text-slate-500">
                    {el.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
