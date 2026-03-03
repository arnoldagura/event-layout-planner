'use client'

import React, { useState } from 'react'
import { useCanvasStore, type CanvasElement as CanvasElementType } from '@/lib/store'
import { cn } from '@/lib/utils'
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
  Lock,
} from 'lucide-react'

interface Props {
  element: CanvasElementType
}

type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'

const HANDLE_CURSORS: Record<ResizeHandle, string> = {
  nw: 'nw-resize', n: 'n-resize',  ne: 'ne-resize',
  e:  'e-resize',  se: 'se-resize', s:  's-resize',
  sw: 'sw-resize', w:  'w-resize',
}

const ALL_HANDLES: ResizeHandle[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']

const elementConfig: Record<
  string,
  { background: string; borderRadius: string; textColor: string; icon: React.ReactNode }
> = {
  stage:        { background: '#3b82f6', borderRadius: '12px', textColor: 'text-white', icon: <Presentation className='w-5 h-5 text-white' /> },
  table:        { background: '#f59e0b', borderRadius: '12px', textColor: 'text-white', icon: <Table        className='w-5 h-5 text-white' /> },
  chair:        { background: '#71717a', borderRadius: '12px', textColor: 'text-white', icon: <Armchair     className='w-4 h-4 text-white' /> },
  booth:        { background: '#0d9488', borderRadius: '12px', textColor: 'text-white', icon: <Store        className='w-5 h-5 text-white' /> },
  entrance:     { background: '#22c55e', borderRadius: '12px', textColor: 'text-white', icon: <DoorOpen     className='w-5 h-5 text-white' /> },
  exit:         { background: '#ef4444', borderRadius: '12px', textColor: 'text-white', icon: <DoorClosed   className='w-5 h-5 text-white' /> },
  restroom:     { background: '#475569', borderRadius: '12px', textColor: 'text-white', icon: <Bath         className='w-5 h-5 text-white' /> },
  bar:          { background: '#f97316', borderRadius: '12px', textColor: 'text-white', icon: <Wine         className='w-5 h-5 text-white' /> },
  registration: { background: '#06b6d4', borderRadius: '12px', textColor: 'text-white', icon: <ClipboardList className='w-5 h-5 text-white' /> },
}

const GRID = 20

// Compute position for each resize handle (placed on the outer rectangular wrapper)
function handleStyle(h: ResizeHandle): React.CSSProperties {
  const base: React.CSSProperties = {
    position: 'absolute',
    width: 8, height: 8,
    background: 'white',
    border: '1.5px solid #27272a',
    borderRadius: 2,
    boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
    cursor: HANDLE_CURSORS[h],
    zIndex: 10,
  }
  if (h.includes('n')) base.top    = -4
  if (h.includes('s')) base.bottom = -4
  if (h.includes('e')) base.right  = -4
  if (h.includes('w')) base.left   = -4
  if (h === 'n' || h === 's') { base.left = '50%'; base.transform = 'translateX(-50%)' }
  if (h === 'e' || h === 'w') { base.top  = '50%'; base.transform = 'translateY(-50%)' }
  return base
}

export const CanvasElement: React.FC<Props> = ({ element }) => {
  const {
    updateElementSilent,
    selectElement,
    addToSelection,
    selectedElement,
    selectedElements,
    _setPendingSnapshot,
    commitHistory,
    scale,
  } = useCanvasStore()

  const [pendingDrag, setPendingDrag] = useState(false)
  const [isDragging, setIsDragging]   = useState(false)
  const [dragStart, setDragStart]     = useState({ x: 0, y: 0, elX: 0, elY: 0 })
  const [isResizing, setIsResizing]   = useState(false)
  const [resizeStart, setResizeStart] = useState({
    mouseX: 0, mouseY: 0,
    elX: 0, elY: 0,
    width: 0, height: 0,
    handle: 'se' as ResizeHandle,
  })

  const DRAG_THRESHOLD = 4 // px — prevent accidental move on click

  const isSelected         = selectedElement === element.id
  const isInMultiSelection = selectedElements.includes(element.id) && !isSelected
  const isForRent          = element.type === 'booth' && element.properties?.forRent === true
  const rentStatus         = element.properties?.status as string | undefined

  const config = elementConfig[element.type] ?? {
    background: '#a1a1aa', borderRadius: '12px', textColor: 'text-white', icon: null,
  }

  // ── Event handlers ──────────────────────────────────────────────────

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (e.shiftKey) { addToSelection(element.id); return }
    selectElement(element.id)
    // Record start position but wait for threshold before committing to a drag
    setDragStart({ x: e.clientX, y: e.clientY, elX: element.x, elY: element.y })
    setPendingDrag(true)
  }

  const handleResizeMouseDown = (e: React.MouseEvent, handle: ResizeHandle) => {
    e.stopPropagation()
    _setPendingSnapshot()
    setIsResizing(true)
    setResizeStart({
      mouseX: e.clientX, mouseY: e.clientY,
      elX: element.x,    elY: element.y,
      width: element.width, height: element.height,
      handle,
    })
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
      const newX = dragStart.elX + (e.clientX - dragStart.x) / scale
      const newY = dragStart.elY + (e.clientY - dragStart.y) / scale
      updateElementSilent(element.id, {
        x: Math.round(newX / GRID) * GRID,
        y: Math.round(newY / GRID) * GRID,
      })
    } else if (isResizing) {
      const dx = (e.clientX - resizeStart.mouseX) / scale
      const dy = (e.clientY - resizeStart.mouseY) / scale
      const { handle, elX, elY, width: startW, height: startH } = resizeStart
      const updates: Partial<CanvasElementType> = {}

      if (handle.includes('e')) updates.width  = Math.max(30, startW + dx)
      if (handle.includes('s')) updates.height = Math.max(30, startH + dy)
      if (handle.includes('w')) {
        const newW = Math.max(30, startW - dx)
        updates.width = newW
        updates.x = elX + (startW - newW)
      }
      if (handle.includes('n')) {
        const newH = Math.max(30, startH - dy)
        updates.height = newH
        updates.y = elY + (startH - newH)
      }
      updateElementSilent(element.id, updates)
    }
  }

  const handleMouseUp = () => {
    setPendingDrag(false)
    if (isDragging || isResizing) commitHistory()
    setIsDragging(false)
    setIsResizing(false)
  }

  React.useEffect(() => {
    if (isDragging || isResizing || pendingDrag) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, isResizing, pendingDrag, dragStart, resizeStart])

  // ── Derived styles ───────────────────────────────────────────────────

  // Outer wrapper: rectangular — drives the selection box + handles
  const outerBoxShadow = isSelected
    ? '0 0 0 1.5px #fff, 0 0 0 3px #18181b, 0 8px 24px rgba(0,0,0,0.22)'
    : isInMultiSelection
    ? '0 0 0 1.5px #fff, 0 0 0 3px #3b82f6, 0 4px 12px rgba(59,130,246,0.22)'
    : undefined

  // Inner visual div: rounded — drives the element color + rent ring
  const innerBoxShadow = isSelected || isInMultiSelection
    ? undefined // outer handles the ring
    : isForRent && rentStatus === 'rented'
    ? '0 0 0 2px #a1a1aa'
    : isForRent && rentStatus === 'pending'
    ? '0 0 0 2px #f59e0b'
    : isForRent
    ? '0 0 0 2px #22c55e'
    : '0 2px 8px rgba(0,0,0,0.14), 0 1px 3px rgba(0,0,0,0.10)'

  return (
    // ── Outer: no border-radius → rectangular selection ring + handles ──
    <div
      style={{
        position: 'absolute',
        left: element.x, top: element.y,
        width: element.width, height: element.height,
        transform: `rotate(${element.rotation}deg)`,
        cursor: isDragging ? 'grabbing' : 'move',
        boxShadow: outerBoxShadow,
        transition: 'box-shadow 0.15s ease',
        opacity: isDragging ? 0.8 : 1,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* ── Inner: border-radius → rounded visual appearance ── */}
      <div
        className={cn('absolute inset-0 flex flex-col items-center justify-center')}
        style={{
          background: config.background,
          borderRadius: config.borderRadius,
          boxShadow: innerBoxShadow,
          transition: 'box-shadow 0.15s ease',
        }}
      >
        {element.width > 50 && element.height > 50 && (
          <div className='mb-1'>{config.icon}</div>
        )}
        <span
          className={cn('pointer-events-none truncate px-1 font-medium', config.textColor)}
          style={{ fontSize: element.width > 60 ? '12px' : '10px' }}
        >
          {element.name}
        </span>

        {/* Rented lock overlay */}
        {isForRent && rentStatus === 'rented' && (
          <div className='absolute inset-0 bg-zinc-900/20 rounded-[inherit] flex items-center justify-center pointer-events-none'>
            <Lock className='w-4 h-4 text-zinc-600' />
          </div>
        )}
      </div>

      {/* ── 8-point rectangular resize handles (on outer wrapper) ── */}
      {isSelected && ALL_HANDLES.map((h) => (
        <div
          key={h}
          style={handleStyle(h)}
          onMouseDown={(e) => handleResizeMouseDown(e, h)}
        />
      ))}
    </div>
  )
}
