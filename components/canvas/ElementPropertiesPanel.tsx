"use client"

import React, { useEffect, useState } from "react"
import {
  Presentation,
  Armchair,
  Store,
  DoorOpen,
  DoorClosed,
  Wine,
  ClipboardList,
  Type,
  Ruler,
  Crosshair,
  RotateCw,
  Trash2,
  Lock,
  Users,
} from "lucide-react"
import { FaRestroom } from "react-icons/fa"

import { useCanvasStore } from "@/lib/store"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MdTableRestaurant } from "react-icons/md"

interface Props {
  elementId: string
  bidCount: number
}

const ELEMENT_ICONS: Record<string, { icon: React.ReactNode; bgClass: string; iconClass: string }> =
  {
    stage: {
      icon: <Presentation className="h-5 w-5" />,
      bgClass: "bg-blue-100",
      iconClass: "text-blue-600",
    },
    table: {
      icon: <MdTableRestaurant className="h-5 w-5" />,
      bgClass: "bg-amber-100",
      iconClass: "text-amber-600",
    },
    chair: {
      icon: <Armchair className="h-5 w-5" />,
      bgClass: "bg-zinc-100",
      iconClass: "text-zinc-600",
    },
    booth: {
      icon: <Store className="h-5 w-5" />,
      bgClass: "bg-teal-100",
      iconClass: "text-teal-600",
    },
    entrance: {
      icon: <DoorOpen className="h-5 w-5" />,
      bgClass: "bg-emerald-100",
      iconClass: "text-emerald-600",
    },
    exit: {
      icon: <DoorClosed className="h-5 w-5" />,
      bgClass: "bg-red-100",
      iconClass: "text-red-600",
    },
    restroom: {
      icon: <FaRestroom className="h-5 w-5" />,
      bgClass: "bg-slate-100",
      iconClass: "text-slate-600",
    },
    bar: {
      icon: <Wine className="h-5 w-5" />,
      bgClass: "bg-orange-100",
      iconClass: "text-orange-600",
    },
    registration: {
      icon: <ClipboardList className="h-5 w-5" />,
      bgClass: "bg-cyan-100",
      iconClass: "text-cyan-600",
    },
  }

