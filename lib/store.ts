import { create } from 'zustand'

export interface CanvasElement {
  id: string
  type: string
  name: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  properties?: Record<string, unknown>
}

interface CanvasStore {
  elements: CanvasElement[]
  selectedElement: string | null
  selectedElements: string[]
  clipboard: CanvasElement | null
  scale: number
  panOffset: { x: number; y: number }
  snapGuides: { x: number | null; y: number | null }
  past: CanvasElement[][]
  future: CanvasElement[][]
  setElements: (elements: CanvasElement[], skipHistory?: boolean) => void
  addElement: (element: CanvasElement) => void
  updateElement: (id: string, updates: Partial<CanvasElement>) => void
  updateElementSilent: (id: string, updates: Partial<CanvasElement>) => void
  commitHistory: () => void
  deleteElement: (id: string) => void
  selectElement: (id: string | null) => void
  addToSelection: (id: string) => void
  copyElement: () => void
  pasteElement: () => void
  deleteSelectedElements: () => void
  setScale: (scale: number) => void
  setPanOffset: (offset: { x: number; y: number }) => void
  setSnapGuides: (guides: { x: number | null; y: number | null }) => void
  alignElements: (alignment: 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom') => void
  distributeElements: (direction: 'horizontal' | 'vertical') => void
  bringToFront: (id: string) => void
  bringForward: (id: string) => void
  sendBackward: (id: string) => void
  sendToBack: (id: string) => void
  clearCanvas: () => void
  resetView: (viewportWidth?: number, viewportHeight?: number) => void
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  _pendingHistorySnapshot: CanvasElement[] | null
  _setPendingSnapshot: () => void
}

const MAX_HISTORY = 50

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  elements: [],
  selectedElement: null,
  selectedElements: [],
  clipboard: null,
  scale: 1,
  panOffset: { x: 0, y: 0 },
  snapGuides: { x: null, y: null },
  past: [],
  future: [],
  _pendingHistorySnapshot: null,

  setElements: (elements, skipHistory = false) =>
    set((state) => {
      if (skipHistory) {
        return { elements }
      }
      return {
        elements,
        past: [...state.past.slice(-MAX_HISTORY + 1), state.elements],
        future: [],
      }
    }),

  addElement: (element) =>
    set((state) => ({
      elements: [...state.elements, element],
      past: [...state.past.slice(-MAX_HISTORY + 1), state.elements],
      future: [],
    })),

