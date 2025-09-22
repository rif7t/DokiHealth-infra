import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabaseServer'
export async function GET() {
  const supabase = createSupabaseServer()
  const { data } = await supabase.from('doctors_public').select('*').order('online', { ascending: false })
  return NextResponse.json(data || [])
}
