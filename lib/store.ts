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
  scale: number
  panOffset: { x: number; y: number }
  past: CanvasElement[][]
  future: CanvasElement[][]
  setElements: (elements: CanvasElement[], skipHistory?: boolean) => void
  addElement: (element: CanvasElement) => void
  updateElement: (id: string, updates: Partial<CanvasElement>) => void
  updateElementSilent: (id: string, updates: Partial<CanvasElement>) => void
  commitHistory: () => void
  deleteElement: (id: string) => void
  selectElement: (id: string | null) => void
  setScale: (scale: number) => void
  setPanOffset: (offset: { x: number; y: number }) => void
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
  scale: 1,
  panOffset: { x: 0, y: 0 },
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
      past: [...state.past.slice(-MAX_HISTORY + 1), state.elements],
      future: [],
    })),

  selectElement: (id) => set({ selectedElement: id }),
  setScale: (scale) => set({ scale }),
  setPanOffset: (offset) => set({ panOffset: offset }),

  clearCanvas: () =>
    set((state) => ({
      elements: [],
      selectedElement: null,
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
      }
    }),

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,
}))
