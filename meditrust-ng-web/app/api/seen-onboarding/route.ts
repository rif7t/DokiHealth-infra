import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("seenOnboarding", "true", { path: "/", httpOnly: false });
  return res;
}

