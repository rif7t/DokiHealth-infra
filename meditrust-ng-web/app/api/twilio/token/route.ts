// app/api/twilio/token/route.ts
import { NextResponse } from "next/server";
import { jwt } from "twilio";
import { createClient } from "@supabase/supabase-js";


const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID!;
const TWILIO_API_KEY_SID = process.env.TWILIO_API_KEY_SID!;
const TWILIO_API_KEY_SECRET = process.env.TWILIO_API_KEY_SECRET!;

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "No auth" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!  // or use admin key here
    );
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const { consult_id } = await req.json();
    if (!consult_id) return NextResponse.json({ error: "Missing consult_id" }, { status: 400 });

    // Check DB: is this consult assigned to this user?
    const { data: consult } = await supabase
      .from("consult")
      .select("id, patient_id, doctor_id")
      .eq("id", consult_id)
      .maybeSingle();

    if (!consult) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (![consult.patient_id, consult.doctor_id].includes(user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    

    // Safe: mint Twilio token
    const videoGrant = new jwt.AccessToken.VideoGrant({ room: `consult_${consult_id}` });
    const accessToken = new jwt.AccessToken(
      TWILIO_ACCOUNT_SID,
      TWILIO_API_KEY_SID,
      TWILIO_API_KEY_SECRET,
      { identity: user.id }
    );
    accessToken.addGrant(videoGrant);
    if(consult.patient_id === user.id){
      accessToken.identity = `patient_${user.id}`;
    }
    if(consult.doctor_id === user.id){
      accessToken.identity = `doctor_${user.id}`;
    }

    console.log("Access Token: ", accessToken.toJwt());
  
    return NextResponse.json({
      token: accessToken.toJwt(),
      room: `consult_${consult_id}`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

