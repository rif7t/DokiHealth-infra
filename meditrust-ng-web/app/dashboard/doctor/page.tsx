"use client";
import { useEffect, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import MobileOnly from "@/components/MobileOnly";
import ModalCard from "@/components/ModalCard";
import ConsultationSummaryCard from "@/components/consults/ConsultationSummaryCard";
import ConsultRequestCard from "@/components/consults/ConsultRequestCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Menu,
  User,
  Calendar,
  ClipboardList,
  PowerIcon,
  X,
  Bell,
  DollarSign,
  Phone,
  CreditCard,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import KPI from "@/components/ui/KPI";
import Toggle from "@/components/ui/Toggle";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";

const banks = [
  "Access Bank",
  "United Bank of Africa",
  "Wema/Alat",
  "Zenith Bank",
];

export default function DoctorDashboard() {
  const router = useRouter();
  const [profile, setDoctorProfile] = useState<any>(null);
  const [acctProfile, setAcctProfile] = useState<any>({});
  const [accessToken, setAccessToken] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedConsult, setSelectedConsult] = useState<any>(null);
  const [showAlerts, setShowAlerts] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showPayouts, setShowPayouts] = useState(false);

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      setAccessToken(session.access_token);

      const res = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      if (data?.profile) {
        setDoctorProfile(data.profile);
        setAcctProfile(data.profile); // ✅ sync acctProfile with profile
      }
    })();
  }, []);

  const doctor = {
    name: profile ? `Dr. ${profile.first_name} ${profile.last_name}` : "",
    specialty: profile?.specialty || "",
  };

  // Mock consultations
  const consultations = [
    {
      id: 1,
      patientName: "Jonathan Adio",
      date: "Aug 28, 2025",
      time: "10:00 AM",
      reason: "Headache and fatigue",
      doctor: doctor.name,
      specialty: "Cardiology",
      status: "verified",
      diagnosis: "Migraine",
      prescriptions: ["Paracetamol", "Rest"],
    },
    {
      id: 2,
      patientName: "Precious Adedayo",
      date: "Aug 26, 2025",
      time: "11:30 AM",
      reason: "Follow-up on diabetes",
      doctor: doctor.name,
      specialty: "Cardiology",
      status: "verified",
      diagnosis: "Hypertension",
      prescriptions: ["Amlodipine"],
    },
  ];

  const alerts = [
    { id: 101, patientName: "Sarah Wilson", reason: "New patient sign-up" },
    {
      id: 102,
      patientName: "David Lee",
      reason: "Diabetes management consult",
    },
  ];

  const payouts = [
    { id: 1, date: "Aug 1, 2025", amount: "₦50,000", status: "Paid" },
    { id: 2, date: "Aug 15, 2025", amount: "₦75,000", status: "Pending" },
  ];

  const handleUpdateAcct = async () => {
    if (!accessToken) return;
    setUpdating(true);
    const updatedProfile = { ...profile, ...acctProfile };
    let isDoctor = true;

    console.log(accessToken);
    console.log(updatedProfile);

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ profile: updatedProfile, isDoctor }),
    });

    const data = await res.json();
    if (data?.profile) {
      setDoctorProfile(data.profile);
      setAcctProfile(data.profile); // ✅ keep them in sync
    }

    console.log("Saved profile:", updatedProfile);
    setUpdating(false);
    return data;
  };

  const [isAvailable, setIsAvailable] = useState(true);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) router.replace("/sign-in");
  };

  return (
    <MobileOnly>
      <RequireAuth>
        <div className="relative flex min-h-screen bg-slate-50">
          {/* Sidebar */}
          <div
            className={clsx(
              "fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-40",
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
                onClick={() => setShowAccountModal(true)}
                className="flex items-center gap-3 text-slate-700 hover:text-teal-600"
              >
                <User size={18} /> Account Details
              </button>
              <button
                onClick={() => router.push("/dashboard/doctor/schedule")}
                className="flex items-center gap-3 text-slate-700 hover:text-teal-600"
              >
                <ClipboardList size={18} /> Schedule
              </button>
              <button
                onClick={() => setShowPayouts(true)}
                className="flex items-center gap-3 text-slate-700 hover:text-teal-600"
              >
                <DollarSign size={18} /> Payouts
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
                    {doctor.name}
                  </p>
                  <p className="text-xs text-slate-500">{doctor.specialty}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Toggle checked={isAvailable} onChange={setIsAvailable} />
                    <span className="text-xs rounded-full bg-teal-100 text-teal-700 px-2 py-0.5">
                      {isAvailable ? "Available" : "Away"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAlerts(true)}
                  className="relative p-3 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 shadow-md"
                >
                  <Bell size={20} />
                  {alerts.length > 0 && (
                    <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform bg-red-500 rounded-full">
                      {alerts.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-3 rounded-full bg-teal-500 text-white hover:bg-teal-600 shadow-md"
                >
                  <Menu size={20} />
                </button>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 gap-3">
              <KPI icon={User} value="128" label="Patients" />
              <KPI icon={Calendar} value="12" label="This Week" />
            </div>

            {/* Previous Consultations */}
            <Card>
              <CardHeader>
                <CardTitle>Previous Consultations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-slate-200">
                  {consultations.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedConsult(c)}
                      className="flex w-full items-center justify-between py-3 text-left hover:bg-slate-50 rounded-lg px-2"
                    >
                      <div>
                        <p className="font-medium text-slate-900">
                          {c.patientName}
                        </p>
                        <p className="text-xs text-slate-500">{c.reason}</p>
                      </div>
                      <span className="text-xs text-slate-500">
                        {c.date}, {c.time}
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </main>
        </div>

        {/* Modals */}
        <ModalCard
          show={!!selectedConsult}
          onClose={() => setSelectedConsult(null)}
          title="Consultation Summary"
        >
          {selectedConsult && (
            <ConsultationSummaryCard consult={selectedConsult} />
          )}
        </ModalCard>

        <ModalCard
          show={showAlerts}
          onClose={() => setShowAlerts(false)}
          title="Consult Requests"
        >
          {alerts.length === 0 ? (
            <p className="text-sm text-slate-600">No new requests.</p>
          ) : (
            <div className="space-y-3">
              {alerts.map((a) => (
                <ConsultRequestCard
                  key={a.id}
                  request={a}
                  onAccept={() => console.log("Accepted", a.id)}
                  onReject={() => console.log("Rejected", a.id)}
                />
              ))}
            </div>
          )}
        </ModalCard>

        <ModalCard
          show={showAccountModal}
          onClose={() => setShowAccountModal(false)}
          title="Account Details"
        >
          <div className="space-y-3">
            <TextField
              placeholder="First Name"
              value={acctProfile?.first_name || ""}
              onChange={(e) =>
                setAcctProfile({ ...acctProfile, first_name: e.target.value })
              }
              icon={User}
            />
            <TextField
              placeholder="Last Name"
              value={acctProfile?.last_name || ""}
              onChange={(e) =>
                setAcctProfile({ ...acctProfile, last_name: e.target.value })
              }
              icon={User}
            />
            <TextField
              placeholder="Phone Number"
              type="tel"
              value={acctProfile?.phone_number || ""}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                if (val.length <= 11)
                  setAcctProfile({ ...acctProfile, phone_number: val });
              }}
              icon={Phone}
            />
            <TextField
              placeholder="Account Number"
              type="tel"
              value={acctProfile?.bank_account_number || ""}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                if (val.length <= 11)
                  setAcctProfile({ ...acctProfile, bank_account_number: val });
              }}
              icon={CreditCard}
            />
            <div className="relative">
              <CreditCard className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <select
                value={acctProfile?.bank_name || ""}
                onChange={(e) =>
                  setAcctProfile({ ...acctProfile, bank_name: e.target.value })
                }
                className="w-full appearance-none rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00CFC1]"
              >
                <option value="">Select Bank</option>
                {banks.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <Button
              disabled={!!updating}
              onClick={handleUpdateAcct}
              className="w-full"
            >
              {updating ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </ModalCard>

        <ModalCard
          show={showPayouts}
          onClose={() => setShowPayouts(false)}
          title="Payouts"
        >
          {payouts.length === 0 ? (
            <p className="text-sm text-slate-600">No payouts yet.</p>
          ) : (
            <div className="space-y-3">
              {payouts.map((p) => (
                <div
                  key={p.id}
                  className="p-3 border border-slate-200 rounded-lg bg-slate-50 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-slate-900">{p.date}</p>
                    <p className="text-xs text-slate-500">{p.status}</p>
                  </div>
                  <span className="text-teal-700 font-semibold">
                    {p.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ModalCard>
      </RequireAuth>
    </MobileOnly>
  );
}
