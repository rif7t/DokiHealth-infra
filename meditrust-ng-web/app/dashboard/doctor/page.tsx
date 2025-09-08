"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import DoctorBell from "@/components/DoctorBell";
import { subscribe } from "@/lib/eventBus";
import { useRef } from "react";
import { KeyboardDismissWrapper } from "@/components/KeyboardDismissWrapper";

export default function DoctorDashboard() {
  const [tab, setTab] = useState("overview");
  const [status, setStatus] = useState("Nil");
  const [availability, setAvailability] = useState(true);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [greeting, setGreeting] = useState("Hello");

  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [consult, setConsult] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [session, setSession] = useState<any | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [cstatus, setCstatus] = useState<any | null>(null);
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);      

  

  // 🔔 Subscription to new consults
  useEffect(() => {
    const unsubscribe = subscribe("new-consult", () => {
      setShowToast(true);
      if (!audioRef.current) {
          audioRef.current = new Audio("/notifications/consult-notif.mp3");
        }
        audioRef.current.play();
      setTimeout(() => setShowToast(false), 2000);
    });
    return () => unsubscribe();
  }, []);

  

  // Fetch consults for logged-in doctor
  useEffect(() => {
    const fetchDoctorAndConsult = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error || !user) throw new Error("Not signed in");
        setDoctorId(user.id);

        const { data: consult, error: consultError } = await supabase
          .from("consult")
          .select("*")
          .eq("doctor_id", user.id)
          .order("created_at", { ascending: true })
          .limit(1)
          .single();

        if (consultError) {
          console.log("No consults yet:", consultError.message);
          setConsult(null);
        } else {
          setConsult(consult);
        }
      } catch (err) {
        console.error("Error fetching consult:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorAndConsult();
  }, []);

  // Fetch profile + consultations
  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      
      if (!session) return router.replace("/sign-in");

      const res = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      setProfile(data.profile);

      const { data: consults } = await supabase
        .from("consult")
        .select("*")
        .eq("doctor_id", data.profile.id)
        .gte("created_at", new Date().toISOString().split("T")[0]);
      setConsultations(consults || []);

      const { data: historyData } = await supabase
        .from("consult")
        .select("*")
        .eq("doctor_id", data.profile.id)
        .eq("status", "completed")
        .order("created_at", { ascending: false });
      setHistory(historyData || []);

      const { data: payoutData } = await supabase
        .from("payouts")
        .select("*")
        .eq("doctor_id", data.profile.id)
        .order("created_at", { ascending: false });
      setPayouts(payoutData || []);
    })();
  }, [router]);

  // Greeting by time of day
  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) setGreeting("Good morning");
      else if (hour < 17) setGreeting("Good afternoon");
      else setGreeting("Good evening");
    };
    updateGreeting();
    const interval = setInterval(updateGreeting, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleAvailability = async () => {
    const newAvailability = !availability;
    try {
      setAvailability(newAvailability);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from("profile")
        .update({ is_available: newAvailability })
        .eq("id", profile.id);

      if (error) {
        console.error("Error updating availability:", error.message);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  const saveProfile = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Not signed in");

      const payload = {
        first_name: profile.first_name,
        last_name: profile.last_name,
        specialty: profile.specialty,
        doctor_bio: profile.doctor_bio,
        bank_account_number: profile.bank_account_number,
        bank_name: profile.bank_name,
        email: profile.email || session.user?.email,
      };

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ profile: payload, isDoctor: true }),
      });

      const data = await res.json();
      if (data.ok) {
        alert("✅ Account details saved successfully!");
      } else {
        throw new Error(data.error || "Failed to save account details");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };
  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/sign-in");
  };

  ConsultStatusWatcher();

  return (
    <KeyboardDismissWrapper>
      <div className="min-h-screen bg-gradient-to-br from-white to-slate-100">
        {/* 🔔 Toast for new consults */}
        {showToast && (
          <div
            onClick={() => setShowToast(false)}
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-black/70 
                       text-white px-4 py-2 rounded-xl shadow-lg animate-bounce cursor-pointer"
          >
            A new consult has been assigned to you
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-2 bg-slate-50 p-2">
          {["overview", "history","payouts","account"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg px-4 py-2 text-sm ${
                tab === t ? "bg-blue-500 text-white" : "bg-white text-slate-600"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview */}
{tab === "overview" && (
  <div className="p-3 sm:p-4 space-y-4 sm:space-y-6">
    
    {/* Welcome Header */}
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
      <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
        <div>
          <h1 className="text-lg sm:text-xl font-bold">{greeting}, Dr. {profile?.first_name || ''}</h1>
          <p className="text-blue-100 text-xs sm:text-sm">Ready to help patients today?</p>
        </div>
      </div>
      <div className="flex items-center justify-end  gap-3">
            <DoctorBell />
            
          </div>
    </div>

    {/* Stats Grid */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg border border-gray-100 p-3 sm:p-6 text-center hover:shadow-xl transition-shadow duration-200 active:scale-95">
        <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
          <span className="text-blue-600 text-sm sm:text-xl">📊</span>
        </div>
        <div className="text-lg sm:text-2xl font-bold text-gray-800 mb-1">{status}</div>
        <p className="text-gray-600 text-xs sm:text-sm font-medium">Current Status</p>
      </div>

      <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg border border-gray-100 p-3 sm:p-6 text-center hover:shadow-xl transition-shadow duration-200 active:scale-95">
        <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-100 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
          <span className="text-green-600 text-sm sm:text-xl">📅</span>
        </div>
        <div className="text-lg sm:text-2xl font-bold text-gray-800 mb-1">{consultations.length}</div>
        <p className="text-gray-600 text-xs sm:text-sm font-medium">Today's Sessions</p>
      </div>

      <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg border border-gray-100 p-3 sm:p-6 text-center hover:shadow-xl transition-shadow duration-200 active:scale-95">
        <div className="w-8 h-8 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
          <span className="text-yellow-600 text-sm sm:text-xl">⭐</span>
        </div>
        <div className="text-lg sm:text-2xl font-bold text-gray-800 mb-1">4.9</div>
        <p className="text-gray-600 text-xs sm:text-sm font-medium">Patient Rating</p>
      </div>

      <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg border border-gray-100 p-3 sm:p-6 text-center hover:shadow-xl transition-shadow duration-200 active:scale-95">
        <div className="w-8 h-8 sm:w-12 sm:h-12 bg-purple-100 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
          <span className="text-purple-600 text-sm sm:text-xl">🏥</span>
        </div>
        <div className="text-lg sm:text-2xl font-bold text-gray-800 mb-1">142</div>
        <p className="text-gray-600 text-xs sm:text-sm font-medium">Total Patients</p>
      </div>
    </div>

    {/* Availability Toggle */}
    <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center ${
            availability ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            <span className="text-lg sm:text-xl">{availability ? '🟢' : '🔴'}</span>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-800">
              {availability ? "Available for Consultations" : "Currently Unavailable"}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              {availability 
                ? "Patients can request consultations with you" 
                : "You won't receive new consultation requests"
              }
            </p>
          </div>
        </div>
        
        <div
          onClick={toggleAvailability}
          className={`relative w-14 h-7 sm:w-16 sm:h-8 rounded-full cursor-pointer transition-all duration-300 active:scale-95 ${
            availability ? "bg-green-500 shadow-lg" : "bg-gray-300"
          }`}
        >
          <div
            className={`absolute top-0.5 sm:top-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
              availability ? "translate-x-7 sm:translate-x-9" : "translate-x-0.5 sm:translate-x-1"
            }`}
          />
        </div>
      </div>
    </div>

    {/* Today's Consultations */}
    <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center">
          <span className="text-blue-600 text-sm sm:text-lg">📋</span>
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-800">Today's Consultations</h2>
          <p className="text-xs sm:text-sm text-gray-600">Here’s what you’ve handled today</p>
        </div>
      </div>

      {consultations.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <span className="text-xl sm:text-2xl"></span>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1 sm:mb-2">No consultations yet</h3>
          <p className="text-gray-600 text-xs sm:text-sm">You've had no patient consultations today.</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {consultations.map((c) => (
            <div
              key={c.id}
              className="border-2 border-gray-100 hover:border-blue-300 rounded-lg sm:rounded-xl p-3 sm:p-4 
                         transition-all duration-200 hover:shadow-md bg-gray-50 hover:bg-white active:scale-[0.98]"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-xs sm:text-sm">
                      {c.patient_name?.charAt(0) || 'P'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm sm:text-base">{c.patient_name}</h4>
                    <p className="text-xs sm:text-sm text-gray-600">Patient Consultation</p>
                  </div>
                </div>
                
                <span
                  className={`text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-medium self-start ${
                    c.status === "Assigned"
                      ? "bg-blue-100 text-blue-700"
                      : c.status === "Accepted"
                      ? "bg-green-100 text-green-700"
                      : c.status === "Rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {c.status || "Pending"}
                </span>
              </div>
              
              <div className="bg-white rounded-lg p-2 sm:p-3 border border-gray-100">
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  <span className="font-medium text-gray-800">Complaint: </span>
                  {c.complaint}
                </p>
              </div>
              
              {c.status === "Assigned" && (
                <div className="flex flex-col sm:flex-row gap-2 mt-3">
                  <button className="flex-1 py-2 px-3 sm:px-4 bg-green-500 hover:bg-green-600 active:scale-95 text-white text-xs sm:text-sm font-medium rounded-lg transition-all">
                    Accept
                  </button>
                  <button className="flex-1 py-2 px-3 sm:px-4 bg-red-500 hover:bg-red-600 active:scale-95 text-white text-xs sm:text-sm font-medium rounded-lg transition-all">
                    Decline
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)}

        {/* History */}
        {tab === "history" && (
          <div className="p-4 space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="font-semibold text-black mb-3">
                Previous Consultations
              </h2>
              {history.length === 0 ? (
                <p className="text-slate-500">No previous consultations.</p>
              ) : (
                history.map((h) => (
                  <div key={h.id} className="border rounded-lg p-3 mb-2">
                    <p className="font-semibold">{h.patient_name}</p>
                    <p className="text-sm text-slate-600">
                      {new Date(h.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-slate-700">{h.diagnosis}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Payouts */}
        {tab === "payouts" && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 shadow text-center">
                <p className="text-2xl font-bold text-blue-600">
                  ₦
                  {payouts
                    .filter((p) => p.status === "paid")
                    .reduce((sum, p) => sum + p.amount, 0)}
                </p>
                <p className="text-slate-600">This Month</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow text-center">
                <p className="text-2xl font-bold text-green-600">
                  ₦
                  {payouts
                    .filter((p) => p.status === "pending")
                    .reduce((sum, p) => sum + p.amount, 0)}
                </p>
                <p className="text-slate-600">Pending</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow">
              <h2 className="font-semibold text-black mb-3">Payout History</h2>
              {payouts.length === 0 ? (
                <p className="text-slate-500">No payout history yet.</p>
              ) : (
                payouts.map((p) => (
                  <div
                    key={p.id}
                    className="flex justify-between border-b py-2 last:border-none"
                  >
                    <div>
                      <h4 className="font-semibold">₦{p.amount}</h4>
                      <p className="text-sm text-slate-500">
                        {new Date(p.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        p.status === "paid"
                          ? "bg-green-100 text-green-600"
                          : "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

          {/* Account */}
        {tab === "account" && (
  <div className="p-4 space-y-6">
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-6">
      
      {/* Header */}
      <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
    Doctor Profile
  </h2>

  <button
    onClick={signOut}
    className="bg-red-100 text-red-600 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-red-200"
  >
    Sign Out
  </button>
</div>

<p className="text-sm text-gray-600 mt-1">
  Manage your professional information and payment details
</p>


      {/* Personal Information Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Personal Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">First Name</label>
            <div className="relative">
              <input
                type="text"
                value={profile?.first_name || ""}
                onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                className="w-full border border-gray-200 rounded-xl p-3 pl-4 
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                           hover:border-gray-300 transition-colors duration-200
                           bg-gray-50 focus:bg-white text-gray-800"
                placeholder="Enter your first name"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Last Name</label>
            <div className="relative">
              <input
                type="text"
                value={profile?.last_name || ""}
                onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                className="w-full border border-gray-200 rounded-xl p-3 pl-4 
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                           hover:border-gray-300 transition-colors duration-200
                           bg-gray-50 focus:bg-white text-gray-800"
                placeholder="Enter your last name"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Phone Number</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">📱</span>
            </div>
            <input
              type="tel"
              value={profile?.phone_number || ""}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, ""); // digits only
                if (val.length <= 11) {
                  setProfile({ ...profile, phone_number: val });
                }
              }}
              className="w-full border border-gray-200 rounded-xl p-3 pl-10 
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                         hover:border-gray-300 transition-colors duration-200
                         bg-gray-50 focus:bg-white text-gray-800"
              placeholder="e.g., 08012345678 (11 digits)"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Enter your 11-digit Nigerian phone number</p>
        </div>
      </div>

      {/* Professional Information Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Professional Information</h3>
        
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Medical Specialty</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">🩺</span>
            </div>
            <select
              value={profile?.specialty || ""}
              onChange={(e) => setProfile({ ...profile, specialty: e.target.value })}
              className="w-full border border-gray-200 rounded-xl p-3 pl-10 
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                         hover:border-gray-300 transition-colors duration-200
                         bg-gray-50 focus:bg-white text-gray-800 appearance-none"
            >
              <option value="">Select your medical specialty</option>
              <option value="General Practice">🏥 General Practice</option>
              <option value="Pediatrics">👶 Pediatrics</option>
              <option value="Cardiology">❤️ Cardiology</option>
              <option value="Dermatology">👤 Dermatology</option>
              <option value="Endocrinology">🔬 Endocrinology</option>
              <option value="Gastroenterology">🫁 Gastroenterology</option>
              <option value="Neurology">🧠 Neurology</option>
              <option value="Orthopedics">🦴 Orthopedics</option>
              <option value="Psychiatry">🧘 Psychiatry</option>
              <option value="Pulmonology">🫁 Pulmonology</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-400">▼</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">This will help patients find you for relevant consultations</p>
        </div>
      </div>

      {/* Banking Information Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Payment Information</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
          <p className="text-xs text-blue-700 flex items-center gap-1">
            <span>🔒</span>
            Your banking information is encrypted and secure. This is required for payment processing.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Bank Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400">🏦</span>
              </div>
              <select
                value={profile?.bank_name || ""}
                onChange={(e) => setProfile({ ...profile, bank_name: e.target.value })}
                className="w-full border border-gray-200 rounded-xl p-3 pl-10 
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                           hover:border-gray-300 transition-colors duration-200
                           bg-gray-50 focus:bg-white text-gray-800 appearance-none"
              >
                <option value="">Select your bank</option>
                <option value="Access Bank">Access Bank</option>
                <option value="United Bank of Africa">United Bank of Africa (UBA)</option>
                <option value="Wema/Alat">Wema Bank / Alat</option>
                <option value="Zenith Bank">Zenith Bank</option>
                <option value="First Bank">First Bank of Nigeria</option>
                <option value="GTBank">Guaranty Trust Bank (GTBank)</option>
                <option value="Fidelity Bank">Fidelity Bank</option>
                <option value="Union Bank">Union Bank</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-400">▼</span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Account Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400">💳</span>
              </div>
              <input
                type="tel"
                value={profile?.bank_account_number || ""}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  if (val.length <= 10) {
                    setProfile({ ...profile, bank_account_number: val });
                  }
                }}
                className="w-full border border-gray-200 rounded-xl p-3 pl-10 
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                           hover:border-gray-300 transition-colors duration-200
                           bg-gray-50 focus:bg-white text-gray-800"
                placeholder="Enter 10-digit account number"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Enter your 10-digit account number</p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-4 border-t border-gray-100">
        <button
          onClick={saveProfile}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 
                     hover:from-blue-700 hover:to-blue-800 
                     text-white font-semibold shadow-lg hover:shadow-xl 
                     transition-all duration-200 transform hover:scale-[1.02]
                     flex items-center justify-center gap-2"
        >
          <span>💾</span>
          Save Profile Changes
        </button>
      </div>
    </div>
   </div>
 )}
      </div>
    </KeyboardDismissWrapper>
  );
}


export function ConsultStatusWatcher() {
  const [status, setStatus] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("SETTING UP SUBSCRIPTION");
    const channel = supabase
      .channel("profile-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profile" },
        async (payload) => {
          console.log("Change received!", payload);

          if (payload.eventType == "UPDATE") {
            setStatus(payload.new);
            
          }
        }
      )
      .subscribe((status) => console.log("Subscription status:", status));

    // Cleanup subscription when component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div>
      <h3>Consult Status Watcher</h3>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      <pre>{status ? JSON.stringify(status, null, 2) : "No updates yet"}</pre>
    </div>
  );
}