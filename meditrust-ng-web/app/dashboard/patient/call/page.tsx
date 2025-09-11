

// "use client";

// import { Suspense, useEffect, useRef, useState } from "react";
// import { useSearchParams } from "next/navigation";
// import { supabase } from "@/lib/supabaseClient";

// // Force dynamic rendering (no prerendering at build time)
// export const dynamic = "force-dynamic";

// function PatientCallInner() {
//   const sp = useSearchParams();
//   const consultId = sp.get("consult_id") ?? "";
//   const [err, setErr] = useState<string | null>(null);

//   const remoteRef = useRef<HTMLDivElement | null>(null);
//   const localRef = useRef<HTMLDivElement | null>(null);
//   const roomRef = useRef<any>(null);

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

//         // 6. Cleanup on tab close
//         window.addEventListener("beforeunload", () => {
//           if (room && room.state !== "disconnected") {
//             room.disconnect();
//           }
//         });
//       } catch (e: any) {
//         setErr(e?.message ?? "join_failed");
//       }
//     })();

//     return () => {
//       // Cleanup on unmount
//       if (roomRef.current && roomRef.current.state !== "disconnected") {
//         roomRef.current.disconnect();
//       }
//       roomRef.current = null;
//     };
//   }, [consultId]);

//   if (!consultId) {
//     return <div className="p-4 text-blue-500">Missing consult_id</div>;
//   }

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

// Force dynamic rendering (no prerendering at build time)
export const dynamic = "force-dynamic";

function PatientCallInner() {
  const sp = useSearchParams();
  const consultId = sp.get("consult_id") ?? "";
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  const remoteRef = useRef<HTMLDivElement | null>(null);
  const localRef = useRef<HTMLDivElement | null>(null);
  const roomRef = useRef<any>(null);

  // --- Cleanup helper: just disconnect room ---
  const cleanupRoom = async () => {
    if (roomRef.current && roomRef.current.state !== "disconnected") {
      roomRef.current.disconnect();
      console.log("✅ Patient disconnected from room");
    }
    roomRef.current = null;
  };

  useEffect(() => {
    if (!consultId) return;

    let room: any;

    (async () => {
      try {
        // 1. Verify session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("not_authenticated");

        // 2. Fetch Twilio token
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
        console.log("Twilio JWT:", body.token);

        if (roomRef.current) {
          console.log("⚠️ Already connected to a room");
          return;
        }

        // 3. Connect to Twilio
        room = await connect(body.token, {
          name: body.room,
          audio: true,
          video: false,
          logLevel: "debug",
        });
        roomRef.current = room;

        console.log("✅ Connected to room:", room.name);

        // 4. Attach local tracks
        room.localParticipant.tracks.forEach((pub: any) => {
          if (pub.track && localRef.current) {
            localRef.current.appendChild(pub.track.attach());
          }
        });

        // 5. Remote participants
        const attachTrack = (t: any) => remoteRef.current?.appendChild(t.attach());
        const detachTrack = (t: any) =>
          t.detach().forEach((el: HTMLElement) => el.remove());

        const watchParticipant = (p: any) => {
          console.log("👥 Participant connected:", p.identity);
          p.tracks.forEach((pub: any) => pub.isSubscribed && attachTrack(pub.track));
          p.on("trackSubscribed", attachTrack);
          p.on("trackUnsubscribed", detachTrack);
        };

        room.participants.forEach(watchParticipant);
        room.on("participantConnected", watchParticipant);

        room.on("participantDisconnected", (p: any) => {
          console.log("👋 Participant disconnected:", p.identity);
        });

        // Cleanup on tab close
        window.addEventListener("beforeunload", cleanupRoom);
      } catch (e: any) {
        setErr(e?.message ?? "join_failed");
      }
    })();

    // --- handle browser back/forward ---
    const handlePopState = async () => {
      console.log("⬅ Browser back detected (patient), cleaning up room…");
      await cleanupRoom();
    };
    window.addEventListener("popstate", handlePopState);

    return () => {
      cleanupRoom();
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", cleanupRoom);
    };
  }, [consultId]);

  if (!consultId) {
    return <div className="p-4 text-blue-500">Missing consult_id</div>;
  }

  // Back button handler
  const handleBack = async () => {
    await cleanupRoom();
    router.push("/dashboard/patient");
  };

  return (
    <div className="p-4 space-y-3">
      {err && <div className="text-sm text-red-600">{err}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="border rounded p-2">
          <div className="text-xs opacity-70 mb-1 text-blue-700">Local</div>
          <div ref={localRef} />
        </div>
        <div className="border rounded p-2">
          <div className="text-xs opacity-70 mb-1 text-blue-700">Remote</div>
          <div ref={remoteRef} />
        </div>
      </div>

      {/* Back Button */}
      <button
        onClick={handleBack}
        className="mt-4 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
      >
        ⬅ Back to Dashboard
      </button>
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

