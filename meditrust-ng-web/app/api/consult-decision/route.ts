import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_PUBLISHABLE_KEY!
);

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { action } = await req.json(); // "accept" or "reject"
    const consultId = params.id;

    if (!["accept", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const status = action === "accept" ? "accepted" : "rejected";

    const { error } = await supabase
      .from("consult")
      .update("status", )
      .eq("id", consultId);

    if (error) throw error;

    return NextResponse.json({ ok: true, consult_id: consultId, status });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
