'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function AuthCallback() {
  const router = useRouter()
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) router.replace('/profile')
      if (event === 'SIGNED_OUT') router.replace('/sign-in')
    })
    return () => data.subscription.unsubscribe()
  }, [router])
  return <div className="flex h-screen items-center justify-center"><p className="text-gray-600">Finishing login…</p></div>
}
