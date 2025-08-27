import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabaseServer'

export async function PATCH(req: Request, { params }: { params: { id: string }}){
  const supabase = createSupabaseServer()
  const { status } = await req.json()
  const { data, error } = await supabase.from('appointments').update({ status }).eq('id', params.id).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function DELETE(req: Request, { params }: { params: { id: string }}){
  const supabase = createSupabaseServer()
  const { error } = await supabase.from('appointments').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
