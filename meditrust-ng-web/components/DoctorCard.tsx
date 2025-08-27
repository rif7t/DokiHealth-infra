'use client'
import { useUIStore } from '@/store/useUIStore'

export type Doctor = {
  id: string
  full_name: string
  specialty: string
  online: boolean
  rating?: number
  bio?: string
}

export default function DoctorCard({ doctor, onSelect }: { doctor: Doctor, onSelect?: (id: string)=>void }) {
  const selected = useUIStore(s => s.selectedDoctorId === doctor.id)
  return (
    <button onClick={()=> onSelect?.(doctor.id)} className={`card w-full text-left ${selected ? 'ring-2 ring-brand-cyan' : ''}`}>
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-brand-soft" />
        <div className="flex-1">
          <div className="font-semibold">{doctor.full_name}</div>
          <div className="text-xs text-gray-500">{doctor.specialty}</div>
          <div className="mt-2 flex items-center gap-2">
            <span className="badge">{doctor.online ? '● Online' : '○ Offline'}</span>
            {doctor.rating ? <span className="badge">★ {doctor.rating.toFixed(1)}</span> : null}
          </div>
        </div>
      </div>
    </button>
  )
}
