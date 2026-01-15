'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { EventCanvas } from '@/components/canvas/EventCanvas';
import { ElementToolbar } from '@/components/canvas/ElementToolbar';
import { AISuggestionPanel } from '@/components/canvas/AISuggestionPanel';
import { useCanvasStore } from '@/lib/store';

interface Event {
  id: string;
  title: string;
  description: string | null;
  eventDate: Date;
  venue: string | null;
  capacity: number | null;
  eventType: string | null;
  elements: Array<{
    id: string;
    type: string;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    properties: Record<string, unknown> | null;
  }>;
}

interface Props {
  event: Event;
}

export function EventEditorClient({ event }: Props) {
  const router = useRouter();
  const { elements, setElements, scale, setScale, clearCanvas } = useCanvasStore();

  useEffect(() => {
    if (event.elements) {
      setElements(
        event.elements.map((el) => ({
          ...el,
          properties: el.properties || {},
        }))
      );
    }
  }, [event.elements, setElements]);

  const handleSave = async () => {
    try {
      for (const element of elements) {
        const existingElement = event.elements.find((e) => e.id === element.id);

        if (existingElement) {
          await fetch(`/api/events/${event.id}/elements`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              elementId: element.id,
              ...element,
            }),
          });
        } else {
          await fetch(`/api/events/${event.id}/elements`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(element),
          });
        }
      }

      const deletedElements = event.elements.filter(
        (e) => !elements.find((el) => el.id === e.id)
      );

      for (const element of deletedElements) {
        await fetch(
          `/api/events/${event.id}/elements?elementId=${element.id}`,
          {
            method: 'DELETE',
          }
        );
      }

      alert('Layout saved successfully!');
      router.refresh();
    } catch (error) {
      console.error('Failed to save layout:', error);
      alert('Failed to save layout');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-100">
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-semibold text-slate-900">{event.title}</h1>
            {event.venue && (
              <p className="text-xs text-slate-500">{event.venue}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 border border-slate-200 rounded px-1">
            <button
              onClick={() => setScale(Math.max(0.5, scale - 0.1))}
              className="p-1.5 text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-600 w-10 text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale(Math.min(2, scale + 0.1))}
              className="p-1.5 text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              if (confirm('Clear all elements from the canvas?')) {
                clearCanvas();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 border border-slate-200 rounded hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            Save
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <ElementToolbar />
        <div className="flex-1 overflow-auto">
          <EventCanvas />
        </div>
        <AISuggestionPanel
          eventId={event.id}
          eventData={{
            title: event.title,
            eventType: event.eventType || undefined,
            capacity: event.capacity || undefined,
            venue: event.venue || undefined,
          }}
        />
      </div>
    </div>
  );
}
