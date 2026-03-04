"use client"

import React from "react"
import {
  Presentation,
  Armchair,
  Store,
  DoorOpen,
  DoorClosed,
  Wine,
  ClipboardList,
  GripVertical,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { FaRestroom } from "react-icons/fa"
import { MdTableRestaurant } from "react-icons/md"

interface ElementType {
  type: string
  label: string
  icon: React.ReactNode
  color: string
  category: "venue" | "seating" | "services"
}

const elements: ElementType[] = [
  // Venue elements
  {
    type: "stage",
    label: "Stage",
    icon: <Presentation className="h-4 w-4" />,
    color: "bg-blue-500",
    category: "venue",
  },
  {
    type: "entrance",
    label: "Entrance",
    icon: <DoorOpen className="h-4 w-4" />,
    color: "bg-emerald-500",
    category: "venue",
  },
  {
    type: "exit",
    label: "Exit",
    icon: <DoorClosed className="h-4 w-4" />,
    color: "bg-red-500",
    category: "venue",
  },
  // Seating elements
  {
    type: "table",
    label: "Table",
    icon: <MdTableRestaurant className="h-4 w-4" />,
    color: "bg-amber-500",
    category: "seating",
  },
  {
    type: "chair",
    label: "Chair",
    icon: <Armchair className="h-4 w-4" />,
    color: "bg-zinc-500",
    category: "seating",
  },
  {
    type: "booth",
    label: "Booth",
    icon: <Store className="h-4 w-4" />,
    color: "bg-purple-500",
    category: "seating",
  },
  // Service elements
  {
    type: "registration",
    label: "Registration",
    icon: <ClipboardList className="h-4 w-4" />,
    color: "bg-cyan-500",
    category: "services",
  },
  {
    type: "bar",
    label: "Bar",
    icon: <Wine className="h-4 w-4" />,
    color: "bg-orange-500",
    category: "services",
  },
  {
    type: "restroom",
    label: "Restroom",
    icon: <FaRestroom className="h-4 w-4" />,
    color: "bg-slate-500",
    category: "services",
  },
]

const categories = [
  { id: "venue", label: "Venue" },
  { id: "seating", label: "Seating" },
  { id: "services", label: "Services" },
] as const

export const ElementToolbar: React.FC = () => {
  const handleDragStart = (e: React.DragEvent, elementType: string) => {
    e.dataTransfer.setData("elementType", elementType)
    e.dataTransfer.effectAllowed = "copy"
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex w-56 flex-col border-r bg-white">
        {/* Header */}
        <div className="border-b p-4">
          <h2 className="font-semibold text-zinc-900">Elements</h2>
          <p className="mt-1 text-xs text-zinc-500">Drag onto canvas</p>
        </div>

        {/* Elements by category */}
        <div className="flex-1 space-y-4 overflow-y-auto p-3">
          {categories.map((category) => (
            <div key={category.id}>
              <h3 className="mb-2 px-1 text-xs font-medium tracking-wider text-zinc-400 uppercase">
                {category.label}
              </h3>
              <div className="space-y-1">
                {elements
                  .filter((el) => el.category === category.id)
                  .map((element) => (
                    <Tooltip key={element.type}>
                      <TooltipTrigger asChild>
                        <div
                          draggable
                          onDragStart={(e) => handleDragStart(e, element.type)}
                          className="group flex cursor-grab items-center gap-3 rounded-lg border border-transparent p-2.5 transition-colors hover:border-zinc-200 hover:bg-zinc-50 active:cursor-grabbing"
                        >
                          <div
                            className={`h-8 w-8 rounded-md ${element.color} flex items-center justify-center text-white shadow-sm`}
                          >
                            {element.icon}
                          </div>
                          <span className="flex-1 text-sm font-medium text-zinc-700">
                            {element.label}
                          </span>
                          <GripVertical className="h-4 w-4 text-zinc-300 opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Drag to add {element.label.toLowerCase()}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Help tip */}
        <div className="border-t bg-zinc-50 p-3">
          <p className="text-xs leading-relaxed text-zinc-500">
            <span className="font-medium text-zinc-600">Tip:</span> Click an element on canvas to
            select it, then drag to move or resize.
          </p>
        </div>
      </div>
    </TooltipProvider>
  )
}
