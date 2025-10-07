
"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { createLocalVideoTrack } from "twilio-video";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  ArrowLeft,
  FileText,
  X,
  Send,
  History,
  AlertTriangle,
  Heart,
  Clock,
  Pill,
  Shield,
  User,
} from "lucide-react";

export const dynamic = "force-dynamic";

type PatientProfile = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  gender?: string | null;
  date_of_birth?: string | null; // ISO date
  blood_type?: string | null;

  drug_allergies?: string | string[] | null;
  food_allergies?: string | string[] | null;
  prescriptions?: string | string[] | null;        // current prescriptions
  over_the_counter?: string | string[] | null;     // OTC
  supplements?: string | string[] | null;

  emergency_phone?: string | null;
  emergency_name?: string | null;

  family_history?: string | string[] | null;
  chronic_conditions?: string | string[] | null;
};

function attachVideo(track: any, container: HTMLDivElement | null) {
  if (!container) return;
  // remove any existing video elements first
  container.querySelectorAll("video").forEach((v) => v.remove());

  const el = track.attach();
  el.style.width = "100%";
  el.style.height = "100%";
  el.style.position = "absolute";
  el.style.objectFit = "cover";
  el.style.display = "block";
  el.style.borderRadius = "0.75rem"; // optional to match Tailwind rounded-xl

  container.appendChild(el);
}


