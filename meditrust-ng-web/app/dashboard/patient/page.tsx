"use client";
import { useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import MobileOnly from "@/components/MobileOnly";
import ModalCard from "@/components/ModalCard";
import {
  Activity,
  Stethoscope,
  FileText,
  MessageSquare,
  PowerIcon,
} from "lucide-react";
import SymptomChecker from "@/components/SymptomChecker";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function PatientDashboard() {
  // Dummy appointments
  const appointments = [
    {
      id: 1,
      doctorName: "Dr. Sarah Johnson",
      specialty: "Cardiologist",
      time: "Tomorrow, 10:00 AM",
      notes: "Follow-up consultation on blood pressure management",
    },
    {
      id: 2,
      doctorName: "Dr. Michael Lee",
      specialty: "Dermatologist",
      time: "Friday, 1:30 PM",
      notes: "Skin rash evaluation",
    },
  ];

  // Dummy records with detailed info
  const records = [
    {
      id: 1,
      title: "Blood Test Results",
      date: "2 days ago",
      summary: "Normal cholesterol levels. Slightly low vitamin D.",
      doctor: "Dr. Sarah Johnson",
      clinic: "MediTrust Clinic - Lab A",
      details:
        "Comprehensive blood test conducted. Hemoglobin levels are within normal range. Cholesterol normal. Vitamin D slightly low, recommended supplements. No other concerns.",
    },
    {
      id: 2,
      title: "MRI Scan Report",
      date: "Last week",
      summary: "No abnormalities detected.",
      doctor: "Dr. Michael Lee",
      clinic: "MediTrust Imaging Center",
      details:
        "Brain MRI conducted to rule out any neurological concerns. No structural abnormalities detected. No signs of stroke or lesions. Patient cleared.",
    },
  ];

  // Dummy doctors
  const doctors = [
    {
      id: 1,
      name: "Dr. Alex Carter",
      specialty: "Cardiologist",
      experience: "12 years",
      isOnline: true,
      isAvailable: true,
    },
    {
      id: 2,
      name: "Dr. Linda Green",
      specialty: "Dermatologist",
      experience: "8 years",
      isOnline: true,
      isAvailable: false,
    },
    {
      id: 3,
      name: "Dr. Robert White",
      specialty: "Neurologist",
      experience: "15 years",
      isOnline: false,
      isAvailable: true,
    },
    {
      id: 4,
      name: "Dr. Sophia Martinez",
      specialty: "Pediatrician",
      experience: "10 years",
      isOnline: true,
      isAvailable: true,
    },
  ];

  // Dummy unread messages
  const unreadMessages = [
    { id: 1, from: "Dr. Johnson", text: "Please remember to take your meds." },
    {
      id: 2,
      from: "Clinic",
      text: "Your appointment is confirmed for tomorrow.",
    },
  ];
  const router = useRouter();
  const [modal, setModal] = useState<string | null>(null);
  const [selected, setSelected] = useState<any>(null);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) router.replace("/");
  };

  return (
    <MobileOnly>
      <RequireAuth>
        <main className="mobile-shell p-4 pb-32 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">MediTrust</h1>
            <div className="px-3 py-1 text-xs rounded-full bg-cyan-500/20 text-cyan-400 font-medium">
              Patient
            </div>
          </div>

          {/* Highlight upcoming appointment */}
          {appointments.length > 0 && (
            <div className="bg-[#1A2622]/90 border border-gray-700 rounded-2xl shadow-lg p-5">
              <h2 className="font-semibold text-white text-lg mb-3">
                Next Appointment
              </h2>
              <div className="p-3 bg-[#0A0F0D]/70 rounded-lg">
                <p className="font-medium text-white">
                  {appointments[0].doctorName}
                </p>
                <p className="text-xs text-gray-400">
                  {appointments[0].specialty}
                </p>
                <p className="text-sm text-gray-300 mt-1">
                  {appointments[0].time}
                </p>
              </div>
            </div>
          )}
        </main>

        {/* Bottom Quick Actions Nav */}
        <div className="fixed bottom-16 left-0 right-0 z-40 px-4">
          <div className="bg-[#1A2622]/95 backdrop-blur-md border border-gray-700 rounded-2xl shadow-xl flex justify-around py-2">
            <button
              onClick={() => setModal("symptoms")}
              className="flex flex-col items-center gap-1 px-3 py-1 hover:bg-gray-800/50 rounded-lg transition"
            >
              <Activity size={20} className="text-cyan-400" />
              <span className="text-xs text-gray-300">Symptoms</span>
            </button>
            <button
              onClick={() => setModal("findDoctor")}
              className="flex flex-col items-center gap-1 px-3 py-1 hover:bg-gray-800/50 rounded-lg transition"
            >
              <Stethoscope size={20} className="text-cyan-400" />
              <span className="text-xs text-gray-300">Find Doctor</span>
            </button>
            <button
              onClick={() => setModal("myHealth")}
              className="flex flex-col items-center gap-1 px-3 py-1 hover:bg-gray-800/50 rounded-lg transition"
            >
              <FileText size={20} className="text-cyan-400" />
              <span className="text-xs text-gray-300">My Health</span>
            </button>
            <button
              onClick={() => setModal("messages")}
              className="relative flex flex-col items-center gap-1 px-3 py-1 hover:bg-gray-800/50 rounded-lg transition"
            >
              <MessageSquare size={20} className="text-cyan-400" />
              {unreadMessages.length > 0 && (
                <span className="absolute top-0 right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadMessages.length}
                </span>
              )}
              <span className="text-xs text-gray-300">Messages</span>
            </button>
            <button
              onClick={() => setModal("sign-out")}
              className="flex flex-col items-center gap-1 px-3 py-1 hover:bg-gray-800/50 rounded-lg transition"
            >
              <PowerIcon size={20} className="text-cyan-400" />
              <span className="text-xs text-gray-300">Sign Out</span>
            </button>
          </div>
        </div>

        {/* --- Modals --- */}

        {/* My Health (Appointments + Records) */}
        <ModalCard show={modal === "myHealth"} onClose={() => setModal(null)}>
          <h2 className="text-lg font-semibold mb-3">My Health</h2>

          {/* Appointments */}
          <h3 className="text-sm text-gray-400 mb-2">Upcoming Appointments</h3>
          {appointments.length === 0 ? (
            <p className="text-sm text-gray-300">No appointments scheduled.</p>
          ) : (
            <div className="space-y-3 mb-4">
              {appointments.map((a) => (
                <div
                  key={a.id}
                  className="p-3 bg-[#0A0F0D]/70 border border-gray-700 rounded-lg"
                >
                  <p className="text-white font-medium">{a.doctorName}</p>
                  <p className="text-xs text-gray-400">{a.specialty}</p>
                  <p className="text-xs text-gray-400">{a.time}</p>
                </div>
              ))}
            </div>
          )}

          {/* Records */}
          <h3 className="text-sm text-gray-400 mb-2">Medical Records</h3>
          {records.length === 0 ? (
            <p className="text-sm text-gray-300">No records available.</p>
          ) : (
            <div className="space-y-3">
              {records.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelected(r)}
                  className="w-full text-left p-3 bg-[#0A0F0D]/70 border border-gray-700 rounded-lg hover:bg-gray-800/40 transition"
                >
                  <p className="text-white font-medium">{r.title}</p>
                  <p className="text-xs text-gray-400">{r.date}</p>
                  <p className="text-xs text-gray-300 mt-1">{r.summary}</p>
                </button>
              ))}
            </div>
          )}
        </ModalCard>

        {/* Record Details Modal */}
        <ModalCard
          show={!!selected && selected?.title}
          onClose={() => setSelected(null)}
        >
          <h2 className="text-lg font-semibold mb-2">{selected?.title}</h2>
          <p className="text-sm text-gray-400">Date: {selected?.date}</p>
          <p className="text-sm text-gray-400">Doctor: {selected?.doctor}</p>
          <p className="text-sm text-gray-400">Clinic: {selected?.clinic}</p>
          <p className="text-sm text-gray-300 mt-3">{selected?.details}</p>
        </ModalCard>

        {/* Doctor Finder Modal */}
        <ModalCard show={modal === "findDoctor"} onClose={() => setModal(null)}>
          <h2 className="text-lg font-semibold mb-3">Find a Doctor</h2>
          <div className="divide-y divide-gray-700">
            {doctors.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setSelected(doc)}
                className="w-full text-left py-3 px-2 hover:bg-gray-800/40 rounded-lg transition flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-white">{doc.name}</p>
                  <p className="text-xs text-gray-400">{doc.specialty}</p>
                </div>
                <span
                  className={`text-xs ${
                    doc.isAvailable ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {doc.isAvailable ? "Available" : "Busy"}
                </span>
              </button>
            ))}
          </div>
        </ModalCard>

        {/* Doctor Details Modal */}
        <ModalCard
          show={!!selected && selected?.name}
          onClose={() => setSelected(null)}
        >
          <h2 className="text-lg font-semibold mb-2">{selected?.name}</h2>
          <p className="text-sm text-gray-300">
            Specialty: {selected?.specialty}
          </p>
          <p className="text-sm text-gray-300">
            Experience: {selected?.experience}
          </p>
          <p className="text-sm text-gray-300 mt-2">
            Status:{" "}
            <span
              className={`${
                selected?.isAvailable ? "text-green-400" : "text-red-400"
              }`}
            >
              {selected?.isAvailable ? "Available" : "Busy"}
            </span>
          </p>
          <div className="mt-5 flex justify-end gap-3">
            <button className="px-4 py-2 bg-[#00CFC1] text-[#0A0F0D] font-semibold rounded-lg text-sm">
              Book Appointment
            </button>
          </div>
        </ModalCard>

        {/* Symptom Checker Modal */}
        <ModalCard show={modal === "symptoms"} onClose={() => setModal(null)}>
          <SymptomChecker onClose={() => setModal(null)} />
        </ModalCard>

        {/* Messages Modal */}
        <ModalCard show={modal === "sign-out"} onClose={() => setModal(null)}>
          <h2 className="text-lg font-semibold mb-3">Sign Out</h2>
          <div className="mt-5 flex justify-end gap-3">
            <button
              onClick={() => handleSignOut()}
              className="px-4 py-2 bg-[#00CFC1] text-[#0A0F0D] font-semibold rounded-lg text-sm"
            >
              Sign Out
            </button>
          </div>
        </ModalCard>

        {/* Messages Modal */}
        <ModalCard show={modal === "messages"} onClose={() => setModal(null)}>
          <h2 className="text-lg font-semibold mb-3">Messages</h2>
          {unreadMessages.length === 0 ? (
            <p className="text-sm text-gray-300">No new messages yet.</p>
          ) : (
            <div className="space-y-3">
              {unreadMessages.map((m) => (
                <div
                  key={m.id}
                  className="p-3 bg-[#0A0F0D]/70 border border-gray-700 rounded-lg"
                >
                  <p className="text-sm text-white font-medium">{m.from}</p>
                  <p className="text-xs text-gray-400">{m.text}</p>
                </div>
              ))}
            </div>
          )}
        </ModalCard>
      </RequireAuth>
    </MobileOnly>
  );
}
