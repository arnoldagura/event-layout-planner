'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  MousePointer2,
  Hand,
  Grid3X3,
  Layers,
  Calendar,
  MapPin,
  Users,
  Maximize,
  Trash2,
  Undo2,
  Redo2,
  Pencil,
  Globe,
  LinkIcon,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { EventCanvas } from '@/components/canvas/EventCanvas';
import { ElementToolbar } from '@/components/canvas/ElementToolbar';
import { AISuggestionPanel } from '@/components/canvas/AISuggestionPanel';
import { useCanvasStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Event {
  id: string;
  title: string;
  description: string | null;
  eventDate: Date;
  venue: string | null;
  capacity: number | null;
  eventType: string | null;
  isPublic: boolean;
  shareToken: string | null;
  elements: Array<{
    id: string;
    type: string;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    properties: unknown;
  }>;
}

interface Props {
  event: Event;
}

export function EventEditorClient({ event }: Props) {
  const router = useRouter();
  const {
    elements,
    setElements,
    scale,
    setScale,
    clearCanvas,
    resetView,
    undo,
    redo,
    past,
    future,
  } = useCanvasStore();
  const [isSaving, setIsSaving] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(event);
  const [isPublic, setIsPublic] = useState(event.isPublic);
  const [shareToken, setShareToken] = useState(event.shareToken);
  const [isPublishing, setIsPublishing] = useState(false);
  useEffect(() => {
    if (event.elements) {
      setElements(
        event.elements.map((el) => ({
          ...el,
          properties: (el.properties as Record<string, unknown>) || {},
        })),
        true
      );
    }
  }, [event.elements, setElements]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  useEffect(() => {
    const currentIds = elements
      .map((e) => e.id)
      .sort()
      .join(',');
    const savedIds = event.elements
      .map((e) => e.id)
      .sort()
      .join(',');
    setHasUnsavedChanges(
      currentIds !== savedIds || elements.length !== event.elements.length
    );
  }, [elements, event.elements]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      for (const element of elements) {
        const existingElement = event.elements.find((e) => e.id === element.id);

        if (existingElement) {
          await fetch(`/api/events/${event.id}/elements`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ elementId: element.id, ...element }),
          });
        } else {
          await fetch(`/api/events/${event.id}/elements`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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

      toast.success('Layout saved successfully!');
      setHasUnsavedChanges(false);
      router.refresh();
    } catch (error) {
      console.error('Failed to save layout:', error);
      toast.error('Failed to save layout');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      if (isPublic && shareToken) {
        // Unpublish
        await fetch(`/api/events/${event.id}/publish`, { method: 'DELETE' });
        setIsPublic(false);
        setShareToken(null);
        toast.success('Event unpublished');
      } else {
        // Publish
        const res = await fetch(`/api/events/${event.id}/publish`, { method: 'POST' });
        const data = await res.json();
        setIsPublic(true);
        setShareToken(data.shareToken);
        const url = `${window.location.origin}/e/${data.shareToken}`;
        await navigator.clipboard.writeText(url);
        toast.success('Published! Link copied to clipboard.');
      }
    } catch {
      toast.error('Failed to update publish status');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareToken) return;
    const url = `${window.location.origin}/e/${shareToken}`;
    await navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };

  const zoomPresets = [50, 75, 100, 125, 150];

  return (
    <TooltipProvider delayDuration={300}>
      <div className='h-screen flex flex-col bg-zinc-100'>
        <header className='bg-white border-b h-14 px-4 flex items-center justify-between shrink-0'>
          <div className='flex items-center gap-3'>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href='/dashboard'
                  className='p-2 rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors'
                >
                  <ArrowLeft className='w-5 h-5' />
                </Link>
              </TooltipTrigger>
              <TooltipContent side='bottom'>Back to Dashboard</TooltipContent>
            </Tooltip>

            <Separator orientation='vertical' className='h-6' />

            <div className='flex items-center gap-3'>
              <div>
                <div className='flex items-center gap-2'>
                  <h1 className='font-semibold text-zinc-900'>{event.title}</h1>
                  {event.eventType && (
                    <Badge variant='secondary' className='text-xs capitalize'>
                      {event.eventType}
                    </Badge>
                  )}
                  {hasUnsavedChanges && (
                    <Badge
                      variant='outline'
                      className='text-xs text-amber-600 border-amber-300 bg-amber-50'
                    >
                      Unsaved
                    </Badge>
                  )}
                </div>
                <div className='flex items-center gap-3 text-xs text-zinc-500'>
                  {event.eventDate && (
                    <span className='flex items-center gap-1'>
                      <Calendar className='w-3 h-3' />
                      {format(new Date(event.eventDate), 'MMM d, yyyy')}
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
                      {event.capacity} guests
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            {isPublic && shareToken && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={handleCopyLink}
                    className='text-zinc-500'
                  >
                    <LinkIcon className='w-4 h-4' />
                    Copy Link
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy public share link</TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isPublic ? 'secondary' : 'outline'}
                  size='sm'
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className={isPublic ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200' : ''}
                >
                  {isPublic ? (
                    <>
                      <Globe className='w-4 h-4' />
                      {isPublishing ? 'Unpublishing...' : 'Published'}
                    </>
                  ) : (
                    <>
                      <EyeOff className='w-4 h-4' />
                      {isPublishing ? 'Publishing...' : 'Publish'}
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isPublic ? 'Click to unpublish and revoke link' : 'Generate a public share link'}
              </TooltipContent>
            </Tooltip>

            <Button
              size='sm'
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className='w-4 h-4' />
              {isSaving ? 'Saving...' : 'Save Layout'}
            </Button>
          </div>
        </header>

        <div className='bg-white border-b px-4 py-2 flex items-center justify-between shrink-0'>
          <div className='flex items-center gap-1'>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon-sm'
                  onClick={undo}
                  disabled={past.length === 0}
                >
                  <Undo2 className='w-4 h-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon-sm'
                  onClick={redo}
                  disabled={future.length === 0}
                >
                  <Redo2 className='w-4 h-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo (Ctrl+Shift+Z)</TooltipContent>
            </Tooltip>

            <Separator orientation='vertical' className='h-5 mx-1' />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showGrid ? 'secondary' : 'ghost'}
                  size='icon-sm'
                  onClick={() => setShowGrid(!showGrid)}
                >
                  <Grid3X3 className='w-4 h-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle Grid</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon-sm'
                  onClick={resetView}
                >
                  <Maximize className='w-4 h-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset View (100%)</TooltipContent>
            </Tooltip>
          </div>

          <div className='flex items-center gap-1 bg-zinc-100 rounded-lg p-1'>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon-sm'
                  onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                  disabled={scale <= 0.5}
                >
                  <ZoomOut className='w-4 h-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom Out</TooltipContent>
            </Tooltip>

            <div className='flex items-center gap-1 px-1'>
              {zoomPresets.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setScale(preset / 100)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    Math.round(scale * 100) === preset
                      ? 'bg-white text-zinc-900 shadow-sm font-medium'
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  {preset}%
                </button>
              ))}
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon-sm'
                  onClick={() => setScale(Math.min(2, scale + 0.1))}
                  disabled={scale >= 2}
                >
                  <ZoomIn className='w-4 h-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom In</TooltipContent>
            </Tooltip>
          </div>

          <div className='flex items-center gap-1'>
            <div className='text-xs text-zinc-500 mr-2'>
              {elements.length} element{elements.length !== 1 ? 's' : ''}
            </div>

            <AlertDialog>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon-sm'
                      className='text-zinc-500 hover:text-red-600'
                    >
                      <RotateCcw className='w-4 h-4' />
                    </Button>
                  </AlertDialogTrigger>
                </TooltipTrigger>
                <TooltipContent>Clear Canvas</TooltipContent>
              </Tooltip>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear Canvas?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove all {elements.length} elements from your
                    layout. You&apos;ll need to save to make this permanent.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={clearCanvas}
                    className='bg-red-600 hover:bg-red-700'
                  >
                    Clear All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className='flex-1 flex overflow-hidden'>
          <ElementToolbar />
          <div className='flex-1 overflow-auto relative'>
            <EventCanvas showGrid={showGrid} />

            {elements.length === 0 && (
              <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
                <div className='text-center max-w-sm p-8 bg-white/80 backdrop-blur-sm rounded-xl border shadow-sm'>
                  <div className='w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-4'>
                    <Layers className='w-6 h-6 text-zinc-400' />
                  </div>
                  <h3 className='font-semibold text-zinc-900 mb-2'>
                    Start designing your layout
                  </h3>
                  <p className='text-sm text-zinc-500 mb-4'>
                    Drag elements from the left panel onto the canvas, or use AI
                    to generate a suggested layout.
                  </p>
                  <div className='flex items-center justify-center gap-4 text-xs text-zinc-400'>
                    <span className='flex items-center gap-1'>
                      <MousePointer2 className='w-3 h-3' />
                      Drag to add
                    </span>
                    <span className='flex items-center gap-1'>
                      <Hand className='w-3 h-3' />
                      Click to select
                    </span>
                  </div>
                </div>
              </div>
            )}
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
    </TooltipProvider>
  );
}