function calcAge(dob?: string | null) {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

function formatTime(s: number) {
  return `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60)
    .toString()
    .padStart(2, "0")}`;
}

function DoctorCallInner() {
  const sp = useSearchParams();
  const rawConsultId = sp.get("consult_id") ?? "";
  const consultId = rawConsultId && rawConsultId !== "null" ? rawConsultId : null;
  const router = useRouter();

  const [err, setErr] = useState<string | null>(null);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Panels & UI state (match your palette/structure)
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [showValidationPopup, setShowValidationPopup] = useState(false);

  // Notes data (match your fields)
  const [notesData, setNotesData] = useState({
    diagnosis: "",
    prescriptions: "",
    injections: "",
    vitals: "",
    symptoms: "",
    recommendations: "",
    followUp: "",
    notes: "",
  });

  // Validation popup data
  const [validationData, setValidationData] = useState({
    symptomsAddressed: "",
    adequateCare: "",
    consultationComplete: "",
  });

  // Patient data for the history panel
  const [patient, setPatient] = useState<PatientProfile | null>(null);

  const userIdRef = useRef<string | null>(null);
  const roomRef = useRef<any>(null);
  const localRef = useRef<HTMLDivElement | null>(null);
  const remoteRef = useRef<HTMLDivElement | null>(null);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

 // Load patient info via consult join
useEffect(() => {
  if (!consultId) return;

  (async () => {
    const { data, error } = await supabase
  .from("consult")
  .select(
    `
      id,
      patient:profile!consult_patient_id_fkey (
        id,
        first_name,
        last_name,
        gender,
        date_of_birth,
        blood_type,
        drug_allergies,
        food_allergies,
        prescriptions,
        over_the_counter,
        supplements,
        emergency_phone,
        emergency_name,
        family_history,
        chronic_conditions
      )
    `
  )
  .eq("id", consultId)
  .single(); // ensures consult itself is a single row

if (error) {
  console.error("Error fetching consult with patient:", error);
  return;
}

let patientData: PatientProfile | null = null;

// handle if Supabase still returns patient as array
if (Array.isArray(data?.patient)) {
  patientData = data.patient[0] as PatientProfile;
} else {
  patientData = data?.patient as PatientProfile;
}

setPatient(patientData);
console.log("✅ Patient profile loaded:", patientData);

  })();
}, [consultId]);







  // Twilio connection logic
  useEffect(() => {
    if (!consultId) return;

    (async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) throw new Error("not_authenticated");
        userIdRef.current = session.user.id;

         // who am I?
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // fetch consult (RLS should protect)
    const { data: consult, error } = await supabase
      .from("consult")
      .select("id, status, doctor_id, patient_id")
      .eq("id", consultId)
      .maybeSingle();

    if (error || !consult) return; // show “not found”
        const resp = await fetch("/api/twilio/token", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ consult_id: consultId }),
          cache: "no-store",
        });
        const body = await resp.json();
        if (!resp.ok) throw new Error(body?.error ?? `token_failed_${resp.status}`);

        const { connect } = await import("twilio-video");
        if (roomRef.current) return;

        const room = await connect(body.token, {
          name: `consult_${consultId}`,
          audio: true,
          video: false,
          logLevel: "debug",
        });
        roomRef.current = room;

        // joined
        logConsultEvent("joined", room.localParticipant.identity, room.sid, consultId);
        await setConsult(consultId, "in_progress");

        // Attach local tracks
       room.localParticipant.tracks.forEach((pub: any) => {
  if (pub.track && localRef.current) {
    localRef.current.appendChild(pub.track.attach());
    const el = pub.track.attach();

    // Apply inline styles to make it fill its container
    el.style.width = "100%";
    el.style.height = "100%";
    el.style.objectFit = "cover";
    el.style.borderRadius = "0.5rem"; // match your Tailwind rounded-lg

    // Optional: clear old video if any
     localRef.current.querySelectorAll("video").forEach((v) => v.remove());
  }
});


        // Attach remote tracks
        const attachTrack = (t: any) => remoteRef.current?.appendChild(t.attach());
        const detachTrack = (t: any) => t.detach().forEach((el: HTMLElement) => el.remove());

        room.participants.forEach((p: any) => {
          p.tracks.forEach((pub: any) => pub.isSubscribed && attachTrack(pub.track));
          p.on("trackSubscribed", attachTrack);
          p.on("trackUnsubscribed", detachTrack);
        });

        room.on("participantConnected", (p: any) => {
          logConsultEvent("joined", p.identity, room.sid, consultId);
          p.on("trackSubscribed", attachTrack);
          p.on("trackUnsubscribed", detachTrack);
        });

        room.on("participantDisconnected", (p: any) => {
          logConsultEvent("disconnected", p.identity, room.sid, consultId);
        });

        room.on("disconnected", () => {
          logConsultEvent("disconnected", room.localParticipant.identity, room.sid, consultId);
          cleanup();
        });

        window.addEventListener("beforeunload", cleanup);
      } catch (e: any) {
        setErr(e?.message ?? "join_failed");
      }
    })();

    return () => {
      cleanup();
    };
  }, [consultId]);

  async function logConsultEvent(
    type: "joined" | "disconnected" | "ended",
    participant: string,
    roomSid: string,
    consultId: string
  ) {
    const timestamp = new Date().toISOString();
    await fetch("/api/consult-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, participant, room_sid: roomSid, timestamp, consult_id: consultId }),
    });
  }

  const cleanup = () => {
    if (roomRef.current && roomRef.current.state !== "disconnected") {
      roomRef.current.disconnect();
    }
    if (userIdRef.current) {
      resetProfile(userIdRef.current);
      setConsult(consultId, "ended");
    }
    roomRef.current = null;
  };

  const toggleVideo = async () => {
  if (!roomRef.current) return;

  if (isVideoOn) {
    // disable all current video tracks
    roomRef.current.localParticipant.videoTracks.forEach((pub: any) => {
      pub.track.disable();
      pub.track.detach().forEach((el: HTMLElement) => el.remove());
    });
    setIsVideoOn(false);
  } else {
    // no video track yet → create and publish one
    if (roomRef.current.localParticipant.videoTracks.size === 0) {
      const track = await createLocalVideoTrack();
      roomRef.current.localParticipant.publishTrack(track);
      attachVideo(track, localRef.current);
    } else {
      // enable and re-attach any existing ones
      roomRef.current.localParticipant.videoTracks.forEach((pub: any) => {
        pub.track.enable();
        attachVideo(pub.track, localRef.current);
      });
    }
    setIsVideoOn(true);
  }
};

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
    roomRef.current?.localParticipant.audioTracks.forEach((pub: any) =>
      isMuted ? pub.track.enable() : pub.track.disable()
    );
  };

  const endCall = () => {
    setShowValidationPopup(true);
  };

  // Save Notes → consult.doctor_notes + consult.diagnosis
  const handleSubmitNotes = async () => {
    const blocks: string[] = [];
    if (notesData.diagnosis.trim()) blocks.push(`Diagnosis: ${notesData.diagnosis.trim()}`);
    if (notesData.prescriptions.trim()) blocks.push(`Prescriptions: ${notesData.prescriptions.trim()}`);
    if (notesData.injections.trim()) blocks.push(`Procedures: ${notesData.injections.trim()}`);
    if (notesData.vitals.trim()) blocks.push(`Vital Signs: ${notesData.vitals.trim()}`);
    if (notesData.symptoms.trim()) blocks.push(`Symptoms: ${notesData.symptoms.trim()}`);
    if (notesData.recommendations.trim()) blocks.push(`Recommendations: ${notesData.recommendations.trim()}`);
    if (notesData.followUp.trim()) blocks.push(`Follow-up: ${notesData.followUp.trim()}`);
    if (notesData.notes.trim()) blocks.push(`Additional Notes: ${notesData.notes.trim()}`);

    const finalNotesString = blocks.join("\n\n");
    if (!finalNotesString.trim()) {
      alert("Please add some notes before saving.");
      return;
    }

    const {data, error } = await supabase
      .from("consult")
      .update({
        doctor_notes: finalNotesString,
        diagnosis: notesData.diagnosis || null,
      })
      .eq("id", consultId)
      .select();

      console.log("My consult diagnosis",{ data, error });
    if (error) {
      console.error("Error saving notes:", error);
      alert("Failed to save notes");
    } else {
      alert("✅ Medical notes saved!");
      setIsNotesOpen(false);
    }
  };

  // Save Validation → consult.feedback (JSON), end & exit
  const handleValidationSubmit = async () => {
    const { error } = await supabase
      .from("consult")
      .update({
        feedback: JSON.stringify(validationData),
        status: "ended",
        ended_at: new Date().toISOString(),
      })
      .eq("id", consultId);

    if (error) {
      console.error("Error saving validation:", error);
      alert("Failed to save validation");
      return;
    }
    //alert("✅ Consultation completed!");
    setShowValidationPopup(false);

    cleanup();
    router.push("/dashboard/doctor");
  };

  if (!consultId) {
    return <div className="p-4 text-blue-500">Missing consult_id</div>;
  }

  function toArray(value: string | string[] | null | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}

  // Derived patient info for display
  const fullName = [patient?.first_name, patient?.last_name].filter(Boolean).join(" ") || "Patient";
  const age = calcAge(patient?.date_of_birth);
  const chronic = toArray(patient?.chronic_conditions);
  const famHist = toArray(patient?.family_history);
  const rx = toArray(patient?.prescriptions);
  const otc = toArray(patient?.over_the_counter);
  const supp = toArray(patient?.supplements);
  
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col relative">
      {/* Header (kept your colors) */}
      <div className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => {
            setShowValidationPopup(true);
          }}
          className="p-2 text-blue-600 hover:text-blue-800 transition-colors rounded-lg hover:bg-blue-50"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="text-center">
          <h1 className="text-lg font-semibold text-gray-800">Doctor Call</h1>
          <p className="text-sm text-gray-600">Call Duration: {formatTime(callDuration)}</p>
        </div>

        <div className="w-20"></div>
      </div>

      {/* Video Area (colors preserved) */}
      <div className="flex-1 p-4 flex flex-col">
        <div className="flex-1 bg-gray-900 rounded-2xl overflow-hidden relative shadow-2xl">
          {/* Remote video */}
          <div
            ref={remoteRef}
                  className="w-full h-full bg-gray-800 flex items-center justify-center rounded-t-2xl overflow-hidden"
                      >
            {/* Optional placeholder */}
            {/* <div className="text-center text-white">
              <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                <User size={64} className="text-blue-200" />
              </div>
              <h3 className="text-xl font-semibold mb-1">{fullName}</h3>
              <p className="text-blue-200">
                {patient?.gender || "—"}{age !== null ? ` • ${age} yrs` : ""}{patient?.blood_type ? ` • ${patient.blood_type}` : ""}
              </p>
            </div> */}
            {/* Patient overlay in top-right */}
          <div className="absolute top-4 right-4 flex items-center bg-black bg-opacity-50 px-3 py-2 rounded-lg shadow-lg">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-2">
              <User size={20} className="text-blue-200" />
            </div>
            <div className="text-white text-sm">
              <p className="font-semibold">{fullName}</p>
              <p className="text-blue-200 text-xs">
                {patient?.gender || "—"}
                {age !== null ? ` • ${age} yrs` : ""}
                {patient?.blood_type ? ` • ${patient.blood_type}` : ""}
              </p>
            </div>
          </div>


            {/* Status indicator */}
            <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Connected
            </div>
          </div>

          {/* Local preview */}
          <div
            ref={localRef}
            className="absolute bottom-4 right-4 w-24 h-32 bg-gray-700 rounded-lg overflow-hidden border-2 border-white shadow-lg"
          />
        </div>

        {/* Control Panel (add history + notes, preserve color scheme) */}
        <div className="mt-6 bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-center gap-6">
            {/* Notes (left) */}
            <button
              onClick={() => setIsNotesOpen((x) => !x)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all transform hover:scale-105 ${
                isNotesOpen
                  ? "bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              <FileText size={24} />
            </button>

            {/* History */}
            <button
              onClick={() => setIsHistoryOpen((x) => !x)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all transform hover:scale-105 ${
                isHistoryOpen
                  ? "bg-green-500 hover:bg-green-600 text-white shadow-lg"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              <History size={24} />
            </button>

            {/* Mute */}
            <button
              onClick={toggleMute}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all transform hover:scale-105 ${
                isMuted
                  ? "bg-red-500 hover:bg-red-600 text-white shadow-lg"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>

            {/* End */}
            <button
              onClick={endCall}
              className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all transform hover:scale-105 shadow-lg"
            >
              <Phone size={28} className="rotate-180" />
            </button>

            {/* Video */}
            <button
              onClick={toggleVideo}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all transform hover:scale-105 ${
                isVideoOn
                  ? "bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
            </button>
          </div>

          {/* Status Text */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              {isMuted && <span className="text-red-500 font-medium">Microphone muted • </span>}
              {!isVideoOn && <span className="text-gray-500 font-medium">Video off • </span>}
              {isNotesOpen && <span className="text-blue-500 font-medium">Notes open • </span>}
              {isHistoryOpen && <span className="text-green-500 font-medium">History open • </span>}
              <span className="text-blue-600 font-medium">Call in progress</span>
            </p>
          </div>
        </div>
      </div>

      {/* Connection Info bar */}
      <div className="px-4 pb-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <p className="text-blue-800 text-sm">🔒 Your call is secure and encrypted</p>
        </div>
      </div>

 {/* Patient History Panel */}
<div
  className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 z-50 ${
    isHistoryOpen ? "translate-x-0" : "translate-x-full"
  }`}
>
  <div className="h-full flex flex-col">
    {/* Header */}
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
          <User size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Patient History</h2>
          <p className="text-blue-100 text-sm">Complete medical profile</p>
        </div>
      </div>
      <button
        onClick={() => setIsHistoryOpen(false)}
        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
      >
        <X size={20} />
      </button>
    </div>

    {/* Body */}
    <div className="flex-1 overflow-y-auto bg-gray-50">
      {!patient ? (
        <div className="p-6 text-center text-gray-500">
          Loading patient info…
        </div>
      ) : (
        <>
          {/* Personal Info */}
          <div className="bg-white m-4 rounded-xl shadow-sm border border-gray-200">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User size={16} className="text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900">
                  Personal Information
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 text-sm font-medium">
                    Full Name
                  </span>
                  <span className="font-semibold text-gray-900">
                    {fullName}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 text-xs font-medium block">
                      Age
                    </span>
                    <span className="font-semibold text-gray-900">
                      {age !== null ? `${age} years` : "—"}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 text-xs font-medium block">
                      Gender
                    </span>
                    <span className="font-semibold text-gray-900">
                      {patient.gender || "—"}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                  <span className="text-red-700 text-xs font-medium block">
                    Blood Type
                  </span>
                  <span className="font-bold text-red-800 text-lg">
                    {patient.blood_type || "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Phone size={16} className="text-orange-600" />
                <h4 className="font-semibold text-gray-800 text-sm">
                  Emergency Contact
                </h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Contact</span>
                  <span className="font-medium text-gray-900">
                    {patient.emergency_name || "—"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phone</span>
                  <span className="font-medium text-gray-900">
                    {patient.emergency_phone || "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Allergies */}
          <div className="bg-red-50 border-2 border-red-200 m-4 rounded-xl shadow-sm">
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                  <AlertTriangle size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-red-800 text-lg">ALLERGIES</h3>
                  <p className="text-red-600 text-xs font-medium uppercase tracking-wide">
                    Critical Information
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Pill size={14} className="text-red-700" />
                    <span className="font-bold text-red-800 text-sm">
                      Drug Allergies
                    </span>
                  </div>
                  <p className="text-red-900 font-semibold">
                    {toArray(patient.drug_allergies).join(", ") ||
                      "None reported"}
                  </p>
                </div>
                <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield size={14} className="text-red-700" />
                    <span className="font-bold text-red-800 text-sm">
                      Food Allergies
                    </span>
                  </div>
                  <p className="text-red-900 font-semibold">
                    {toArray(patient.food_allergies).join(", ") ||
                      "None reported"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Medications */}
          <div className="bg-white m-4 rounded-xl shadow-sm border border-gray-200">
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Pill size={16} className="text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900">Current Medications</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2 text-sm">
                    Prescriptions
                  </h4>
                  {rx.length ? (
                    <ul className="space-y-1">
                      {rx.map((med, i) => (
                        <li
                          key={i}
                          className="text-blue-900 font-medium text-sm flex items-center gap-2"
                        >
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                          {med}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-blue-700 italic text-sm">
                      None reported
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 text-xs font-medium block mb-1">
                      Over-the-Counter
                    </span>
                    <span className="text-gray-900 text-sm font-medium">
                      {otc.length ? otc.join(", ") : "None"}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 text-xs font-medium block mb-1">
                      Supplements
                    </span>
                    <span className="text-gray-900 text-sm font-medium">
                      {supp.length ? supp.join(", ") : "None"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Medical History */}
          <div className="bg-white m-4 rounded-xl shadow-sm border border-gray-200">
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Heart size={16} className="text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-900">Medical History</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-orange-400 rounded-full"></div>
                    Chronic Conditions
                  </h4>
                  {chronic.length ? (
                    <div className="space-y-2">
                      {chronic.map((c, i) => (
                        <div
                          key={i}
                          className="p-3 bg-orange-50 rounded-lg border border-orange-200"
                        >
                          <span className="text-orange-800 font-medium text-sm">
                            {c}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic text-sm">
                      No chronic conditions reported
                    </p>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-indigo-400 rounded-full"></div>
                    Family History
                  </h4>
                  {famHist.length ? (
                    <div className="space-y-2">
                      {famHist.map((c, i) => (
                        <div
                          key={i}
                          className="p-3 bg-indigo-50 rounded-lg border border-indigo-200"
                        >
                          <span className="text-indigo-800 font-medium text-sm">
                            {c}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic text-sm">
                      No family history reported
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Previous Consultations */}
          <div
            className="bg-white m-4 rounded-xl shadow-sm border border-gray-200"
            style={{ marginBottom: isNotesOpen ? "50vh" : "1rem" }}
          >
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Clock size={16} className="text-gray-600" />
                </div>
                <h3 className="font-bold text-gray-900">Previous Consultations</h3>
              </div>
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock size={24} className="text-gray-400" />
                </div>
                <p className="text-gray-500 italic">
                  Consultation history will appear here
                </p>
                <p className="text-gray-400 text-sm mt-1">Coming soon...</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  </div>
</div>





      {/* Medical Notes Bottom Drawer (kept your colors/spacing) */}
      <div
        className={`fixed bottom-0 left-0 bg-white rounded-t-2xl shadow-2xl transform transition-transform duration-300 z-50 ${
          isNotesOpen ? "translate-y-0" : "translate-y-full"
        } ${isHistoryOpen ? "right-96" : "right-0"}`}
        style={{ height: "clamp(400px, 40vh, 500px)" }}
      >
        <div className="h-full flex flex-col max-w-6xl mx-auto">
          {/* Drawer Handle & Title */}
          <div className="p-3 text-center border-b border-gray-200">
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-3"></div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-black">Medical Notes</h2>
              <button onClick={() => setIsNotesOpen(false)} className="p-1 hover:bg-gray-100 rounded text-gray-500">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Notes Form */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                ["diagnosis", "Diagnosis"],
                ["prescriptions", "Prescriptions"],
                ["injections", "Procedures"],
                ["vitals", "Vital Signs"],
                ["symptoms", "Symptoms"],
                ["recommendations", "Recommendations"],
                ["followUp", "Follow-up"],
                ["notes", "Additional Notes"],
              ].map(([key, label]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <textarea
                    value={(notesData as any)[key]}
                    onChange={(e) => setNotesData((prev) => ({ ...prev, [key]: e.target.value }))}
                    placeholder={`${label}...`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-400 h-16 resize-none text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handleSubmitNotes}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
              >
                <Send size={18} />
                Save Notes
              </button>
              <p className="text-xs text-gray-500">Auto-saved to patient record</p>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Popup (kept your blue/gray palette) */}
      {showValidationPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-blue-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-xl font-bold mb-2">Validate Consultation</h2>
              <p className="text-blue-100">Quick validation to complete consultation</p>
            </div>

            {/* Form */}
            <div className="p-6 space-y-6">
              {[
                ["symptomsAddressed", "Did you provide medical advice to the patient? *"],
                ["adequateCare", "Was this a legitimate medical consultation? *"],
                ["consultationComplete", "Call duration was appropriate for the consultation *"],
              ].map(([field, label]) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-3">{label}</label>
                  <div className="space-y-2">
                    {["Yes", "No"].map((option) => (
                      <label key={option} className="flex items-center">
                        <input
                          type="radio"
                          name={field}
                          value={option}
                          checked={(validationData as any)[field] === option}
                          onChange={(e) =>
                            setValidationData((prev) => ({ ...prev, [field]: e.target.value }))
                          }
                          className="mr-3 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-black">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex items-center justify-between">
              <p className="text-sm text-gray-600">* All fields required</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowValidationPopup(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleValidationSubmit}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
                >
                  Complete & End Call
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {err && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-100 text-red-800 px-4 py-2 rounded shadow">
          {err}
        </div>
      )}
    </div>
  );
}

// Helpers (unchanged)
async function resetProfile(userId: string) {
  await supabase
    .from("profile")
    .update({ is_assigned: false, consult_id: null, room: null, is_connecting: false })
    .eq("id", userId);
}
async function setConsult(consultId: string, status: string) {
  if (status === "in_progress") {
    await supabase
      .from("consult")
      .update({ status: "in_progress", started_at: new Date().toISOString() })
      .eq("id", consultId);
  }
  if (status === "ended") {
    await supabase
      .from("consult")
      .update({ status: "ended", ended_at: new Date().toISOString() })
      .eq("id", consultId);
  }
}

export default function DoctorCallPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading call…</div>}>
      <DoctorCallInner />
    </Suspense>
  );
}