  updateElement: (id, updates) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      ),
      past: [...state.past.slice(-MAX_HISTORY + 1), state.elements],
      future: [],
    })),

  updateElementSilent: (id, updates) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      ),
    })),

  _setPendingSnapshot: () =>
    set((state) => ({
      _pendingHistorySnapshot: [...state.elements],
    })),

  commitHistory: () =>
    set((state) => {
      if (!state._pendingHistorySnapshot) return state
      return {
        past: [...state.past.slice(-MAX_HISTORY + 1), state._pendingHistorySnapshot],
        future: [],
        _pendingHistorySnapshot: null,
      }
    }),

  deleteElement: (id) =>
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      selectedElement: state.selectedElement === id ? null : state.selectedElement,
      selectedElements: state.selectedElements.filter((sid) => sid !== id),
      past: [...state.past.slice(-MAX_HISTORY + 1), state.elements],
      future: [],
    })),

  selectElement: (id) => set({ selectedElement: id, selectedElements: id ? [id] : [] }),

  addToSelection: (id) =>
    set((state) => ({
      selectedElements: state.selectedElements.includes(id)
        ? state.selectedElements.filter((sid) => sid !== id)
        : [...state.selectedElements, id],
    })),

  copyElement: () =>
    set((state) => {
      const el = state.elements.find((e) => e.id === state.selectedElement)
      return el ? { clipboard: el } : {}
    }),

  pasteElement: () =>
    set((state) => {
      if (!state.clipboard) return {}
      const src = state.clipboard
      const newId = crypto.randomUUID()
      const pasted: CanvasElement = {
        ...src,
        id: newId,
        x: src.x + 20,
        y: src.y + 20,
        properties:
          src.type === 'booth'
            ? { ...src.properties, boothId: crypto.randomUUID() }
            : src.properties,
      }
      return {
        elements: [...state.elements, pasted],
        selectedElement: newId,
        selectedElements: [newId],
        past: [...state.past.slice(-MAX_HISTORY + 1), state.elements],
        future: [],
      }
    }),

  deleteSelectedElements: () =>
    set((state) => {
      if (state.selectedElements.length === 0) return {}
      const ids = new Set(state.selectedElements)
      return {
        elements: state.elements.filter((el) => !ids.has(el.id)),
        selectedElement: null,
        selectedElements: [],
        past: [...state.past.slice(-MAX_HISTORY + 1), state.elements],
        future: [],
      }
    }),

  setScale: (scale) => set({ scale }),
  setPanOffset: (offset) => set({ panOffset: offset }),
  setSnapGuides: (guides) => set({ snapGuides: guides }),

  alignElements: (alignment) =>
    set((state) => {
      if (state.selectedElements.length < 2) return state
      const selected = state.elements.filter((el) => state.selectedElements.includes(el.id))
      const minX = Math.min(...selected.map((el) => el.x))
      const maxX = Math.max(...selected.map((el) => el.x + el.width))
      const minY = Math.min(...selected.map((el) => el.y))
      const maxY = Math.max(...selected.map((el) => el.y + el.height))
      const centerX = (minX + maxX) / 2
      const centerY = (minY + maxY) / 2
      const updated = state.elements.map((el) => {
        if (!state.selectedElements.includes(el.id)) return el
        switch (alignment) {
          case 'left':     return { ...el, x: minX }
          case 'center-h': return { ...el, x: centerX - el.width / 2 }
          case 'right':    return { ...el, x: maxX - el.width }
          case 'top':      return { ...el, y: minY }
          case 'center-v': return { ...el, y: centerY - el.height / 2 }
          case 'bottom':   return { ...el, y: maxY - el.height }
          default:         return el
        }
      })
      return {
        elements: updated,
        past: [...state.past.slice(-MAX_HISTORY + 1), state.elements],
        future: [],
      }
    }),

  distributeElements: (direction) =>
    set((state) => {
      if (state.selectedElements.length < 3) return state
      const selected = state.elements.filter((el) => state.selectedElements.includes(el.id))
      let updated: CanvasElement[]

      if (direction === 'horizontal') {
        const sorted = [...selected].sort((a, b) => a.x - b.x)
        const totalSpan = sorted[sorted.length - 1].x + sorted[sorted.length - 1].width - sorted[0].x
        const totalWidth = sorted.reduce((s, el) => s + el.width, 0)
        const gap = (totalSpan - totalWidth) / (sorted.length - 1)
        const positions = new Map<string, number>()
        let cur = sorted[0].x
        for (const el of sorted) { positions.set(el.id, cur); cur += el.width + gap }
        updated = state.elements.map((el) =>
          positions.has(el.id) ? { ...el, x: positions.get(el.id)! } : el
        )
      } else {
        const sorted = [...selected].sort((a, b) => a.y - b.y)
        const totalSpan = sorted[sorted.length - 1].y + sorted[sorted.length - 1].height - sorted[0].y
        const totalHeight = sorted.reduce((s, el) => s + el.height, 0)
        const gap = (totalSpan - totalHeight) / (sorted.length - 1)
        const positions = new Map<string, number>()
        let cur = sorted[0].y
        for (const el of sorted) { positions.set(el.id, cur); cur += el.height + gap }
        updated = state.elements.map((el) =>
          positions.has(el.id) ? { ...el, y: positions.get(el.id)! } : el
        )
      }

      return {
        elements: updated,
        past: [...state.past.slice(-MAX_HISTORY + 1), state.elements],
        future: [],
      }
    }),

  bringToFront: (id) =>
    set((state) => {
      const el = state.elements.find((e) => e.id === id)
      if (!el) return state
      const rest = state.elements.filter((e) => e.id !== id)
      return { elements: [...rest, el], past: [...state.past.slice(-MAX_HISTORY + 1), state.elements], future: [] }
    }),

  bringForward: (id) =>
    set((state) => {
      const idx = state.elements.findIndex((e) => e.id === id)
      if (idx < 0 || idx === state.elements.length - 1) return state
      const els = [...state.elements]
      ;[els[idx], els[idx + 1]] = [els[idx + 1], els[idx]]
      return { elements: els, past: [...state.past.slice(-MAX_HISTORY + 1), state.elements], future: [] }
    }),

  sendBackward: (id) =>
    set((state) => {
      const idx = state.elements.findIndex((e) => e.id === id)
      if (idx <= 0) return state
      const els = [...state.elements]
      ;[els[idx - 1], els[idx]] = [els[idx], els[idx - 1]]
      return { elements: els, past: [...state.past.slice(-MAX_HISTORY + 1), state.elements], future: [] }
    }),

  sendToBack: (id) =>
    set((state) => {
      const el = state.elements.find((e) => e.id === id)
      if (!el) return state
      const rest = state.elements.filter((e) => e.id !== id)
      return { elements: [el, ...rest], past: [...state.past.slice(-MAX_HISTORY + 1), state.elements], future: [] }
    }),

  clearCanvas: () =>
    set((state) => ({
      elements: [],
      selectedElement: null,
      selectedElements: [],
      past: [...state.past.slice(-MAX_HISTORY + 1), state.elements],
      future: [],
    })),

  resetView: (viewportWidth?: number, viewportHeight?: number) =>
    set((state) => {
      if (!viewportWidth || !viewportHeight || state.elements.length === 0) {
        return { scale: 1, panOffset: { x: 0, y: 0 } }
      }

      const minX = Math.min(...state.elements.map((el) => el.x))
      const minY = Math.min(...state.elements.map((el) => el.y))
      const maxX = Math.max(...state.elements.map((el) => el.x + el.width))
      const maxY = Math.max(...state.elements.map((el) => el.y + el.height))

      const layoutCenterX = (minX + maxX) / 2
      const layoutCenterY = (minY + maxY) / 2

      const offsetX = viewportWidth / 2 - layoutCenterX
      const offsetY = viewportHeight / 2 - layoutCenterY

      return { scale: 1, panOffset: { x: offsetX, y: offsetY } }
    }),

  undo: () =>
    set((state) => {
      if (state.past.length === 0) return state
      const previous = state.past[state.past.length - 1]
      const newPast = state.past.slice(0, -1)
      return {
        elements: previous,
        past: newPast,
        future: [state.elements, ...state.future.slice(0, MAX_HISTORY - 1)],
        selectedElement: null,
        selectedElements: [],
      }
    }),

  redo: () =>
    set((state) => {
      if (state.future.length === 0) return state
      const next = state.future[0]
      const newFuture = state.future.slice(1)
      return {
        elements: next,
        past: [...state.past, state.elements],
        future: newFuture,
        selectedElement: null,
        selectedElements: [],
      }
    }),

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,
}))
