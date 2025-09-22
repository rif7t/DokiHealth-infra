import { create } from 'zustand'

type Store = {
  seenOnboarding: boolean
  setSeenOnboarding: (v: boolean) => void
}

export const useAppStore = create<Store>((set) => ({
  seenOnboarding: false,
  setSeenOnboarding: (v) => {
    localStorage.setItem('seenOnboarding', 'true')
    set({ seenOnboarding: v })
  }
}))