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

interface Props {
  collapsed?: boolean
}

export const ElementToolbar: React.FC<Props> = ({ collapsed = false }) => {
  const handleDragStart = (e: React.DragEvent, elementType: string) => {
    e.dataTransfer.setData("elementType", elementType)
    e.dataTransfer.effectAllowed = "copy"
  }

  return (
    <TooltipProvider delayDuration={300}>
      {/* Outer wrapper — width is controlled by parent; this fills it */}
      <div className="relative flex h-full w-full flex-col overflow-hidden">
        {/* ── Collapsed view (icon strip) ── */}
        <div
          className={`absolute inset-0 flex flex-col items-center gap-1.5 overflow-y-auto px-2 py-3 transition-opacity duration-150 ${
            collapsed ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          {elements.map((element) => (
            <Tooltip key={element.type}>
              <TooltipTrigger asChild>
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, element.type)}
                  className={`flex h-10 w-10 cursor-grab items-center justify-center rounded-none shadow-none ${element.color} text-white transition-opacity hover:opacity-80 active:cursor-grabbing`}
                >
                  {element.icon}
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="rounded-none border border-border bg-card font-mono text-[10px] text-foreground uppercase"
              >
                <p>Drag to add {element.label.toLowerCase()}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* ── Expanded view (full panel) ── */}
        <div
          className={`flex h-full flex-col bg-card transition-opacity duration-150 ${
            collapsed ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
        >
          <div className="border-b border-border p-4">
            <h2 className="font-mono text-xs font-bold tracking-widest text-foreground uppercase">
              Elements
            </h2>
            <p className="mt-1 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
              Drag onto canvas
            </p>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto p-4">
            {categories.map((category) => (
              <div key={category.id}>
                <h3 className="mb-3 px-1 font-mono text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                  {category.label}
                </h3>
                <div className="space-y-2">
                  {elements
                    .filter((el) => el.category === category.id)
                    .map((element) => (
                      <Tooltip key={element.type}>
                        <TooltipTrigger asChild>
                          <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, element.type)}
                            className="group flex cursor-grab items-center gap-3 border border-border bg-background p-2 transition-colors hover:border-foreground active:cursor-grabbing"
                          >
                            <div
                              className={`flex h-8 w-8 items-center justify-center ${element.color} text-white shadow-none`}
                            >
                              {element.icon}
                            </div>
                            <span className="flex-1 font-mono text-[10px] font-bold tracking-widest text-foreground uppercase transition-colors group-hover:text-foreground">
                              {element.label}
                            </span>
                            <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          className="rounded-none border border-border bg-card font-mono text-[10px] text-foreground uppercase"
                        >
                          <p>Drag to add {element.label.toLowerCase()}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border bg-muted p-4">
            <p className="font-mono text-[9px] leading-relaxed tracking-widest text-muted-foreground uppercase">
              <span className="font-bold text-foreground">SYSTEM TIP:</span> CLICK AN ELEMENT ON
              CANVAS TO SELECT IT, THEN DRAG TO MOVE OR RESIZE.
            </p>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
