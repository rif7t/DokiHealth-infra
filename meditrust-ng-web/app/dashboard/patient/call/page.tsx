

// // "use client";

// // import { Suspense, useEffect, useRef, useState } from "react";
// // import { useSearchParams } from "next/navigation";
// // import { supabase } from "@/lib/supabaseClient";

// // // Force dynamic rendering (no prerendering at build time)
// // export const dynamic = "force-dynamic";

// // function PatientCallInner() {
// //   const sp = useSearchParams();
// //   const consultId = sp.get("consult_id") ?? "";
// //   const [err, setErr] = useState<string | null>(null);

// //   const remoteRef = useRef<HTMLDivElement | null>(null);
// //   const localRef = useRef<HTMLDivElement | null>(null);
// //   const roomRef = useRef<any>(null);

// //   useEffect(() => {
// //     if (!consultId) return;

// //     let room: any;

// //     (async () => {
// //       try {
// //         // 1. Verify session
// //         const { data: { session } } = await supabase.auth.getSession();
// //         if (!session) throw new Error("not_authenticated");

// //         // 2. Fetch Twilio token
// //         const resp = await fetch("/api/twilio/token", {
// //           method: "POST",
// //           headers: {
// //             "content-type": "application/json",
// //             authorization: `Bearer ${session.access_token}`,
// //           },
// //           body: JSON.stringify({ consult_id: consultId }),
// //           cache: "no-store",
// //         });
// //         const body = await resp.json();
// //         if (!resp.ok) throw new Error(body?.error ?? `token_failed_${resp.status}`);

// //         const { connect } = await import("twilio-video");
// //         console.log("Twilio JWT:", body.token);

// //         if (roomRef.current) {
// //           console.log("⚠️ Already connected to a room");
// //           return;
// //         }

// //         // 3. Connect to Twilio
// //         room = await connect(body.token, {
// //           name: body.room,
// //           audio: true,
// //           video: false,
// //           logLevel: "debug",
// //         });
// //         roomRef.current = room;

// //         console.log("✅ Connected to room:", room.name);

// //         // 4. Attach local tracks
// //         room.localParticipant.tracks.forEach((pub: any) => {
// //           if (pub.track && localRef.current) {
// //             localRef.current.appendChild(pub.track.attach());
// //           }
// //         });

// //         // 5. Remote participants
// //         const attachTrack = (t: any) => remoteRef.current?.appendChild(t.attach());
// //         const detachTrack = (t: any) =>
// //           t.detach().forEach((el: HTMLElement) => el.remove());

// //         const watchParticipant = (p: any) => {
// //           console.log("👥 Participant connected:", p.identity);
// //           p.tracks.forEach((pub: any) => pub.isSubscribed && attachTrack(pub.track));
// //           p.on("trackSubscribed", attachTrack);
// //           p.on("trackUnsubscribed", detachTrack);
// //         };

// //         room.participants.forEach(watchParticipant);
// //         room.on("participantConnected", watchParticipant);

// //         room.on("participantDisconnected", (p: any) => {
// //           console.log("👋 Participant disconnected:", p.identity);
// //         });

// //         // 6. Cleanup on tab close
// //         window.addEventListener("beforeunload", () => {
// //           if (room && room.state !== "disconnected") {
// //             room.disconnect();
// //           }
// //         });
// //       } catch (e: any) {
// //         setErr(e?.message ?? "join_failed");
// //       }
// //     })();

// //     return () => {
// //       // Cleanup on unmount
// //       if (roomRef.current && roomRef.current.state !== "disconnected") {
// //         roomRef.current.disconnect();
// //       }
// //       roomRef.current = null;
// //     };
// //   }, [consultId]);

// //   if (!consultId) {
// //     return <div className="p-4 text-blue-500">Missing consult_id</div>;
// //   }

// //   return (
// //     <div className="p-4 space-y-3">
// //       {err && <div className="text-sm text-red-600">{err}</div>}
// //       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
// //         <div className="border rounded p-2">
// //           <div className="text-xs opacity-70 mb-1 text-blue-700">Local</div>
// //           <div ref={localRef} />
// //         </div>
// //         <div className="border rounded p-2">
// //           <div className="text-xs opacity-70 mb-1 text-blue-700">Remote</div>
// //           <div ref={remoteRef} />
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // export default function PatientCallPage() {
// //   return (
// //     <Suspense fallback={<div className="p-4">Loading call…</div>}>
// //       <PatientCallInner />
// //     </Suspense>
// //   );
// // }

// "use client";

// import { Suspense, useEffect, useRef, useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { supabase } from "@/lib/supabaseClient";

// // Force dynamic rendering (no prerendering at build time)
// export const dynamic = "force-dynamic";

