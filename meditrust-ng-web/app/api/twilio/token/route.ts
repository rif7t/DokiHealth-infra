// app/api/twilio/token/route.ts
export const runtime = "nodejs"; // needed for the Node Twilio SDK

import { NextResponse } from "next/server";
import twilio from "twilio";

export async function POST(req: Request) {
  const { consult_id, room } = await req.json().catch(() => ({}));
  if (!consult_id && !room) {
    return NextResponse.json({ error: "consult_id_or_room_required" }, { status: 422 });
  }

  // This is exactly how Twilio’s docs do it: server-side AccessToken + VideoGrant.
  const AccessToken = twilio.jwt.AccessToken;
  const VideoGrant  = AccessToken.VideoGrant;

  const at = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID!,      // ACxxxxxxxx
    process.env.TWILIO_API_KEY_SID!,      // SKxxxxxxxx
    process.env.TWILIO_API_KEY_SECRET!,   // secret
    { identity: "user-" + Date.now(), ttl: 300 } // set your real identity (e.g., user id)
  );

  const roomName = room ?? `consult_${consult_id}`;
  at.addGrant(new VideoGrant({ room: roomName }));

  return NextResponse.json({ token: at.toJwt(), room: roomName });
}
