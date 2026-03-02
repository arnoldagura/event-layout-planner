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
  X,
  Lock,
} from 'lucide-react';

interface Props {
  element: CanvasElementType
}

const elementConfig: Record<
  string,
  {
    background: string;
    borderRadius: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
    icon: React.ReactNode;
  }
> = {
  stage: {
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-400',
    textColor: 'text-blue-700',
    background: '#3b82f6',
    borderRadius: '12px',
    icon: <Presentation className='w-5 h-5 text-white' />,
  },
  table: {
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-400',
    textColor: 'text-amber-700',
    background: '#f59e0b',
    borderRadius: '12px',
    icon: <Table className='w-5 h-5 text-white' />,
  },
  chair: {
    bgColor: 'bg-zinc-100',
    borderColor: 'border-zinc-400',
    textColor: 'text-zinc-700',
    background: '#71717a',
    borderRadius: '12px',
    icon: <Armchair className='w-4 h-4 text-white' />,
  },
  booth: {
    bgColor: 'bg-teal-100',
    borderColor: 'border-teal-400',
    textColor: 'text-teal-700',
    background: '#0d9488',
    borderRadius: '12px',
    icon: <Store className='w-5 h-5 text-white' />,
  },
  entrance: {
    bgColor: 'bg-emerald-100',
    borderColor: 'border-emerald-400',
    textColor: 'text-emerald-700',
    background: '#22c55e',
    borderRadius: '12px',
    icon: <DoorOpen className='w-5 h-5 text-white' />,
  },
  exit: {
    bgColor: 'bg-red-100',
    borderColor: 'border-red-400',
    textColor: 'text-red-700',
    background: '#ef4444',
    borderRadius: '12px',
    icon: <DoorClosed className='w-5 h-5 text-white' />,
  },
  restroom: {
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-400',
    textColor: 'text-slate-700',
    background: '#475569',
    borderRadius: '12px',
    icon: <Bath className='w-5 h-5 text-white' />,
  },
  bar: {
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-400',
    textColor: 'text-orange-700',
    background: '#f97316',
    borderRadius: '12px',
    icon: <Wine className='w-5 h-5 text-white' />,
  },
  registration: {
    bgColor: 'bg-cyan-100',
    borderColor: 'border-cyan-400',
    textColor: 'text-cyan-700',
    background: '#06b6d4',
    borderRadius: '12px',
    icon: <ClipboardList className='w-5 h-5 text-white' />,
  },
}

export const CanvasElement: React.FC<Props> = ({ element }) => {
  const { updateElementSilent, selectElement, selectedElement, deleteElement, _setPendingSnapshot, commitHistory } = useCanvasStore()
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isResizing, setIsResizing] = useState(false)
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })

  const isSelected = selectedElement === element.id
  const isForRent = element.type === 'booth' && element.properties?.forRent === true
  const rentStatus = element.properties?.status as string | undefined
  const config = elementConfig[element.type] || {
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-400',
    textColor: 'text-gray-700',
    background: '#a1a1aa',
    borderRadius: '12px',
    icon: null,
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    selectElement(element.id)
    _setPendingSnapshot()
    setIsDragging(true)
    setDragStart({
      x: e.clientX - element.x,
      y: e.clientY - element.y,
    })
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      updateElementSilent(element.id, {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    } else if (isResizing) {
      const newWidth = Math.max(30, resizeStart.width + (e.clientX - resizeStart.x))
      const newHeight = Math.max(30, resizeStart.height + (e.clientY - resizeStart.y))
      updateElementSilent(element.id, {
        width: newWidth,
        height: newHeight,
      })
    }
  }

  const handleMouseUp = () => {
    if (isDragging || isResizing) {
      commitHistory()
    }
    setIsDragging(false)
    setIsResizing(false)
  }

  React.useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, isResizing, dragStart, resizeStart])

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    _setPendingSnapshot()
    setIsResizing(true)
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: element.width,
      height: element.height,
    })
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    deleteElement(element.id)
  }

  void handleDelete;

  return (
    <div
      className={cn(
        'absolute border-2 cursor-move flex flex-col items-center justify-center rounded-md transition-shadow',
        config.bgColor,
        config.borderColor,
        isSelected && 'ring-2 ring-zinc-900 ring-offset-2 shadow-lg',
        isDragging && 'opacity-80 shadow-xl'
      )}
      style={{
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
        transform: `rotate(${element.rotation}deg)`,
        background: config.background,
        borderRadius: config.borderRadius,
        boxShadow: isSelected
          ? '0 0 0 2px #fff, 0 0 0 4px #18181b, 0 8px 20px rgba(0,0,0,0.18)'
          : isForRent && rentStatus === 'rented'
          ? '0 0 0 2px #a1a1aa'
          : isForRent && rentStatus === 'pending'
          ? '0 0 0 2px #f59e0b'
          : isForRent
          ? '0 0 0 2px #22c55e'
          : '0 2px 8px rgba(0,0,0,0.14), 0 1px 3px rgba(0,0,0,0.10)',
        transition: 'box-shadow 0.15s ease, opacity 0.1s ease',
      }}
      onMouseDown={handleMouseDown}
    >
      {element.width > 50 && element.height > 50 && (
        <div className={cn('mb-1', config.textColor)}>
          {config.icon}
        </div>
      )}

        <span
        className={cn(
          'pointer-events-none truncate px-1 font-medium',
          config.textColor,
          element.width > 60 ? 'text-xs' : 'text-[10px]'
        )}
        >
          {element.name}
        </span>

      {isForRent && rentStatus === 'rented' && (
        <div className="absolute inset-0 bg-zinc-900/20 rounded-[inherit] flex items-center justify-center pointer-events-none">
          <Lock className="w-4 h-4 text-zinc-600" />
        </div>
      )}

      {isSelected && (
        <>
          <button
            className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-md transition-colors"
            onClick={handleDelete}
          >
            <X className="w-3 h-3" />
          </button>

          <div
            className="absolute -bottom-1 -right-1 w-3 h-3 bg-zinc-900 rounded-sm cursor-se-resize shadow-sm"
            onMouseDown={handleResizeMouseDown}
          />

          <div className="absolute -top-1 -left-1 w-2 h-2 bg-zinc-900 rounded-sm" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-zinc-900 rounded-sm" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-zinc-900 rounded-sm" />
        </>
      )}
    </div>
  )
}
