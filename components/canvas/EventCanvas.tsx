'use client'

import React, { useRef, useState } from 'react'
import { useCanvasStore } from '@/lib/store'
import { CanvasElement } from './CanvasElement'

export const EventCanvas: React.FC = () => {
  const { elements, addElement, selectElement, scale } = useCanvasStore()
  const canvasRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === canvasRef.current) {
      selectElement(null)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const elementType = e.dataTransfer.getData('elementType')

    if (!elementType || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / scale
    const y = (e.clientY - rect.top) / scale

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
  }

  return (
    <div className="relative h-full w-full bg-gray-50 overflow-hidden">
      <div
        ref={canvasRef}
        className="absolute inset-0 bg-white"
        style={{
          backgroundImage: `
            linear-gradient(to right, #f0f0f0 1px, transparent 1px),
            linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)
          `,
          backgroundSize: `${20 * scale}px ${20 * scale}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: '1000px',
          height: '800px',
        }}
        onClick={handleCanvasClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {elements.map((element) => (
          <CanvasElement key={element.id} element={element} />
        ))}
      </div>
    </div>
  )
}
