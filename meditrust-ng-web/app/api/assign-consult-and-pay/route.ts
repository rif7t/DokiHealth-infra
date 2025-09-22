import { NextRequest, NextResponse } from "next/server";

export interface ConsultAssignRequest {
  consult_id: string;
  specialty: string;
  symptoms: string;
}

export interface ConsultResponse{
    ok: boolean;
    consult_id: string;
    doctor_id: string;
    status: string;
}

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, ""); // lowercase

  if (!token)
    return NextResponse.json({ error: "No access token" }, { status: 401 });

  try {

  const body = await req.json();
  const consult_id = String(body.consult_id ?? "").trim();
  const specialty = String(body.specialty ?? "").trim();
  console.log("CONSULT", consult_id);
  if (!consult_id || !specialty) {
    return NextResponse.json({ error: "consult_id and specialty required" }, { status: 400 });
  }

  const res = await fetch(
    "https://ygqftwnzqcuykntpbcnp.supabase.co/functions/v1/verify-consult",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        apikey: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY!,
      },
      body: JSON.stringify({ consult_id: consult_id }),
    }
  );
      
      if (!res.ok) throw new Error(await res.text());
      const text = await res.json();
      console.log("CONSULT ASSIGN: ", text);
      return new NextResponse(JSON.stringify(text), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Consult Request Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
    
}
