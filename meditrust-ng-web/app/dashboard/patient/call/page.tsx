
// "use client";

// import { Suspense, useEffect, useRef, useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { supabase } from "@/lib/supabaseClient";
// import { createLocalVideoTrack } from "twilio-video";
// import { Video, VideoOff, Mic, MicOff, Phone, ArrowLeft } from "lucide-react";

// export const dynamic = "force-dynamic";

// function PatientCallInner() {
//   const sp = useSearchParams();
//   const consultId = sp.get("consult_id") ?? "";
//   const router = useRouter();

//   const [err, setErr] = useState<string | null>(null);
//   const [isVideoOn, setIsVideoOn] = useState(true);
//   const [isMuted, setIsMuted] = useState(false);
//   const [callDuration, setCallDuration] = useState(0);

//   const roomRef = useRef<any>(null);
//   const localRef = useRef<HTMLDivElement | null>(null);
//   const remoteRef = useRef<HTMLDivElement | null>(null);

//   // Timer
//   useEffect(() => {
//     const timer = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
//     return () => clearInterval(timer);
//   }, []);

//   // Twilio connection
//   useEffect(() => {
//     if (!consultId) return;
     

//     (async () => {
//       try {
//         const { data: { session } } = await supabase.auth.getSession();
//         if (!session) throw new Error("not_authenticated");

//         const resp = await fetch("/api/twilio/token", {
//           method: "POST",
//           headers: {
//             "content-type": "application/json",
//             authorization: `Bearer ${session.access_token}`,
//           },
//           body: JSON.stringify({ consult_id: consultId }),
//           cache: "no-store",
//         });
//         const body = await resp.json();
//         if (!resp.ok) throw new Error(body?.error ?? `token_failed_${resp.status}`);

//         const { connect } = await import("twilio-video");

//         if (roomRef.current) return;

//        const room = await connect(body.token, {
//           name: `consult_${consultId}`, // ensure name matches consultId
//           audio: true,
//           video: false,
//           logLevel: "debug",
//         });
//         roomRef.current = room;

//         console.log("From search param:", consultId);        // directly from URL
//         console.log("From backend token:", body.room);       // what your token API returned

//         // log join
//         logConsultEvent("joined", room.localParticipant.identity, room.sid, consultId);

//         console.log("body.roomis :", body.room);
//         roomRef.current = room;
      
//         //console.log("Consult ID extracted:", consult_Id);

//         // Attach local tracks
//         room.localParticipant.tracks.forEach((pub: any) => {
//           if (pub.track && localRef.current) {
//             localRef.current.appendChild(pub.track.attach());
//           }
//         });

//         // Attach remote tracks
//         const attachTrack = (t: any) => remoteRef.current?.appendChild(t.attach());
//         const detachTrack = (t: any) => t.detach().forEach((el: HTMLElement) => el.remove());

//         room.participants.forEach((p: any) => {
//           p.tracks.forEach((pub: any) => pub.isSubscribed && attachTrack(pub.track));
//           p.on("trackSubscribed", attachTrack);
//           p.on("trackUnsubscribed", detachTrack);
//         });

//         room.on("participantConnected", (p: any) => {
//           logConsultEvent("joined", p.identity, room.sid, consultId);
//           p.on("trackSubscribed", attachTrack);
//           p.on("trackUnsubscribed", detachTrack);
//         });

//         room.on("participantDisconnected", (p: any) => {
//           logConsultEvent("disconnected", p.identity, room.sid, consultId);
//           console.log("👋 Participant disconnected:", p.identity);
//         });

//         room.on("disconnected", () => {
//           logConsultEvent("disconnected", room.localParticipant.identity, room.sid, consultId);
//           cleanup();
//         });

//         async function logConsultEvent(type: "joined" | "disconnected" | "ended", participant: string, roomSid: string, consult_Id: string) {
//           const timestamp = new Date().toISOString();

//           const res = await fetch("/api/consult-events", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ type, participant, room_sid: roomSid, timestamp, consult_id:consult_Id })
//           });

//           const data = await res.json();
//           console.log("Consult event logged:", data);
//         }


//         window.addEventListener("beforeunload", cleanup);
//       } catch (e: any) {
//         setErr(e?.message ?? "join_failed");
//       }
//     })();

