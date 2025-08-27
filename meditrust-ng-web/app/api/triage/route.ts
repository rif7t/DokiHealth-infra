import { NextResponse } from 'next/server'
const rules = [{ keywords: ['fever','cough'], specialty: 'General Practice', advice: 'Rest and hydrate' }]
export async function POST(req: Request){
  const { symptoms } = await req.json()
  const text = (symptoms || '').toLowerCase()
  let best = { specialty: 'General Practice', confidence: 0.4, advice: 'See a GP' }
  for (const r of rules){
    const hits = r.keywords.filter(k => text.includes(k)).length
    if (hits > 0){ const conf = Math.min(0.9, 0.4 + hits*0.1); if (conf > best.confidence) best = { specialty: r.specialty, confidence: conf, advice: r.advice } }
  }
  return NextResponse.json(best)
}
