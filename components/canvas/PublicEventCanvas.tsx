'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'
import {
  Presentation,
  Table,
  Armchair,
  Store,
  DoorOpen,
  DoorClosed,
  Bath,
  Wine,
  ClipboardList,
  Hand,
  Lock,
} from 'lucide-react'

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

const elementConfig: Record<string, { background: string; borderRadius: string; icon: React.ReactNode }> = {
  stage:        { background: '#3b82f6', borderRadius: '12px', icon: <Presentation className='w-5 h-5 text-white' /> },
  table:        { background: '#f59e0b', borderRadius: '12px', icon: <Table className='w-5 h-5 text-white' /> },
  chair:        { background: '#71717a', borderRadius: '12px', icon: <Armchair className='w-4 h-4 text-white' /> },
  booth:        { background: '#0d9488', borderRadius: '12px', icon: <Store className='w-5 h-5 text-white' /> },
  entrance:     { background: '#22c55e', borderRadius: '12px', icon: <DoorOpen className='w-5 h-5 text-white' /> },
  exit:         { background: '#ef4444', borderRadius: '12px', icon: <DoorClosed className='w-5 h-5 text-white' /> },
  restroom:     { background: '#475569', borderRadius: '12px', icon: <Bath className='w-5 h-5 text-white' /> },
  bar:          { background: '#f97316', borderRadius: '12px', icon: <Wine className='w-5 h-5 text-white' /> },
  registration: { background: '#06b6d4', borderRadius: '12px', icon: <ClipboardList className='w-5 h-5 text-white' /> },
}

export const PublicEventCanvas: React.FC<Props> = ({ elements, highlightedId, onBoothClick }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 100, y: 100 })
  const [isPanning, setIsPanning] = useState(false)
  const [isSpacePressed, setIsSpacePressed] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [initialOffset, setInitialOffset] = useState({ x: 0, y: 0 })

  // Pan to highlighted element when it changes
  useEffect(() => {
    if (!highlightedId || !containerRef.current) return
    const el = elements.find((e) => e.id === highlightedId)
    if (!el) return

    const container = containerRef.current
    const centerX = container.clientWidth / 2
    const centerY = container.clientHeight / 2

    // Pan so element center aligns with viewport center
    const elCenterX = el.x + el.width / 2
    const elCenterY = el.y + el.height / 2

    setPanOffset({
      x: centerX - elCenterX * scale,
      y: centerY - elCenterY * scale,
    })
  }, [highlightedId, elements, scale])

  // Spacebar pan mode
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

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (isSpacePressed && e.button === 0)) {
      e.preventDefault()
      setIsPanning(true)
      setPanStart({ x: e.clientX, y: e.clientY })
      setInitialOffset({ x: panOffset.x, y: panOffset.y })
    }
  }, [isSpacePressed, panOffset])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPanOffset({
        x: initialOffset.x + (e.clientX - panStart.x),
        y: initialOffset.y + (e.clientY - panStart.y),
      })
    }
  }, [isPanning, panStart, initialOffset])

  const handleMouseUp = useCallback(() => setIsPanning(false), [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    const newScale = Math.min(3, Math.max(0.25, scale + delta))

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      const scaleRatio = newScale / scale
      setPanOffset({
        x: mouseX - (mouseX - panOffset.x) * scaleRatio,
        y: mouseY - (mouseY - panOffset.y) * scaleRatio,
      })
    }
    setScale(newScale)
  }, [scale, panOffset])

  const getCursorStyle = () => {
    if (isPanning) return 'grabbing'
    if (isSpacePressed) return 'grab'
    return 'default'
  }

  return (
    <div
      ref={containerRef}
      className='relative h-full w-full bg-zinc-200 overflow-hidden'
      style={{ cursor: getCursorStyle() }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {isSpacePressed && (
        <div className='absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-zinc-900 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 shadow-lg'>
          <Hand className='w-3 h-3' />
          Pan Mode
        </div>
      )}

      <div
        className='absolute bg-white'
        style={{
          backgroundImage: `radial-gradient(circle, #d4d4d8 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)',
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`,
          transformOrigin: '0 0',
          width: '2000px',
          height: '1500px',
        }}
      >
        <div
          className='absolute border-2 border-dashed border-zinc-300 rounded-lg pointer-events-none'
          style={{ left: '20px', top: '20px', width: 'calc(100% - 40px)', height: 'calc(100% - 40px)' }}
        />

        {elements.map((element) => {
          const config = elementConfig[element.type] || { background: '#a1a1aa', borderRadius: '12px', icon: null }
          const isHighlighted = element.id === highlightedId
          const props = element.properties ?? {}
          const isForRent = element.type === 'booth' && props.forRent === true
          const rentStatus = props.status as string | undefined
          const isBooth = element.type === 'booth'

          const boxShadow = isHighlighted
            ? '0 0 0 3px #fff, 0 0 0 6px #f59e0b, 0 8px 24px rgba(245,158,11,0.4)'
            : isForRent && rentStatus === 'rented'
            ? '0 0 0 2px #a1a1aa'
            : isForRent && rentStatus === 'pending'
            ? '0 0 0 2px #f59e0b'
            : isForRent
            ? '0 0 0 2px #22c55e'
            : '0 2px 8px rgba(0,0,0,0.14), 0 1px 3px rgba(0,0,0,0.10)'

          return (
            <div
              key={element.id}
              className='absolute flex flex-col items-center justify-center'
              style={{
                left: `${element.x}px`,
                top: `${element.y}px`,
                width: `${element.width}px`,
                height: `${element.height}px`,
                transform: `rotate(${element.rotation}deg)`,
                background: config.background,
                borderRadius: config.borderRadius,
                boxShadow,
                transition: 'box-shadow 0.2s ease',
                border: isHighlighted ? '2px solid #f59e0b' : '2px solid transparent',
                cursor: isBooth ? 'pointer' : 'default',
              }}
              onClick={isBooth ? () => onBoothClick?.(element) : undefined}
            >
              {element.width > 50 && element.height > 50 && (
                <div className='mb-1'>{config.icon}</div>
              )}
              <span
                className='pointer-events-none truncate px-1 font-medium text-white'
                style={{ fontSize: element.width > 60 ? '12px' : '10px' }}
              >
                {element.name}
              </span>

              {isForRent && rentStatus === 'rented' && (
                <div className='absolute inset-0 bg-zinc-900/20 rounded-[inherit] flex items-center justify-center pointer-events-none'>
                  <Lock className='w-4 h-4 text-zinc-600' />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className='absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg border shadow-sm text-xs text-zinc-600 space-y-1'>
        <div className='font-medium text-zinc-900'>{Math.round(scale * 100)}%</div>
        <div className='flex items-center gap-3 text-zinc-500'>
          <span>Scroll to zoom</span>
          <span>•</span>
          <span>Space + drag to pan</span>
        </div>
      </div>
    </div>
  )
}
