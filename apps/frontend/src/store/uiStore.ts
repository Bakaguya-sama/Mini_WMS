import { create } from 'zustand'

interface UIState {
  isInteracting: boolean
  setInteracting: (val: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  isInteracting: false,
  setInteracting: (val) => set({ isInteracting: val }),
}))
