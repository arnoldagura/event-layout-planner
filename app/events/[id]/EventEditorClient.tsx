"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { EventCanvas } from "@/components/canvas/EventCanvas"
import { ElementToolbar } from "@/components/canvas/ElementToolbar"
import { AlignmentToolbar } from "@/components/canvas/AlignmentToolbar"
import { AISuggestionPanel } from "@/components/canvas/AISuggestionPanel"
import { VersionHistoryPanel } from "@/components/layout/VersionHistoryPanel"
import { BidsPanel } from "@/components/layout/BidsPanel"
import { ElementPropertiesPanel } from "@/components/canvas/ElementPropertiesPanel"
import { useCanvasStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Event {
  id: string
  title: string
  description: string | null
  eventDate: Date
  venue: string | null
  capacity: number | null
  eventType: string | null
  isPublic: boolean
  shareToken: string | null
  elements: Array<{
    id: string
    type: string
    name: string
    x: number
    y: number
    width: number
    height: number
    rotation: number
    properties: unknown
  }>
}

interface Props {
  event: Event
}

export function EventEditorClient({ event }: Props) {
  const router = useRouter()
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
    selectedElement,
    copyElement,
    pasteElement,
    deleteSelectedElements,
  } = useCanvasStore()
  const [isSaving, setIsSaving] = useState(false)
  const [showGrid, setShowGrid] = useState(true)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentEvent, setCurrentEvent] = useState(event)
  const [isPublic, setIsPublic] = useState(event.isPublic)
  const [shareToken, setShareToken] = useState(event.shareToken)
  const [isPublishing, setIsPublishing] = useState(false)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [expiresAt, setExpiresAt] = useState("")
  const [rightPanel, setRightPanel] = useState<"ai" | "history" | "bids">("ai")
  const [bids, setBids] = useState<{ id: string; boothId: string; status: string }[]>([])
  useEffect(() => {
    if (event.elements) {
      setElements(
        event.elements.map((el) => ({
          ...el,
          properties: (el.properties as Record<string, unknown>) || {},
        })),
        true
      )
    }
  }, [event.elements, setElements])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault()
        if (e.shiftKey) {
          redo()
        } else {
          undo()
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault()
        redo()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        e.preventDefault()
        copyElement()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        e.preventDefault()
        pasteElement()
      }
      if ((e.key === "Delete" || e.key === "Backspace") && e.target === document.body) {
        e.preventDefault()
        deleteSelectedElements()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [undo, redo, copyElement, pasteElement, deleteSelectedElements])

  useEffect(() => {
    const currentIds = elements
      .map((e) => e.id)
      .sort()
      .join(",")
    const savedIds = event.elements
      .map((e) => e.id)
      .sort()
      .join(",")
    setHasUnsavedChanges(currentIds !== savedIds || elements.length !== event.elements.length)
  }, [elements, event.elements])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/events/${event.id}/elements`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ elements }),
      })

      if (!res.ok) throw new Error("Failed to save layout")

      toast.success("Layout saved successfully!")
      setHasUnsavedChanges(false)
      // Fire-and-forget version snapshot
      fetch(`/api/events/${event.id}/versions`, { method: "POST" }).catch((err) =>
        console.error("Version snapshot failed:", err)
      )
      router.refresh()
    } catch (error) {
      console.error("Failed to save layout:", error)
      toast.error("Failed to save layout")
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async (expiry?: string) => {
    setIsPublishing(true)
    try {
      if (isPublic && shareToken) {
        // Unpublish
        await fetch(`/api/events/${event.id}/publish`, { method: "DELETE" })
        setIsPublic(false)
        setShareToken(null)
        toast.success("Event unpublished")
      } else {
        // Publish
        const res = await fetch(`/api/events/${event.id}/publish`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ expiresAt: expiry || null }),
        })
        const data = await res.json()
        setIsPublic(true)
        setShareToken(data.shareToken)
        const url = `${window.location.origin}/e/${data.shareToken}`
        await navigator.clipboard.writeText(url)
        toast.success("Published! Link copied to clipboard.")
        setShowPublishModal(false)
        setExpiresAt("")
      }
    } catch {
      toast.error("Failed to update publish status")
    } finally {
      setIsPublishing(false)
    }
  }

  const handleCopyLink = async () => {
    if (!shareToken) return
    const url = `${window.location.origin}/e/${shareToken}`
    await navigator.clipboard.writeText(url)
    toast.success("Link copied to clipboard")
  }

  const zoomPresets = [50, 75, 100, 125, 150]

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-screen flex-col bg-zinc-100">
        <header className="flex h-14 shrink-0 items-center justify-between border-b bg-white px-4">
          <div className="flex items-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/dashboard"
                  className="rounded-md p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom">Back to Dashboard</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-semibold text-zinc-900">{event.title}</h1>
                  {event.eventType && (
                    <Badge variant="secondary" className="text-xs capitalize">
                      {event.eventType}
                    </Badge>
                  )}
                  {hasUnsavedChanges && (
                    <Badge
                      variant="outline"
                      className="border-amber-300 bg-amber-50 text-xs text-amber-600"
                    >
                      Unsaved
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  {event.eventDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(event.eventDate), "MMM d, yyyy")}
                    </span>
                  )}
                  {event.venue && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {event.venue}
                    </span>
                  )}
                  {event.capacity && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {event.capacity} guests
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isPublic && shareToken && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyLink}
                    className="text-zinc-500"
                  >
                    <LinkIcon className="h-4 w-4" />
                    Copy Link
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy public share link</TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isPublic ? "secondary" : "outline"}
                  size="sm"
                  onClick={isPublic ? () => handlePublish() : () => setShowPublishModal(true)}
                  disabled={isPublishing}
                  className={
                    isPublic
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      : ""
                  }
                >
                  {isPublic ? (
                    <>
                      <Globe className="h-4 w-4" />
                      {isPublishing ? "Unpublishing..." : "Published"}
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4" />
                      {isPublishing ? "Publishing..." : "Publish"}
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isPublic ? "Click to unpublish and revoke link" : "Generate a public share link"}
              </TooltipContent>
            </Tooltip>

            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save Layout"}
            </Button>
          </div>
        </header>

        <div className="flex shrink-0 items-center justify-between border-b bg-white px-4 py-2">
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" onClick={undo} disabled={past.length === 0}>
                  <Undo2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={redo}
                  disabled={future.length === 0}
                >
                  <Redo2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo (Ctrl+Shift+Z)</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="mx-1 h-5" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showGrid ? "secondary" : "ghost"}
                  size="icon-sm"
                  onClick={() => setShowGrid(!showGrid)}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle Grid</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" onClick={() => resetView()}>
                  <Maximize className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset View (100%)</TooltipContent>
            </Tooltip>
          </div>

          <div className="flex items-center gap-1 rounded-lg bg-zinc-100 p-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                  disabled={scale <= 0.5}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom Out</TooltipContent>
            </Tooltip>

            <div className="flex items-center gap-1 px-1">
              {zoomPresets.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setScale(preset / 100)}
                  className={`rounded px-2 py-1 text-xs transition-colors ${
                    Math.round(scale * 100) === preset
                      ? "bg-white font-medium text-zinc-900 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  {preset}%
                </button>
              ))}
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setScale(Math.min(2, scale + 0.1))}
                  disabled={scale >= 2}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom In</TooltipContent>
            </Tooltip>
          </div>

          <div className="flex items-center gap-1">
            <div className="mr-2 text-xs text-zinc-500">
              {elements.length} element{elements.length !== 1 ? "s" : ""}
            </div>

            <AlertDialog>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-zinc-500 hover:text-red-600"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                </TooltipTrigger>
                <TooltipContent>Clear Canvas</TooltipContent>
              </Tooltip>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear Canvas?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove all {elements.length} elements from your layout. You&apos;ll
                    need to save to make this permanent.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clearCanvas} className="bg-red-600 hover:bg-red-700">
                    Clear All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <ElementToolbar />
          <div className="relative flex-1 overflow-auto">
            <AlignmentToolbar />
            <EventCanvas showGrid={showGrid} />

            {elements.length === 0 && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="max-w-sm rounded-xl border bg-white/80 p-8 text-center shadow-sm backdrop-blur-sm">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
                    <Layers className="h-6 w-6 text-zinc-400" />
                  </div>
                  <h3 className="mb-2 font-semibold text-zinc-900">Start designing your layout</h3>
                  <p className="mb-4 text-sm text-zinc-500">
                    Drag elements from the left panel onto the canvas, or use AI to generate a
                    suggested layout.
                  </p>
                  <div className="flex items-center justify-center gap-4 text-xs text-zinc-400">
                    <span className="flex items-center gap-1">
                      <MousePointer2 className="h-3 w-3" />
                      Drag to add
                    </span>
                    <span className="flex items-center gap-1">
                      <Hand className="h-3 w-3" />
                      Click to select
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex w-72 flex-col border-l bg-white">
            {/* Element properties — shown when any element is selected */}
            {(() => {
              const selectedEl = elements.find((e) => e.id === selectedElement)
              if (!selectedEl) return null
              const props = (selectedEl.properties ?? {}) as Record<string, unknown>
              const boothId = props.boothId as string | undefined
              const bidCount = boothId ? bids.filter((b) => b.boothId === boothId).length : 0
              return <ElementPropertiesPanel elementId={selectedElement!} bidCount={bidCount} />
            })()}

            {/* Tab bar */}
            <div className="flex shrink-0 border-b">
              <button
                onClick={() => setRightPanel("ai")}
                className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors ${
                  rightPanel === "ai"
                    ? "border-b-2 border-zinc-900 text-zinc-900"
                    : "text-zinc-400 hover:text-zinc-600"
                }`}
              >
                AI
              </button>
              <button
                onClick={() => setRightPanel("history")}
                className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors ${
                  rightPanel === "history"
                    ? "border-b-2 border-zinc-900 text-zinc-900"
                    : "text-zinc-400 hover:text-zinc-600"
                }`}
              >
                History
              </button>
              <button
                onClick={() => setRightPanel("bids")}
                className={`relative flex-1 px-3 py-2.5 text-xs font-medium transition-colors ${
                  rightPanel === "bids"
                    ? "border-b-2 border-zinc-900 text-zinc-900"
                    : "text-zinc-400 hover:text-zinc-600"
                }`}
              >
                Bids
                {bids.filter((b) => b.status === "pending").length > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-[9px] text-white">
                    {bids.filter((b) => b.status === "pending").length}
                  </span>
                )}
              </button>
            </div>

            {rightPanel === "ai" ? (
              <AISuggestionPanel
                eventId={event.id}
                eventData={{
                  title: event.title,
                  eventType: event.eventType || undefined,
                  capacity: event.capacity || undefined,
                  venue: event.venue || undefined,
                }}
                className="w-full border-none"
              />
            ) : rightPanel === "history" ? (
              <VersionHistoryPanel eventId={event.id} />
            ) : (
              <BidsPanel eventId={event.id} onBidsLoaded={(loaded) => setBids(loaded)} />
            )}
          </div>
        </div>
      </div>
      {/* Publish modal */}
      <Dialog open={showPublishModal} onOpenChange={setShowPublishModal}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Publish Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-zinc-500">
              Anyone with the link can view this event's layout in read-only mode.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="expires-at">Link expires (optional)</Label>
              <Input
                id="expires-at"
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPublishModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => handlePublish(expiresAt || undefined)} disabled={isPublishing}>
              {isPublishing ? "Publishing..." : "Publish & Copy Link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
