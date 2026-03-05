"use client"

import { useEffect, useRef, useState } from "react"
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
  Maximize,
  Undo2,
  Redo2,
  Globe,
  LinkIcon,
  EyeOff,
  Download,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Clock,
  Tag,
  Terminal,
  Server,
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { toPng } from "html-to-image"
import { EventCanvas } from "@/components/canvas/EventCanvas"
import { ElementToolbar } from "@/components/canvas/ElementToolbar"
import { AlignmentToolbar } from "@/components/canvas/AlignmentToolbar"
import { AISuggestionPanel } from "@/components/canvas/AISuggestionPanel"
import { VersionHistoryPanel } from "@/components/layout/VersionHistoryPanel"
import { BidsPanel } from "@/components/layout/BidsPanel"
import { ElementPropertiesPanel } from "@/components/canvas/ElementPropertiesPanel"
import { useCanvasStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
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
  const [currentEvent, setCurrentEvent] = useState(event)
  const [isPublic, setIsPublic] = useState(event.isPublic)
  const [shareToken, setShareToken] = useState(event.shareToken)
  const [isPublishing, setIsPublishing] = useState(false)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [expiresAt, setExpiresAt] = useState("")
  const [rightPanel, setRightPanel] = useState<"ai" | "history" | "bids">("ai")
  const [bids, setBids] = useState<{ id: string; boothId: string; status: string }[]>([])
  const [isExporting, setIsExporting] = useState(false)
  const [leftOpen, setLeftOpen] = useState(true)
  const [rightOpen, setRightOpen] = useState(true)
  const canvasBoardRef = useRef<HTMLDivElement>(null)

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

      toast.success("Event saved")
      setHasUnsavedChanges(false)
      fetch(`/api/events/${event.id}/versions`, { method: "POST" }).catch()
      router.refresh()
    } catch {
      toast.error("SYNC FAILED")
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async (expiry?: string) => {
    setIsPublishing(true)
    try {
      if (isPublic && shareToken) {
        await fetch(`/api/events/${event.id}/publish`, { method: "DELETE" })
        setIsPublic(false)
        setShareToken(null)
        toast.success("Event unpublished")
      } else {
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
        toast.success("Event published. Link copied to clipboard.")
        setShowPublishModal(false)
        setExpiresAt("")
      }
    } catch {
      toast.error("Failed to publish event")
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

  const handleExport = async () => {
    const node = canvasBoardRef.current
    if (!node) return
    setIsExporting(true)

    const savedTransform = node.style.transform
    const savedTransformOrigin = node.style.transformOrigin
    node.style.transform = "none"
    node.style.transformOrigin = "0 0"

    try {
      const dataUrl = await toPng(node, {
        width: 2000,
        height: 1500,
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        filter: (el) => (el as HTMLElement).dataset?.exportExclude !== "true",
      })
      const a = document.createElement("a")
      a.href = dataUrl
      a.download = `EVENT_LAYOUT_${event.id.substring(0, 6).toUpperCase()}.png`
      a.click()
    } catch {
      toast.error("Export failed")
    } finally {
      node.style.transform = savedTransform
      node.style.transformOrigin = savedTransformOrigin
      setIsExporting(false)
    }
  }

  const zoomPresets = [50, 75, 100, 125, 150]

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex h-screen flex-col overflow-hidden bg-[#f8f8f8] font-sans text-black selection:bg-black selection:text-white">
        {/* TOP STATUS BAR (OVERVIEW) */}
        <header className="z-20 flex h-12 shrink-0 items-center justify-between border-b border-black bg-white px-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="group flex h-8 w-8 items-center justify-center rounded-none border border-transparent transition-colors hover:border-black"
            >
              <ArrowLeft className="h-4 w-4 text-[#666] group-hover:text-black" />
            </Link>

            <div className="h-6 w-[1px] bg-[#d4d4d8]" />

            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <h1 className="text-sm leading-none font-bold tracking-tight uppercase">
                  {event.title}
                </h1>
                {event.eventType && (
                  <span className="border border-[#d4d4d8] px-1.5 py-0.5 text-[9px] leading-none tracking-widest text-[#666] uppercase">
                    {event.eventType}
                  </span>
                )}
                <span
                  className={`border px-1.5 py-0.5 text-[9px] leading-none tracking-widest uppercase transition-colors ${hasUnsavedChanges ? "border-[#ffb300] bg-[#fffdf0] text-[#ffb300]" : "border-transparent text-[#999]"}`}
                >
                  {hasUnsavedChanges ? "SAVING REQUIRED" : "SAVED"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isPublic && shareToken && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="h-8 rounded-none border-black px-3 font-mono text-[10px] tracking-widest uppercase hover:bg-[#f0f0f0]"
              >
                <LinkIcon className="mr-1.5 h-3.5 w-3.5" />
                COPY LINK
              </Button>
            )}

            <Button
              variant={isPublic ? "outline" : "outline"}
              size="sm"
              onClick={isPublic ? () => handlePublish() : () => setShowPublishModal(true)}
              disabled={isPublishing}
              className={`h-8 rounded-none border-black px-3 font-mono text-[10px] tracking-widest uppercase transition-colors ${
                isPublic
                  ? "border-[#009944] bg-[#009944] text-white hover:bg-[#00cc55]"
                  : "bg-white text-black hover:bg-[#f0f0f0]"
              }`}
            >
              {isPublic ? (
                <>
                  <Globe className="mr-1.5 h-3.5 w-3.5" />
                  {isPublishing ? "UNPUBLISHING..." : "PUBLISHED"}
                </>
              ) : (
                <>
                  <EyeOff className="mr-1.5 h-3.5 w-3.5" />
                  {isPublishing ? "PUBLISHING..." : "PUBLISH"}
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={isExporting}
              className="h-8 rounded-none border-black px-3 font-mono text-[10px] tracking-widest uppercase hover:bg-[#f0f0f0]"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              {isExporting ? "EXPORTING..." : "EXPORT PNG"}
            </Button>

            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="h-8 rounded-none border border-black bg-black px-4 font-mono text-[10px] tracking-widest text-white uppercase transition-colors hover:border-[#0055ff] hover:bg-[#0055ff]"
            >
              <Save className="mr-1.5 h-3.5 w-3.5" />
              {isSaving ? "SAVING..." : "SAVE LAYOUT"}
            </Button>
          </div>
        </header>

        {/* SUB-HEADER NAV (TOOLS / CANVAS CONTROLS) */}
        <div className="z-10 flex shrink-0 items-center justify-between border-b border-[#d4d4d8] bg-white px-4 py-1.5 font-mono text-xs">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={undo}
              disabled={past.length === 0}
              className="h-6 w-6 rounded-none hover:bg-[#f0f0f0]"
            >
              <Undo2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={redo}
              disabled={future.length === 0}
              className="h-6 w-6 rounded-none hover:bg-[#f0f0f0]"
            >
              <Redo2 className="h-3.5 w-3.5" />
            </Button>

            <div className="mx-2 h-4 w-[1px] bg-[#d4d4d8]" />

            <Button
              variant={showGrid ? "default" : "ghost"}
              size="icon-sm"
              onClick={() => setShowGrid(!showGrid)}
              className={`h-6 w-6 rounded-none ${showGrid ? "bg-black text-white hover:bg-[#333]" : "hover:bg-[#f0f0f0]"}`}
            >
              <Grid3X3 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => resetView()}
              className="h-6 w-6 rounded-none hover:bg-[#f0f0f0]"
            >
              <Maximize className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="flex items-center gap-0">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setScale(Math.max(0.5, scale - 0.1))}
              disabled={scale <= 0.5}
              className="h-6 w-6 rounded-none text-[#666] hover:bg-[#f0f0f0]"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <div className="flex h-6 items-center">
              {zoomPresets.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setScale(preset / 100)}
                  className={`h-full px-2 text-[10px] tracking-widest transition-colors ${
                    Math.round(scale * 100) === preset
                      ? "bg-black font-bold text-white"
                      : "text-[#666] hover:bg-[#f0f0f0]"
                  }`}
                >
                  {preset}%
                </button>
              ))}
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setScale(Math.min(2, scale + 0.1))}
              disabled={scale >= 2}
              className="h-6 w-6 rounded-none text-[#666] hover:bg-[#f0f0f0]"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-[10px] tracking-widest text-[#999] uppercase">
              OBJECTS: <span className="font-bold text-black">{elements.length}</span>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-6 w-6 rounded-none text-[#999] hover:bg-[#ffcccc] hover:text-[#cc0000]"
                  title="Clear Canvas"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-none border-2 border-black p-0 shadow-none">
                <div className="border-b border-black bg-[#cc0000] px-4 py-3 text-xs font-bold tracking-widest text-white uppercase">
                  Clear Canvas
                </div>
                <div className="p-6">
                  <AlertDialogDescription className="font-mono text-sm tracking-wide text-black uppercase">
                    Are you sure you want to delete {elements.length} elements from your layout?
                  </AlertDialogDescription>
                  <AlertDialogFooter className="mt-6 flex gap-4 sm:space-x-4">
                    <AlertDialogCancel className="mt-0 h-10 w-1/2 rounded-none border border-black font-mono text-xs tracking-widest uppercase">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={clearCanvas}
                      className="m-0 h-10 w-1/2 rounded-none border border-black bg-[#cc0000] font-mono text-xs tracking-widest text-white uppercase hover:bg-[red]"
                    >
                      Confirm Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* MAIN EDITOR AREA */}
        <div className="flex flex-1 overflow-hidden">
          {/* LEFT PANEL: TACTICAL ASSETS */}
          <div
            className={`relative shrink-0 border-r bg-white transition-[width] duration-200 ease-in-out ${leftOpen ? "w-64 border-black" : "border-r-dashed w-12 border-[#d4d4d8]"}`}
          >
            <button
              onClick={() => setLeftOpen((v) => !v)}
              className="absolute top-4 -right-3 z-10 flex h-6 w-6 items-center justify-center rounded-none border border-black bg-white shadow-none transition-colors hover:bg-black hover:text-white"
            >
              {leftOpen ? (
                <ChevronLeft className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </button>
            <div className="flex h-full flex-col overflow-hidden">
              {leftOpen && (
                <div className="flex h-10 shrink-0 items-center border-b border-[#d4d4d8] bg-[#f8f8f8] px-4">
                  <span className="font-mono text-[10px] font-bold tracking-widest text-[#666] uppercase">
                    Elements
                  </span>
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <ElementToolbar collapsed={!leftOpen} />
              </div>
            </div>
          </div>

          {/* CANVAS AREA */}
          <div className="relative flex-1 cursor-crosshair overflow-hidden bg-[#f0f0f0]">
            <AlignmentToolbar />
            <EventCanvas ref={canvasBoardRef} showGrid={showGrid} />

            {elements.length === 0 && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="max-w-sm border border-black bg-white p-6 shadow-[4px_4px_0_0_#000]">
                  <div className="mb-4 flex items-center gap-3 border-b border-black pb-3">
                    <Terminal className="h-5 w-5" />
                    <h3 className="font-mono text-sm font-bold tracking-widest uppercase">
                      EVENT CANVAS
                    </h3>
                  </div>
                  <p className="mb-6 font-mono text-xs leading-relaxed tracking-wider text-[#666] uppercase">
                    Drag elements from the side panel or generate an AI layout suggestion.
                  </p>
                  <div className="flex items-center justify-between border border-[#d4d4d8] bg-[#f4f4f5] p-2 font-mono text-[10px] tracking-widest text-black">
                    <span className="flex items-center gap-2">
                      <MousePointer2 className="h-3 w-3 text-[#0055ff]" /> DRAG_DROP
                    </span>
                    <span className="flex items-center gap-2">
                      <Hand className="h-3 w-3 text-[#009944]" /> SELECT
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT PANEL: TELEMETRY / HISTORY */}
          <div
            className={`relative z-10 shrink-0 border-l bg-white transition-[width] duration-200 ease-in-out ${rightOpen ? "w-[320px] border-black" : "border-l-dashed w-12 border-[#d4d4d8]"}`}
          >
            <button
              onClick={() => setRightOpen((v) => !v)}
              className="absolute top-4 -left-3 z-20 flex h-6 w-6 items-center justify-center rounded-none border border-black bg-white shadow-none transition-colors hover:bg-black hover:text-white"
            >
              {rightOpen ? (
                <ChevronRight className="h-3.5 w-3.5" />
              ) : (
                <ChevronLeft className="h-3.5 w-3.5" />
              )}
            </button>

            <div className="relative flex h-full flex-col overflow-hidden">
              {/* COLLAPSED TABS */}
              <div
                className={`absolute inset-0 flex flex-col items-center gap-2 py-4 transition-opacity duration-150 ${rightOpen ? "pointer-events-none opacity-0" : "opacity-100"}`}
              >
                {(
                  [
                    { id: "ai", icon: <Server className="h-4 w-4" />, label: "AI" },
                    { id: "history", icon: <Clock className="h-4 w-4" />, label: "HISTORY" },
                    {
                      id: "bids",
                      icon: <Tag className="h-4 w-4" />,
                      label: "BID",
                      pending: bids.filter((b) => b.status === "pending").length,
                    },
                  ] as const
                ).map((tab) => (
                  <Tooltip key={tab.id}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => {
                          setRightPanel(tab.id)
                          setRightOpen(true)
                        }}
                        className={`relative flex h-12 w-10 flex-col items-center justify-center gap-1 rounded-none border border-transparent transition-colors hover:border-black ${rightPanel === tab.id ? "bg-black text-white" : "text-[#666]"}`}
                      >
                        {tab.icon}
                        <span className="font-mono text-[8px] tracking-widest">{tab.label}</span>
                        {"pending" in tab && tab.pending > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-none border border-black bg-[#ffb300] text-[8px] font-bold text-black shadow-none">
                            {tab.pending}
                          </span>
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="left"
                      className="rounded-none border border-black font-mono text-[10px] uppercase"
                    >
                      {tab.label}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>

              {/* EXPANDED CONTENT */}
              <div
                className={`flex h-full w-[320px] flex-col bg-[#f8f8f8] transition-opacity duration-150 ${rightOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
              >
                {/* Top Active Element scanner */}
                <div className="shrink-0 bg-white">
                  {(() => {
                    const selectedEl = elements.find((e) => e.id === selectedElement)
                    if (!selectedEl)
                      return (
                        <div className="flex h-10 items-center border-b border-black bg-black px-4 text-white">
                          <span className="font-mono text-[10px] font-bold tracking-widest text-[#666] uppercase">
                            PROPERTIES : <span className="text-white">NONE SELECTED</span>
                          </span>
                        </div>
                      )
                    const props = (selectedEl.properties ?? {}) as Record<string, unknown>
                    const boothId = props.boothId as string | undefined
                    const bidCount = boothId ? bids.filter((b) => b.boothId === boothId).length : 0
                    return (
                      <>
                        <div className="flex h-10 items-center border-b border-black bg-[#0055ff] px-4 text-white">
                          <span className="font-mono text-[10px] font-bold tracking-widest uppercase">
                            PROPERTIES
                          </span>
                        </div>
                        <ElementPropertiesPanel elementId={selectedElement!} bidCount={bidCount} />
                      </>
                    )
                  })()}
                </div>

                {/* Tab navigation */}
                <div className="flex h-10 shrink-0 divide-x divide-black border-y border-black bg-white">
                  <button
                    onClick={() => setRightPanel("ai")}
                    className={`flex flex-1 items-center justify-center gap-1.5 font-mono text-[10px] tracking-widest uppercase transition-colors ${rightPanel === "ai" ? "bg-black font-bold text-white" : "text-[#666] hover:bg-[#f0f0f0]"}`}
                  >
                    <Server className="h-3.5 w-3.5" /> AI
                  </button>
                  <button
                    onClick={() => setRightPanel("history")}
                    className={`flex flex-1 items-center justify-center gap-1.5 font-mono text-[10px] tracking-widest uppercase transition-colors ${rightPanel === "history" ? "bg-black font-bold text-white" : "text-[#666] hover:bg-[#f0f0f0]"}`}
                  >
                    <Clock className="h-3.5 w-3.5" /> HISTORY
                  </button>
                  <button
                    onClick={() => setRightPanel("bids")}
                    className={`relative flex flex-1 items-center justify-center gap-1.5 font-mono text-[10px] tracking-widest uppercase transition-colors ${rightPanel === "bids" ? "bg-black font-bold text-white" : "text-[#666] hover:bg-[#f0f0f0]"}`}
                  >
                    <Tag className="h-3.5 w-3.5" /> BIDS
                    {bids.filter((b) => b.status === "pending").length > 0 && (
                      <span className="ml-1 bg-[#ffb300] px-1.5 py-0.5 text-[8px] leading-none font-bold text-black">
                        {bids.filter((b) => b.status === "pending").length}
                      </span>
                    )}
                  </button>
                </div>

                {/* Panel Content container */}
                <div className="flex-1 overflow-auto bg-white">
                  {rightPanel === "ai" ? (
                    <AISuggestionPanel
                      eventId={event.id}
                      eventData={{
                        title: event.title,
                        eventType: event.eventType || undefined,
                        capacity: event.capacity || undefined,
                        venue: event.venue || undefined,
                      }}
                      className="w-full rounded-none border-none shadow-none"
                    />
                  ) : rightPanel === "history" ? (
                    <VersionHistoryPanel eventId={event.id} />
                  ) : (
                    <BidsPanel eventId={event.id} onBidsLoaded={(loaded) => setBids(loaded)} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Publish Dialog */}
      <Dialog open={showPublishModal} onOpenChange={setShowPublishModal}>
        <DialogContent className="rounded-none border-2 border-black p-0 shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] sm:max-w-md">
          <div className="flex items-center justify-between border-b border-black bg-black px-5 py-4 text-white">
            <DialogTitle className="font-mono text-xs tracking-widest uppercase">
              Publish Event
            </DialogTitle>
            <Globe className="h-4 w-4 text-[#009944]" />
          </div>
          <div className="space-y-6 bg-white p-6">
            <p className="font-mono text-xs leading-relaxed tracking-widest text-[#666] uppercase">
              If published, authorized users will be able to view this event based on its public
              link.
            </p>
            <div className="space-y-2">
              <Label className="font-mono text-[10px] font-bold tracking-widest text-black uppercase">
                Expiration Date (Optional)
              </Label>
              <Input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
                className="h-10 rounded-none border-black font-mono text-sm shadow-none focus-visible:ring-1 focus-visible:ring-black"
              />
            </div>

            <DialogFooter className="mt-8 flex gap-4 border-t border-[#d4d4d8] pt-6">
              <Button
                variant="outline"
                onClick={() => setShowPublishModal(false)}
                className="h-10 w-full rounded-none border-black font-mono text-xs tracking-widest uppercase"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handlePublish(expiresAt || undefined)}
                disabled={isPublishing}
                className="h-10 w-full rounded-none border border-black font-mono text-xs tracking-widest uppercase shadow-[2px_2px_0_0_#000] transition-colors hover:bg-[#009944] hover:text-white"
              >
                {isPublishing ? "Publishing..." : "Publish & Copy Link"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
