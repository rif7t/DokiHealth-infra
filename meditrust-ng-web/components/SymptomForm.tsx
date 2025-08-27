'use client'
import { useState } from 'react'
import { useUIStore } from '@/store/useUIStore'

export default function SymptomForm() {
  const [symptoms, setSymptoms] = useState('')
  const [loading, setLoading] = useState(false)
  const setTriageResult = useUIStore(s => s.setTriageResult)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms })
      })
      const data = await res.json()
      setTriageResult(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="card space-y-3">
      <label className="text-sm font-medium">Describe your symptoms</label>
      <textarea
        className="input h-28 resize-none"
        placeholder="e.g. headache, fever, sore throat for 2 days..."
        value={symptoms}
        onChange={(e)=>setSymptoms(e.target.value)}
      />
      <button className="btn-primary w-full" disabled={loading}>
        {loading ? 'Checking…' : 'Check Symptoms'}
      </button>
    </form>
  )
}
