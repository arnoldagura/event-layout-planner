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
  setElements: (elements: CanvasElement[]) => void
  addElement: (element: CanvasElement) => void
  updateElement: (id: string, updates: Partial<CanvasElement>) => void
  deleteElement: (id: string) => void
  selectElement: (id: string | null) => void
  setScale: (scale: number) => void
  clearCanvas: () => void
}

export const useCanvasStore = create<CanvasStore>((set) => ({
  elements: [],
  selectedElement: null,
  scale: 1,
  setElements: (elements) => set({ elements }),
  addElement: (element) =>
    set((state) => ({ elements: [...state.elements, element] })),
  updateElement: (id, updates) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      ),
    })),
  deleteElement: (id) =>
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      selectedElement: state.selectedElement === id ? null : state.selectedElement,
    })),
  selectElement: (id) => set({ selectedElement: id }),
  setScale: (scale) => set({ scale }),
  clearCanvas: () => set({ elements: [], selectedElement: null }),
}))
