

// "use client";

// import { Suspense, useEffect, useRef, useState } from "react";
// import { useRouter } from "next/navigation";
// import { useSearchParams } from "next/navigation";
// import { supabase } from "@/lib/supabaseClient";

// // Force dynamic rendering (no prerendering at build time)
// export const dynamic = "force-dynamic";

// function DoctorCallInner() {
//   const sp = useSearchParams();
//   const consultId = sp.get("consult_id") ?? "";
//   const [err, setErr] = useState<string | null>(null);

//   const userIdRef = useRef<string | null>(null);
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
//         userIdRef.current = session.user.id;

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
//         await setConsult(consultId, "in_progress");

//         // 4. Attach local tracks
//         room.localParticipant.tracks.forEach((pub: any) => {
//           if (pub.track && localRef.current) {
//             localRef.current.appendChild(pub.track.attach());
//           }
//         });

//         // 5. Remote participant handlers
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

//         // 6. Handle disconnection
//         room.on("disconnected", async () => {
//           console.log("👋 Room disconnected, cleaning up profile…");
//           if (userIdRef.current) {
//             await resetProfile(userIdRef.current);
//             await setConsult(consultId, "ended");
//           }
//         });

//         // Ensure cleanup on tab close
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
//       (async () => {
//         if (userIdRef.current) {
//           await resetProfile(userIdRef.current);
//           await setConsult(consultId, "ended");
//         }
//       })();
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
//           <div className="text-xs opacity-70 text-blue-700 mb-1">Local</div>
//           <div ref={localRef} />
//         </div>
//         <div className="border rounded text-blue-700 p-2">
//           <div className="text-xs opacity-70 mb-1">Remote</div>
//           <div ref={remoteRef} />
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function DoctorCallPage() {
//   return (
//     <Suspense fallback={<div className="p-4">Loading call…</div>}>
//       <DoctorCallInner />
//     </Suspense>
//   );
// }

// // --- helpers ---

// async function resetProfile(userId: string) {
//   const { data, error } = await supabase
//     .from("profile")
//     .update({
//       is_assigned: false,
//       consult_id: null,
//       room: null,
//     })
//     .eq("id", userId)
//     .select("room, consult_id, is_assigned, ended_at")
//     .single();

//   if (error) {
//     console.error("❌ Failed to reset profile:", error);
//     return null;
//   }

//   console.log("✅ Profile reset:", data);
//   return data;
// }

// async function setConsult(consultId: string, status: string) {
//   if (status === "ended") {
//     const { error } = await supabase
//       .from("consult")
//       .update({
//         status: "ended",
//         ended_at: new Date().toISOString(),
//       })
//       .eq("id", consultId);

//     if (error) console.error("❌ Failed to update consult:", error);
//   }

//   if (status === "in_progress") {
//     const { error } = await supabase
//       .from("consult")
//       .update({ status: "in_progress" })
//       .eq("id", consultId);

//     if (error) console.error("❌ Failed to update consult:", error);
//   }
// }

"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// Force dynamic rendering (no prerendering at build time)
export const dynamic = "force-dynamic";

function DoctorCallInner() {
  const sp = useSearchParams();
  const consultId = sp.get("consult_id") ?? "";
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  const userIdRef = useRef<string | null>(null);
  const remoteRef = useRef<HTMLDivElement | null>(null);
  const localRef = useRef<HTMLDivElement | null>(null);
  const roomRef = useRef<any>(null);

  // --- Cleanup helpers ---
  const cleanupConsult = async () => {
    if (userIdRef.current) {
      await resetProfile(userIdRef.current);
      await setConsult(consultId, "ended");
    }
  };

  useEffect(() => {
    if (!consultId) return;

    let room: any;

    (async () => {
      try {
        // 1. Verify session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("not_authenticated");
        userIdRef.current = session.user.id;

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
        await setConsult(consultId, "in_progress");

        // 4. Attach local tracks
        room.localParticipant.tracks.forEach((pub: any) => {
          if (pub.track && localRef.current) {
            localRef.current.appendChild(pub.track.attach());
          }
        });

        // 5. Remote participant handlers
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

        // 6. Handle disconnection
        room.on("disconnected", async () => {
          console.log("👋 Room disconnected, cleaning up profile…");
          await cleanupConsult();
        });

        // Ensure cleanup on tab close
        window.addEventListener("beforeunload", () => {
          if (room && room.state !== "disconnected") {
            room.disconnect();
          }
        });
      } catch (e: any) {
        setErr(e?.message ?? "join_failed");
      }
    })();

    // --- handle browser back arrow ---
    const handlePopState = async () => {
      console.log("⬅ Browser back detected, cleaning up…");
      await cleanupConsult();
    };
    window.addEventListener("popstate", handlePopState);

    return () => {
      // Cleanup on unmount
      if (roomRef.current && roomRef.current.state !== "disconnected") {
        roomRef.current.disconnect();
      }
      (async () => await cleanupConsult())();
      roomRef.current = null;

      window.removeEventListener("popstate", handlePopState);
    };
  }, [consultId]);

  if (!consultId) {
    return <div className="p-4 text-blue-500">Missing consult_id</div>;
  }

  // Back button handler
  const handleBack = async () => {
    await cleanupConsult();
    router.push("/dashboard/doctor");
  };

  return (
    <div className="p-4 space-y-3">
      {err && <div className="text-sm text-red-600">{err}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="border rounded p-2">
          <div className="text-xs opacity-70 text-blue-700 mb-1">Local</div>
          <div ref={localRef} />
        </div>
        <div className="border rounded text-blue-700 p-2">
          <div className="text-xs opacity-70 mb-1">Remote</div>
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

export default function DoctorCallPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading call…</div>}>
      <DoctorCallInner />
    </Suspense>
  );
}

// --- helpers ---
async function resetProfile(userId: string) {
  const { data, error } = await supabase
    .from("profile")
    .update({
      is_assigned: false,
      consult_id: null,
      room: null,
    })
    .eq("id", userId)
    .select("room, consult_id, is_assigned, ended_at")
    .single();

  if (error) {
    console.error("❌ Failed to reset profile:", error);
    return null;
  }

  console.log("✅ Profile reset:", data);
  return data;
}

async function setConsult(consultId: string, status: string) {
  if (status === "ended") {
    const { error } = await supabase
      .from("consult")
      .update({
        status: "ended",
        ended_at: new Date().toISOString(),
      })
      .eq("id", consultId);

    if (error) console.error("❌ Failed to update consult:", error);
  }

  if (status === "in_progress") {
    const { error } = await supabase
      .from("consult")
      .update({ status: "in_progress" })
      .eq("id", consultId);

    if (error) console.error("❌ Failed to update consult:", error);
  }
}

