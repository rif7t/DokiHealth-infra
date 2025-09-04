import { Data } from "framer/data/Data.js";
import { NextRequest, NextResponse } from "next/server";

export interface TriageRequest {
  symptoms: string;
}

export interface TriageResponse {
  triage_id: string;
  symptoms: string;
  specialty: string;
  [key: string]: any;
}

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, ""); // lowercase

  if (!token)
    return NextResponse.json({ error: "No access token" }, { status: 401 });

  try {
    //const body = await req.json().catch(()=>({}));
    const { symptoms }: TriageRequest = await req.json();
   

    if (!symptoms || typeof symptoms !== "string") {
      return NextResponse.json({ error: "Invalid symptoms" }, { status: 400 });
    }

    const res = await fetch(
      "https://ygqftwnzqcuykntpbcnp.supabase.co/functions/v1/triage",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          apikey: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY!,
        },
        body: JSON.stringify({ symptoms }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: errText }, { status: res.status });
    }

    const data: TriageResponse = await res.json();
    
    const dataStr : string = JSON.stringify(data);

    console.log("TRIAGE ID RESPONSE", dataStr);

    return NextResponse.json(data);
  } catch (err) {
    console.error("Triage API Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}