export function ElementPropertiesPanel({ elementId, bidCount }: Props) {
  const { elements, updateElement, deleteElement } = useCanvasStore()
  const element = elements.find((e) => e.id === elementId)

  const props = (element?.properties ?? {}) as Record<string, unknown>
  const isBooth = element?.type === "booth"

  const [name, setName] = useState(element?.name ?? "")
  const [width, setWidth] = useState(element?.width ?? 80)
  const [height, setHeight] = useState(element?.height ?? 80)
  const [rotation, setRotation] = useState(element?.rotation ?? 0)
  const [posX, setPosX] = useState(Math.round(element?.x ?? 0))
  const [posY, setPosY] = useState(Math.round(element?.y ?? 0))
  const [forRent, setForRent] = useState(Boolean(props.forRent))
  const [askingPrice, setAskingPrice] = useState(String(props.askingPrice ?? ""))
  const [category, setCategory] = useState(String(props.category ?? ""))
  const [description, setDescription] = useState(String(props.description ?? ""))
  const [attendeeName, setAttendeeName] = useState(String(props.attendeeName ?? ""))

  useEffect(() => {
    if (!element) return
    const p = (element.properties ?? {}) as Record<string, unknown>

    if (element.type === "booth" && !p.boothId) {
      updateElement(elementId, { properties: { ...p, boothId: crypto.randomUUID() } })
    }

    setName(element.name)
    setWidth(element.width)
    setHeight(element.height)
    setRotation(element.rotation)
    setPosX(Math.round(element.x))
    setPosY(Math.round(element.y))
    setForRent(Boolean(p.forRent))
    setAskingPrice(String(p.askingPrice ?? ""))
    setCategory(String(p.category ?? ""))
    setDescription(String(p.description ?? ""))
    setAttendeeName(String(p.attendeeName ?? ""))
  }, [elementId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!element) return null

  const typeConfig = ELEMENT_ICONS[element.type] ?? {
    icon: null,
    bgClass: "bg-zinc-100",
    iconClass: "text-zinc-600",
  }
  const rentStatus = String(props.status ?? "available")
  const statusColor =
    rentStatus === "rented"
      ? "text-muted-foreground bg-muted border-border"
      : rentStatus === "pending"
        ? "text-warning bg-warning/10 border-warning"
        : "text-success bg-success/10 border-success"

  const applyName = () => {
    const trimmed = name.trim()
    if (trimmed && trimmed !== element.name) {
      updateElement(elementId, { name: trimmed })
    }
  }

  const applyAttendeeName = () => {
    const existing = (element.properties ?? {}) as Record<string, unknown>
    const trimmed = attendeeName.trim()
    updateElement(elementId, {
      properties: {
        ...existing,
        attendeeName: trimmed || undefined,
      },
    })
  }

  const applyDimensions = () => {
    const w = Math.max(30, width)
    const h = Math.max(30, height)
    if (w !== element.width || h !== element.height) {
      updateElement(elementId, { width: w, height: h })
    }
  }

  const applyRotation = () => {
    updateElement(elementId, { rotation: rotation % 360 })
  }

  const applyPosition = () => {
    updateElement(elementId, { x: posX, y: posY })
  }

  const applyBoothProps = () => {
    const existing = (element.properties ?? {}) as Record<string, unknown>
    updateElement(elementId, {
      properties: {
        ...existing,
        forRent,
        askingPrice: forRent && askingPrice ? Number(askingPrice) : undefined,
        category: category.trim() || undefined,
        description: description.trim() || undefined,
        status: existing.status ?? (forRent ? "available" : undefined),
      },
    })
  }

  const handleForRentToggle = () => {
    const next = !forRent
    setForRent(next)
    const existing = (element.properties ?? {}) as Record<string, unknown>
    updateElement(elementId, {
      properties: {
        ...existing,
        forRent: next,
        status: existing.status ?? (next ? "available" : undefined),
      },
    })
  }

  return (
    <div className="shrink-0 border-b border-border bg-card">
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-none text-white shadow-none ${typeConfig.bgClass}`}
        >
          {typeConfig.icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-mono text-xs font-bold tracking-widest text-foreground uppercase">
            Properties
          </h3>
          <p className="mt-0.5 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
            {element.type}
          </p>
        </div>
        {isBooth && forRent && (
          <Badge
            className={`shrink-0 rounded-none border font-mono text-[10px] tracking-widest uppercase ${statusColor}`}
          >
            {rentStatus.charAt(0).toUpperCase() + rentStatus.slice(1)}
          </Badge>
        )}
        {isBooth && bidCount > 0 && (
          <Badge
            variant="secondary"
            className="shrink-0 rounded-none border border-border bg-secondary font-mono text-[10px] tracking-widest text-secondary-foreground uppercase"
          >
            {bidCount} bid{bidCount !== 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      <div className="h-px bg-border" />

      <div className="space-y-4 p-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Type className="h-3.5 w-3.5 text-muted-foreground" />
            <Label className="font-mono text-[10px] font-bold tracking-widest text-foreground uppercase">
              Name
            </Label>
          </div>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={applyName}
            onKeyDown={(e) => {
              if (e.key === "Enter") applyName()
            }}
            placeholder="Element name"
            className="h-9 rounded-none border-border bg-background font-mono text-xs shadow-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <Label className="font-mono text-[10px] font-bold tracking-widest text-foreground uppercase">
              {element.type === "chair" ? "Attendee Name" : "Attendees"}
            </Label>
          </div>
          {element.type === "chair" ? (
            <Input
              value={attendeeName}
              onChange={(e) => setAttendeeName(e.target.value)}
              onBlur={applyAttendeeName}
              onKeyDown={(e) => {
                if (e.key === "Enter") applyAttendeeName()
              }}
              placeholder="Assign to attendee"
              className="h-9 rounded-none border-border bg-background font-mono text-xs shadow-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          ) : (
            <Textarea
              value={attendeeName}
              onChange={(e) => setAttendeeName(e.target.value)}
              onBlur={applyAttendeeName}
              placeholder="Assign attendees (one per line)"
              rows={3}
              className="resize-none rounded-none border-border bg-background font-mono text-xs shadow-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Ruler className="h-3.5 w-3.5 text-muted-foreground" />
            <Label className="font-mono text-[10px] font-bold tracking-widest text-foreground uppercase">
              Dimensions
            </Label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <p className="font-mono text-[9px] font-bold tracking-widest text-muted-foreground uppercase">
                Width
              </p>
              <Input
                type="number"
                min={30}
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                onBlur={applyDimensions}
                className="h-9 rounded-none border-border bg-background font-mono text-xs shadow-none"
              />
            </div>
            <div className="space-y-1">
              <p className="font-mono text-[9px] font-bold tracking-widest text-muted-foreground uppercase">
                Height
              </p>
              <Input
                type="number"
                min={30}
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                onBlur={applyDimensions}
                className="h-9 rounded-none border-border bg-background font-mono text-xs shadow-none"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <RotateCw className="h-3.5 w-3.5 text-muted-foreground" />
            <Label className="font-mono text-[10px] font-bold tracking-widest text-foreground uppercase">
              Rotation
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={Math.round(rotation)}
              onChange={(e) => setRotation(Number(e.target.value))}
              onBlur={applyRotation}
              onKeyDown={(e) => {
                if (e.key === "Enter") applyRotation()
              }}
              className="h-9 rounded-none border-border bg-background font-mono text-xs shadow-none"
            />
            <span className="shrink-0 font-mono text-xs text-muted-foreground">°</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Crosshair className="h-3.5 w-3.5 text-muted-foreground" />
            <Label className="font-mono text-[10px] font-bold tracking-widest text-foreground uppercase">
              Position
            </Label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <p className="font-mono text-[9px] font-bold tracking-widest text-muted-foreground uppercase">
                X
              </p>
              <Input
                type="number"
                value={posX}
                onChange={(e) => setPosX(Number(e.target.value))}
                onBlur={applyPosition}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyPosition()
                }}
                className="h-9 rounded-none border-border bg-background font-mono text-xs shadow-none"
              />
            </div>
            <div className="space-y-1">
              <p className="font-mono text-[9px] font-bold tracking-widest text-muted-foreground uppercase">
                Y
              </p>
              <Input
                type="number"
                value={posY}
                onChange={(e) => setPosY(Number(e.target.value))}
                onBlur={applyPosition}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyPosition()
                }}
                className="h-9 rounded-none border-border bg-background font-mono text-xs shadow-none"
              />
            </div>
          </div>
        </div>

        {isBooth && (
          <>
            <div className="h-px bg-border" />

            <div className="flex items-center justify-between">
              <Label className="font-mono text-[10px] font-bold tracking-widest text-foreground uppercase">
                For Rent
              </Label>
              <button
                role="switch"
                aria-checked={forRent}
                onClick={handleForRentToggle}
                className={`relative inline-flex h-5 w-9 items-center rounded-none border border-border transition-colors focus:outline-none ${
                  forRent ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform border border-border bg-background transition-transform ${
                    forRent ? "translate-x-[18px]" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {forRent && (
              <div className="space-y-1.5">
                <Label className="font-mono text-[10px] font-bold tracking-widest text-foreground uppercase">
                  Asking Price ($)
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={askingPrice}
                  onChange={(e) => setAskingPrice(e.target.value)}
                  onBlur={applyBoothProps}
                  placeholder="e.g. 500"
                  className="h-9 rounded-none border-border bg-background font-mono text-xs shadow-none"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="font-mono text-[10px] font-bold tracking-widest text-foreground uppercase">
                Category
              </Label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                onBlur={applyBoothProps}
                placeholder="e.g. Technology, Food"
                className="h-9 rounded-none border-border bg-background font-mono text-xs shadow-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-mono text-[10px] font-bold tracking-widest text-foreground uppercase">
                Description
              </Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={applyBoothProps}
                placeholder="Booth details..."
                rows={2}
                className="resize-none rounded-none border-border bg-background font-mono text-xs shadow-none"
              />
            </div>
          </>
        )}

        <div className="h-px bg-border" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
            <Label className="font-mono text-[10px] font-bold tracking-widest text-foreground uppercase">
              Lock element
            </Label>
          </div>
          <button
            role="switch"
            aria-checked={Boolean(props.isLocked)}
            onClick={() => {
              const existing = (element.properties ?? {}) as Record<string, unknown>
              updateElement(elementId, {
                properties: { ...existing, isLocked: !existing.isLocked },
              })
            }}
            className={`relative inline-flex h-5 w-9 items-center rounded-none border border-border transition-colors focus:outline-none ${
              props.isLocked ? "bg-warning" : "bg-muted"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform border border-border bg-background transition-transform ${
                props.isLocked ? "translate-x-[18px]" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="hover:text-destructive-foreground w-full rounded-none border-destructive font-mono text-[10px] tracking-widest text-destructive uppercase shadow-none hover:bg-destructive"
          onClick={() => deleteElement(elementId)}
        >
          <Trash2 className="h-4 w-4" />
          Remove Element
        </Button>
      </div>
    </div>
  )
}
