"use client"

import React, { useState, useRef } from "react"
import { useCanvasStore, type CanvasElement as CanvasElementType } from "@/lib/store"
import { cn } from "@/lib/utils"
import {
  Presentation,
  Armchair,
  Store,
  DoorOpen,
  DoorClosed,
  Wine,
  ClipboardList,
  Lock,
} from "lucide-react"
import { FaRestroom } from "react-icons/fa"
import { MdTableRestaurant } from "react-icons/md"

interface Props {
  element: CanvasElementType
}

type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w"

const HANDLE_CURSORS: Record<ResizeHandle, string> = {
  nw: "nw-resize",
  n: "n-resize",
  ne: "ne-resize",
  e: "e-resize",
  se: "se-resize",
  s: "s-resize",
  sw: "sw-resize",
  w: "w-resize",
}

const ALL_HANDLES: ResizeHandle[] = ["nw", "n", "ne", "e", "se", "s", "sw", "w"]

type LucideIcon = React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>

const elementConfig: Record<
  string,
  { background: string; borderRadius: string; textColor: string; Icon: LucideIcon | null }
> = {
  stage: {
    background: "#3b82f6",
    borderRadius: "12px",
    textColor: "text-white",
    Icon: Presentation,
  },
  table: {
    background: "#f59e0b",
    borderRadius: "12px",
    textColor: "text-white",
    Icon: MdTableRestaurant,
  },
  chair: { background: "#71717a", borderRadius: "12px", textColor: "text-white", Icon: Armchair },
  booth: { background: "#0d9488", borderRadius: "12px", textColor: "text-white", Icon: Store },
  entrance: {
    background: "#22c55e",
    borderRadius: "12px",
    textColor: "text-white",
    Icon: DoorOpen,
  },
  exit: { background: "#ef4444", borderRadius: "12px", textColor: "text-white", Icon: DoorClosed },
  restroom: {
    background: "#475569",
    borderRadius: "12px",
    textColor: "text-white",
    Icon: FaRestroom,
  },
  bar: { background: "#f97316", borderRadius: "12px", textColor: "text-white", Icon: Wine },
  registration: {
    background: "#06b6d4",
    borderRadius: "12px",
    textColor: "text-white",
    Icon: ClipboardList,
  },
}

function iconSize(w: number, h: number): number {
  const min = Math.min(w, h)
  if (min < 30) return 10
  if (min < 42) return 13
  if (min < 56) return 15
  if (min < 72) return 17
  return 20
}

const GRID = 20
const SNAP_THRESHOLD = 8 // canvas px — snap guides kick in within this distance

// Compute position for each resize handle
function handleStyle(h: ResizeHandle): React.CSSProperties {
  const base: React.CSSProperties = {
    position: "absolute",
    width: 8,
    height: 8,
    background: "white",
    border: "1.5px solid #27272a",
    borderRadius: 2,
    boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
    cursor: HANDLE_CURSORS[h],
    zIndex: 10,
  }
  if (h.includes("n")) base.top = -4
  if (h.includes("s")) base.bottom = -4
  if (h.includes("e")) base.right = -4
  if (h.includes("w")) base.left = -4
  if (h === "n" || h === "s") {
    base.left = "50%"
    base.transform = "translateX(-50%)"
  }
  if (h === "e" || h === "w") {
    base.top = "50%"
    base.transform = "translateY(-50%)"
  }
  return base
}

