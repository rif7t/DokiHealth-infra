'use client'
import { useEffect } from 'react'
import { useUIStore } from '@/store/useUIStore'

export default function MobileOnly({ children }: { children: React.ReactNode }) {
  const { showDesktopPrompt, setShowDesktopPrompt } = useUIStore()
  useEffect(() => {
    const check = () => setShowDesktopPrompt(window.innerWidth > 600)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [setShowDesktopPrompt])

  if (showDesktopPrompt) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        <div className="card max-w-md space-y-4">
          <h1 className="text-2xl font-semibold">Open on Mobile</h1>
          <p className="text-sm text-gray-600">
            MediTrust is optimized for phones. Open on your mobile device for the best experience.
          </p>
          {/* <div className="badge">Tip: Use the device toolbar to simulate a phone.</div> */}
        </div>
      </div>
    )
  }
  return <div className="mobile-shell">{children}</div>
}
