"use client";
import RequireAuth from "@/components/RequireAuth";
import BottomNav from "@/components/BottomNav";
import MobileOnly from "@/components/MobileOnly";

export default function PatientDashboard() {
  const appointments = [];

  return (
    <MobileOnly>
      <RequireAuth>
        <main className="mobile-shell p-4 pb-20 space-y-4">
          <div className="header">
            <h1>MediTrust</h1>
            <div className="badge">Patient</div>
          </div>

          <div className="card">
            <h2 className="font-semibold mb-2">Upcoming Appointments</h2>
            {appointments.length === 0 ? (
              <p className="empty">
                No appointments yet. Book one to get started!
              </p>
            ) : (
              appointments.map((a, i) => <div key={i}>{a.doctorName}</div>)
            )}
          </div>

          <div className="card">
            <h2 className="font-semibold mb-2">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2">
              <a href="/triage" className="btn-primary">
                Check Symptoms
              </a>
              <a href="/doctors" className="btn-primary">
                Find a Doctor
              </a>
            </div>
          </div>
        </main>
        <BottomNav role="patient" />
      </RequireAuth>
    </MobileOnly>
  );
}