//     // cleanup must be synchronous
//     return () => {
//       cleanup();
//     };
//   }, [consultId]);

//   // ---- cleanup (sync wrapper) ----
//   const cleanup = () => {
//     if (roomRef.current && roomRef.current.state !== "disconnected") {
//       roomRef.current.disconnect();
//     }
//     roomRef.current = null;
//   };

//   // const toggleVideo = () => {
//   //   setIsVideoOn((prev) => !prev);
//   //   roomRef.current?.localParticipant.videoTracks.forEach((pub: any) =>
//   //     isVideoOn ? pub.track.disable() : pub.track.enable()
//   //   );
//   // };
//   const toggleVideo = async () => {
//     if (!roomRef.current) return;
  
//     if (isVideoOn) {
//       // Turn video off
//       roomRef.current.localParticipant.videoTracks.forEach((pub: any) =>
//         pub.track.disable()
//       );
//       setIsVideoOn(false);
//     } else {
//       // If no track exists yet, create one
//       if (roomRef.current.localParticipant.videoTracks.size === 0) {
//         const track = await createLocalVideoTrack();
//         roomRef.current.localParticipant.publishTrack(track);
//       } else {
//         roomRef.current.localParticipant.videoTracks.forEach((pub: any) =>
//           pub.track.enable()
//         );
//       }
//       setIsVideoOn(true);
//     }
//   };

//   const toggleMute = () => {
//     setIsMuted((prev) => !prev);
//     roomRef.current?.localParticipant.audioTracks.forEach((pub: any) =>
//       isMuted ? pub.track.enable() : pub.track.disable()
//     );
//   };

//   const endCall = () => {
//     cleanup();
//     router.push("/dashboard/patient");
//   };

//   const formatTime = (s: number) =>
//     `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60)
//       .toString()
//       .padStart(2, "0")}`;

//   if (!consultId) {
//     return <div className="p-4 text-blue-500">Missing consult_id</div>;
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
//       {/* Header */}
//       <div className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
//         <button
//           onClick={endCall}
//           className="p-2 text-blue-600 hover:text-blue-800 transition-colors rounded-lg hover:bg-blue-50"
//         >
//           <ArrowLeft size={24} />
//         </button>

//         <div className="text-center">
//           <h1 className="text-lg font-semibold text-gray-800">Patient Call</h1>
//           <p className="text-sm text-gray-600">Call Duration: {formatTime(callDuration)}</p>
//         </div>

//         <div className="w-20"></div>
//       </div>

//       {/* Video Area */}
//       <div className="flex-1 p-4 flex flex-col">
//         <div className="flex-1 bg-gray-900 rounded-2xl overflow-hidden relative shadow-2xl">
//           {/* Remote video */}
//           <div
//             ref={remoteRef}
//             className="w-full h-full bg-gray-800 flex items-center justify-center"
//           />

//           {/* Local preview */}
//           <div
//             ref={localRef}
//             className="absolute bottom-4 right-4 w-24 h-32 bg-gray-700 rounded-lg overflow-hidden border-2 border-white shadow-lg"
//           />
//         </div>

//         {/* Control Panel */}
//         <div className="mt-6 bg-white rounded-2xl p-6 shadow-lg">
//           <div className="flex items-center justify-center gap-6">
//             {/* Mute */}
//             <button
//               onClick={toggleMute}
//               className={`w-14 h-14 rounded-full flex items-center justify-center ${
//                 isMuted ? "bg-red-500 text-white" : "bg-gray-100 text-gray-700"
//               }`}
//             >
//               {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
//             </button>

//             {/* End Call */}
//             <button
//               onClick={endCall}
//               className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center"
//             >
//               <Phone size={28} className="rotate-180" />
//             </button>

//             {/* Video */}
//             <button
//               onClick={toggleVideo}
//               className={`w-14 h-14 rounded-full flex items-center justify-center ${
//                 isVideoOn ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700"
//               }`}
//             >
//               {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function PatientCallPage() {
//   return (
//     <Suspense fallback={<div className="p-4">Loading call…</div>}>
//       <PatientCallInner />
//     </Suspense>
//   );
// }


