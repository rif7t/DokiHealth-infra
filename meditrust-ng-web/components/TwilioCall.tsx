"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  consultId: string;
  role: "doctor" | "patient";
  wantVideo?: boolean; // default false (audio-only)
};

export default function TwilioCall({ consultId, role, wantVideo = false }: Props) {
  const [phase, setPhase] = useState<"idle"|"fetching"|"connecting"|"connected"|"error">("idle");
  const [err, setErr] = useState<string | null>(null);

  const roomRef = useRef<any>(null);
  const localRef = useRef<HTMLDivElement | null>(null);
  const remoteRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setPhase("fetching");

        // 1) Auth → bearer
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("not_authenticated");

        // 2) Ask server for a token (server uses existing consult.twilio_room)
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

        const token: string = body.token;
        const roomName: string = body.room;
        if (!token || !roomName) throw new Error("bad_token_payload");

        // 3) Client-only import + connect
        const { connect } = await import("twilio-video");

        setPhase("connecting");
        const room = await connect(token, { name: roomName, audio: true, video: wantVideo });
        if (cancelled) { room.disconnect(); return; }
        roomRef.current = room;
        setPhase("connected");

        // Attach existing remote tracks
        room.participants.forEach(attachParticipant);
        // Listen for future remote tracks
        room.on("participantConnected", attachParticipant);
        room.on("participantDisconnected", detachParticipant);

        // Show local tracks (optional preview)
        room.localParticipant.tracks.forEach((pub: any) => {
          if (pub.track && localRef.current) localRef.current.appendChild(pub.track.attach());
        });

        // Cleanup on tab close
        const bye = () => room.disconnect();
        window.addEventListener("beforeunload", bye);
        return () => window.removeEventListener("beforeunload", bye);

      } catch (e: any) {
        setErr(e?.message ?? "join_failed");
        setPhase("error");
      }
    })();

    return () => {
      cancelled = true;
      try { roomRef.current?.disconnect(); } catch {}
      roomRef.current = null;
    };
  }, [consultId, wantVideo, role]);

  function attachParticipant(p: any) {
    p.tracks.forEach((pub: any) => { if (pub.isSubscribed) attachTrack(pub.track); });
    p.on("trackSubscribed", attachTrack);
    p.on("trackUnsubscribed", detachTrack);
  }
  function attachTrack(track: any) {
    const el = track.attach();
    remoteRef.current?.appendChild(el);
  }
  function detachParticipant(p: any) {
    p.tracks.forEach((pub: any) => { if (pub.track) detachTrack(pub.track); });
  }
  function detachTrack(track: any) {
    track.detach().forEach((el: HTMLElement) => el.remove());
  }

  // Simple controls
  const toggleMute = () => {
    const room = roomRef.current;
    if (!room) return;
    const pubs = Array.from(room.localParticipant.audioTracks.values());
    const enabled = pubs.some((p: any) => p.track.isEnabled);
    pubs.forEach((p: any) => (enabled ? p.track.disable() : p.track.enable()));
  };
  const leave = () => { try { roomRef.current?.disconnect(); } catch {} };

  return (
    <div className="p-4 space-y-3">
      <header className="flex justify-between">
        <div className="font-semibold text-blue-500">{role === "doctor" ? "Doctor" : "Patient"} Call</div>
        <div className="text-sm text-blue-600 opacity-70">{phase}</div>
      </header>

      {err && <div className="text-sm text-red-600">{err}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="border rounded p-2">
          <div className="text-xs text-blue-500 opacity-70 mb-1">Local</div>
          <div ref={localRef} />
        </div>
        <div className="border rounded p-2">
          <div className="text-xs text-blue-500 opacity-70 mb-1">Remote</div>
          <div ref={remoteRef} />
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={toggleMute} className="px-3 py-2 rounded bg-blue-200 hover:bg-blue-300 text-sm">
          Mute / Unmute
        </button>
        <button onClick={leave} className="px-3 py-2 rounded bg-red-500 hover:bg-red-600 text-white text-sm">
          Leave
        </button>
      </div>

      <p className="text-xs text-blue-500 opacity-70">Needs HTTPS or http://localhost for mic permission.</p>
    </div>
  );
}
