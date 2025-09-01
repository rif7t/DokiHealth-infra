'use client'
import { useEffect } from 'react'
import { useUIStore } from '@/store/useUIStore'
import { Smartphone } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from "./ui/Card"

export default function MobileOnly({ children }: { children: React.ReactNode }) {
  const { showDesktopPrompt, setShowDesktopPrompt } = useUIStore()

  useEffect(() => {
    const check = () => setShowDesktopPrompt(window.innerWidth > 500)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [setShowDesktopPrompt])

  if (showDesktopPrompt) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center bg-gray-50">
        <Card className="max-w-md w-full shadow-lg rounded-2xl border border-gray-200 p-6 space-y-4">
          <CardHeader className="flex flex-col items-center space-y-2">
            <Smartphone className="w-10 h-10 text-blue-500" />
            <CardTitle className="text-2xl font-semibold">Open on Mobile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 leading-relaxed">
              MediTrust is designed for mobile devices.  
              Please open this app on your phone for the best experience or shrink Desktop window
            </p>
            <div className="mt-4 text-xs text-gray-500 bg-blue-50 px-3 py-2 rounded-lg inline-block">
              💡 Tip: Use browser dev tools to simulate a mobile view.
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <div className="mobile-shell">{children}</div>
}