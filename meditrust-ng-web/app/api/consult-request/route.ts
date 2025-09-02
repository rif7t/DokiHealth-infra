
import { NextRequest, NextResponse } from "next/server";

export interface TriageResponse {
  triage_id: string;
}
export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, ""); // lowercase

  if (!token)
    return NextResponse.json({ error: "No access token" }, { status: 401 });

  try {
    //const body = await req.json().catch(()=>({}));
    const { triage_id }: triage_id = await req.json();
    console.log(triage_id);

    if (!triage_id) {
      return NextResponse.json({ error: "Invalid triage id" }, { status: 400 });
    }

    const res = await fetch(
      "https://ygqftwnzqcuykntpbcnp.supabase.co/functions/v1/consult-request",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          apikey: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY!,
        },
        body: JSON.stringify({ triage_id }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: errText }, { status: res.status });
    }

    const data: TriageResponse = await res.json();

    return NextResponse.json(data);
  } catch (err) {
    console.error("consult-request API Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
