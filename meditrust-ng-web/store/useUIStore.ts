'use client'
import { create } from 'zustand'
export const useUIStore = create(set => ({
  triageResult: null,
  selectedDoctorId: null,
  selectedSlot: null,
  showDesktopPrompt: false,
  setTriageResult: (r) => set({ triageResult: r }),
  setSelectedDoctor: (id) => set({ selectedDoctorId: id }),
  setSelectedSlot: (s) => set({ selectedSlot: s }),
  setShowDesktopPrompt: (v) => set({ showDesktopPrompt: v })
}))
