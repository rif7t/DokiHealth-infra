"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { startConsult } from "@/lib/onStartConsult";
import { KeyboardDismissWrapper } from "@/components/KeyboardDismissWrapper";

export default function PatientDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"symptoms" | "history" | "health" | "account">("symptoms");
  const [loading, setLoading] = useState(false);
// New Visit form state
  const [urgency, setUrgency] = useState("");
  const [symptom, setSymptom] = useState("");
  const [greeting, setGreeting] = useState("Hello");

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
    };

    updateGreeting(); // set immediately on load
    const interval = setInterval(updateGreeting, 60 * 1000); // update every minute
    return () => clearInterval(interval);
  }, []);

const requestConsult = async () => {
  if (!symptom) {
    alert("⚠️ Please fill in all required fields.");
    return;
  }

  

  if (urgency === "emergency") {
    alert("🚨 Red Alert – this would normally trigger emergency protocol.");
    return;
  }
    
  //setLoadingConsult(true);

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return;
    }
     try {

    setLoading(true);
    // Now create a consult request
    await startConsult(symptom);
    alert("✅ Consultation request submitted successfully!")
  } catch (e: any) {
    console.error("Error creating consultation:", e.message);
    alert("❌ Something went wrong creating your consultation.");
  } finally {
    setLoading(false);
  }

    
    // Reset form
    setSymptom("");
    //setDuration("");
    setUrgency("");
    //setType("video");

    ;
  } catch (err: any) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

