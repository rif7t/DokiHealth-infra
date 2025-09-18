// app/api/banks/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://api.paystack.co/bank", {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const data = await res.json();
    if (!data.status) {
      return NextResponse.json({ error: data.message }, { status: 400 });
    }

    // Only return what you need
    const banks = data.data.map((b: any) => ({
      name: b.name,
      code: b.code,
      slug: b.slug,
    }));

    return NextResponse.json({ banks });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
