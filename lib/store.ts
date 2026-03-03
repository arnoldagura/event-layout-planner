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
  clearCanvas: () => void
  resetView: () => void
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

  clearCanvas: () =>
    set((state) => ({
      elements: [],
      selectedElement: null,
      selectedElements: [],
      past: [...state.past.slice(-MAX_HISTORY + 1), state.elements],
      future: [],
    })),

  resetView: () => set({ scale: 1, panOffset: { x: 0, y: 0 } }),

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
