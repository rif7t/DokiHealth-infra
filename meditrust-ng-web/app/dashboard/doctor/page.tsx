"use client";
import RequireAuth from "@/components/RequireAuth";
import MobileOnly from "@/components/MobileOnly";
import {
  Circle,
  DollarSign,
  Calendar,
  Users,
  Bell,
  Video,
  ClipboardList,
} from "lucide-react";
import { useState } from "react";
import Modal from "@/components/ModalCard";

export default function DoctorDashboard() {
  const consultations = [
    {
      id: 1,
      patientName: "John Doe",
      time: "10:00 AM",
      reason: "Headache and fatigue",
    },
    {
      id: 2,
      patientName: "Jane Smith",
      time: "11:30 AM",
      reason: "Follow-up on diabetes",
    },
    {
      id: 3,
      patientName: "Michael Johnson",
      time: "1:00 PM",
      reason: "Fever and cough",
    },
    {
      id: 4,
      patientName: "Emily Davis",
      time: "3:15 PM",
      reason: "Skin rash consultation",
    },
    {
      id: 5,
      patientName: "Chris Brown",
      time: "5:00 PM",
      reason: "General checkup",
    },
  ];

  const pendingRequests = [
    { id: 101, name: "Sarah Wilson", reason: "New patient sign-up" },
    {
      id: 102,
      name: "David Lee",
      reason: "Requesting diabetes management consult",
    },
  ];

  const recentPatients = [
    { id: 201, name: "Anna Taylor", lastVisit: "Yesterday" },
    { id: 202, name: "Mark Johnson", lastVisit: "2 days ago" },
  ];

  const patients = [
    {
      id: 301,
      name: "Olivia Harris",
      age: 34,
      condition: "Hypertension",
      lastVisit: "3 weeks ago",
    },
    {
      id: 302,
      name: "James Wilson",
      age: 52,
      condition: "Diabetes",
      lastVisit: "1 month ago",
    },
    {
      id: 303,
      name: "Sophia Turner",
      age: 28,
      condition: "Asthma",
      lastVisit: "2 months ago",
    },
    {
      id: 304,
      name: "Liam Brown",
      age: 45,
      condition: "Back pain",
      lastVisit: "1 week ago",
    },
  ];

  const schedule = [
    { id: 401, time: "09:00 AM", patient: "Emma Watson", type: "Consultation" },
    { id: 402, time: "10:30 AM", patient: "John Doe", type: "Follow-up" },
    { id: 403, time: "12:00 PM", patient: "Sophia Turner", type: "Checkup" },
    { id: 404, time: "02:00 PM", patient: "Liam Brown", type: "Consultation" },
    { id: 405, time: "04:00 PM", patient: "James Wilson", type: "Review" },
  ];

  const [isAvailable, setIsAvailable] = useState(true);
  const isOnline = true;
  const [selected, setSelected] = useState<any>(null);
  const [modal, setModal] = useState<string | null>(null);

  return (
    <MobileOnly>
      <RequireAuth>
        <main className="mobile-shell p-4 pb-32 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              MediTrust
            </h1>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Circle
                  className={`w-3 h-3 ${
                    isOnline ? "text-green-400 fill-green-400" : "text-gray-500"
                  }`}
                />
                <span className="text-xs text-gray-300">
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="hidden"
                />
                <div
                  className={`w-10 h-5 flex items-center rounded-full p-1 transition ${
                    isAvailable ? "bg-green-500" : "bg-gray-600"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                      isAvailable ? "translate-x-5" : ""
                    }`}
                  />
                </div>
              </label>
              <span className="px-3 py-1 text-xs rounded-full bg-cyan-500/20 text-cyan-400 font-medium">
                Doctor
              </span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Users, value: "128", label: "Patients" },
              { icon: Calendar, value: "12", label: "Consults Today" },
              { icon: DollarSign, value: "$450", label: "Earnings" },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="bg-[#1A2622]/90 border border-gray-700 rounded-2xl p-4 text-center shadow-md hover:bg-[#1F2E2A] transition"
              >
                <stat.icon className="mx-auto text-cyan-400 mb-2" size={22} />
                <p className="text-lg font-bold text-white">{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Upcoming Consultations */}
          <section className="bg-[#1A2622]/90 border border-gray-700 rounded-2xl shadow-lg p-5">
            <h2 className="font-semibold text-white text-lg mb-3">
              Upcoming Consultations
            </h2>
            <div className="divide-y divide-gray-700">
              {consultations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className="w-full flex justify-between items-center py-3 hover:bg-gray-800/40 px-2 rounded-lg transition"
                >
                  <div>
                    <p className="font-medium text-white">{c.patientName}</p>
                    <p className="text-xs text-gray-400">{c.reason}</p>
                  </div>
                  <span className="text-xs text-gray-400">{c.time}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Recent Patients */}
          <section className="bg-[#1A2622]/90 border border-gray-700 rounded-2xl shadow-lg p-5">
            <h2 className="font-semibold text-white text-lg mb-3">
              Recent Patients
            </h2>
            <div className="divide-y divide-gray-700">
              {recentPatients.map((p) => (
                <div
                  key={p.id}
                  className="flex justify-between items-center py-3 px-2"
                >
                  <p className="text-white">{p.name}</p>
                  <span className="text-xs text-gray-400">
                    Last Visit: {p.lastVisit}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* Quick Actions Nav Bar */}
        <nav className="fixed bottom-16 left-0 right-0 z-40 px-4">
          <div className="bg-[#1A2622]/95 backdrop-blur-md border border-gray-700 rounded-2xl shadow-xl flex justify-around py-2">
            <button
              onClick={() => setModal("patients")}
              className="flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-lg hover:bg-gray-800/50 transition"
            >
              <Users size={20} className="text-cyan-400" />
              <span className="text-xs text-gray-300">Patients</span>
            </button>
            <button
              onClick={() => setModal("schedule")}
              className="flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-lg hover:bg-gray-800/50 transition"
            >
              <ClipboardList size={20} className="text-cyan-400" />
              <span className="text-xs text-gray-300">Schedule</span>
            </button>
            <button
              onClick={() => setModal("alerts")}
              className="relative flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-lg hover:bg-gray-800/50 transition"
            >
              <div className="relative">
                <Bell size={20} className="text-cyan-400" />
                {pendingRequests.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {pendingRequests.length}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-300">Alerts</span>
            </button>
          </div>
        </nav>

        {/* Patients Modal */}
        <Modal
          show={modal === "patients"}
          onClose={() => setModal(null)}
          title="My Patients"
        >
          <div className="divide-y divide-gray-700">
            {patients.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                className="w-full flex justify-between items-center py-3 px-2 hover:bg-gray-800/40 rounded-lg transition"
              >
                <div>
                  <p className="text-white font-medium">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.condition}</p>
                </div>
                <span className="text-xs text-gray-400">
                  Last Visit: {p.lastVisit}
                </span>
              </button>
            ))}
          </div>
        </Modal>

        {/* Schedule Modal */}
        <Modal
          show={modal === "schedule"}
          onClose={() => setModal(null)}
          title="Today's Schedule"
        >
          <div className="divide-y divide-gray-700">
            {schedule.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelected(s)}
                className="w-full flex justify-between items-center py-3 px-2 hover:bg-gray-800/40 rounded-lg transition"
              >
                <div>
                  <p className="text-white font-medium">{s.patient}</p>
                  <p className="text-xs text-gray-400">{s.type}</p>
                </div>
                <span className="text-xs text-gray-400">{s.time}</span>
              </button>
            ))}
          </div>
        </Modal>

        {/* Alerts Modal */}
        <Modal
          show={modal === "alerts"}
          onClose={() => setModal(null)}
          title="Pending Alerts"
        >
          {pendingRequests.length === 0 ? (
            <p className="text-sm text-gray-400">No pending requests.</p>
          ) : (
            <div className="divide-y divide-gray-700">
              {pendingRequests.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelected(r)}
                  className="w-full flex justify-between items-center py-3 hover:bg-gray-800/40 px-2 rounded-lg transition"
                >
                  <p className="text-white font-medium">{r.name}</p>
                  <span className="text-xs text-gray-400">{r.reason}</span>
                </button>
              ))}
            </div>
          )}
        </Modal>

        {/* Generic Details Modal */}
        <Modal
          show={!!selected}
          onClose={() => setSelected(null)}
          title="Details"
        >
          <div className="space-y-2">
            <p className="text-sm text-gray-300">
              <strong className="text-white">Name:</strong>{" "}
              {selected?.patientName || selected?.name || selected?.patient}
            </p>
            {selected?.time && (
              <p className="text-sm text-gray-300">
                <strong className="text-white">Time:</strong> {selected?.time}
              </p>
            )}
            {selected?.reason && (
              <p className="text-sm text-gray-300">
                <strong className="text-white">Reason:</strong>{" "}
                {selected?.reason}
              </p>
            )}
            {selected?.type && (
              <p className="text-sm text-gray-300">
                <strong className="text-white">Type:</strong> {selected?.type}
              </p>
            )}
          </div>

          <div className="mt-5 flex justify-end gap-3">
            {selected?.patientName && (
              <button className="px-4 py-2 bg-[#00CFC1] text-[#0A0F0D] font-semibold rounded-lg text-sm flex items-center gap-2 hover:bg-[#00e0d2] transition">
                <Video size={16} /> Start Call
              </button>
            )}
          </div>
        </Modal>
      </RequireAuth>
    </MobileOnly>
  );
}
