"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import DoctorBell from "@/components/DoctorBell";
import {subscribe} from "@/lib/eventBus";
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

  const router = useRouter();
  
   useEffect(() => {
    // Subscribe to "new-consult" events
    const unsubscribe = subscribe("new-consult", () => {
      // Show popup
      setShowToast(true);

      // Play sound
      const audio = new Audio("@/public/notifications/consult-notif.wav");
      audio.play().catch((e) => console.error("Sound play failed:", e));

      // Auto-hide after 2s
      setTimeout(() => setShowToast(false), 2000);
    });

    // cleanup on unmount
    return () => unsubscribe();
  }, []);


   useEffect(() => {
    const fetchDoctorAndConsult = async () => {
      setLoading(true);
      try {
        // Get logged-in user (doctor)
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) throw new Error("Not signed in");
        setDoctorId(user.id);

        // Fetch ONE consult assigned to this doctor
        const { data: consult, error: consultError } = await supabase
          .from("consult")
          .select("*")
          .eq("doctor_id", user.id)
          .order("created_at", { ascending: true }) // get earliest
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
  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return router.replace("/sign-in");

      // Profile
      const res = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      setProfile(data.profile);

      // Today’s consultations
      const { data: consults } = await supabase
        .from("consult")
        .select("*")
        .eq("doctor_id", data.profile.id)
        .gte("created_at", new Date().toISOString().split("T")[0]);
      setConsultations(consults || []);

      // Previous consultations (completed only)
      const { data: historyData } = await supabase
        .from("consult")
        .select("*")
        .eq("doctor_id", data.profile.id)
        .eq("status", "completed")
        .order("created_at", { ascending: false });
      setHistory(historyData || []);

      // Payouts
      const { data: payoutData } = await supabase
        .from("payouts")
        .select("*")
        .eq("doctor_id", data.profile.id)
        .order("created_at", { ascending: false });
      setPayouts(payoutData || []);
    })();
  }, [router]);

useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) {
        setGreeting("Good morning");
      } else if (hour < 17) {
        setGreeting("Good afternoon");
      } else {
        setGreeting("Good evening");
      }
      console.log("time is: ", hour);
    };

    updateGreeting(); // set immediately on load
    const interval = setInterval(updateGreeting, 60 * 1000); // update every minute
    return () => clearInterval(interval);
  }, []);

  const acceptConsult = async () => {
    if (!consult) return;
    await supabase
      .from("consults")
      .update({ status: "accepted" })
      .eq("id", consult.id);
    setConsult({ ...consult, status: "accepted" });
  };

  const rejectConsult = async () => {
    if (!consult) return;
    await supabase
      .from("consults")
      .update({ status: "rejected", doctor_id: null }) // unassign
      .eq("id", consult.id);
    setConsult({ ...consult, status: "rejected", doctor_id: null });
  };

  const toggleAvailability = async () => {
    const newAvailability = !availability;
    
    
    try {
    setAvailability(newAvailability);
    console.log("new availability: ", newAvailability);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from("profile")
      .update({ is_available: !newAvailability })
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


  return (
    <KeyboardDismissWrapper>
    <div className="min-h-screen bg-gradient-to-br from-white to-slate-100">
      {/* Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur shadow p-4 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold text-slate-800">
            {greeting}, Dr. {profile?.last_name} 🩺
          </h1>
          <p className="text-xs text-slate-500">
            Ready to help your patients today?
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* ✅ Keep your existing bell logic here */}
          <div className="flex gap-3">
        <DoctorBell />
      </div>
          <button
            className="bg-red-100 text-red-600 px-3 py-2 rounded-lg text-xs font-semibold"
            onClick={async () => {
              await supabase.auth.signOut();
              router.replace("/sign-in");
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
      {/* <h1 className="text-xl font-bold">Doctor Dashboard</h1> */}

      {/* {loading ? (
        <p>Loading consult...</p>
      ) : consult ? (
        <div className="mt-4 border p-4 rounded-lg shadow">
          <p>
            <strong>Patient:</strong> {consult.patient_id}
          </p>
          <p>
            <strong>Status:</strong> {consult.status}
          </p>
          
        </div>
      ) : (
        <p>No consults assigned right now.</p>
      )} */}

      
      {showToast && (
        <div
          onClick={() => setShowToast(false)}
          onTouchStart={(e) => {
              const startY = e.touches[0].clientY;
              const handleTouchEnd = (ev: TouchEvent) => {
                const endY = ev.changedTouches[0].clientY;
                if (startY - endY > 50) { // swipe up
                  setShowToast(false);
                }
                document.removeEventListener("touchend", handleTouchEnd);
              };
              document.addEventListener("touchend", handleTouchEnd);
            }}

          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-black/70 
                    text-white px-4 py-2 rounded-xl shadow-lg 
                    transition-all duration-300 animate-bounce cursor-pointer"
        >
          A new consult has been assigned to you
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-2 bg-slate-50 p-2">
        {["overview", "history", "account", "payouts"].map((t) => (
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
        <div className="p-4 space-y-4">
          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{status}</div>
              <p className="text-slate-600 text-sm">Status</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {consultations.length}
              </div>
              <p className="text-slate-600 text-sm">Today</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">4.9</div>
              <p className="text-slate-600 text-sm">Rating</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">142</div>
              <p className="text-slate-600 text-sm">Total</p>
            </div>
          </div>

          {/* Availability toggle */}
          <div className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
            <div>
              <h2 className="font-semibold text-slate-800">
                {availability
                  ? "Available for Consultations"
                  : "Currently Unavailable"}
              </h2>
            
            </div>
            <div
              onClick={toggleAvailability}
              className={`w-14 h-8 rounded-full cursor-pointer transition ${
                availability ? "bg-blue-500" : "bg-slate-300"
              }`}
            >
              <div
                className={`w-7 h-7 mt-0.5 bg-white rounded-full shadow transform transition ${
                  availability ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </div>
          </div>

          {/* Today's Consultations (your existing logic) */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-semibold text-black mb-2">Today's Consultations</h2>
            {consultations.length === 0 ? (
              <p className="text-slate-500">No consultations today.</p>
            ) : (
              consultations.map((c) => (
                <div
                  key={c.id}
                  className="border rounded-lg p-3 mb-2 hover:border-blue-400"
                >
                  <p className="font-semibold">{c.patient_name}</p>
                  <p className="text-sm text-slate-600">{c.complaint}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      c.status === "Assigned"
                        ? "bg-blue-100 text-blue-600"
                        : c.status === "Accepted"
                        ? "bg-green-100 text-green-600"
                        : c.status === "Rejected"
                        ? "bg-red-100 text-red-600"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {c.status || "Nil"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* {Pending Consults Modal} */}
      {/* <div className="mt-4 flex gap-4">
            <button
              onClick={acceptConsult}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              Accept
            </button>
            <button
              onClick={rejectConsult}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Reject
            </button>
          </div> */}

      {/* History */}
      {tab === "history" && (
        <div className="p-4 space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-semibold text-black mb-3">Previous Consultations</h2>
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

      {/* Account */}
      {tab === "account" && (
        <div className="p-4 space-y-4">
          <div className="bg-white rounded-lg shadow p-4 space-y-3 text-blue-500">
            <h2 className="font-semibold">Account Details</h2>
            <input
              type="text"
              value={profile?.first_name || ""}
              onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
              className="w-full border rounded-lg p-2 text-black"
              placeholder="First Name"
            />
            <input
              type="text"
              value={profile?.last_name || ""}
              onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
              className="w-full border rounded-lg p-2 text-black"
              placeholder="Last Name"
            />
            <input
              type="tel"
              value={profile?.phone_number || ""}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, ""); // digits only
                if (val.length <= 11) {
                  setProfile({ ...profile, phone_number: val });
                }
              }}
              className="w-full border rounded-lg p-2 text-black"
              placeholder="Phone Number (11 digits)"
            />
              <select
              value={profile?.specialty || ""}
              onChange={(e) => setProfile({ ...profile, specialty: e.target.value })}
              className="w-full border rounded-lg p-2 text-black bg-white"
            >
              <option value="">Select Specialty</option>
              <option value="General Practice">General Practice</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Dermatology">Dermatology</option>
              <option value="Endocrinology">Endocrinology</option>
              <option value="Gastroenterology">Gastroenterology</option>
              <option value="Neurology">Neurology</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Psychiatry">Psychiatry</option>
              <option value="Pulmonology">Pulmonology</option>
            </select>

            
            <select
            value={profile?.bank_name || ""}
            onChange={(e) => setProfile({ ...profile, bank_name: e.target.value })}
            className="form-select"
          >
            <option value="">Select Bank</option>
            <option value="Access Bank">Access Bank</option>
            <option value="United Bank of Africa">United Bank of Africa</option>
            <option value="Wema/Alat">Wema/Alat</option>
            <option value="Zenith Bank">Zenith Bank</option>
          </select>

            <input
              type="tel"
              value={profile?.bank_account_number || ""}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                if (val.length <= 10) {
                  setProfile({ ...profile, bank_account_number: val });
                }
              }}
              className="form-input"
              placeholder="Enter 10-digit account number"
            />

            <button
              onClick={saveProfile}
              className="w-full py-2 rounded-lg bg-blue-500 text-white font-semibold"
            >
              Save Changes
            </button>
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
    </div>
    </KeyboardDismissWrapper>
  );
}
