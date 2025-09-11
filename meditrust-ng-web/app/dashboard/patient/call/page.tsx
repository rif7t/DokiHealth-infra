// app/dashboard/patient/call/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";


export default function PatientCallPage() {
  const sp = useSearchParams();
  const consultId = sp.get("consult_id") ?? "";
  const [err, setErr] = useState<string | null>(null);
  const remoteRef = useRef<HTMLDivElement | null>(null);
  const localRef  = useRef<HTMLDivElement | null>(null);
  const roomRef   = useRef<any>(null);

  useEffect(() => {
    if (!consultId) return;
    let cancelled = false;

    (async () => {
      try {

        

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("not_authenticated");

        // Ask your Next.js API to mint token for the DB room
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
        console.log("Twilio JWT :", body.token);
        if (roomRef.current) {
        console.log("Already connected to a room");
        return;
          }
          roomRef.current = await connect(body.token, { name: body.room, audio: true, video: false, logLevel: 'debug' });

        // local preview (optional)
        roomRef.current.localParticipant.tracks.forEach((pub: any) => {
          if (pub.track && localRef.current) localRef.current.appendChild(pub.track.attach());
        });

        // remote participants
        const attachTrack = (t: any) => remoteRef.current?.appendChild(t.attach());
        const detachTrack = (t: any) => t.detach().forEach((el: HTMLElement) => el.remove());

        roomRef.current.participants.forEach(p => {
          p.tracks.forEach((pub: any) => pub.isSubscribed && attachTrack(pub.track));
          p.on("trackSubscribed", attachTrack);
          p.on("trackUnsubscribed", detachTrack);
        });
        roomRef.current.on("participantConnected", p => {
          p.on("trackSubscribed", attachTrack);
          p.on("trackUnsubscribed", detachTrack);
          console.log("👥 Participant connected:", p.identity);
        });

        // Log when someone leaves
        roomRef.current.on("participantDisconnected", participant => {
          console.log("Participant disconnected:", participant.identity);
        });

        window.addEventListener("beforeunload", () => roomRef.current.disconnect());
      } catch (e: any) {
        setErr(e?.message ?? "join_failed");
      }
    })();

    return () => { cancelled = true; try { roomRef.current?.disconnect(); roomRef.current = null;

     } catch {} };
  }, [consultId]);

  if (!consultId) return <div className="p-4">Missing consult_id</div>;
  return (
    <div className="p-4 space-y-3">
      {err && <div className="text-sm text-red-600">{err}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="border rounded p-2">
          <div className="text-xs opacity-70 mb-1 text-blue-700 ">Local</div>
          <div ref={localRef} />
        </div>
        <div className="border rounded p-2">
          <div className="text-xs opacity-70 text-blue-700 mb-1">Remote</div>
          <div ref={remoteRef} />
        </div>
      </div>
    </div>
  );
}
