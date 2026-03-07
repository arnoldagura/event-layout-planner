"use client"

import React, { useRef, useState, useEffect, useCallback } from "react"
import {
  Presentation,
  Armchair,
  Store,
  DoorOpen,
  DoorClosed,
  Wine,
  ClipboardList,
  Table,
  Hand,
  Lock,
} from "lucide-react"
import { FaRestroom } from "react-icons/fa"

interface CanvasElement {
  id: string
  type: string
  name: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  properties?: Record<string, unknown> | null
}

interface Props {
  elements: CanvasElement[]
  highlightedId: string | null
  onBoothClick?: (element: CanvasElement) => void
}

type LucideIcon = React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>

const elementConfig: Record<
  string,
  { background: string; borderRadius: string; Icon: LucideIcon | null }
> = {
  stage: { background: "var(--info)", borderRadius: "0px", Icon: Presentation },
  table: { background: "var(--warning)", borderRadius: "0px", Icon: Table },
  chair: { background: "var(--muted-foreground)", borderRadius: "0px", Icon: Armchair },
  booth: { background: "var(--info)", borderRadius: "0px", Icon: Store },
  entrance: { background: "var(--success)", borderRadius: "0px", Icon: DoorOpen },
  exit: { background: "var(--destructive)", borderRadius: "0px", Icon: DoorClosed },
  restroom: { background: "var(--muted-foreground)", borderRadius: "0px", Icon: FaRestroom },
  bar: { background: "var(--warning)", borderRadius: "0px", Icon: Wine },
  registration: { background: "var(--info)", borderRadius: "0px", Icon: ClipboardList },
}

function iconSize(w: number, h: number): number {
  const min = Math.min(w, h)
  if (min < 30) return 10
  if (min < 42) return 13
  if (min < 56) return 15
  if (min < 72) return 17
  return 20
}

