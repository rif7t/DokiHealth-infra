'use client'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function SessionSync() {
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        try {
          await fetch('/api/auth/set-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session })
          })
        } catch (e) {
          console.error('Failed to sync session to server', e)
        }
      }
    })
    return () => data.subscription.unsubscribe()
  }, [])
  return null
}
