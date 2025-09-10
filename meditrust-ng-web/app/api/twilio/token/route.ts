// app/api/twilio/token/route.ts (Next.js App Router, Node runtime)
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import twilio from "twilio";

const URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const ACC = process.env.TWILIO_ACCOUNT_SID!;       // ACxxxxxxxx
const KEY = process.env.TWILIO_API_KEY_SID!;       // SKxxxxxxxx
const SEC = process.env.TWILIO_API_KEY_SECRET!;    // secret

export async function POST(req: Request) {
  // 1) Auth: bearer from the browser session
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "missing_bearer_token" }, { status: 401 });

  const supa = createClient(URL, ANON, { global: { headers: { Authorization: `Bearer ${token}` } } });
  const { data: u } = await supa.auth.getUser();
  if (!u?.user) return NextResponse.json({ error: "invalid_token" }, { status: 401 });

  // 2) Input
  const { consult_id } = await req.json().catch(() => ({}));
  if (!consult_id) return NextResponse.json({ error: "consult_id_required" }, { status: 422 });

  // 3) Authorize & readiness checks (prevents rogue joins)
const { data: c, error: cErr } = await supa
  .from("consult")
  .select("id, patient_id, assigned_doctor_id, status, twilio_room")
  .eq("id", consult_id)
  .maybeSingle();

if (cErr || !c) {
  return NextResponse.json({ error: "consult_not_found" }, { status: 404 });
}

const caller = u.user.id;
const allowed = caller === c.patient_id || caller === c.assigned_doctor_id;
if (!allowed) {
  return NextResponse.json({ error: "forbidden" }, { status: 403 });
}

// Fetch escrow separately (new!)
let paid = false;
const { data: esc, error: eErr } = await supa
  .from("escrow")
  .select("status")
  .eq("consult_id", consult_id)
  .order("created_at", { ascending: false })
  .limit(1)
  .maybeSingle();

if (esc) {
  paid = esc.status === "held" || esc.status === "paid";
} else if (eErr) {
  // If doctor can't read escrow due to RLS, you can rely on the webhook’s state:
  // Only allow doctor if consult is already 'connecting' (set by webhook after verifying payment).
  const doctorTrying = caller === c.assigned_doctor_id;
  if (!(doctorTrying && c.status === "connecting")) {
    return NextResponse.json({ error: "escrow_check_failed" }, { status: 403 });
  }
  paid = true; // trust webhook gate for doctor path
}

const ready = c.status === "connecting" && !!c.twilio_room;
if (!paid || !ready) {
  return NextResponse.json({ error: "not_ready" }, { status: 409 });
}
}
