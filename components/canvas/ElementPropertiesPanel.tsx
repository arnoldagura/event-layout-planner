'use client'

import React from 'react'
import { useCanvasStore } from '@/lib/store'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Trash2,
  Box,
  Move,
  Ruler,
  Type,
  X,
  Presentation,
  Table,
  Armchair,
  Store,
  DoorOpen,
  DoorClosed,
  Bath,
  Wine,
  ClipboardList,
} from 'lucide-react'

const elementConfig: Record<string, {
  bgColor: string
  borderColor: string
  textColor: string
  label: string
  icon: React.ReactNode
}> = {
  stage: {
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    label: 'Stage',
    icon: <Presentation className="w-4 h-4" />
  },
  table: {
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    label: 'Table',
    icon: <Table className="w-4 h-4" />
  },
  chair: {
    bgColor: 'bg-zinc-50',
    borderColor: 'border-zinc-200',
    textColor: 'text-zinc-700',
    label: 'Chair',
    icon: <Armchair className="w-4 h-4" />
  },
  booth: {
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    label: 'Booth',
    icon: <Store className="w-4 h-4" />
  },
  entrance: {
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
    label: 'Entrance',
    icon: <DoorOpen className="w-4 h-4" />
  },
  exit: {
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    label: 'Exit',
    icon: <DoorClosed className="w-4 h-4" />
  },
  restroom: {
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    textColor: 'text-slate-700',
    label: 'Restroom',
    icon: <Bath className="w-4 h-4" />
  },
  bar: {
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-700',
    label: 'Bar',
    icon: <Wine className="w-4 h-4" />
  },
  registration: {
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    textColor: 'text-cyan-700',
    label: 'Registration',
    icon: <ClipboardList className="w-4 h-4" />
  },
}

interface Props {
  panOffset: { x: number; y: number }
  scale: number
}

export const ElementPropertiesPanel: React.FC<Props> = ({ panOffset, scale }) => {
  const { elements, selectedElement, updateElement, deleteElement, selectElement } = useCanvasStore()

  const element = elements.find((el) => el.id === selectedElement)

  if (!element) {
    return null
  }

  const config = elementConfig[element.type] || {
    bgColor: 'bg-zinc-50',
    borderColor: 'border-zinc-200',
    textColor: 'text-zinc-700',
    label: element.type,
    icon: <Box className="w-4 h-4" />
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateElement(element.id, { name: e.target.value })
  }

  const handleDimensionChange = (dimension: 'width' | 'height', value: string) => {
    const numValue = parseInt(value) || 30
    updateElement(element.id, { [dimension]: Math.max(30, numValue) })
  }

  const handleDelete = () => {
    deleteElement(element.id)
  }

  const handleClose = () => {
    selectElement(null)
  }

  // Calculate position near the element
  // Position the panel to the right of the element, or left if not enough space
  const panelWidth = 240
  const panelHeight = 320
  const padding = 16

  // Element's screen position
  const elementScreenX = element.x * scale + panOffset.x
  const elementScreenY = element.y * scale + panOffset.y
  const elementScreenWidth = element.width * scale
  const elementScreenHeight = element.height * scale

  // Default: position to the right of the element
  let left = elementScreenX + elementScreenWidth + padding
  let top = elementScreenY

  // Clamp to viewport bounds
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800

  // If panel would go off right edge, position to the left of element
  if (left + panelWidth > viewportWidth - 100) {
    left = elementScreenX - panelWidth - padding
  }

  // Keep panel on screen horizontally
  left = Math.max(padding, Math.min(left, viewportWidth - panelWidth - 100))

  // Keep panel on screen vertically (accounting for header ~112px)
  top = Math.max(130, Math.min(top, viewportHeight - panelHeight - padding))

  return (
    <div
      className="fixed z-50 w-60 bg-white rounded-xl shadow-2xl border overflow-hidden"
      style={{
        left: `${left}px`,
        top: `${top}px`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="p-3 border-b bg-zinc-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg ${config.bgColor} ${config.borderColor} border flex items-center justify-center`}>
            <span className={config.textColor}>{config.icon}</span>
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900 text-sm leading-tight">Properties</h3>
            <p className="text-[10px] text-zinc-500">{config.label}</p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="p-1 rounded-md hover:bg-zinc-200 text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Properties */}
      <div className="p-3 space-y-3">
        {/* Name */}
        <div className="space-y-1">
          <Label htmlFor="element-name" className="text-[10px] flex items-center gap-1 text-zinc-500 uppercase tracking-wider">
            <Type className="w-3 h-3" />
            Name
          </Label>
          <Input
            id="element-name"
            value={element.name}
            onChange={handleNameChange}
            className="h-8 text-sm"
            placeholder="Element name"
          />
        </div>

        {/* Dimensions */}
        <div className="space-y-1">
          <Label className="text-[10px] flex items-center gap-1 text-zinc-500 uppercase tracking-wider">
            <Ruler className="w-3 h-3" />
            Size
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-[10px] text-zinc-400 mb-0.5">W</div>
              <Input
                type="number"
                min={30}
                value={Math.round(element.width)}
                onChange={(e) => handleDimensionChange('width', e.target.value)}
                className="h-7 text-sm"
              />
            </div>
            <div>
              <div className="text-[10px] text-zinc-400 mb-0.5">H</div>
              <Input
                type="number"
                min={30}
                value={Math.round(element.height)}
                onChange={(e) => handleDimensionChange('height', e.target.value)}
                className="h-7 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Position (read-only) */}
        <div className="space-y-1">
          <Label className="text-[10px] flex items-center gap-1 text-zinc-500 uppercase tracking-wider">
            <Move className="w-3 h-3" />
            Position
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="px-2 py-1.5 bg-zinc-50 rounded-md border text-center">
              <div className="text-[10px] text-zinc-400">X</div>
              <div className="text-sm text-zinc-700 font-medium">{Math.round(element.x)}</div>
            </div>
            <div className="px-2 py-1.5 bg-zinc-50 rounded-md border text-center">
              <div className="text-[10px] text-zinc-400">Y</div>
              <div className="text-sm text-zinc-700 font-medium">{Math.round(element.y)}</div>
            </div>
          </div>
        </div>

        {/* Delete button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 h-8"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Remove
        </Button>
      </div>
    </div>
  )
}
