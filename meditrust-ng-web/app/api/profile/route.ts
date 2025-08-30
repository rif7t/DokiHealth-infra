import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Helper to create a Supabase client with the user's access token
const createSupabaseServer = (accessToken?: string) => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_PUBLISHABLE_KEY!,
    {
      global: {
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : undefined,
      },
    }
  );
};

export async function GET(req: NextRequest) {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token)
    return NextResponse.json({ profile: null }, { status: 401 });

  const supabase = createSupabaseServer(token);

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user)
    return NextResponse.json({ profile: null }, { status: 401 });

  const { data: profile, error: profileError } = await supabase
    .from("profile")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError)
    return NextResponse.json({ error: profileError.message }, { status: 400 });

  return NextResponse.json({ profile });
}

export async function PUT(req: NextRequest) {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token)
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const supabase = createSupabaseServer(token);

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user)
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { profile, isDoctor } = await req.json();

  const _user = {
    id: user.id,
    role: isDoctor ? "doctor" : "patient",
    title: profile.title,
    first_name: profile.first_name,
    last_name: profile.last_name,
    phone_number: profile.phone_number,
    specialty: isDoctor ? profile.specialty || "General Practice" : null,
    verified: isDoctor,
    is_available: isDoctor,
    is_online: true,
    email: profile?.email || user.email,
  };

  const { error: e2 } = await supabase
    .from("profile")
    .update(_user)
    .eq("id", user.id)
    .single();

  if (e2)
    return NextResponse.json({ error: e2.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}