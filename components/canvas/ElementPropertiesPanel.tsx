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

  useEffect(() => {
    if (!element) return
    const p = (element.properties ?? {}) as Record<string, unknown>

    // Auto-generate boothId for booths
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
      ? "text-zinc-500 bg-zinc-100 border-zinc-200"
      : rentStatus === "pending"
        ? "text-amber-700 bg-amber-50 border-amber-200"
        : "text-emerald-700 bg-emerald-50 border-emerald-200"

  // Apply name on blur / Enter
  const applyName = () => {
    const trimmed = name.trim()
    if (trimmed && trimmed !== element.name) {
      updateElement(elementId, { name: trimmed })
    }
  }

  // Apply dimensions on blur
  const applyDimensions = () => {
    const w = Math.max(30, width)
    const h = Math.max(30, height)
    if (w !== element.width || h !== element.height) {
      updateElement(elementId, { width: w, height: h })
    }
  }

  // Apply rotation on blur / Enter
  const applyRotation = () => {
    updateElement(elementId, { rotation: rotation % 360 })
  }

  // Apply position on blur / Enter
  const applyPosition = () => {
    updateElement(elementId, { x: posX, y: posY })
  }

  // Apply booth rental props on blur
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

  // Toggle forRent immediately
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
    <div className="shrink-0 border-b bg-white">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${typeConfig.bgClass}`}
        >
          <span className={typeConfig.iconClass}>{typeConfig.icon}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm leading-tight font-semibold text-zinc-900">Properties</h3>
          <p className="mt-0.5 text-xs text-zinc-400 capitalize">{element.type}</p>
        </div>
        {isBooth && forRent && (
          <Badge className={`shrink-0 text-xs ${statusColor}`}>
            {rentStatus.charAt(0).toUpperCase() + rentStatus.slice(1)}
          </Badge>
        )}
        {isBooth && bidCount > 0 && (
          <Badge variant="secondary" className="shrink-0 text-xs">
            {bidCount} bid{bidCount !== 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      <div className="h-px bg-zinc-100" />

      <div className="space-y-4 p-4">
        {/* ── Name ── */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Type className="h-3.5 w-3.5 text-zinc-400" />
            <Label className="text-xs font-medium text-zinc-600">Name</Label>
          </div>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={applyName}
            onKeyDown={(e) => {
              if (e.key === "Enter") applyName()
            }}
            placeholder="Element name"
            className="h-9 text-sm"
          />
        </div>

        {/* ── Dimensions ── */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Ruler className="h-3.5 w-3.5 text-zinc-400" />
            <Label className="text-xs font-medium text-zinc-600">Dimensions</Label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <p className="text-[10px] font-medium tracking-wide text-zinc-400 uppercase">Width</p>
              <Input
                type="number"
                min={30}
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                onBlur={applyDimensions}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-medium tracking-wide text-zinc-400 uppercase">
                Height
              </p>
              <Input
                type="number"
                min={30}
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                onBlur={applyDimensions}
                className="h-9 text-sm"
              />
            </div>
          </div>
        </div>

        {/* ── Rotation ── */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <RotateCw className="h-3.5 w-3.5 text-zinc-400" />
            <Label className="text-xs font-medium text-zinc-600">Rotation</Label>
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
              className="h-9 text-sm"
            />
            <span className="shrink-0 text-sm text-zinc-400">°</span>
          </div>
        </div>

        {/* ── Position ── */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Crosshair className="h-3.5 w-3.5 text-zinc-400" />
            <Label className="text-xs font-medium text-zinc-600">Position</Label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <p className="text-[10px] font-medium tracking-wide text-zinc-400 uppercase">X</p>
              <Input
                type="number"
                value={posX}
                onChange={(e) => setPosX(Number(e.target.value))}
                onBlur={applyPosition}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyPosition()
                }}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-medium tracking-wide text-zinc-400 uppercase">Y</p>
              <Input
                type="number"
                value={posY}
                onChange={(e) => setPosY(Number(e.target.value))}
                onBlur={applyPosition}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyPosition()
                }}
                className="h-9 text-sm"
              />
            </div>
          </div>
        </div>

        {/* ── Booth rental fields ── */}
        {isBooth && (
          <>
            <div className="h-px bg-zinc-100" />

            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-zinc-700">For Rent</Label>
              <button
                role="switch"
                aria-checked={forRent}
                onClick={handleForRentToggle}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                  forRent ? "bg-zinc-900" : "bg-zinc-300"
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    forRent ? "translate-x-4" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {forRent && (
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-600">Asking Price ($)</Label>
                <Input
                  type="number"
                  min={0}
                  value={askingPrice}
                  onChange={(e) => setAskingPrice(e.target.value)}
                  onBlur={applyBoothProps}
                  placeholder="e.g. 500"
                  className="h-9 text-sm"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-600">Category</Label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                onBlur={applyBoothProps}
                placeholder="e.g. Technology, Food"
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-600">Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={applyBoothProps}
                placeholder="Booth details..."
                rows={2}
                className="resize-none text-sm"
              />
            </div>
          </>
        )}

        {/* ── Lock ── */}
        <div className="h-px bg-zinc-100" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-zinc-400" />
            <Label className="text-xs font-medium text-zinc-600">Lock element</Label>
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
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
              props.isLocked ? "bg-amber-500" : "bg-zinc-300"
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                props.isLocked ? "translate-x-4" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* ── Remove ── */}
        <Button
          variant="outline"
          size="sm"
          className="w-full border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50"
          onClick={() => deleteElement(elementId)}
        >
          <Trash2 className="h-4 w-4" />
          Remove Element
        </Button>
      </div>
    </div>
  )
}