export const PublicEventCanvas: React.FC<Props> = ({ elements, highlightedId, onBoothClick }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 100, y: 100 })
  const [isPanning, setIsPanning] = useState(false)
  const [isSpacePressed, setIsSpacePressed] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [initialOffset, setInitialOffset] = useState({ x: 0, y: 0 })

  // Refs to avoid stale closures in event listeners
  const panOffsetRef = useRef(panOffset)
  const scaleRef = useRef(scale)
  const touchRef = useRef<{
    startX: number
    startY: number
    startOffset: { x: number; y: number }
    pinchDist: number | null
  } | null>(null)

  // Keep refs in sync with state
  const setPanOffsetSync = useCallback((offset: { x: number; y: number }) => {
    panOffsetRef.current = offset
    setPanOffset(offset)
  }, [])

  const setScaleSync = useCallback((s: number) => {
    scaleRef.current = s
    setScale(s)
  }, [])

  // Pan to highlighted element when it changes
  useEffect(() => {
    if (!highlightedId || !containerRef.current) return
    const el = elements.find((e) => e.id === highlightedId)
    if (!el) return

    const container = containerRef.current
    const centerX = container.clientWidth / 2
    const centerY = container.clientHeight / 2

    const elCenterX = el.x + el.width / 2
    const elCenterY = el.y + el.height / 2

    setPanOffsetSync({
      x: centerX - elCenterX * scaleRef.current,
      y: centerY - elCenterY * scaleRef.current,
    })
  }, [highlightedId, elements, setPanOffsetSync])

  // Spacebar pan mode (desktop)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat && e.target === document.body) {
        e.preventDefault()
        setIsSpacePressed(true)
      }
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePressed(false)
        setIsPanning(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  // Mouse pan
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1 || (isSpacePressed && e.button === 0)) {
        e.preventDefault()
        setIsPanning(true)
        setPanStart({ x: e.clientX, y: e.clientY })
        setInitialOffset({ x: panOffset.x, y: panOffset.y })
      }
    },
    [isSpacePressed, panOffset]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        setPanOffsetSync({
          x: initialOffset.x + (e.clientX - panStart.x),
          y: initialOffset.y + (e.clientY - panStart.y),
        })
      }
    },
    [isPanning, panStart, initialOffset, setPanOffsetSync]
  )

  const handleMouseUp = useCallback(() => setIsPanning(false), [])

  // Wheel zoom
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.1 : 0.1
      const newScale = Math.min(3, Math.max(0.25, scaleRef.current + delta))

      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top
        const ratio = newScale / scaleRef.current
        setPanOffsetSync({
          x: mouseX - (mouseX - panOffsetRef.current.x) * ratio,
          y: mouseY - (mouseY - panOffsetRef.current.y) * ratio,
        })
      }
      setScaleSync(newScale)
    },
    [setPanOffsetSync, setScaleSync]
  )

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener("wheel", handleWheel, { passive: false })
    return () => el.removeEventListener("wheel", handleWheel)
  }, [handleWheel])

  // Touch pan + pinch-to-zoom
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchRef.current = {
          startX: e.touches[0].clientX,
          startY: e.touches[0].clientY,
          startOffset: { ...panOffsetRef.current },
          pinchDist: null,
        }
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        touchRef.current = {
          startX: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          startY: (e.touches[0].clientY + e.touches[1].clientY) / 2,
          startOffset: { ...panOffsetRef.current },
          pinchDist: Math.sqrt(dx * dx + dy * dy),
        }
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      if (!touchRef.current) return

      if (e.touches.length === 1 && touchRef.current.pinchDist === null) {
        // Single finger pan
        const dx = e.touches[0].clientX - touchRef.current.startX
        const dy = e.touches[0].clientY - touchRef.current.startY
        setPanOffsetSync({
          x: touchRef.current.startOffset.x + dx,
          y: touchRef.current.startOffset.y + dy,
        })
      } else if (e.touches.length === 2 && touchRef.current.pinchDist !== null) {
        // Two-finger pinch-to-zoom + pan
        const ddx = e.touches[0].clientX - e.touches[1].clientX
        const ddy = e.touches[0].clientY - e.touches[1].clientY
        const newDist = Math.sqrt(ddx * ddx + ddy * ddy)
        const ratio = newDist / touchRef.current.pinchDist
        const newScale = Math.min(3, Math.max(0.25, scaleRef.current * ratio))

        // Zoom toward pinch midpoint
        const rect = el.getBoundingClientRect()
        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top
        const scaleRatio = newScale / scaleRef.current
        setPanOffsetSync({
          x: midX - (midX - panOffsetRef.current.x) * scaleRatio,
          y: midY - (midY - panOffsetRef.current.y) * scaleRatio,
        })
        setScaleSync(newScale)
        // Update baseline for next move event
        touchRef.current.pinchDist = newDist
      }
    }

    const onTouchEnd = () => {
      touchRef.current = null
    }

    el.addEventListener("touchstart", onTouchStart, { passive: false })
    el.addEventListener("touchmove", onTouchMove, { passive: false })
    el.addEventListener("touchend", onTouchEnd)
    return () => {
      el.removeEventListener("touchstart", onTouchStart)
      el.removeEventListener("touchmove", onTouchMove)
      el.removeEventListener("touchend", onTouchEnd)
    }
  }, [setPanOffsetSync, setScaleSync])

  const getCursorStyle = () => {
    if (isPanning) return "grabbing"
    if (isSpacePressed) return "grab"
    return "default"
  }

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden bg-muted"
      style={{ cursor: getCursorStyle() }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {isSpacePressed && (
        <div className="absolute top-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-none bg-foreground px-3 py-1.5 font-mono text-[10px] tracking-widest text-background uppercase shadow-lg">
          <Hand className="h-3 w-3" />
          Pan Mode
        </div>
      )}

      <div
        className="absolute border border-border shadow-lg"
        style={{
          backgroundSize: "20px 20px",
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`,
          transformOrigin: "0 0",
          width: "2000px",
          height: "1500px",
        }}
      >
        <div
          className="pointer-events-none absolute rounded-none border border-dashed border-border"
          style={{
            left: "20px",
            top: "20px",
            width: "calc(100% - 40px)",
            height: "calc(100% - 40px)",
          }}
        />

        {elements.map((element) => {
          const config = elementConfig[element.type] || {
            background: "var(--muted-foreground)",
            borderRadius: "0px",
            Icon: null,
          }
          const isHighlighted = element.id === highlightedId
          const props = element.properties ?? {}
          const isForRent = element.type === "booth" && props.forRent === true
          const rentStatus = props.status as string | undefined
          const isBooth = element.type === "booth"
          const isSmall = element.width < 60 || element.height < 35
          const attendeeName = props.attendeeName as string | undefined

          const boxShadow = isHighlighted
            ? "0 0 0 2px var(--background), 0 0 0 4px var(--info), 0 4px 12px rgba(0,0,0,0.1)"
            : isForRent && rentStatus === "rented"
              ? "0 0 0 1px var(--border)"
              : isForRent && rentStatus === "pending"
                ? "0 0 0 2px var(--warning)"
                : isForRent
                  ? "0 0 0 2px var(--success)"
                  : "0 1px 3px rgba(0,0,0,0.1)"

          return (
            <div
              key={element.id}
              className="absolute flex flex-col items-center justify-center"
              style={{
                left: `${element.x}px`,
                top: `${element.y}px`,
                width: `${element.width}px`,
                height: `${element.height}px`,
                transform: `rotate(${element.rotation}deg)`,
                background: config.background,
                borderRadius: config.borderRadius,
                boxShadow,
                transition: "none",
                border: isHighlighted ? "2px solid var(--info)" : "2px solid transparent",
                cursor: isBooth ? "pointer" : "default",
              }}
              onClick={isBooth ? () => onBoothClick?.(element) : undefined}
            >
              {config.Icon && element.width >= 24 && element.height >= 24 && (
                <div className={element.height > 50 ? "mb-1" : ""}>
                  <config.Icon
                    size={iconSize(element.width, element.height)}
                    className="text-white"
                    strokeWidth={2}
                  />
                </div>
              )}
              {!isSmall && (
                <div
                  className="pointer-events-none w-full leading-tight font-medium text-white flex flex-col items-center gap-0.5"
                  style={{
                    fontSize: element.width > 80 ? "12px" : "10px",
                    fontFamily: "monospace",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    textAlign: "center",
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                    padding: "0 6px",
                  }}
                >
                  <div>{element.name}</div>
                  {attendeeName && (
                    <div className="mt-1 flex flex-col items-center gap-0.5">
                      {attendeeName
                        .split("\n")
                        .filter((line) => line.trim())
                        .slice(0, 3)
                        .map((name, i) => (
                          <div
                            key={i}
                            className="max-w-[calc(100%-8px)] truncate border border-info/30 bg-black/40 px-1.5 py-0.5 text-[8px] leading-none tracking-widest text-info uppercase"
                          >
                            {name.trim()}
                          </div>
                        ))}
                      {attendeeName.split("\n").filter((line) => line.trim()).length > 3 && (
                        <div className="max-w-[calc(100%-8px)] truncate border border-info/30 bg-black/40 px-1.5 py-0.5 text-[8px] leading-none tracking-widest text-info uppercase">
                          +{attendeeName.split("\n").filter((line) => line.trim()).length - 3} MORE
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {isForRent && rentStatus === "rented" && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-[inherit] bg-background/50 backdrop-blur-[1px]">
                  <Lock className="h-4 w-4 text-foreground" />
                </div>
              )}

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
                    fontSize: "9px",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    fontFamily: "monospace",
                    fontWeight: 700,
                    color: "var(--foreground)",
                    background: "var(--background)",
                    padding: "2px 6px",
                    borderRadius: 0,
                    border: "1px solid var(--border)",
                  }}
                >
                  {element.name}
                  {attendeeName && (
                    <span className="ml-1 text-info">
                      [{attendeeName.split("\n").filter((line) => line.trim()).length > 1
                        ? `${attendeeName.split("\n").filter((line) => line.trim()).length} ATTENDEES`
                        : attendeeName.trim().substring(0, 10)}]
                    </span>
                  )}
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
                      borderRadius: 0,
                      border: "1px solid",
                      whiteSpace: "nowrap",
                      ...(rentStatus === "rented"
                        ? { background: "var(--muted)", color: "var(--muted-foreground)", borderColor: "var(--border)" }
                        : rentStatus === "pending"
                          ? { background: "var(--warning)", color: "var(--primary-foreground)", borderColor: "var(--warning)" }
                          : { background: "var(--success)", color: "var(--primary-foreground)", borderColor: "var(--success)" }),
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
          )
        })}
      </div>

      {/* Zoom hint — desktop shows keyboard shortcuts, mobile shows touch hints */}
      <div className="absolute bottom-4 left-4 space-y-1 rounded-none border border-border bg-card/90 px-3 py-2 text-[9px] font-mono tracking-widest text-muted-foreground uppercase shadow-sm backdrop-blur-sm">
        <div className="font-bold text-foreground">{Math.round(scale * 100)}%</div>
        <div className="hidden items-center gap-3 text-muted-foreground sm:flex">
          <span>SCROLL TO ZOOM</span>
          <span className="text-border">|</span>
          <span>SPACE + DRAG TO PAN</span>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground sm:hidden">
          <span>PINCH TO ZOOM</span>
          <span className="text-border">|</span>
          <span>DRAG TO PAN</span>
        </div>
      </div>
    </div>
  )
}
