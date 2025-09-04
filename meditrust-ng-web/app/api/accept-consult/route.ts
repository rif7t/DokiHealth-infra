import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, ""); // lowercase

  if (!token)
    return NextResponse.json({ error: "No access token" }, { status: 401 });

  try {

  const body = await req.json();
  const consult_id = String(body.consult_id ?? "").trim();
  
  console.log("CONSULT", consult_id);
  if (!consult_id ) {
    return NextResponse.json({ error: "consult_id required" }, { status: 400 });
  }

  const res = await fetch(
    "https://ygqftwnzqcuykntpbcnp.supabase.co/functions/v1/consult-accept",
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
      
      if (!res.ok) throw new Error(await res.json());
      const text = await res.json();
      console.log("CONSULT ASSIGN: ", text);
      return  NextResponse.json(text);
  } catch (err: any) {
    console.error("Consult Request Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
    
}