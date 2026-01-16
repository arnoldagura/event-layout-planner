'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'
import { useCanvasStore } from '@/lib/store'
import { CanvasElement } from './CanvasElement'
import { Hand } from 'lucide-react'

interface Props {
  showGrid?: boolean
}

export const EventCanvas: React.FC<Props> = ({ showGrid = true }) => {
  const { elements, addElement, selectElement, scale, panOffset, setPanOffset, setScale } = useCanvasStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Pan state
  const [isPanning, setIsPanning] = useState(false)
  const [isSpacePressed, setIsSpacePressed] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [initialOffset, setInitialOffset] = useState({ x: 0, y: 0 })

  // Handle spacebar for pan mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && e.target === document.body) {
        e.preventDefault()
        setIsSpacePressed(true)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false)
        setIsPanning(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // Handle mouse down for panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Middle mouse button or spacebar + left click
    if (e.button === 1 || (isSpacePressed && e.button === 0)) {
      e.preventDefault()
      setIsPanning(true)
      setPanStart({ x: e.clientX, y: e.clientY })
      setInitialOffset({ x: panOffset.x, y: panOffset.y })
    }
  }, [isSpacePressed, panOffset])

  // Handle mouse move for panning
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      const deltaX = e.clientX - panStart.x
      const deltaY = e.clientY - panStart.y
      setPanOffset({
        x: initialOffset.x + deltaX,
        y: initialOffset.y + deltaY,
      })
    }
  }, [isPanning, panStart, initialOffset, setPanOffset])

  // Handle mouse up to stop panning
  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
  }, [])

  // Handle mouse wheel for zooming
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()

    const delta = e.deltaY > 0 ? -0.1 : 0.1
    const newScale = Math.min(3, Math.max(0.25, scale + delta))

    // Zoom towards cursor position
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      // Calculate new offset to zoom towards cursor
      const scaleRatio = newScale / scale
      const newOffsetX = mouseX - (mouseX - panOffset.x) * scaleRatio
      const newOffsetY = mouseY - (mouseY - panOffset.y) * scaleRatio

      setPanOffset({ x: newOffsetX, y: newOffsetY })
    }

    setScale(newScale)
  }, [scale, panOffset, setScale, setPanOffset])

  // Handle canvas click (deselect)
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === canvasRef.current && !isPanning) {
      selectElement(null)
    }
  }

  // Handle drop for adding elements
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const elementType = e.dataTransfer.getData('elementType')

    if (!elementType || !canvasRef.current || !containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()

    // Calculate position accounting for pan and scale
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
      properties: {},
    }

    addElement(newElement)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  // Cursor style based on state
  const getCursorStyle = () => {
    if (isPanning) return 'grabbing'
    if (isSpacePressed) return 'grab'
    return 'default'
  }

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full bg-zinc-200 overflow-hidden"
      style={{ cursor: getCursorStyle() }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Pan mode indicator */}
      {isSpacePressed && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-zinc-900 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 shadow-lg">
          <Hand className="w-3 h-3" />
          Pan Mode
        </div>
      )}

      {/* Canvas Container with pan/zoom transform */}
      <div
        ref={canvasRef}
        className="absolute bg-white shadow-lg"
        style={{
          backgroundImage: showGrid
            ? `
              linear-gradient(to right, #f4f4f5 1px, transparent 1px),
              linear-gradient(to bottom, #f4f4f5 1px, transparent 1px)
            `
            : 'none',
          backgroundSize: `${20}px ${20}px`,
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`,
          transformOrigin: '0 0',
          width: '2000px',
          height: '1500px',
        }}
        onClick={handleCanvasClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {/* Canvas boundary indicator */}
        <div
          className="absolute border-2 border-dashed border-zinc-300 rounded-lg pointer-events-none"
          style={{
            left: '20px',
            top: '20px',
            width: 'calc(100% - 40px)',
            height: 'calc(100% - 40px)',
          }}
        />

        {/* Elements */}
        {elements.map((element) => (
          <CanvasElement key={element.id} element={element} />
        ))}
      </div>

      {/* Controls hint */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg border shadow-sm text-xs text-zinc-600 space-y-1">
        <div className="font-medium text-zinc-900">{Math.round(scale * 100)}%</div>
        <div className="flex items-center gap-3 text-zinc-500">
          <span>Scroll to zoom</span>
          <span>•</span>
          <span>Space + drag to pan</span>
        </div>
      </div>
    </div>
  )
}