// "use client";

// import { Suspense, useEffect, useRef, useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { supabase } from "@/lib/supabaseClient";
// import { createLocalVideoTrack } from "twilio-video";
// import {
//   Video,
//   VideoOff,
//   Mic,
//   MicOff,
//   Phone,
//   ArrowLeft,
//   User,
//   History,
//   X,
// } from "lucide-react";

// export const dynamic = "force-dynamic";

// function PatientCallInner() {
//   const sp = useSearchParams();
//   const consultId = sp.get("consult_id") ?? "";
//   const router = useRouter();

//   const [err, setErr] = useState<string | null>(null);
//   const [isVideoOn, setIsVideoOn] = useState(true);
//   const [isMuted, setIsMuted] = useState(false);
//   const [callDuration, setCallDuration] = useState(0);

//   const [isHistoryOpen, setIsHistoryOpen] = useState(false);
//   const [showValidationPopup, setShowValidationPopup] = useState(false);
//   const [validationData, setValidationData] = useState({
//     consultComplete: "",
//     satisfaction: "",
//     clarity: "",
//   });

//   const [patientProfile, setPatientProfile] = useState<any>(null);

//   const roomRef = useRef<any>(null);
//   const localRef = useRef<HTMLDivElement | null>(null);
//   const remoteRef = useRef<HTMLDivElement | null>(null);

//   // Timer
//   useEffect(() => {
//     const timer = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
//     return () => clearInterval(timer);
//   }, []);

//   // Fetch patient profile for history panel
//   useEffect(() => {
//     if (!consultId) return;
//     (async () => {
//       const { data: consult } = await supabase
//         .from("consult")
//         .select("patient_id")
//         .eq("id", consultId)
//         .maybeSingle();

//       if (consult?.patient_id) {
//         const { data } = await supabase
//           .from("profile")
//           .select(
//             "first_name, last_name, gender, blood_type, age, emergency_name, emergency_phone, drug_allergies, food_allergies, prescriptions, over_the_counter, supplements, family_history, chronic_conditions"
//           )
//           .eq("id", consult.patient_id)
//           .maybeSingle();
//         setPatientProfile(data);
//       }
//     })();
//   }, [consultId]);

//   // Twilio connection
//   useEffect(() => {
//     if (!consultId) return;

//     (async () => {
//       try {
//         const {
//           data: { session },
//         } = await supabase.auth.getSession();
//         if (!session) throw new Error("not_authenticated");

//         const resp = await fetch("/api/twilio/token", {
//           method: "POST",
//           headers: {
//             "content-type": "application/json",
//             authorization: `Bearer ${session.access_token}`,
//           },
//           body: JSON.stringify({ consult_id: consultId }),
//           cache: "no-store",
//         });
//         const body = await resp.json();
//         if (!resp.ok) throw new Error(body?.error ?? `token_failed_${resp.status}`);

//         const { connect } = await import("twilio-video");
//         if (roomRef.current) return;

//         const room = await connect(body.token, {
//           name: `consult_${consultId}`,
//           audio: true,
//           video: false,
//           logLevel: "debug",
//         });
//         roomRef.current = room;

//         logConsultEvent("joined", room.localParticipant.identity, room.sid, consultId);

//         // Attach local tracks
//         room.localParticipant.tracks.forEach((pub: any) => {
//           if (pub.track && localRef.current) {
//             localRef.current.appendChild(pub.track.attach());
//           }
//         });

//         // Attach remote tracks
//         const attachTrack = (t: any) => remoteRef.current?.appendChild(t.attach());
//         const detachTrack = (t: any) =>
//           t.detach().forEach((el: HTMLElement) => el.remove());

//         room.participants.forEach((p: any) => {
//           p.tracks.forEach((pub: any) => pub.isSubscribed && attachTrack(pub.track));
//           p.on("trackSubscribed", attachTrack);
//           p.on("trackUnsubscribed", detachTrack);
//         });

//         room.on("participantConnected", (p: any) => {
//           logConsultEvent("joined", p.identity, room.sid, consultId);
//         });

//         room.on("participantDisconnected", (p: any) => {
//           logConsultEvent("disconnected", p.identity, room.sid, consultId);
//         });

