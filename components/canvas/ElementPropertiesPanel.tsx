'use client'

import React from 'react'
import { useCanvasStore } from '@/lib/store'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Trash2,
  Box,
  Move,
  Ruler,
  Type,
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

export const ElementPropertiesPanel: React.FC = () => {
  const { elements, selectedElement, updateElement, deleteElement } = useCanvasStore()

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

  return (
    <div className="border-b">
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-8 h-8 rounded-lg ${config.bgColor} ${config.borderColor} border flex items-center justify-center`}>
            <span className={config.textColor}>{config.icon}</span>
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900 text-sm">Element Properties</h3>
            <p className="text-xs text-zinc-500">{config.label}</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Properties */}
      <div className="p-4 space-y-4">
        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="element-name" className="text-xs flex items-center gap-1.5 text-zinc-600">
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
        <div className="space-y-1.5">
          <Label className="text-xs flex items-center gap-1.5 text-zinc-600">
            <Ruler className="w-3 h-3" />
            Dimensions
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1">Width</div>
              <Input
                type="number"
                min={30}
                value={Math.round(element.width)}
                onChange={(e) => handleDimensionChange('width', e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1">Height</div>
              <Input
                type="number"
                min={30}
                value={Math.round(element.height)}
                onChange={(e) => handleDimensionChange('height', e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Position (read-only) */}
        <div className="space-y-1.5">
          <Label className="text-xs flex items-center gap-1.5 text-zinc-600">
            <Move className="w-3 h-3" />
            Position
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="px-3 py-1.5 bg-zinc-50 rounded-md border">
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider">X</div>
              <div className="text-sm text-zinc-700 font-medium">{Math.round(element.x)}</div>
            </div>
            <div className="px-3 py-1.5 bg-zinc-50 rounded-md border">
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Y</div>
              <div className="text-sm text-zinc-700 font-medium">{Math.round(element.y)}</div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Delete button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
        >
          <Trash2 className="w-4 h-4" />
          Remove Element
        </Button>
      </div>
    </div>
  )
}
