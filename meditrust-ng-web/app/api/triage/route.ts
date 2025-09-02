import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState} from "react";

export interface TriageRequest {
  symptoms: string;
}

export interface TriageResponse {
  triage_id: string;
  symptoms: string;
  specialty: string;
  [key: string]: any;
}

export default async function SessionChecker() {
    const [session, setSession] = useState(null);
export async function POST(req: NextRequest) {
  const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

  req.headers.get("authorization")?.replace(/^Bearer\s+/i, ""); // lowercase 
  const token = session.access_token//req.headers.get("authorization")?.replace(/^Bearer\s+/i, ""); // lowercase
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      const token = data.session.access_token;
    });
  }, []);
  if (!token)
    return NextResponse.json({ error: "No access token" }, { status: 401 });

  try {
    //const body = await req.json().catch(()=>({}));
    const { symptoms }: TriageRequest = await req.json();
    console.log(symptoms);

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

    return NextResponse.json(data);
  } catch (err) {
    console.error("Triage API Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}