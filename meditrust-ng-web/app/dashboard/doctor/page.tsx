'use client'
import RequireAuth from '@/components/RequireAuth'
import BottomNav from '@/components/BottomNav'

export default function DoctorDashboard() {
  const consultations = []

  return (
    <RequireAuth>
      <main className="mobile-shell p-4 pb-20 space-y-4">
        <div className="header"><h1>MediTrust</h1><div className="badge">Doctor</div></div>

        <div className="card">
          <h2 className="font-semibold mb-2">Upcoming Consultations</h2>
          {consultations.length === 0 ? <p className="empty">No consultations scheduled. Patients will appear here.</p> : consultations.map((c,i)=>(<div key={i}>{c.patientName}</div>))}
        </div>
      </main>
      <BottomNav role="doctor" />
    </RequireAuth>
  )
}