//         room.on("disconnected", () => {
//           logConsultEvent(
//             "disconnected",
//             room.localParticipant.identity,
//             room.sid,
//             consultId
//           );
//           cleanup();
//         });

//         window.addEventListener("beforeunload", cleanup);
//       } catch (e: any) {
//         setErr(e?.message ?? "join_failed");
//       }
//     })();

//     return () => {
//       cleanup();
//     };
//   }, [consultId]);

//   async function logConsultEvent(
//     type: "joined" | "disconnected" | "ended",
//     participant: string,
//     roomSid: string,
//     consult_Id: string
//   ) {
//     const timestamp = new Date().toISOString();
//     await fetch("/api/consult-events", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ type, participant, room_sid: roomSid, timestamp, consult_id: consult_Id }),
//     });
//   }

//   // cleanup
//   const cleanup = () => {
//     if (roomRef.current && roomRef.current.state !== "disconnected") {
//       roomRef.current.disconnect();
//     }
//     roomRef.current = null;
//   };

//   const toggleVideo = async () => {
//     if (!roomRef.current) return;
//     if (isVideoOn) {
//       roomRef.current.localParticipant.videoTracks.forEach((pub: any) =>
//         pub.track.disable()
//       );
//       setIsVideoOn(false);
//     } else {
//       if (roomRef.current.localParticipant.videoTracks.size === 0) {
//         const track = await createLocalVideoTrack();
//         roomRef.current.localParticipant.publishTrack(track);
//       } else {
//         roomRef.current.localParticipant.videoTracks.forEach((pub: any) =>
//           pub.track.enable()
//         );
//       }
//       setIsVideoOn(true);
//     }
//   };

//   const toggleMute = () => {
//     setIsMuted((prev) => !prev);
//     roomRef.current?.localParticipant.audioTracks.forEach((pub: any) =>
//       isMuted ? pub.track.enable() : pub.track.disable()
//     );
//   };

//   const endCall = () => {
//     setShowValidationPopup(true);
//   };

//   const handleValidationSubmit = async () => {
//     await supabase
//       .from("consult")
//       .update({ patient_feedback: JSON.stringify(validationData) })
//       .eq("id", consultId);
//     setShowValidationPopup(false);
//     cleanup();
//     router.push("/dashboard/patient");
//   };

//   const formatTime = (s: number) =>
//     `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60)
//       .toString()
//       .padStart(2, "0")}`;

//   if (!consultId) {
//     return <div className="p-4 text-blue-500">Missing consult_id</div>;
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col relative">
//       {/* Header */}
//       <div className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
//         <button
//           onClick={endCall}
//           className="p-2 text-blue-600 hover:text-blue-800 transition-colors rounded-lg hover:bg-blue-50"
//         >
//           <ArrowLeft size={24} />
//         </button>

//         <div className="text-center">
//           <h1 className="text-lg font-semibold text-gray-800">Patient Call</h1>
//           <p className="text-sm text-gray-600">
//             Call Duration: {formatTime(callDuration)}
//           </p>
//         </div>

//         <div className="w-20"></div>
//       </div>

//       {/* Video Area */}
//       <div className="flex-1 p-4 flex flex-col">
//         <div className="flex-1 bg-gray-900 rounded-2xl overflow-hidden relative shadow-2xl">
//           <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
//             Connected
//           </div>

//           {/* Remote video */}
//           <div
//             ref={remoteRef}
//             className="w-full h-full bg-gray-800 flex items-center justify-center"
//           />

//           {/* Local preview */}
//           <div
//             ref={localRef}
//             className="absolute bottom-4 right-4 w-24 h-32 bg-gray-700 rounded-lg overflow-hidden border-2 border-white shadow-lg"
//           />
//         </div>

//         {/* Control Panel */}
//         <div className="mt-6 bg-white rounded-2xl p-6 shadow-lg">
//           <div className="flex items-center justify-center gap-6">
//             {/* History Button */}
//             <button
//               onClick={() => setIsHistoryOpen(!isHistoryOpen)}
//               className={`w-14 h-14 rounded-full flex items-center justify-center transition-all transform hover:scale-105 ${
//                 isHistoryOpen
//                   ? "bg-green-500 hover:bg-green-600 text-white shadow-lg"
//                   : "bg-gray-100 hover:bg-gray-200 text-gray-700"
//               }`}
//             >
//               <History size={24} />
//             </button>

