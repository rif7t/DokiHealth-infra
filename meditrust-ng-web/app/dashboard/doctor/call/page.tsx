// app/dashboard/doctor/call/page.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function DoctorCallPage() {
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

        const room = await connect(body.token, {
          name: body.room,        // <- use room from server
          audio: true,
          video: false,
        });

        if (cancelled) { room.disconnect(); return; }
        roomRef.current = room;

        // local preview (optional)
        room.localParticipant.tracks.forEach((pub: any) => {
          if (pub.track && localRef.current) localRef.current.appendChild(pub.track.attach());
        });

        // remote participants
        const attachTrack = (t: any) => remoteRef.current?.appendChild(t.attach());
        const detachTrack = (t: any) => t.detach().forEach((el: HTMLElement) => el.remove());

        room.participants.forEach(p => {
          p.tracks.forEach((pub: any) => pub.isSubscribed && attachTrack(pub.track));
          p.on("trackSubscribed", attachTrack);
          p.on("trackUnsubscribed", detachTrack);
        });
        room.on("participantConnected", p => {
          p.on("trackSubscribed", attachTrack);
          p.on("trackUnsubscribed", detachTrack);
        });

        window.addEventListener("beforeunload", () => room.disconnect());
      } catch (e: any) {
        setErr(e?.message ?? "join_failed");
      }
    })();

    return () => { cancelled = true; try { roomRef.current?.disconnect(); } catch {} };
  }, [consultId]);

  if (!consultId) return <div className="p-4">Missing consult_id</div>;
  return (
    <div className="p-4 space-y-3">
      {err && <div className="text-sm text-red-600">{err}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="border rounded p-2">
          <div className="text-xs opacity-70 mb-1">Local</div>
          <div ref={localRef} />
        </div>
        <div className="border rounded p-2">
          <div className="text-xs opacity-70 mb-1">Remote</div>
          <div ref={remoteRef} />
        </div>
      </div>
    </div>
  );
}
