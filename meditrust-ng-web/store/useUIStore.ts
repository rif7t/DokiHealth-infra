'use client'
import { create } from 'zustand'

interface UIState {
  triageResult: any 
  showDesktopPrompt: boolean
  setTriageResult: (value: any ) => void
  setShowDesktopPrompt: (value: boolean) => void
}

export const useUIStore = create<UIState>(set => ({
  triageResult:  null,
  showDesktopPrompt: false,
  setTriageResult: (r) => set({ triageResult: r }),
  setShowDesktopPrompt: (v) => set({ showDesktopPrompt: v })
}))