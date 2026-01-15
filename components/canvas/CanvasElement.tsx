'use client'

import React, { useState } from 'react'
import { useCanvasStore, type CanvasElement as CanvasElementType } from '@/lib/store'
import { cn } from '@/lib/utils'

interface Props {
  element: CanvasElementType
}

export const CanvasElement: React.FC<Props> = ({ element }) => {
  const { updateElement, selectElement, selectedElement, deleteElement } = useCanvasStore()
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isResizing, setIsResizing] = useState(false)
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })

  const isSelected = selectedElement === element.id

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    selectElement(element.id)
    setIsDragging(true)
    setDragStart({
      x: e.clientX - element.x,
      y: e.clientY - element.y,
    })
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      updateElement(element.id, {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    } else if (isResizing) {
      const newWidth = Math.max(20, resizeStart.width + (e.clientX - resizeStart.x))
      const newHeight = Math.max(20, resizeStart.height + (e.clientY - resizeStart.y))
      updateElement(element.id, {
        width: newWidth,
        height: newHeight,
      })
    }
  }

  const handleMouseUp = () => {
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

  const getElementColor = (type: string) => {
    const colors: Record<string, string> = {
      stage: 'bg-indigo-200 border-indigo-400',
      table: 'bg-blue-200 border-blue-400',
      chair: 'bg-green-200 border-green-400',
      booth: 'bg-yellow-200 border-yellow-400',
      entrance: 'bg-emerald-200 border-emerald-400',
      exit: 'bg-red-200 border-red-400',
      restroom: 'bg-cyan-200 border-cyan-400',
      bar: 'bg-orange-200 border-orange-400',
      registration: 'bg-indigo-200 border-indigo-400',
    }
    return colors[type] || 'bg-gray-200 border-gray-400'
  }

  return (
    <div
      className={cn(
        'absolute border-2 cursor-move flex items-center justify-center text-xs font-medium transition-all',
        getElementColor(element.type),
        isSelected && 'ring-2 ring-blue-500 ring-offset-2',
        isDragging && 'opacity-70'
      )}
      style={{
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
        transform: `rotate(${element.rotation}deg)`,
      }}
      onMouseDown={handleMouseDown}
    >
      <span className="pointer-events-none truncate px-1">{element.name}</span>

      {isSelected && (
        <>
          <button
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
            onClick={handleDelete}
          >
            ×
          </button>
          <div
            className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize"
            onMouseDown={handleResizeMouseDown}
          />
        </>
      )}
    </div>
  )
}
