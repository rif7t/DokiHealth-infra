'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.replace('/sign-in')
        return
      }

      try {
        const resp = await fetch('/api/profile')
        const json = await resp.json()

        if (!json.profile || !json.profile.full_name) {
          router.replace('/profile')
        } else if (json.doctor) {
          router.replace('/dashboard/doctor')
        } else {
          router.replace('/dashboard/patient')
        }
      } catch (err) {
        console.error('Profile check failed', err)
        router.replace('/sign-in')
      }
    }

    checkAuth().finally(() => setLoading(false))
  }, [router])

  return (
    <main className="h-screen w-full bg-[#111C18] flex flex-col items-center justify-center">
      {/* Splash Branding */}
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-mint to-brand-cyan flex items-center justify-center text-black font-bold text-xl shadow-lg">
        MT
      </div>
      <h1 className="mt-6 text-2xl font-semibold text-white">MediTrust</h1>
      <p className="mt-2 text-gray-400">Loading your health partner...</p>
    </main>
  )
}