"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { startConsult } from "@/lib/onStartConsult";
import { ConsultStatusWatcher } from "@/components/ConsultStatusWatcher"; // make sure you export it
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
  const [showWatcher, setShowWatcher] = useState(false);

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

    const handleClick = () => {
    // 1. Trigger your request function
    requestConsult();

    // 2. Show the watcher
    setShowWatcher(true);
  };


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

    

  } catch (err: any) {
    console.error(err);
  } finally {
    setLoading(false);
    
  }}

  

  ///End of Request Consult

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      // if (!session) {
      //   router.replace("/sign-in");
      //   return;
      // }

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
  .order("requested_at", { ascending: false });


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
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-6">
    {/* Header */}
    <div className="border-b border-gray-100 pb-4">
      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
        <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          🩺
        </span>
        Request Consultation
      </h2>
      <p className="text-sm text-gray-600 mt-1">Tell us about your symptoms to get matched with the right doctor</p>
      </div>

      {/* Symptoms Description Section */}
      <div className="space-y-4">
        {/* <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Symptom Details</h3> */}
        
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Describe Your Symptoms</label>
          <div className="relative">
            <textarea
              placeholder="Please describe your symptoms in detail. Include when they started, severity, and any factors that make them better or worse..."
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-3 
                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                        hover:border-gray-300 transition-colors duration-200
                        bg-gray-50 focus:bg-white text-gray-800 resize-none"
              rows={4}
            />
          </div>
          <p className="text-xs text-gray-500">Be as detailed as possible to help doctors understand your condition</p>
        </div>

    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">How long have you had these symptoms?</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-400">⏰</span>
        </div>
        <select className="w-full border border-gray-200 rounded-xl p-3 pl-10 
                          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                          hover:border-gray-300 transition-colors duration-200
                          bg-gray-50 focus:bg-white text-gray-800 appearance-none">
          <option value="">Select duration</option>
          <option value="hours">Few hours</option>
          <option value="1-2days">1-2 days</option>
          <option value="week">1 week</option>
          <option value="weeks">Several weeks</option>
          <option value="month">1 month or more</option>
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <span className="text-gray-400">▼</span>
        </div>
      </div>
    </div>
    </div>

    {/* Consultation Preferences Section */}
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Consultation Preferences</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Consultation Type</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400"></span>
            </div>
            <select className="w-full border border-gray-200 rounded-xl p-3 pl-10 
                              focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                              hover:border-gray-300 transition-colors duration-200
                              bg-gray-50 focus:bg-white text-gray-800 appearance-none">
              <option value="video">📹 Video call</option>
              <option value="voice">📞 Voice call</option>
              <option value="message">💬 Messaging</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-400">▼</span>
            </div>
          </div>
        </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Urgency Level</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">📊</span>
          </div>
          <select className="w-full border border-gray-200 rounded-xl p-3 pl-10 
                            focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                            hover:border-gray-300 transition-colors duration-200
                            bg-gray-50 focus:bg-white text-gray-800 appearance-none">
            <option value="">Select urgency</option>
            <option value="routine">🟢 Routine (within days)</option>
            <option value="soon">🟡 Soon (within hours)</option>
            <option value="urgent">🟠 Urgent (within 30 mins)</option>
            <option value="emergency">🔴 Emergency (immediate)</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-400">▼</span>
          </div>
        </div>
      </div>
      </div>
    </div>

    {/* Request Button */}
    <div className="pt-4 border-t border-gray-100">
      <button
        disabled={loading}
        onClick={handleClick}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 
                  hover:from-blue-700 hover:to-blue-800 
                  disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed
                  text-white font-semibold shadow-lg hover:shadow-xl 
                  transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100
                  flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Requesting...
          </>
        ) : (
          <>
            <span>🔍</span>
            Request Consultation
          </>
        )}
      </button>
      {showWatcher && <ConsultStatusWatcher />}
      </div>

    {/* Emergency Section */}
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
      <div className="flex items-start gap-2">
        <span className="text-red-500 mt-0.5">⚠️</span>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-red-800">Emergency Alert</h4>
          <p className="text-xs text-red-600 mt-1">
            Only use Red Alert for life-threatening emergencies. Misuse may result in account suspension.
          </p>
        </div>
      </div>
      
      <button className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 
                        text-white font-semibold shadow-lg hover:shadow-xl 
                        transition-all duration-200 transform hover:scale-[1.02]
                        flex items-center justify-center gap-2">
        <span>🚨</span>
        Red Alert - Emergency
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
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-6">
        {/* Header */}
        <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              👤
            </span>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Account Details</h2>
              <p className="text-sm text-gray-600 mt-1">
                Manage your personal information and contact details
              </p>
            </div>
          </div>

          <button
            onClick={signOut}
            className="px-4 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600"
          >
            Sign Out
          </button>
        </div>
     
  

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
              onChange={(e) =>
                setProfile({ ...profile, first_name: e.target.value })
              }
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
              onChange={(e) =>
                setProfile({ ...profile, last_name: e.target.value })
              }
              className="w-full border border-gray-200 rounded-xl p-3 pl-4 
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                         hover:border-gray-300 transition-colors duration-200
                         bg-gray-50 focus:bg-white text-gray-800"
              placeholder="Enter your last name"
            />
          </div>
        </div>
      </div>
    </div>

    {/* Contact Information Section */}
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Contact Information</h3>
      
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">📧</span>
            </div>
            <input
              type="email"
              value={profile?.email || ""}
              onChange={(e) =>
                setProfile({ ...profile, email: e.target.value })
              }
              className="w-full border border-gray-200 rounded-xl p-3 pl-10 
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                         hover:border-gray-300 transition-colors duration-200
                         bg-gray-50 focus:bg-white text-gray-800"
              placeholder="your.email@example.com"
            />
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
              onChange={(e) =>
                setProfile({ ...profile, phone_number: e.target.value })
              }
              className="w-full border border-gray-200 rounded-xl p-3 pl-10 
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                         hover:border-gray-300 transition-colors duration-200
                         bg-gray-50 focus:bg-white text-gray-800"
              placeholder="e.g., 08012345678"
              maxLength={11}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Emergency Contact</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">🚨</span>
            </div>
            <input
              type="tel"
              value={profile?.emergency_contact || ""}
              onChange={(e) => {
                const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 11);
                setProfile({ ...profile, emergency_contact: onlyDigits });
              }}
              maxLength={11}
              className="w-full border border-gray-200 rounded-xl p-3 pl-10 
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                         hover:border-gray-300 transition-colors duration-200
                         bg-gray-50 focus:bg-white text-gray-800"
              placeholder="Emergency contact number"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">This contact will be notified in case of emergency</p>
        </div>
      </div>
    </div>

    {/* Medical Information Section */}
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Medical Information</h3>
      
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Medical History</label>
        <div className="relative">
          <textarea
            className="w-full border border-gray-200 rounded-xl p-3 
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                       hover:border-gray-300 transition-colors duration-200
                       bg-gray-50 focus:bg-white text-gray-800 resize-none"
            placeholder="Share any relevant medical history, allergies, or current medications..."
            rows={4}
            defaultValue=""
          />
        </div>
        <p className="text-xs text-amber-600 flex items-center gap-1">
          <span>⚠️</span>
          This information is not yet saved automatically
        </p>
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
        Save Changes
      </button>
    </div>
    </div>
    )}
      </div>
    </div>
    </KeyboardDismissWrapper>
  );
};

