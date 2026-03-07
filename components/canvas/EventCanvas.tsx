"use client"

import React, { useRef, useState, useEffect, useCallback } from "react"
import { useCanvasStore } from "@/lib/store"
import { CanvasElement } from "./CanvasElement"
import { Hand } from "lucide-react"

interface Props {
  showGrid?: boolean
}

export const EventCanvas = React.forwardRef<HTMLDivElement, Props>(function EventCanvas(
  { showGrid = true },
  ref
) {
  const {
    elements,
    addElement,
    selectElement,
    scale,
    panOffset,
    setPanOffset,
    setScale,
    snapGuides,
  } = useCanvasStore()
  const containerRef = useRef<HTMLDivElement>(null)

  const [isPanning, setIsPanning] = useState(false)
  const [isSpacePressed, setIsSpacePressed] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [initialOffset, setInitialOffset] = useState({ x: 0, y: 0 })

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
        const deltaX = e.clientX - panStart.x
        const deltaY = e.clientY - panStart.y
        setPanOffset({
          x: initialOffset.x + deltaX,
          y: initialOffset.y + deltaY,
        })
      }
    },
    [isPanning, panStart, initialOffset, setPanOffset]
  )

  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
  }, [])

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault()

      const delta = e.deltaY > 0 ? -0.1 : 0.1
      const newScale = Math.min(3, Math.max(0.25, scale + delta))

      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top

        const scaleRatio = newScale / scale
        const newOffsetX = mouseX - (mouseX - panOffset.x) * scaleRatio
        const newOffsetY = mouseY - (mouseY - panOffset.y) * scaleRatio

        setPanOffset({ x: newOffsetX, y: newOffsetY })
      }

      setScale(newScale)
    },
    [scale, panOffset, setScale, setPanOffset]
  )

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener("wheel", handleWheel, { passive: false })
    return () => el.removeEventListener("wheel", handleWheel)
  }, [handleWheel])

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isPanning) {
      selectElement(null)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const elementType = e.dataTransfer.getData("elementType")

    if (!elementType || !containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()

    const x = (e.clientX - containerRect.left - panOffset.x) / scale
    const y = (e.clientY - containerRect.top - panOffset.y) / scale

    const elementSizes: Record<string, { width: number; height: number }> = {
      stage: { width: 200, height: 100 },
      table: { width: 80, height: 80 },
      chair: { width: 30, height: 30 },
      booth: { width: 100, height: 100 },
      entrance: { width: 60, height: 40 },
      exit: { width: 60, height: 40 },
      restroom: { width: 50, height: 50 },
      bar: { width: 120, height: 60 },
      registration: { width: 100, height: 60 },
    }

    const size = elementSizes[elementType] || { width: 80, height: 80 }

    const newElement = {
      id: `element-${Date.now()}`,
      type: elementType,
      name: `${elementType.charAt(0).toUpperCase() + elementType.slice(1)} ${elements.length + 1}`,
      x: x - size.width / 2,
      y: y - size.height / 2,
      width: size.width,
      height: size.height,
      rotation: 0,
      properties: elementType === "booth" ? { boothId: crypto.randomUUID() } : {},
    }

    addElement(newElement)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
  }

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
        ref={ref}
        className="absolute border border-border shadow-lg"
        style={{
          backgroundColor: "var(--canvas-bg)",
          backgroundImage: showGrid
            ? `linear-gradient(var(--canvas-grid) 1px, transparent 1px), linear-gradient(90deg, var(--canvas-grid) 1px, transparent 1px)`
            : "none",
          backgroundSize: `${20}px ${20}px`,
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`,
          transformOrigin: "0 0",
          width: "2000px",
          height: "1500px",
        }}
        onClick={handleCanvasClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div
          data-export-exclude="true"
          className="pointer-events-none absolute rounded-lg border-2 border-dashed border-zinc-300"
          style={{
            left: "20px",
            top: "20px",
            width: "calc(100% - 40px)",
            height: "calc(100% - 40px)",
          }}
        />

        {elements.map((element) => (
          <CanvasElement key={element.id} element={element} />
        ))}

        {snapGuides.x !== null && (
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: snapGuides.x,
              width: 1,
              background: "#3b82f6",
              opacity: 0.7,
              pointerEvents: "none",
              zIndex: 50,
            }}
          />
        )}
        {snapGuides.y !== null && (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: snapGuides.y,
              height: 1,
              background: "#3b82f6",
              opacity: 0.7,
              pointerEvents: "none",
              zIndex: 50,
            }}
          />
        )}
      </div>

      <div className="absolute bottom-4 left-4 space-y-1 rounded-lg border bg-white/90 px-3 py-2 text-xs text-zinc-600 shadow-sm backdrop-blur-sm">
        <div className="font-medium text-zinc-900">{Math.round(scale * 100)}%</div>
        <div className="flex items-center gap-3 text-zinc-500">
          <span>Scroll to zoom</span>
          <span>•</span>
          <span>Space + drag to pan</span>
        </div>
      </div>
    </div>
  )
})
