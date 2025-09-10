import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization");
  if (!token) {
    return NextResponse.json({ error: "No access token" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const consult_id = String(body.consult_id ?? "").trim();

    if (!consult_id) {
      return NextResponse.json({ error: "Invalid consult id" }, { status: 400 });
    }

    console.log("Consult_id for payment Init:", consult_id);

    const res = await fetch(
      "https://ygqftwnzqcuykntpbcnp.supabase.co/functions/v1/payments",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
          apikey: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY!,
        },
        body: JSON.stringify({ consult_id, action: "init" }),
      }
    );
    if (!res.ok) {
  const errorBody = await res.json().catch(() => ({}));
  throw new Error(errorBody.message ?? JSON.stringify(errorBody));
    }

    const payment_info = await res.json();
    let authorization_url = payment_info.authorization_url;
    let reference = payment_info.reference;
    let amount_kobo = payment_info.amount_kobo;
    let currency = payment_info.currency;
    
    return NextResponse.json({authorization_url: String(authorization_url), 
      reference: String(reference), amount_kobo: Number(amount_kobo), currency: String(currency),});
  } catch (err: any) {
    console.error("Payment Init Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}



