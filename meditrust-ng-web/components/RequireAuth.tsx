'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) setAuthed(true)
      else router.replace('/sign-in')
      setLoading(false)
    }
    check()
  }, [router])

  if (loading) return <div className="flex h-screen items-center justify-center"><p className="text-gray-600">Checking session…</p></div>
  if (!authed) return null
  return <>{children}</>
}
