// app/dashboard/patient/call/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";


export default function PatientCallPage() {
  const sp = useSearchParams();
  const consultId = sp.get("consult_id") ?? "";
  const [err, setErr] = useState<string | null>(null);

  const roomRef   = useRef<any>(null);
  const localRef  = useRef<HTMLDivElement | null>(null);
  const remoteRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!consultId) return;
    let cancelled = false;

    (async () => {
      try {
        // 1) Auth for bearer
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("not_authenticated");

        // 2) Ask server for a Twilio token (server reads consult.twilio_room)
        const resp = await fetch("/api/twilio/token", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ consult_id: consultId }),
          cache: "no-store",
        });

        const body = await resp.json().catch(() => ({}));
        if (!resp.ok) throw new Error(body?.error ?? `token_failed_${resp.status}`);

        // 3) Client-only import and connect
        const { connect } = await import("twilio-video");
        const room = await connect(body.token, { name: body.room, audio: true, video: false });

        if (cancelled) { room.disconnect(); return; }
        roomRef.current = room;

        // Show local tracks (optional)
        room.localParticipant.tracks.forEach((pub: any) => {
          if (pub.track && localRef.current) localRef.current.appendChild(pub.track.attach());
        });

        // Attach existing remote tracks
        room.participants.forEach(attachParticipant);
        // Future remote tracks
        room.on("participantConnected", attachParticipant);
        room.on("participantDisconnected", detachParticipant);

        // Disconnect safely on tab close
        const bye = () => room.disconnect();
        window.addEventListener("beforeunload", bye);
        return () => window.removeEventListener("beforeunload", bye);

      } catch (e: any) {
        console.error("[patient-call] join failed:", e);
        setErr(e?.message ?? "join_failed");
      }
    })();

    return () => {
      cancelled = true;
      try { roomRef.current?.disconnect(); } catch {}
      roomRef.current = null;
    };

    function attachParticipant(p: any) {
      p.tracks.forEach((pub: any) => {
        if (pub.isSubscribed) attachTrack(pub.track);
      });
      p.on("trackSubscribed", attachTrack);
      p.on("trackUnsubscribed", detachTrack);
    }

    function attachTrack(track: any) {
      const el = track.attach();
      remoteRef.current?.appendChild(el);
    }

    function detachParticipant(p: any) {
      p.tracks.forEach((pub: any) => {
        if (pub.track) detachTrack(pub.track);
      });
    }

    function detachTrack(track: any) {
      track.detach().forEach((el: HTMLElement) => el.remove());
    }
  }, [consultId]);

  if (!consultId) return <div className="p-4">Missing consult_id</div>;

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
