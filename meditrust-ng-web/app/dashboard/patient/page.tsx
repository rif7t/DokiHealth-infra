"use client";
import { useEffect, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import MobileOnly from "@/components/MobileOnly";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Menu, User, FileText, PowerIcon, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import ModalCard from "@/components/ModalCard";
import SymptomChecker from "@/components/SymptomChecker";
import PreviousConsultationCard from "@/components/consults/PreviousConsultationCard";
import ConsultationDetailsCard from "@/components/consults/ConsultationDetailsCard";

export default function PatientDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedConsult, setSelectedConsult] = useState<any>(null);

  let accessToken = ""
  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      accessToken = session.access_token;
      if (!session) return;
      const res = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      
      if (data?.profile) {
        setProfile(data.profile);
      }
    })();
  }, []);

  // Dummy patient + consultations
  const patient = {
    name: `${profile.first_name} ${profile.last_name}`,
    age: profile.age,
    gender: profile.gender,
  };
  const consultations = [
    {
      id: 1,
      doctor: "Dr. Lawal Idris",
      specialty: "Cardiologist",
      date: "Aug 25, 2025",
      time: "10:00 AM",
      symptoms: ["Chest pain", "Fatigue"],
      status: "verified",
      diagnosis: "Mild Arrhythmia",
      prescriptions: ["Beta-blockers 5mg daily", "Lifestyle modifications"],
    },
    {
      id: 2,
      doctor: "Dr. Maureen Adekola",
      specialty: "Dermatologist",
      date: "Aug 12, 2025",
      time: "2:30 PM",
      symptoms: ["Skin rash", "Itching"],
      status: "accepted",
      diagnosis: "Eczema",
      prescriptions: ["Topical steroid cream", "Moisturizer"],
    },
  ];

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) router.replace("/sign-in");
  };

  const statusBadge = (status: string) => {
    const base = "inline-flex px-2 py-1 text-xs font-medium rounded-full";
    switch (status) {
      case "requested":
        return `${base} bg-yellow-100 text-yellow-700`;
      case "accepted":
        return `${base} bg-blue-100 text-blue-700`;
      case "verified":
        return `${base} bg-green-100 text-green-700`;
      default:
        return `${base} bg-slate-100 text-slate-600`;
    }
  };

  return (
    <MobileOnly>
      <RequireAuth>
        <div className="relative flex min-h-screen bg-slate-60">
          {/* Sidebar */}
          <div
            className={clsx(
              "fixed top-0 right-2 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-40",
              sidebarOpen ? "translate-x-0" : "translate-x-full"
            )}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">Menu</h2>
              <button onClick={() => setSidebarOpen(false)}>
                <X size={20} className="text-slate-600 hover:text-red-500" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <button
                onClick={() => router.push("/dashboard/patient/my-health")}
                className="flex items-center gap-3 text-slate-700 hover:text-teal-600"
              >
                <FileText size={18} /> My Health
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 text-red-600 hover:text-red-700"
              >
                <PowerIcon size={18} /> Sign Out
              </button>
            </div>
          </div>

          {/* Main Content */}
          <main className="flex-1 mx-auto max-w-md p-4 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                  <User className="text-slate-600" size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {patient.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {patient.gender}, {patient.age} y.o
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-3 rounded-full bg-teal-500 text-white hover:bg-teal-600 shadow-md"
              >
                <Menu size={20} />
              </button>
            </div>

            {/* Symptom Checker Card */}
            <Card className="border border-teal-100 shadow-sm">
              <CardContent>
                <SymptomChecker />
              </CardContent>
            </Card>

            {/* Previous Consultations */}
            <Card>
              <CardHeader>
                <CardTitle>Previous Consultations</CardTitle>
              </CardHeader>
              <CardContent>
                {consultations.length === 0 ? (
                  <p className="text-sm text-slate-600">
                    No past consultations.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {consultations.map((c) => (
                      <PreviousConsultationCard
                        key={c.id}
                        consult={c}
                        onClick={() => setSelectedConsult(c)}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>

        {/* Modal for Consultation Details */}
        <ModalCard
          show={!!selectedConsult}
          onClose={() => setSelectedConsult(null)}
          title="Consultation Details"
        >
          {selectedConsult && (
            <ConsultationDetailsCard
              consult={selectedConsult}
              statusBadge={statusBadge}
            />
          )}
        </ModalCard>
      </RequireAuth>
    </MobileOnly>
  );
}