//             {/* Mute */}
//             <button
//               onClick={toggleMute}
//               className={`w-14 h-14 rounded-full flex items-center justify-center ${
//                 isMuted ? "bg-red-500 text-white" : "bg-gray-100 text-gray-700"
//               }`}
//             >
//               {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
//             </button>

//             {/* End Call */}
//             <button
//               onClick={endCall}
//               className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center"
//             >
//               <Phone size={28} className="rotate-180" />
//             </button>

//             {/* Video */}
//             <button
//               onClick={toggleVideo}
//               className={`w-14 h-14 rounded-full flex items-center justify-center ${
//                 isVideoOn ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700"
//               }`}
//             >
//               {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Patient History Panel */}
//       <div
//         className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 z-50 ${
//           isHistoryOpen ? "translate-x-0" : "translate-x-full"
//         }`}
//       >
//         <div className="h-full flex flex-col">
//           <div className="bg-green-600 text-white p-4 flex items-center justify-between">
//             <h2 className="text-lg font-semibold">Your Medical History</h2>
//             <button
//               onClick={() => setIsHistoryOpen(false)}
//               className="p-1 hover:bg-green-700 rounded"
//             >
//               <X size={20} />
//             </button>
//           </div>

//           <div className="flex-1 overflow-y-auto p-4 text-sm space-y-3">
//             {patientProfile ? (
//               <>
//                 <p>
//                   <span className="font-medium">Name:</span>{" "}
//                   {patientProfile.first_name} {patientProfile.last_name}
//                 </p>
//                 <p>
//                   <span className="font-medium">Age:</span> {patientProfile.age} years
//                 </p>
//                 <p>
//                   <span className="font-medium">Gender:</span>{" "}
//                   {patientProfile.gender}
//                 </p>
//                 <p>
//                   <span className="font-medium">Blood Type:</span>{" "}
//                   {patientProfile.blood_type}
//                 </p>
//                 <p>
//                   <span className="font-medium">Emergency Contact:</span>{" "}
//                   {patientProfile.emergency_name} -{" "}
//                   {patientProfile.emergency_phone}
//                 </p>
//                 <p>
//                   <span className="font-medium">Drug Allergies:</span>{" "}
//                   {patientProfile.drug_allergies || "None"}
//                 </p>
//                 <p>
//                   <span className="font-medium">Food Allergies:</span>{" "}
//                   {patientProfile.food_allergies || "None"}
//                 </p>
//                 <p>
//                   <span className="font-medium">Prescriptions:</span>{" "}
//                   {patientProfile.prescriptions || "None"}
//                 </p>
//                 <p>
//                   <span className="font-medium">OTC:</span>{" "}
//                   {patientProfile.over_the_counter || "None"}
//                 </p>
//                 <p>
//                   <span className="font-medium">Supplements:</span>{" "}
//                   {patientProfile.supplements || "None"}
//                 </p>
//                 <p>
//                   <span className="font-medium">Family History:</span>{" "}
//                   {patientProfile.family_history || "None"}
//                 </p>
//                 <p>
//                   <span className="font-medium">Chronic Conditions:</span>{" "}
//                   {patientProfile.chronic_conditions || "None"}
//                 </p>
//               </>
//             ) : (
//               <p className="text-gray-500">Loading profile...</p>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Validation Popup */}
//       {showValidationPopup && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
//             <div className="bg-blue-600 text-white p-6 rounded-t-2xl">
//               <h2 className="text-xl font-bold mb-2">Consultation Feedback</h2>
//               <p className="text-blue-100">Please answer before ending the call</p>
//             </div>