// function PatientCallInner() {
//   const sp = useSearchParams();
//   const consultId = sp.get("consult_id") ?? "";
//   const [err, setErr] = useState<string | null>(null);
//   const router = useRouter();

//   const remoteRef = useRef<HTMLDivElement | null>(null);
//   const localRef = useRef<HTMLDivElement | null>(null);
//   const roomRef = useRef<any>(null);

//   // --- Cleanup helper: just disconnect room ---
//   const cleanupRoom = async () => {
//     if (roomRef.current && roomRef.current.state !== "disconnected") {
//       roomRef.current.disconnect();
//       console.log("✅ Patient disconnected from room");
//     }
//     roomRef.current = null;
//   };

//   useEffect(() => {
//     if (!consultId) return;

//     let room: any;

//     (async () => {
//       try {
//         // 1. Verify session
//         const { data: { session } } = await supabase.auth.getSession();
//         if (!session) throw new Error("not_authenticated");

//         // 2. Fetch Twilio token
//         const resp = await fetch("/api/twilio/token", {
//           method: "POST",
//           headers: {
//             "content-type": "application/json",
//             authorization: `Bearer ${session.access_token}`,
//           },
//           body: JSON.stringify({ consult_id: consultId }),
//           cache: "no-store",
//         });
        
//         (async () => {
//     const { data, error } = await supabase
//       .from("consult")
//       .select("status")
//       .eq("id", consultId)
//       .single();

//         if (data?.status === "ended") {
//           // Redirect back if user tries to "forward" into a dead consult
//           router.push("/dashboard/doctor");
//         }
//       })();

//         const body = await resp.json();
//         if (!resp.ok) throw new Error(body?.error ?? `token_failed_${resp.status}`);

//         const { connect } = await import("twilio-video");
//         console.log("Twilio JWT:", body.token);

//         if (roomRef.current) {
//           console.log("⚠️ Already connected to a room");
//           return;
//         }

//         // 3. Connect to Twilio
//         room = await connect(body.token, {
//           name: body.room,
//           audio: true,
//           video: false,
//           logLevel: "debug",
//         });
//         roomRef.current = room;

//         console.log("✅ Connected to room:", room.name);

//         // 4. Attach local tracks
//         room.localParticipant.tracks.forEach((pub: any) => {
//           if (pub.track && localRef.current) {
//             localRef.current.appendChild(pub.track.attach());
//           }
//         });

//         // 5. Remote participants
//         const attachTrack = (t: any) => remoteRef.current?.appendChild(t.attach());
//         const detachTrack = (t: any) =>
//           t.detach().forEach((el: HTMLElement) => el.remove());

//         const watchParticipant = (p: any) => {
//           console.log("👥 Participant connected:", p.identity);
//           p.tracks.forEach((pub: any) => pub.isSubscribed && attachTrack(pub.track));
//           p.on("trackSubscribed", attachTrack);
//           p.on("trackUnsubscribed", detachTrack);
//         };

//         room.participants.forEach(watchParticipant);
//         room.on("participantConnected", watchParticipant);

//         room.on("participantDisconnected", (p: any) => {
//           console.log("👋 Participant disconnected:", p.identity);
//         });

//         // Cleanup on tab close
//         window.addEventListener("beforeunload", cleanupRoom);
//       } catch (e: any) {
//         setErr(e?.message ?? "join_failed");
//       }
//     })();

//     // --- handle browser back/forward ---
//     const handlePopState = async () => {
//       console.log("⬅ Browser back detected (patient), cleaning up room…");
//       await cleanupRoom();
//     };
//     window.addEventListener("popstate", handlePopState);

//     return () => {
//       cleanupRoom();
//       window.removeEventListener("popstate", handlePopState);
//       window.removeEventListener("beforeunload", cleanupRoom);
//     };
//   }, [consultId]);

//   if (!consultId) {
//     return <div className="p-4 text-blue-500">Missing consult_id</div>;
//   }

//   // Back button handler
//   const handleBack = async () => {
//     await cleanupRoom();
//     router.push("/dashboard/patient");
//   };

//   return (
//     <div className="p-4 space-y-3">
//       {err && <div className="text-sm text-red-600">{err}</div>}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//         <div className="border rounded p-2">
//           <div className="text-xs opacity-70 mb-1 text-blue-700">Local</div>
//           <div ref={localRef} />
//         </div>
//         <div className="border rounded p-2">
//           <div className="text-xs opacity-70 mb-1 text-blue-700">Remote</div>
//           <div ref={remoteRef} />
//         </div>
//       </div>

//       {/* Back Button */}
//       <button
//         onClick={handleBack}
//         className="mt-4 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
//       >
//          Back to Dashboard
//       </button>
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

