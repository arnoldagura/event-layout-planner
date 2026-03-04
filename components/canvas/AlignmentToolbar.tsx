'use client'

import React from 'react'
import { useCanvasStore } from '@/lib/store'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// Inline SVG icons
const icons = {
  alignLeft:      <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><rect x="1" y="2" width="1.5" height="12" rx="0.5"/><rect x="3.5" y="4" width="8" height="3" rx="1"/><rect x="3.5" y="9" width="11" height="3" rx="1"/></svg>,
  alignCenterH:   <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><rect x="7.25" y="1" width="1.5" height="14" rx="0.5"/><rect x="3" y="4" width="10" height="3" rx="1"/><rect x="1" y="9" width="14" height="3" rx="1"/></svg>,
  alignRight:     <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><rect x="13.5" y="2" width="1.5" height="12" rx="0.5"/><rect x="4.5" y="4" width="8" height="3" rx="1"/><rect x="1" y="9" width="11" height="3" rx="1"/></svg>,
  alignTop:       <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><rect x="2" y="1" width="12" height="1.5" rx="0.5"/><rect x="4" y="3.5" width="3" height="8" rx="1"/><rect x="9" y="3.5" width="3" height="11" rx="1"/></svg>,
  alignCenterV:   <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><rect x="1" y="7.25" width="14" height="1.5" rx="0.5"/><rect x="4" y="3" width="3" height="10" rx="1"/><rect x="9" y="1" width="3" height="14" rx="1"/></svg>,
  alignBottom:    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><rect x="2" y="13.5" width="12" height="1.5" rx="0.5"/><rect x="4" y="4.5" width="3" height="8" rx="1"/><rect x="9" y="1" width="3" height="11" rx="1"/></svg>,
  distributeH:    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><rect x="1" y="2" width="1.5" height="12" rx="0.5"/><rect x="13.5" y="2" width="1.5" height="12" rx="0.5"/><rect x="5.5" y="5" width="5" height="6" rx="1"/></svg>,
  distributeV:    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><rect x="2" y="1" width="12" height="1.5" rx="0.5"/><rect x="2" y="13.5" width="12" height="1.5" rx="0.5"/><rect x="5" y="5.5" width="6" height="5" rx="1"/></svg>,
  bringToFront:   <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><rect x="5" y="1" width="10" height="10" rx="1.5"/><rect x="1" y="5" width="10" height="10" rx="1.5" opacity="0.35"/></svg>,
  bringForward:   <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><rect x="5" y="1" width="10" height="10" rx="1.5"/><rect x="1" y="5" width="10" height="10" rx="1.5" opacity="0.35"/><path d="M8 13v2M8 13l-1.5-1.5M8 13l1.5-1.5" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg>,
  sendBackward:   <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><rect x="1" y="5" width="10" height="10" rx="1.5"/><rect x="5" y="1" width="10" height="10" rx="1.5" opacity="0.35"/><path d="M8 3V1M8 3L6.5 4.5M8 3l1.5 1.5" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg>,
  sendToBack:     <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><rect x="1" y="5" width="10" height="10" rx="1.5"/><rect x="5" y="1" width="10" height="10" rx="1.5" opacity="0.35"/></svg>,
}

interface BtnProps {
  label: string
  onClick: () => void
  children: React.ReactNode
}

function AlignBtn({ label, onClick, children }: BtnProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className="p-2 rounded-md text-zinc-300 hover:text-white hover:bg-white/15 active:bg-white/25 transition-colors"
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">{label}</TooltipContent>
    </Tooltip>
  )
}

export function AlignmentToolbar() {
  const {
    selectedElement,
    selectedElements,
    alignElements,
    distributeElements,
    bringToFront,
    bringForward,
    sendBackward,
    sendToBack,
  } = useCanvasStore()

  const hasSingle = !!selectedElement
  const hasMulti  = selectedElements.length >= 2
  const canDistribute = selectedElements.length >= 3

  if (!hasSingle && !hasMulti) return null

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-0.5 bg-zinc-900 rounded-xl shadow-xl shadow-black/30 px-2 py-1.5 border border-zinc-700">
      {hasMulti && (
        <span className="text-[10px] font-semibold text-zinc-400 px-1.5 select-none tracking-wide uppercase">
          {selectedElements.length} selected
        </span>
      )}

      {/* Layer order — always shown for any selection */}
      <AlignBtn label="Bring to front" onClick={() => bringToFront(selectedElement ?? selectedElements[0])}>
        {icons.bringToFront}
      </AlignBtn>
      <AlignBtn label="Bring forward" onClick={() => bringForward(selectedElement ?? selectedElements[0])}>
        {icons.bringForward}
      </AlignBtn>
      <AlignBtn label="Send backward" onClick={() => sendBackward(selectedElement ?? selectedElements[0])}>
        {icons.sendBackward}
      </AlignBtn>
      <AlignBtn label="Send to back" onClick={() => sendToBack(selectedElement ?? selectedElements[0])}>
        {icons.sendToBack}
      </AlignBtn>

      {hasMulti && (
        <>
          <div className="w-px h-4 bg-zinc-200 mx-1" />

          {/* Horizontal alignment */}
          <AlignBtn label="Align left edges" onClick={() => alignElements('left')}>
            {icons.alignLeft}
          </AlignBtn>
          <AlignBtn label="Align centers (horizontal)" onClick={() => alignElements('center-h')}>
            {icons.alignCenterH}
          </AlignBtn>
          <AlignBtn label="Align right edges" onClick={() => alignElements('right')}>
            {icons.alignRight}
          </AlignBtn>

          <div className="w-px h-4 bg-zinc-200 mx-1" />

          {/* Vertical alignment */}
          <AlignBtn label="Align top edges" onClick={() => alignElements('top')}>
            {icons.alignTop}
          </AlignBtn>
          <AlignBtn label="Align centers (vertical)" onClick={() => alignElements('center-v')}>
            {icons.alignCenterV}
          </AlignBtn>
          <AlignBtn label="Align bottom edges" onClick={() => alignElements('bottom')}>
            {icons.alignBottom}
          </AlignBtn>

          {canDistribute && (
            <>
              <div className="w-px h-4 bg-zinc-200 mx-1" />
              <AlignBtn label="Distribute horizontally" onClick={() => distributeElements('horizontal')}>
                {icons.distributeH}
              </AlignBtn>
              <AlignBtn label="Distribute vertically" onClick={() => distributeElements('vertical')}>
                {icons.distributeV}
              </AlignBtn>
            </>
          )}
        </>
      )}
    </div>
  )
}
