'use client'
import { useEffect, useState } from 'react'
import { useUIStore } from '@/store/useUIStore'
import DoctorCard, { Doctor } from './DoctorCard'

export default function AppointmentScheduler() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(false)
  const selectedDoctorId = useUIStore(s => s.selectedDoctorId)
  const setSelectedDoctor = useUIStore(s => s.setSelectedDoctor)
  const selectedSlot = useUIStore(s => s.selectedSlot)
  const setSelectedSlot = useUIStore(s => s.setSelectedSlot)

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/doctors')
      const data = await res.json()
      setDoctors(data)
    })()
  }, [])

  const times = ['13:00','13:30','14:00','14:30','15:00']

  const book = async () => {
    if (!selectedDoctorId || !selectedSlot) return alert('Pick a doctor and time')
    setLoading(true)
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctor_id: selectedDoctorId, slot: selectedSlot })
      })
      const data = await res.json()
      if (data.error) alert(data.error)
      else alert('Booked!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="card space-y-3">
        <div className="text-sm font-medium">Pick a doctor</div>
        <div className="space-y-3">
          {doctors.map(d => (
            <DoctorCard key={d.id} doctor={d} onSelect={(id)=>setSelectedDoctor(id)} />
          ))}
        </div>
      </div>

      <div className="card space-y-3">
        <div className="text-sm font-medium">Select a time today</div>
        <div className="flex flex-wrap gap-2">
          {times.map(t => (
            <button key={t}
              onClick={()=>setSelectedSlot(t)}
              className={`badge ${selectedSlot===t ? 'ring-2 ring-brand-cyan' : ''}`}>
              {t}
            </button>
          ))}
        </div>
        <button className="btn-primary w-full" onClick={book} disabled={loading}>
          {loading ? 'Booking…' : 'Book Consultation'}
        </button>
      </div>
    </div>
  )
}