//         const room = await connect(body.token, {
//           name: body.room,
//           audio: true,
//           video: true,
//           logLevel: "debug",
//         });
//         roomRef.current = room;

//         console.log("✅ Patient connected to room:", room.name);

//         // Attach local tracks
//         room.localParticipant.tracks.forEach((pub: any) => {
//           if (pub.track && localRef.current) localRef.current.appendChild(pub.track.attach());
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
//           p.on("trackSubscribed", attachTrack);
//           p.on("trackUnsubscribed", detachTrack);
//         });

//         room.on("participantDisconnected", (p: any) => {
//           console.log("👋 Participant disconnected:", p.identity);
//         });

//         room.on("disconnected", () => {
//           console.log("👋 Room disconnected (patient).");
//         });

//         window.addEventListener("beforeunload", cleanup);
//       } catch (e: any) {
//         setErr(e?.message ?? "join_failed");
//       }
//     })();

//     return () => cleanup();
//   }, [consultId]);

//   // Cleanup (patient only disconnects room)
//   const cleanup = () => {
//     if (roomRef.current && roomRef.current.state !== "disconnected") {
//       roomRef.current.disconnect();
//     }
//     roomRef.current = null;
//   };

//   const toggleVideo = () => {
//     setIsVideoOn((prev) => !prev);
//     roomRef.current?.localParticipant.videoTracks.forEach((pub: any) =>
//       isVideoOn ? pub.track.disable() : pub.track.enable()
//     );
//   };

//   const toggleMute = () => {
//     setIsMuted((prev) => !prev);
//     roomRef.current?.localParticipant.audioTracks.forEach((pub: any) =>
//       isMuted ? pub.track.enable() : pub.track.disable()
//     );
//   };

//   const endCall = async () => {
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

"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Video, VideoOff, Mic, MicOff, Phone, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

function PatientCallInner() {
  const sp = useSearchParams();
  const consultId = sp.get("consult_id") ?? "";
  const router = useRouter();

  const [err, setErr] = useState<string | null>(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const roomRef = useRef<any>(null);
  const localRef = useRef<HTMLDivElement | null>(null);
  const remoteRef = useRef<HTMLDivElement | null>(null);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Twilio connection
  useEffect(() => {
    if (!consultId) return;

    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("not_authenticated");

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
          name: body.room,
          audio: true,
          video: true,
          logLevel: "debug",
        });
        roomRef.current = room;

        console.log("✅ Patient connected to room:", room.name);

        // Attach local tracks
        room.localParticipant.tracks.forEach((pub: any) => {
          if (pub.track && localRef.current) {
            localRef.current.appendChild(pub.track.attach());
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
          p.on("trackSubscribed", attachTrack);
          p.on("trackUnsubscribed", detachTrack);
        });

        room.on("participantDisconnected", (p: any) => {
          console.log("👋 Participant disconnected:", p.identity);
        });

        room.on("disconnected", () => {
          cleanup();
        });

        window.addEventListener("beforeunload", cleanup);
      } catch (e: any) {
        setErr(e?.message ?? "join_failed");
      }
    })();

    // cleanup must be synchronous
    return () => {
      cleanup();
    };
  }, [consultId]);

  // ---- cleanup (sync wrapper) ----
  const cleanup = () => {
    if (roomRef.current && roomRef.current.state !== "disconnected") {
      roomRef.current.disconnect();
    }
    roomRef.current = null;
  };

  const toggleVideo = () => {
    setIsVideoOn((prev) => !prev);
    roomRef.current?.localParticipant.videoTracks.forEach((pub: any) =>
      isVideoOn ? pub.track.disable() : pub.track.enable()
    );
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
    roomRef.current?.localParticipant.audioTracks.forEach((pub: any) =>
      isMuted ? pub.track.enable() : pub.track.disable()
    );
  };

  const endCall = () => {
    cleanup();
    router.push("/dashboard/patient");
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60)
      .toString()
      .padStart(2, "0")}`;

  if (!consultId) {
    return <div className="p-4 text-blue-500">Missing consult_id</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
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

        <div className="w-20"></div>
      </div>

      {/* Video Area */}
      <div className="flex-1 p-4 flex flex-col">
        <div className="flex-1 bg-gray-900 rounded-2xl overflow-hidden relative shadow-2xl">
          {/* Remote video */}
          <div
            ref={remoteRef}
            className="w-full h-full bg-gray-800 flex items-center justify-center"
          />

          {/* Local preview */}
          <div
            ref={localRef}
            className="absolute bottom-4 right-4 w-24 h-32 bg-gray-700 rounded-lg overflow-hidden border-2 border-white shadow-lg"
          />
        </div>

        {/* Control Panel */}
        <div className="mt-6 bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-center gap-6">
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
        </div>
      </div>
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