export const CanvasElement: React.FC<Props> = ({ element }) => {
  const {
    elements,
    updateElementSilent,
    selectElement,
    addToSelection,
    selectedElement,
    selectedElements,
    _setPendingSnapshot,
    commitHistory,
    scale,
    setSnapGuides,
  } = useCanvasStore()

  const outerRef = useRef<HTMLDivElement>(null)

  const [pendingDrag, setPendingDrag] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, elX: 0, elY: 0 })
  const [isResizing, setIsResizing] = useState(false)
  const [resizeStart, setResizeStart] = useState({
    mouseX: 0,
    mouseY: 0,
    elX: 0,
    elY: 0,
    width: 0,
    height: 0,
    handle: "se" as ResizeHandle,
  })
  const [isRotating, setIsRotating] = useState(false)
  const [rotateStart, setRotateStart] = useState({ angle: 0, startRotation: 0 })

  const DRAG_THRESHOLD = 4

  const isSelected = selectedElement === element.id
  const isInMultiSelection = selectedElements.includes(element.id) && !isSelected
  const isForRent = element.type === "booth" && element.properties?.forRent === true
  const rentStatus = element.properties?.status as string | undefined
  const isBooth = element.type === "booth"
  const isSmall = element.width < 60 || element.height < 35

  const config = elementConfig[element.type] ?? {
    background: "#a1a1aa",
    borderRadius: "12px",
    textColor: "text-white",
    Icon: null,
  }

  // ── Event handlers ──────────────────────────────────────────────────

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (e.shiftKey) {
      addToSelection(element.id)
      return
    }
    selectElement(element.id)
    setDragStart({ x: e.clientX, y: e.clientY, elX: element.x, elY: element.y })
    setPendingDrag(true)
  }

  const handleResizeMouseDown = (e: React.MouseEvent, handle: ResizeHandle) => {
    e.stopPropagation()
    _setPendingSnapshot()
    setIsResizing(true)
    setResizeStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      elX: element.x,
      elY: element.y,
      width: element.width,
      height: element.height,
      handle,
    })
  }

  const handleRotateMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    _setPendingSnapshot()
    const rect = outerRef.current?.getBoundingClientRect()
    if (!rect) return
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI)
    setIsRotating(true)
    setRotateStart({ angle: startAngle, startRotation: element.rotation })
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (pendingDrag && !isDragging) {
      const dist = Math.hypot(e.clientX - dragStart.x, e.clientY - dragStart.y)
      if (dist > DRAG_THRESHOLD) {
        _setPendingSnapshot()
        setIsDragging(true)
        setPendingDrag(false)
      }
      return
    }

    if (isDragging) {
      let rawX = dragStart.elX + (e.clientX - dragStart.x) / scale
      let rawY = dragStart.elY + (e.clientY - dragStart.y) / scale

      // Check element snap guides against non-selected elements
      const others = elements.filter(
        (el) => el.id !== element.id && !selectedElements.includes(el.id)
      )
      let snapX: number | null = null
      let snapY: number | null = null
      let snappedX = false
      let snappedY = false

      for (const other of others) {
        if (!snappedX) {
          // my left / center / right vs their left / center / right
          const myEdges: [number, number][] = [
            [rawX, 0],
            [rawX + element.width / 2, element.width / 2],
            [rawX + element.width, element.width],
          ]
          const theirEdges = [other.x, other.x + other.width / 2, other.x + other.width]
          for (const [myEdge, offset] of myEdges) {
            for (const theirEdge of theirEdges) {
              if (Math.abs(myEdge - theirEdge) < SNAP_THRESHOLD) {
                rawX = theirEdge - offset
                snapX = theirEdge
                snappedX = true
                break
              }
            }
            if (snappedX) break
          }
        }
        if (!snappedY) {
          const myEdges: [number, number][] = [
            [rawY, 0],
            [rawY + element.height / 2, element.height / 2],
            [rawY + element.height, element.height],
          ]
          const theirEdges = [other.y, other.y + other.height / 2, other.y + other.height]
          for (const [myEdge, offset] of myEdges) {
            for (const theirEdge of theirEdges) {
              if (Math.abs(myEdge - theirEdge) < SNAP_THRESHOLD) {
                rawY = theirEdge - offset
                snapY = theirEdge
                snappedY = true
                break
              }
            }
            if (snappedY) break
          }
        }
        if (snappedX && snappedY) break
      }

      setSnapGuides({ x: snapX, y: snapY })

      // Grid snap only where no element snap
      const newX = snappedX ? rawX : Math.round(rawX / GRID) * GRID
      const newY = snappedY ? rawY : Math.round(rawY / GRID) * GRID
      updateElementSilent(element.id, { x: newX, y: newY })
    } else if (isResizing) {
      const dx = (e.clientX - resizeStart.mouseX) / scale
      const dy = (e.clientY - resizeStart.mouseY) / scale
      const { handle, elX, elY, width: startW, height: startH } = resizeStart
      const updates: Partial<CanvasElementType> = {}

      if (handle.includes("e")) updates.width = Math.max(30, startW + dx)
      if (handle.includes("s")) updates.height = Math.max(30, startH + dy)
      if (handle.includes("w")) {
        const newW = Math.max(30, startW - dx)
        updates.width = newW
        updates.x = elX + (startW - newW)
      }
      if (handle.includes("n")) {
        const newH = Math.max(30, startH - dy)
        updates.height = newH
        updates.y = elY + (startH - newH)
      }
      updateElementSilent(element.id, updates)
    } else if (isRotating) {
      const rect = outerRef.current?.getBoundingClientRect()
      if (!rect) return
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI)
      let newRotation = rotateStart.startRotation + (currentAngle - rotateStart.angle)
      // Shift to snap to 15° increments
      if (e.shiftKey) newRotation = Math.round(newRotation / 15) * 15
      updateElementSilent(element.id, { rotation: newRotation })
    }
  }

  const handleMouseUp = () => {
    setPendingDrag(false)
    if (isDragging || isResizing || isRotating) commitHistory()
    if (isDragging) setSnapGuides({ x: null, y: null })
    setIsDragging(false)
    setIsResizing(false)
    setIsRotating(false)
  }

  React.useEffect(() => {
    if (isDragging || isResizing || pendingDrag || isRotating) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
      return () => {
        window.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, isResizing, pendingDrag, isRotating, dragStart, resizeStart, rotateStart])

  // ── Derived styles ───────────────────────────────────────────────────

  const outerBoxShadow = isSelected
    ? "0 0 0 1.5px #fff, 0 0 0 3px #18181b, 0 8px 24px rgba(0,0,0,0.22)"
    : isInMultiSelection
      ? "0 0 0 1.5px #fff, 0 0 0 3px #3b82f6, 0 4px 12px rgba(59,130,246,0.22)"
      : undefined

  const innerBoxShadow =
    isSelected || isInMultiSelection
      ? undefined
      : isForRent && rentStatus === "rented"
        ? "0 0 0 2px #a1a1aa"
        : isForRent && rentStatus === "pending"
          ? "0 0 0 2px #f59e0b"
          : isForRent
            ? "0 0 0 2px #22c55e"
            : "0 2px 8px rgba(0,0,0,0.14), 0 1px 3px rgba(0,0,0,0.10)"

  return (
    <div
      ref={outerRef}
      style={{
        position: "absolute",
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        transform: `rotate(${element.rotation}deg)`,
        cursor: isDragging ? "grabbing" : "move",
        boxShadow: outerBoxShadow,
        transition: "box-shadow 0.15s ease",
        opacity: isDragging ? 0.8 : 1,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Inner: border-radius → rounded visual */}
      <div
        className={cn("absolute inset-0 flex flex-col items-center justify-center")}
        style={{
          background: config.background,
          borderRadius: config.borderRadius,
          boxShadow: innerBoxShadow,
          transition: "box-shadow 0.15s ease",
        }}
      >
        {config.Icon && element.width >= 24 && element.height >= 24 && (
          <div className={element.height > 50 ? "mb-1" : ""}>
            <config.Icon size={iconSize(element.width, element.height)} className="text-white" />
          </div>
        )}
        {!isSmall && (
          <div
            className={cn("pointer-events-none w-full leading-tight font-medium", config.textColor)}
            style={{
              fontSize: element.width > 80 ? "12px" : "10px",
              textShadow: "0 1px 3px rgba(0,0,0,0.45)",
              textAlign: "center",
              wordBreak: "break-word",
              overflowWrap: "anywhere",
              padding: "0 6px",
            }}
          >
            {element.name}
          </div>
        )}

        {isForRent && rentStatus === "rented" && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-[inherit] bg-zinc-900/20">
            <Lock className="h-4 w-4 text-zinc-600" />
          </div>
        )}

        {isBooth && element.width >= 60 && element.height >= 40 && (
          <div
            className="pointer-events-none absolute bottom-1.5 left-1/2"
            style={{ transform: "translateX(-50%)" }}
          >
            <span
              style={{
                display: "inline-block",
                fontSize: "9px",
                fontWeight: 700,
                letterSpacing: "0.06em",
                lineHeight: 1,
                padding: "2px 5px",
                borderRadius: 3,
                whiteSpace: "nowrap",
                ...(rentStatus === "rented"
                  ? { background: "rgba(0,0,0,0.35)", color: "#e4e4e7" }
                  : rentStatus === "pending"
                    ? { background: "rgba(0,0,0,0.30)", color: "#fde68a" }
                    : { background: "rgba(0,0,0,0.25)", color: "#bbf7d0" }),
              }}
            >
              {isForRent
                ? rentStatus === "rented"
                  ? "RENTED"
                  : rentStatus === "pending"
                    ? "PENDING"
                    : "FOR RENT"
                : "NOT AVAILABLE"}
            </span>
          </div>
        )}
      </div>

      {/* Below-label for small elements */}
      {isSmall && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginTop: 4,
            pointerEvents: "none",
            zIndex: 5,
            textAlign: "center",
            whiteSpace: "nowrap",
            fontSize: "10px",
            fontWeight: 600,
            color: "#18181b",
            background: "rgba(255,255,255,0.85)",
            padding: "1px 5px",
            borderRadius: 3,
            boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
          }}
        >
          {element.name}
        </div>
      )}

      {/* 8-point resize handles */}
      {isSelected &&
        ALL_HANDLES.map((h) => (
          <div key={h} style={handleStyle(h)} onMouseDown={(e) => handleResizeMouseDown(e, h)} />
        ))}

      {/* Rotation handle — stem + circle above element */}
      {isSelected && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            pointerEvents: "none",
            zIndex: 12,
          }}
        >
          {/* Circle */}
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "white",
              border: "1.5px solid #27272a",
              boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
              marginTop: -28,
              cursor: isRotating ? "grabbing" : "grab",
              pointerEvents: "all",
            }}
            onMouseDown={handleRotateMouseDown}
          />
          {/* Stem connecting circle to element top */}
          <div style={{ width: 1, height: 16, background: "#52525b", marginTop: 0 }} />
        </div>
      )}
    </div>
  )
}
