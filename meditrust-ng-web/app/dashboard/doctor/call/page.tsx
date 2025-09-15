
"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { createLocalVideoTrack } from "twilio-video";
import { Video, VideoOff, Mic, MicOff, Phone, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

 function DoctorCallInner() {
  const sp = useSearchParams();
  const consultId = sp.get("consult_id") ?? "";
  const router = useRouter();

  const [err, setErr] = useState<string | null>(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const userIdRef = useRef<string | null>(null);
  const roomRef = useRef<any>(null);
  const localRef = useRef<HTMLDivElement | null>(null);
  const remoteRef = useRef<HTMLDivElement | null>(null);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Twilio connection logic
  useEffect(() => {
    if (!consultId) return;

    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("not_authenticated");
        userIdRef.current = session.user.id;

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
          video: false,
          logLevel: "debug",
        });
        roomRef.current = room;

        await setConsult(consultId, "in_progress");

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

        room.on("disconnected", () => {
          cleanup(); // fire & forget
        });

        window.addEventListener("beforeunload", cleanup);
      } catch (e: any) {
        setErr(e?.message ?? "join_failed");
      }
    })();

    // cleanup must be synchronous
    return () => {
      cleanup(); // don't await
    };
  }, [consultId]);

  // ---- cleanup (sync wrapper) ----
  const cleanup = () => {
    if (roomRef.current && roomRef.current.state !== "disconnected") {
      roomRef.current.disconnect();
    }

    if (userIdRef.current) {
      // fire-and-forget async work
      resetProfile(userIdRef.current);
      setConsult(consultId, "ended");
    }

    roomRef.current = null;
  };

  // const toggleVideo = () => {
  //   setIsVideoOn((prev) => !prev);
  //   roomRef.current?.localParticipant.videoTracks.forEach((pub: any) =>
  //     isVideoOn ? pub.track.disable() : pub.track.enable()
  //   );
  // };

  const toggleVideo = async () => {
  if (!roomRef.current) return;

  if (isVideoOn) {
    // Turn video off
    roomRef.current.localParticipant.videoTracks.forEach((pub: any) =>
      pub.track.disable()
    );
    setIsVideoOn(false);
  } else {
    // If no track exists yet, create one
    if (roomRef.current.localParticipant.videoTracks.size === 0) {
      const track = await createLocalVideoTrack();
      roomRef.current.localParticipant.publishTrack(track);
    } else {
      roomRef.current.localParticipant.videoTracks.forEach((pub: any) =>
        pub.track.enable()
      );
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
    cleanup();
    router.push("/dashboard/doctor");
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
          <h1 className="text-lg font-semibold text-gray-800">Doctor Call</h1>
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

// helpers (fire-and-forget async)
async function resetProfile(userId: string) {
  await supabase.from("profile").update({
    is_assigned: false,
    consult_id: null,
    room: null,
  }).eq("id", userId);
}
async function setConsult(consultId: string, status: string) {
  if (status === "in_progress") {
    await supabase.from("consult").update({
      status: "in_progress",
      started_at: new Date().toISOString(),
    }).eq("id", consultId);
  }
  if (status === "ended") {
    await supabase.from("consult").update({
      status: "ended",
      ended_at: new Date().toISOString(),
    }).eq("id", consultId);
  }
}

export default function DoctorCallPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading call…</div>}>
      <DoctorCallInner />
    </Suspense>
  );
}


