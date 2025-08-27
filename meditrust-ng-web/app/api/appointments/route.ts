import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabaseServer'
export async function GET(){
  const supabase = createSupabaseServer()
  const user = (await supabase.auth.getUser()).data.user
  if (!user) return NextResponse.json([], { status: 200 })
  const { data } = await supabase.from('appointments_view').select('*').or(`patient_id.eq.${user.id},doctor_id.eq.${user.id}`).order('created_at', { ascending: false })
  return NextResponse.json(data || [])
}
export async function POST(req: Request){
  const supabase = createSupabaseServer()
  const user = (await supabase.auth.getUser()).data.user
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  const body = await req.json()
  const { data, error } = await supabase.from('appointments').insert({ patient_id: user.id, doctor_id: body.doctor_id, slot: body.slot, status: 'scheduled' }).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}
