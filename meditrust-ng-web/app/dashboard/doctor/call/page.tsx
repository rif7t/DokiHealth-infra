// // app/dashboard/doctor/call/page.tsx
// "use client";
// import { useEffect, useRef, useState } from "react";
// import { useSearchParams } from "next/navigation";
// import { supabase } from "@/lib/supabaseClient";

// export default function DoctorCallPage() {
//   const sp = useSearchParams();
//   const consultId = sp.get("consult_id") ?? "";
//   const [err, setErr] = useState<string | null>(null);
//   const remoteRef = useRef<HTMLDivElement | null>(null);
//   const localRef  = useRef<HTMLDivElement | null>(null);
//   const roomRef   = useRef<any>(null);

//   useEffect(() => {
//     if (!consultId) return;
//     let cancelled = false;

//     (async () => {
//       try {

        

//         const { data: { session } } = await supabase.auth.getSession();
//         if (!session) throw new Error("not_authenticated");

//         // Ask your Next.js API to mint token for the DB room
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
//         console.log("Twilio JWT :", body.token);
//         if (roomRef.current) {
//         console.log("Already connected to a room");
//         return;
//           }
//           roomRef.current = await connect(body.token, { name: body.room, audio: true, video: false, logLevel: 'debug' });
//           if(roomRef.current) setConsult(consultId, "in_progress");

//         // local preview (optional)
//         roomRef.current.localParticipant.tracks.forEach((pub: any) => {
//           if (pub.track && localRef.current) localRef.current.appendChild(pub.track.attach());
//         });

//         // remote participants
//         const attachTrack = (t: any) => remoteRef.current?.appendChild(t.attach());
//         const detachTrack = (t: any) => t.detach().forEach((el: HTMLElement) => el.remove());

//         roomRef.current.participants.forEach(p => {
//           p.tracks.forEach((pub: any) => pub.isSubscribed && attachTrack(pub.track));
//           p.on("trackSubscribed", attachTrack);
//           p.on("trackUnsubscribed", detachTrack);
//         });
//         roomRef.current.on("participantConnected", p => {
//           p.on("trackSubscribed", attachTrack);
//           p.on("trackUnsubscribed", detachTrack);
//           console.log("👥 Participant connected:", p.identity);
//         });

//         // Log when someone leaves
//         roomRef.current.on("participantDisconnected", participant => {
//           console.log("Participant disconnected:", participant.identity);
//         });

//         window.addEventListener("beforeunload", () => roomRef.current.disconnect());

//         roomRef.current.on("disconnected", async() =>{
//           console.log("👋 Room disconnected, cleaning up profile…");

//           const { data: { session } } = await supabase.auth.getSession();
//           if (session?.user?.id) {
//             await resetProfile(session.user.id);
//             await setConsult(consultId, "ended");
//           }
//         })
//       } catch (e: any) {
//         setErr(e?.message ?? "join_failed");
//       }
//     })();

//     return () => { cancelled = true; try { roomRef.current?.disconnect(); roomRef.current = null;

//      } catch {} };
//   }, [consultId]);


//   if (!consultId) return <div className="p-4 text-blue-500">Missing consult_id</div>;
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

// async function setConsult(consultId:string, status:string){

//   if(status === "ended"){
//     await supabase.from("consult").
//     update({status: "ended",
//       ended_at: new Date().toISOString(),})
//   }
//   if(status === "in_progress"){
//     const {error:cerr} = await supabase.from("consult").
//     update({status: "in_progress"}).
//     eq("id", consultId);
//   }

// }

"use client";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function DoctorCallPage() {
  const sp = useSearchParams();
  const consultId = sp.get("consult_id") ?? "";
  const [err, setErr] = useState<string | null>(null);
  const userIdRef = useRef<string | null>(null);
  const remoteRef = useRef<HTMLDivElement | null>(null);
  const localRef = useRef<HTMLDivElement | null>(null);
  
  const roomRef = useRef<any>(null);

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
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.id) {
            await resetProfile(userIdRef.current);
            await setConsult(consultId, "ended");
          }
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

    return () => {
      // Cleanup on unmount
      if (roomRef.current && roomRef.current.state !== "disconnected") {
        roomRef.current.disconnect();
      }
      (async () => {
        await resetProfile(userIdRef.current);
        await setConsult(consultId, "ended");
    })();
      roomRef.current = null;
    };

  }, [consultId]);

  if (!consultId) {
    return <div className="p-4 text-blue-500">Missing consult_id</div>;
  }

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
    </div>
  );
}

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