//             <div className="p-6 space-y-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-3">
//                   Was the consultation complete? *
//                 </label>
//                 <div className="space-y-2">
//                   {["Yes", "No"].map((opt) => (
//                     <label key={opt} className="flex items-center">
//                       <input
//                         type="radio"
//                         name="consultComplete"
//                         value={opt}
//                         checked={validationData.consultComplete === opt}
//                         onChange={(e) =>
//                           setValidationData({
//                             ...validationData,
//                             consultComplete: e.target.value,
//                           })
//                         }
//                         className="mr-3 text-blue-600 focus:ring-blue-500"
//                       />
//                       <span className="text-sm">{opt}</span>
//                     </label>
//                   ))}
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-3">
//                   Were you satisfied with the consultation? *
//                 </label>
//                 <div className="space-y-2">
//                   {["Yes", "No"].map((opt) => (
//                     <label key={opt} className="flex items-center">
//                       <input
//                         type="radio"
//                         name="satisfaction"
//                         value={opt}
//                         checked={validationData.satisfaction === opt}
//                         onChange={(e) =>
//                           setValidationData({
//                             ...validationData,
//                             satisfaction: e.target.value,
//                           })
//                         }
//                         className="mr-3 text-blue-600 focus:ring-blue-500"
//                       />
//                       <span className="text-sm">{opt}</span>
//                     </label>
//                   ))}
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-3">
//                   Was the doctor’s explanation clear? *
//                 </label>
//                 <div className="space-y-2">
//                   {["Yes", "No"].map((opt) => (
//                     <label key={opt} className="flex items-center">
//                       <input
//                         type="radio"
//                         name="clarity"
//                         value={opt}
//                         checked={validationData.clarity === opt}
//                         onChange={(e) =>
//                           setValidationData({
//                             ...validationData,
//                             clarity: e.target.value,
//                           })
//                         }
//                         className="mr-3 text-blue-600 focus:ring-blue-500"
//                       />
//                       <span className="text-sm">{opt}</span>
//                     </label>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex items-center justify-end gap-3">
//               <button
//                 onClick={() => setShowValidationPopup(false)}
//                 className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleValidationSubmit}
//                 className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
//               >
//                 Submit & End Call
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default function PatientCallPage() {
//   return (
//     <Suspense fallback={<div className="p-4">Loading call…</div>}>
//       <PatientCallInner />
//     </Suspense>
//   );
// }



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
  History,
  X,
  User,
} from "lucide-react";

export const dynamic = "force-dynamic";

function attachVideo(track: any, container: HTMLDivElement | null) {
  if (!container) return;

  // remove any old <video> tags first
  container.querySelectorAll("video").forEach((v) => v.remove());

  const el = track.attach();
  el.style.position = "absolute";
  el.style.width = "100%";
  el.style.height = "100%";
  el.style.objectFit = "cover";
  el.style.display = "block";
  el.style.borderRadius = "0.75rem"; // matches rounded-xl
  container.appendChild(el);
}