// export function ConsultStatusWatcher() {
//   const [newConsultStatus, setNewConsultStatus] = useState<string | null>(null);

//   useEffect(() => {
//     let channel: ReturnType<typeof supabase.channel> | null = null;

//     const getConsultStatus = async () => {
//       const {
//         data: { session },
//       } = await supabase.auth.getSession();

//       if (!session) return;

//       // Ensure Realtime has the auth context
//       await supabase.realtime.setAuth(session.access_token);
//       const patient_id = session.user.id; 
//       channel = supabase
//         .channel(`consults`, {
//           config: {
//             private: true,
//           },
//         })
//         .on(
//           "broadcast",
//           { event: "UPDATE" },
//           (payload) => {
//             console.log("Realtime payload:", payload);
//             const newStatus = payload.payload.record as string;
//             setNewConsultStatus(newStatus);
//           }
//         )
//         .subscribe((status, error) => {
//           if (error) {
//             console.error("Error subscribing to channel:", error);
//             console.error("user_id :", session.user.id);
//           } else {
//             console.log("Subscription status:", status);
//           }
//         });
//     };

//     getConsultStatus();

//     // Cleanup on unmount
//     return () => {
//       if (channel) {
//         supabase.removeChannel(channel);
//       }
//     };
//   }, []);
// };


