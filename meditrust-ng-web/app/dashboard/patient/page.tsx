"use client";

import { Suspense, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useSession } from "@/components/SessionProvider";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { startConsult } from "@/lib/onStartConsult";
import { ConsultStatusWatcher } from "@/components/ConsultStatusWatcher"; // make sure you export it
import { KeyboardDismissWrapper } from "@/components/KeyboardDismissWrapper";
import MedicalHistoryForms from "./profile/MedicalHistoryForms";
import PatientDashboardSearchParams from "./PatientDashboardSearchParams";
import { AlertTriangle, Heart, Pill, Shield, TrendingUp, User } from "lucide-react";

function toArray(v: string | string[] | null | undefined): string[] {
        if (!v) return [];
        if (Array.isArray(v)) return v.map(String).filter(Boolean);

        const s = String(v).trim();
        if (!s) return [];

        // try parsing JSON (if value is stored as a JSON array string)
        try {
          const parsed = JSON.parse(s);
          if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
        } catch {
          // not JSON, fall back to splitting
        }

        // fallback: split on commas or semicolons
        return s
          .split(/[,;]\s*/)
          .map((x) => x.trim())
          .filter(Boolean);
      }

export default function PatientDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"symptoms" | "history" | "health" | "account">("symptoms");
  const [loading, setLoading] = useState(false);
  // New Visit form state
  const [urgency, setUrgency] = useState("");
  const [duration, setDuration] = useState("");
  const [symptom, setSymptom] = useState("");
  const [greeting, setGreeting] = useState("Hello");
  const [showWatcher, setShowWatcher] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
   //const searchParams = useSearchParams();


  //  useEffect(() => {
  //   if (searchParams.get("new") === "1") {
  //     setIsNewUser(true);
  //     // Optional: remove the param so it doesn’t stick on reload
  //     const url = new URL(window.location.href);
  //     url.searchParams.delete("new");
  //     window.history.replaceState({}, "", url.toString());
  //   }
  // }, [searchParams]);

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

    const fullSymptoms = `${symptom} (Duration: ${duration || "N/A"}, Urgency: ${
    urgency || "N/A"
  })`;
    // Now create a consult request
    await startConsult(fullSymptoms);
    // alert("✅ Consultation request submitted successfully!")

  } catch (e: any) {
    console.error("Error creating consultation:", e.message);
    alert("❌ Something went wrong creating your consultation.");
  } finally {
    setLoading(false);
  }

    
    // Reset form
    //setSymptom("");
    //setDuration("");
    setUrgency("");
    //setType("video");
    setDuration("");
    

    

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
       setLoading(false);
       

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

  if (profile === null && isNewUser === false) {
  // ⏳ Still fetching profile, don’t render dashboard or forms yet
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      <span className="ml-3 text-gray-600">Loading profile...</span>
    </div>
  );
}

