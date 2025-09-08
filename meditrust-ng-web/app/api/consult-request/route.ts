import { NextRequest, NextResponse } from "next/server";

export interface ConsultRequest {
  triage_id: string;
}

export interface ConsultResponse {
  consult_id: string;
}

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization");
  if (!token) {
    return NextResponse.json({ error: "No access token" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const triage_id = String(body.triage_id ?? "").trim();

    if (!triage_id) {
      return NextResponse.json({ error: "Invalid triage id" }, { status: 400 });
    }

    console.log("Triage_id:", triage_id);

    const res = await fetch(
      "https://ygqftwnzqcuykntpbcnp.supabase.co/functions/v1/consult-request",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
          apikey: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY!,
        },
        body: JSON.stringify({ triage_id }),
      }
    );
    
   if (!res.ok) {
  const errorBody = await res.json().catch(() => ({}));
  throw new Error(errorBody.message ?? JSON.stringify(errorBody));
}
    const consult_info = await res.json();
    console.log("CONSULT REQUEST: ", consult_info);
    let consult_id = consult_info.consult_id;
    let specialty = consult_info.specialty;
    return NextResponse.json({consult_id, specialty,});
  } catch (err: any) {
    console.error("Consult Request Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}



