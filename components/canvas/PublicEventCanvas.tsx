'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'
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
} from 'lucide-react'
import { FaRestroom } from 'react-icons/fa'

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

const elementConfig: Record<string, { background: string; borderRadius: string; Icon: LucideIcon | null }> = {
  stage:        { background: '#3b82f6', borderRadius: '12px', Icon: Presentation },
  table:        { background: '#f59e0b', borderRadius: '12px', Icon: Table        },
  chair:        { background: '#71717a', borderRadius: '12px', Icon: Armchair     },
  booth:        { background: '#0d9488', borderRadius: '12px', Icon: Store        },
  entrance:     { background: '#22c55e', borderRadius: '12px', Icon: DoorOpen     },
  exit:         { background: '#ef4444', borderRadius: '12px', Icon: DoorClosed   },
  restroom:     { background: '#475569', borderRadius: '12px', Icon: FaRestroom   },
  bar:          { background: '#f97316', borderRadius: '12px', Icon: Wine         },
  registration: { background: '#06b6d4', borderRadius: '12px', Icon: ClipboardList},
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

  // Mouse pan
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
      setPanOffsetSync({
        x: initialOffset.x + (e.clientX - panStart.x),
        y: initialOffset.y + (e.clientY - panStart.y),
      })
    }
  }, [isPanning, panStart, initialOffset, setPanOffsetSync])

  const handleMouseUp = useCallback(() => setIsPanning(false), [])

  // Wheel zoom
  const handleWheel = useCallback((e: WheelEvent) => {
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
  }, [setPanOffsetSync, setScaleSync])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
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

    el.addEventListener('touchstart', onTouchStart, { passive: false })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd)
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [setPanOffsetSync, setScaleSync])

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
          const config = elementConfig[element.type] || { background: '#a1a1aa', borderRadius: '12px', Icon: null }
          const isHighlighted = element.id === highlightedId
          const props = element.properties ?? {}
          const isForRent = element.type === 'booth' && props.forRent === true
          const rentStatus = props.status as string | undefined
          const isBooth = element.type === 'booth'
          const isSmall = element.width < 60 || element.height < 35

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
              {config.Icon && element.width >= 24 && element.height >= 24 && (
                <div className={element.height > 50 ? 'mb-1' : ''}>
                  <config.Icon
                    size={iconSize(element.width, element.height)}
                    className='text-white'
                    strokeWidth={2}
                  />
                </div>
              )}
              {!isSmall && (
                <div
                  className='pointer-events-none w-full font-medium leading-tight text-white'
                  style={{ fontSize: element.width > 80 ? '12px' : '10px', textShadow: '0 1px 3px rgba(0,0,0,0.45)', textAlign: 'center', wordBreak: 'break-word', overflowWrap: 'anywhere', padding: '0 6px' }}
                >
                  {element.name}
                </div>
              )}

              {isForRent && rentStatus === 'rented' && (
                <div className='absolute inset-0 bg-zinc-900/20 rounded-[inherit] flex items-center justify-center pointer-events-none'>
                  <Lock className='w-4 h-4 text-zinc-600' />
                </div>
              )}

              {isSmall && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginTop: 4,
                    pointerEvents: 'none',
                    zIndex: 5,
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    fontSize: '10px',
                    fontWeight: 600,
                    color: '#18181b',
                    background: 'rgba(255,255,255,0.85)',
                    padding: '1px 5px',
                    borderRadius: 3,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                  }}
                >
                  {element.name}
                </div>
              )}

              {isBooth && element.width >= 60 && element.height >= 40 && (
                <div
                  className='absolute bottom-1.5 left-1/2 pointer-events-none'
                  style={{ transform: 'translateX(-50%)' }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: '9px',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      lineHeight: 1,
                      padding: '2px 5px',
                      borderRadius: 3,
                      whiteSpace: 'nowrap',
                      ...(rentStatus === 'rented'
                        ? { background: 'rgba(0,0,0,0.35)', color: '#e4e4e7' }
                        : rentStatus === 'pending'
                        ? { background: 'rgba(0,0,0,0.30)', color: '#fde68a' }
                        : { background: 'rgba(0,0,0,0.25)', color: '#bbf7d0' }),
                    }}
                  >
                    {isForRent
                      ? rentStatus === 'rented'
                        ? 'RENTED'
                        : rentStatus === 'pending'
                        ? 'PENDING'
                        : 'FOR RENT'
                      : 'NOT AVAILABLE'
                    }
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Zoom hint — desktop shows keyboard shortcuts, mobile shows touch hints */}
      <div className='absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg border shadow-sm text-xs text-zinc-600 space-y-1'>
        <div className='font-medium text-zinc-900'>{Math.round(scale * 100)}%</div>
        <div className='hidden sm:flex items-center gap-3 text-zinc-500'>
          <span>Scroll to zoom</span>
          <span>•</span>
          <span>Space + drag to pan</span>
        </div>
        <div className='flex sm:hidden items-center gap-3 text-zinc-500'>
          <span>Pinch to zoom</span>
          <span>•</span>
          <span>Drag to pan</span>
        </div>
      </div>
    </div>
  )
}