if (profile === null && isNewUser === true) {
  // ⏳ Still fetching profile, don’t render dashboard or forms yet
  setIsNewUser(false);

      


  return (
    
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      <span className="ml-3 text-gray-600">Almost there, let’s complete your medical profile...</span>
    </div>
  );
}


  // If no profile or missing key fields, force MedicalHistoryForms
  if (!profile || !profile.date_of_birth) {
    const flag = localStorage.getItem("justSignedUp");
    if (flag === "true") {
      setIsNewUser(true);
      localStorage.removeItem("justSignedUp"); // clean up after first load
    }
  console.log("We're onboarding");
  return (
    <MedicalHistoryForms
      onComplete={(updatedProfile) => setProfile(updatedProfile)}
    />
  );
}
 

    return (
    <KeyboardDismissWrapper>
       {/* 👇 Suspense wrapper for search params */}
      <Suspense fallback={null}>
        <PatientDashboardSearchParams onNewUser={setIsNewUser} />
      </Suspense>
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
              placeholder="Please briefly describe your symptoms. Include when they started, severity, and any factors that make them better or worse..."
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-3 
                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                        hover:border-gray-300 transition-colors duration-200
                        bg-gray-50 focus:bg-white text-gray-800 resize-none"
              rows={4}
            />
          </div>
          <p className="text-xs text-gray-500">Briefly describe your main concern (you’ll explain more to the doctor during the call)</p>
        </div>

    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">How long have you had these symptoms?</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-400">⏰</span>
        </div>
        <select
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        className="w-full border border-gray-200 rounded-xl p-3 pl-10 
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
        {/* <div className="space-y-1">
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
        </div> */}

       <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Urgency Level</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">📊</span>
          </div>
          <select
          value={urgency}
          onChange={(e) => setUrgency(e.target.value)}
          className="w-full border border-gray-200 rounded-xl p-3 pl-10 
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

        {activeTab === "history" && (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="border-b border-gray-100 px-6 py-5">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                Previous Consultations
              </h2>
              <p className="text-gray-600 text-sm mt-1">Your complete medical history and consultation records</p>
            </div>
            
            <div className="p-6">
              {history.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No consultation history</h3>
                  <p className="text-gray-500">Your past consultations and medical records will appear here</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {consultations.map((consultation, index) => (
                    <div
                      key={consultation.id}
                      className="relative rounded-2xl border border-gray-200 bg-white p-6 hover:shadow-md hover:border-gray-300 transition-all duration-200"
                    >
                      {/* Header with date */}
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm">
                            {history.length - index}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Consultation #{history.length - index}</p>
                            <p className="text-xs text-gray-500">
                              {consultation.created_at
                                ? new Date(consultation.created_at).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })
                                : "Date not available"}
                            </p>
                          </div>
                        </div>
                        
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          consultation.diagnosis
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {consultation.diagnosis ? "Diagnosed" : "Under Review"}
                        </div>
                      </div>

                      {/* Content sections */}
                      <div className="space-y-5">
                        {/* Diagnosis section */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-1.5 h-6 bg-red-400 rounded-full"></div>
                            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                              Diagnosis
                            </h4>
                          </div>
                          <p className={`text-lg font-semibold pl-4 ${
                            consultation.diagnosis
                              ? "text-gray-900"
                              : "text-gray-400 italic font-normal"
                          }`}>
                            {consultation.diagnosis || "Pending medical review"}
                          </p>
                        </div>

                        {/* Symptoms section */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-1.5 h-6 bg-orange-400 rounded-full"></div>
                            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                              Symptoms Reported
                            </h4>
                          </div>
                          <p className={`text-base pl-4 leading-relaxed ${
                            consultation.symptoms
                              ? "text-gray-700"
                              : "text-gray-400 italic"
                          }`}>
                            {consultation.symptoms || "No symptoms reported"}
                          </p>
                        </div>

                        {/* Doctor notes section */}
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-1.5 h-6 bg-blue-400 rounded-full"></div>
                            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                              Doctor's Notes & Recommendations
                            </h4>
                          </div>
                          <p className={`text-base pl-4 leading-relaxed ${
                            consultation.doctor_notes
                              ? "text-gray-800"
                              : "text-gray-400 italic"
                          }`}>
                            {consultation.doctor_notes || "No additional notes or recommendations provided"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}


        {/* Health */}
{activeTab === "health" && (
  <div className="space-y-4">
    {/* Stats grid */}
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-white p-4 rounded-xl shadow text-center">
        <div className="text-2xl font-bold text-blue-600">{totalVisits}</div>
        <p className="text-sm text-slate-500">Total Visits</p>
      </div>
      <div className="bg-white p-4 rounded-xl shadow text-center">
        <div className="text-2xl font-bold text-red-600">
          {[
            ...toArray(profile?.prescriptions),
            ...toArray(profile?.over_the_counter),
            ...toArray(profile?.supplements),
          ].length}
        </div>
        <p className="text-sm text-slate-500">Active Medications</p>
      </div>
      <div className="bg-white p-4 rounded-xl shadow text-center">
        <div className="text-2xl font-bold text-green-600">{specialists}</div>
        <p className="text-sm text-slate-500">Specialists Seen</p>
      </div>
      <div className="bg-white p-4 rounded-xl shadow text-center">
        <div className="text-lg font-bold text-slate-700">
          {lastVisit || "—"}
        </div>
        <p className="text-sm text-slate-500">Last Visit</p>
      </div>
    </div>

    <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="border-b border-gray-100 px-6 py-5">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                Health Overview
              </h3>
              <p className="text-gray-600 text-sm mt-1">Complete medical profile and health summary</p>
            </div>
            
            <div className="p-6">
              {!profile ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">Loading profile…</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Chronic Conditions */}
                  <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-orange-600" />
                      </div>
                      <span className="font-semibold text-gray-800">Chronic Conditions</span>
                    </div>
                    <p className="text-gray-700 pl-11">
                      {toArray(profile.chronic_conditions).length > 0
                        ? toArray(profile.chronic_conditions).join(", ")
                        : "None reported"}
                    </p>
                  </div>

                  {/* Allergies */}
                  <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      </div>
                      <span className="font-semibold text-gray-800">Allergies</span>
                    </div>
                    <p className="text-gray-700 pl-11">
                      {[
                        ...toArray(profile.drug_allergies),
                        ...toArray(profile.food_allergies),
                      ].length > 0
                        ? [
                            ...toArray(profile.drug_allergies),
                            ...toArray(profile.food_allergies),
                          ].join(", ")
                        : "None reported"}
                    </p>
                  </div>

                  {/* Medications */}
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Pill className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="font-semibold text-gray-800">Current Medications</span>
                    </div>
                    <p className="text-gray-700 pl-11">
                      {[
                        ...toArray(profile.prescriptions),
                        ...toArray(profile.over_the_counter),
                        ...toArray(profile.supplements),
                      ].length > 0
                        ? [
                            ...toArray(profile.prescriptions),
                            ...toArray(profile.over_the_counter),
                            ...toArray(profile.supplements),
                          ].join(", ")
                        : "None reported"}
                    </p>
                  </div>

                  {/* Family History */}
                  <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <Shield className="w-4 h-4 text-indigo-600" />
                      </div>
                      <span className="font-semibold text-gray-800">Family History</span>
                    </div>
                    <p className="text-gray-700 pl-11">
                      {toArray(profile.family_history).length > 0
                        ? toArray(profile.family_history).join(", ")
                        : "None reported"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
    {/* Vitals */}
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
  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
    Medical Information
  </h3>

  <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200 w-full">
    {/* Blood Type */}
    {profile?.blood_type && (
      <div className="flex flex-col sm:flex-row sm:gap-2">
        <span className="text-blue-500 font-medium">Blood Type:</span>
        <span className="text-gray-800 break-words">{profile.blood_type}</span>
      </div>
    )}

    {/* Chronic Conditions */}
    {profile?.chronic_conditions?.length > 0 && (
      <div className="flex flex-col sm:flex-row sm:gap-2">
        <span className="text-blue-500 font-medium">Chronic Conditions:</span>
        <span className="text-gray-800 break-words">
          {profile.chronic_conditions.join(", ")}
        </span>
      </div>
    )}

    {/* Previous Surgeries */}
    {profile?.previous_surgeries && (
      <div className="flex flex-col sm:flex-row sm:gap-2">
        <span className="text-blue-500 font-medium">Surgeries:</span>
        <span className="text-gray-800 break-words">{profile.previous_surgeries}</span>
      </div>
    )}

    {/* Family History */}
    {profile?.family_history && (
      <div className="flex flex-col sm:flex-row sm:gap-2">
        <span className="text-blue-500 font-medium">Family History:</span>
        <span className="text-gray-800 break-words">{profile.family_history}</span>
      </div>
    )}

    {/* Allergies */}
    {profile?.drug_allergies && (
      <div className="flex flex-col sm:flex-row sm:gap-2">
        <span className="text-blue-500 font-medium">Drug Allergies:</span>
        <span className="text-gray-800 break-words">{profile.drug_allergies}</span>
      </div>
    )}
    {profile?.food_allergies && (
      <div className="flex flex-col sm:flex-row sm:gap-2">
        <span className="text-blue-500 font-medium">Food Allergies:</span>
        <span className="text-gray-800 break-words">{profile.food_allergies}</span>
      </div>
    )}
    {profile?.environmental_allergies && (
      <div className="flex flex-col sm:flex-row sm:gap-2">
        <span className="text-blue-500 font-medium">Environmental Allergies:</span>
        <span className="text-gray-800 break-words">{profile.environmental_allergies}</span>
      </div>
    )}

    {/* Prescriptions */}
    {profile?.prescriptions && (
      <div className="flex flex-col sm:flex-row sm:gap-2">
        <span className="text-blue-500 font-medium">Current Prescriptions:</span>
        <span className="text-gray-800 break-words">{profile.prescriptions}</span>
      </div>
    )}
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