function PatientCallInner() {
  const sp = useSearchParams();
  const consultId = sp.get("consult_id") ?? "";
  const router = useRouter();

  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [showValidationPopup, setShowValidationPopup] = useState(false);
  const [validationData, setValidationData] = useState({
    consultComplete: "",
    satisfaction: "",
    clarity: "",
  });

  const [patientProfile, setPatientProfile] = useState<any>(null);
  const [doctorProfile, setDoctorProfile] = useState<any>(null);

  const roomRef = useRef<any>(null);
  const localRef = useRef<HTMLDivElement | null>(null);
  const remoteRef = useRef<HTMLDivElement | null>(null);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch profiles (patient + doctor)
  useEffect(() => {
    if (!consultId) return;
    (async () => {
      // consult to get patient_id + doctor_id
      const { data: consult } = await supabase
        .from("consult")
        .select("patient_id, doctor_id")
        .eq("id", consultId)
        .maybeSingle();

      if (consult?.patient_id) {
        const { data } = await supabase
          .from("profile")
          .select(
            "first_name, last_name, gender, blood_type, age, emergency_name, emergency_phone, drug_allergies, food_allergies, prescriptions, over_the_counter, supplements, family_history, chronic_conditions"
          )
          .eq("id", consult.patient_id)
          .maybeSingle();
        setPatientProfile(data);
      }

      if (consult?.doctor_id) {
        const { data: doc } = await supabase
          .from("profile")
          .select("first_name, last_name, specialty")
          .eq("id", consult.doctor_id)
          .maybeSingle();
        setDoctorProfile(doc);
      }
    })();
  }, [consultId]);

  // Twilio connection
  useEffect(() => {
    if (!consultId) return;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

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
      if (!resp.ok) return;

      const { connect } = await import("twilio-video");
      if (roomRef.current) return;

      const room = await connect(body.token, {
        name: `consult_${consultId}`,
        audio: true,
        video: false,
        logLevel: "debug",
      });
      roomRef.current = room;

      // Attach local
      room.localParticipant.tracks.forEach((pub: any) => {
        if (pub.track && localRef.current) localRef.current.appendChild(pub.track.attach());
        
      });

      // Attach remote
      const attachTrack = (t: any) => remoteRef.current?.appendChild(t.attach());
      const detachTrack = (t: any) => t.detach().forEach((el: HTMLElement) => el.remove());

      room.participants.forEach((p: any) => {
        p.tracks.forEach((pub: any) => pub.isSubscribed && attachTrack(pub.track));
        p.on("trackSubscribed", attachTrack);
        p.on("trackUnsubscribed", detachTrack);
      });

      window.addEventListener("beforeunload", cleanup);
    })();

    return () => { cleanup(); };
  }, [consultId]);

  // cleanup
  const cleanup = () => {
    if (roomRef.current && roomRef.current.state !== "disconnected") {
      roomRef.current.disconnect();
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
    roomRef.current?.localParticipant.audioTracks.forEach((p: any) =>
      isMuted ? p.track.enable() : p.track.disable()
    );
  };

  const endCall = () => setShowValidationPopup(true);

  const handleValidationSubmit = async () => {
    await supabase
      .from("consult")
      .update({
        patient_feedback: JSON.stringify(validationData),
        status: "ended",
        ended_at: new Date().toISOString(),
      })
      .eq("id", consultId);

    setShowValidationPopup(false);
    cleanup();
    router.push("/dashboard/patient");
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60)
      .toString()
      .padStart(2, "0")}`;

  if (!consultId) return <div className="p-4 text-blue-500">Missing consult_id</div>;

  const docName = [doctorProfile?.first_name, doctorProfile?.last_name].filter(Boolean).join(" ") || "Doctor";
  const docSpec = doctorProfile?.specialty || "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col relative">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <button
          onClick={endCall}
          className="p-2 text-blue-600 hover:text-blue-800 transition-colors rounded-lg hover:bg-blue-50"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="text-lg font-semibold text-gray-800">Patient Call</h1>
          <p className="text-sm text-gray-600">Call Duration: {formatTime(callDuration)}</p>
        </div>
        <div className="w-20" />
      </div>

      {/* Video Area */}
      <div className="flex-1 p-4 flex flex-col">
        <div className="flex-1 bg-gray-900 rounded-2xl overflow-hidden relative shadow-2xl">
          {/* Connected tag */}
          <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Connected
          </div>

          {/* Doctor header (icon + name/specialty) */}
    <div className="absolute top-4 right-4 flex items-center gap-3 bg-black bg-opacity-40 px-3 py-2 rounded-lg">
      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
        <User size={24} className="text-blue-200" />
      </div>
      <div className="text-white text-sm">
        <p className="font-semibold">{docName}</p>
        {docSpec && <p className="text-blue-200 text-xs">{docSpec}</p>}
      </div>
    </div>

          {/* Remote video */}
          <div ref={remoteRef}   className="w-full h-full relative overflow-hidden bg-black" />

          {/* Local preview */}
          <div
            ref={localRef}
            className="absolute bottom-4 right-4 w-24 h-32 bg-gray-700 rounded-lg overflow-hidden border-2 border-white shadow-lg"
          />
        </div>

        {/* Control Panel */}
        <div className="mt-6 bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-center gap-6">
            {/* History Button */}
            <button
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all transform hover:scale-105 ${
                isHistoryOpen ? "bg-green-500 hover:bg-green-600 text-white shadow-lg" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              <History size={24} />
            </button>

            {/* Mute */}
            <button
              onClick={toggleMute}
              className={`w-14 h-14 rounded-full flex items-center justify-center ${
                isMuted ? "bg-red-500 text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>

            {/* End Call */}
            <button
              onClick={endCall}
              className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center"
            >
              <Phone size={28} className="rotate-180" />
            </button>

            {/* Video */}
            <button
              onClick={toggleVideo}
              className={`w-14 h-14 rounded-full flex items-center justify-center ${
                isVideoOn ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
            </button>
          </div>

          {/* Status Text (mic/video/call) */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              {isMuted && <span className="text-red-500 font-medium">Microphone muted • </span>}
              {!isVideoOn && <span className="text-gray-500 font-medium">Video off • </span>}
              <span className="text-blue-600 font-medium">Call in progress</span>
            </p>
          </div>
        </div>
      </div>

      {/* Connection Info */}
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
          <div className="bg-green-600 text-white p-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your Medical History</h2>
            <button onClick={() => setIsHistoryOpen(false)} className="p-1 hover:bg-green-700 rounded">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 text-sm space-y-3">
            {patientProfile ? (
              <>
                <p><span className="font-medium">Name:</span> {patientProfile.first_name} {patientProfile.last_name}</p>
                <p><span className="font-medium">Age:</span> {patientProfile.age} years</p>
                <p><span className="font-medium">Gender:</span> {patientProfile.gender}</p>
                <p><span className="font-medium">Blood Type:</span> {patientProfile.blood_type}</p>
                <p><span className="font-medium">Emergency:</span> {patientProfile.emergency_name} - {patientProfile.emergency_phone}</p>
                <p><span className="font-medium">Drug Allergies:</span> {patientProfile.drug_allergies || "None"}</p>
                <p><span className="font-medium">Food Allergies:</span> {patientProfile.food_allergies || "None"}</p>
                <p><span className="font-medium">Prescriptions:</span> {patientProfile.prescriptions || "None"}</p>
                <p><span className="font-medium">OTC:</span> {patientProfile.over_the_counter || "None"}</p>
                <p><span className="font-medium">Supplements:</span> {patientProfile.supplements || "None"}</p>
                <p><span className="font-medium">Family History:</span> {patientProfile.family_history || "None"}</p>
                <p><span className="font-medium">Chronic Conditions:</span> {patientProfile.chronic_conditions || "None"}</p>
              </>
            ) : (
              <p className="text-gray-500">Loading profile…</p>
            )}
          </div>
        </div>
      </div>

      {/* Validation Popup */}
      {showValidationPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="bg-blue-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-xl font-bold mb-2">Consultation Feedback</h2>
              <p className="text-blue-100">Quick validation to complete call</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Mirrors doctor popup (radio groups) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Was the consultation complete? *
                </label>
                <div className="space-y-2">
                  {["Yes", "No"].map((opt) => (
                    <label key={opt} className="flex items-center">
                      <input
                        type="radio"
                        name="consultComplete"
                        value={opt}
                        checked={validationData.consultComplete === opt}
                        onChange={(e) => setValidationData({ ...validationData, consultComplete: e.target.value })}
                        className="mr-3 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-black">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Were you satisfied with the consultation? *
                </label>
                <div className="space-y-2">
                  {["Yes", "No"].map((opt) => (
                    <label key={opt} className="flex items-center">
                      <input
                        type="radio"
                        name="satisfaction"
                        value={opt}
                        checked={validationData.satisfaction === opt}
                        onChange={(e) => setValidationData({ ...validationData, satisfaction: e.target.value })}
                        className="mr-3 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-black">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Was the doctor’s explanation clear? *
                </label>
                <div className="space-y-2">
                  {["Yes", "No"].map((opt) => (
                    <label key={opt} className="flex items-center">
                      <input
                        type="radio"
                        name="clarity"
                        value={opt}
                        checked={validationData.clarity === opt}
                        onChange={(e) => setValidationData({ ...validationData, clarity: e.target.value })}
                        className="mr-3 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-black">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex items-center justify-between">
              <p className="text-sm text-gray-600">* All fields required</p>
              <div className="flex gap-3">
                <button onClick={() => setShowValidationPopup(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">
                  Cancel
                </button>
                <button onClick={handleValidationSubmit} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all">
                  Submit & End Call
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PatientCallPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading call…</div>}>
      <PatientCallInner />
    </Suspense>
  );
}