///End of Request Consult

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/sign-in");
        return;
      }

      // Fetch profile
      const res = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      if (data?.profile) setProfile(data.profile);

      // Fetch consultations
      const { data: consults, error } = await supabase
  .from("consult")
  .select("*")
  .order("coalesce(requested_at, '1970-01-01')", { ascending: false });

      setConsultations(consults || []);
    })();
  }, [router]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/sign-in");
  };

  // Stats
  const totalVisits = consultations.length;
  const specialists = [...new Set(consultations.map((c) => c.doctor_id))].length;
  const lastVisit = consultations[0]?.created_at
    ? new Date(consultations[0].created_at).toLocaleDateString()
    : "—";

  const saveProfile = async () => {
    if (!profile) return;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    await fetch("/api/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ profile, isDoctor: false }),
    });
    alert("✅ Profile updated");
  };


  return (
    <KeyboardDismissWrapper>
    <div className="min-h-dvh bg-gradient-to-br from-white to-slate-100">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur shadow-md rounded-b-2xl p-4">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h1 className="text-base font-semibold text-black">
              {greeting}, {profile?.first_name} ⭐
            </h1>
            <p className="text-sm text-slate-500">How are you feeling today?</p>
          </div>
          <div className="flex gap-2">
            
            <button
              onClick={signOut}
              className="px-3 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-600"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-50 rounded-xl p-1 overflow-x-auto">
          {["symptoms", "history", "health", "account"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 text-sm py-2 rounded-lg ${
                activeTab === tab
                  ? "bg-blue-500 text-white font-semibold"
                  : "text-slate-600"
              }`}
            >
              {tab === "symptoms"
                ? "New Visit"
                : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {/* Symptoms/New Visit */}
        {activeTab === "symptoms" && (
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-semibold text-black mb-4">Describe Your Symptoms</h2>
            <textarea
             placeholder="Describe your symptoms..."
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              className="w-full border rounded-lg text-black p-3 mb-3"
            />
            <select className="w-full border rounded-lg  text-black p-3 mb-3">
              <option value="">Select duration</option>
              <option>Few hours</option>
              <option>1-2 days</option>
              <option>1 week</option>
            </select>
            <select className="w-full border rounded-lg  text-black p-3 mb-3">
              <option value="video">Video call</option>
              <option value="voice">Voice call</option>
              <option value="message">Messaging</option>
            </select>
            <select className="w-full border rounded-lg  text-black p-3 mb-3">
              <option value="">Urgency</option>
              <option value="routine">Routine</option>
              <option value="soon">Soon</option>
              <option value="urgent">Urgent</option>
              <option value="emergency">Emergency</option>
            </select>
            <div>
            <button
              disabled={loading}
              onClick={requestConsult}
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold mb-3"
            >
              {loading ? "Requesting..." : "Request Consultation"}
            </button>
          </div>
            
            {/* Emergency Button fixed at bottom */}

            <p className="text-sm text-red-600 mt-16 font-semibold">
              ⚠️ Warning: Pressing the Red Alert button carelessly can lead to your account being disabled.
            </p>

            <div className="fixed bottom-4 left-0 right-0 flex justify-center px-4">
              <button
                className="w-full max-w-md rounded-lg border border-red-500 bg-red-500 px-3 py-2 text- font-semibold text-white hover:bg-red-100"
              >
                🚨 Red Alert
              </button>
            </div>
          </div>
          
        )}

        {/* History */}
        {activeTab === "history" && (
          <div className="bg-white text-black rounded-xl shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Consultation History</h2>
            {consultations.length === 0 ? (
              <p className="text-slate-500">No consultations yet.</p>
            ) : (
              consultations.map((c) => (
                <div
                  key={c.id}
                  className="p-3 mb-2 rounded-lg border bg-slate-50"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-800">
                      Dr. {c.doctor_name || "Unknown"}
                    </span>
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">
                      {c.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {new Date(c.created_at).toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-700 mt-1">{c.reason}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Health */}
        {activeTab === "health" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-xl shadow text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {totalVisits}
                </div>
                <p className="text-sm text-slate-500">Total Visits</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow text-center">
                <div className="text-2xl font-bold text-red-600">0</div>
                <p className="text-sm text-slate-500">Active Meds</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow text-center">
                <div className="text-2xl font-bold text-green-600">
                  {specialists}
                </div>
                <p className="text-sm text-slate-500">Specialists</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow text-center">
                <div className="text-lg font-bold text-slate-700">
                  {lastVisit}
                </div>
                <p className="text-sm text-slate-500">Last Visit</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow">
              <h3 className="text-lg text-black font-semibold mb-2">Health Overview</h3>
              {consultations.length === 0 ? (
                <p className="text-slate-500">No feedback available yet.</p>
              ) : (
                consultations
                  .filter((c) => c.feedback)
                  .map((c) => (
                    <p
                      key={c.id}
                      className="text-sm text-slate-700 border-l-4 border-blue-300 pl-2 mb-2"
                    >
                      {c.feedback}
                    </p>
                  ))
              )}
            </div>

            <div className="bg-white p-4 rounded-xl shadow">
              <h3 className="text-lg text-black font-semibold mb-2">Vital Signs</h3>
              <p className="text-slate-500 text-sm">No vitals recorded yet.</p>
            </div>
          </div>
        )}

        {/* Account */}
        {activeTab === "account" && (
          <div className="bg-white rounded-xl  text-black  shadow p-4 space-y-3">
            <h2 className="text-lg font-semibold mb-4">Account Details</h2>
            <input
              type="text"
              value={profile?.first_name || ""}
              onChange={(e) =>
                setProfile({ ...profile, first_name: e.target.value })
              }
              className="w-full border rounded-lg p-2"
              placeholder="First Name"
            />
            <input
              type="text"
              value={profile?.last_name || ""}
              onChange={(e) =>
                setProfile({ ...profile, last_name: e.target.value })
              }
              className="w-full border rounded-lg p-2"
              placeholder="Last Name"
            />
            <input
              type="email"
              value={profile?.email || ""}
              onChange={(e) =>
                setProfile({ ...profile, email: e.target.value })
              }
              className="w-full border rounded-lg p-2"
              placeholder="Email"
            />
            <input
              type="tel"
              value={profile?.phone_number || ""}
              onChange={(e) =>
                setProfile({ ...profile, phone_number: e.target.value })
              }
              className="w-full border rounded-lg p-2"
              placeholder="Phone Number"
              maxLength={11}
            />
            
            <input
              type="tel"
              value={profile?.emergency_contact || ""}
              onChange={(e) => {
                const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 11);
                setProfile({ ...profile, emergency_contact: onlyDigits });
              }}
              maxLength={11}
              className="w-full border rounded-lg p-2 text-black"
              placeholder="Emergency Contact"
            />

            <textarea
              className="w-full border rounded-lg p-2"
              placeholder="Medical History (not yet saved)"
              defaultValue=""
            />
            <button
              onClick={saveProfile}
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
    </KeyboardDismissWrapper>
  );
}
