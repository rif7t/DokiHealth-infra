import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabaseServer'

export async function GET(){
  const supabase = createSupabaseServer()
  const user = (await supabase.auth.getUser()).data.user
  if (!user) return NextResponse.json({ profile: null })
  const [{ data: profile }, { data: doctor }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('doctors_public').select('*').eq('id', user.id).single()
  ])
  return NextResponse.json({ profile, doctor })
}

export async function PUT(req: Request){
  const supabase = createSupabaseServer()
  const user = (await supabase.auth.getUser()).data.user
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  const { profile, isDoctor } = await req.json()
  const { error: e1 } = await supabase.from('profiles').upsert({ id: user.id, ...profile })
  if (e1) return NextResponse.json({ error: e1.message }, { status: 400 })
  if (isDoctor){
    const doc = { id: user.id, full_name: profile.full_name, specialty: profile.specialty || 'General Practice', bio: profile.bio || '', online: true }
    const { error: e2 } = await supabase.from('doctors_public').upsert(doc)
    if (e2) return NextResponse.json({ error: e2.message }, { status: 400 })
  }
  return NextResponse.json({ ok: true })
}
