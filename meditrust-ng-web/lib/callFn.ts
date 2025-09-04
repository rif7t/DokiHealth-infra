// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";


// src/lib/callFn.ts
import { supabase } from "./supabaseClient";

function fnBase() {

  // derive from SUPABASE_URL
  const u = new URL( process.env.NEXT_PUBLIC_SUPABASE_URL!);

  const host = u.host.replace(".supabase.co", ".functions.supabase.co");
  return `https://${host}`;
}

export async function callFn<T = any>(name: string, payload: any): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? "";
  const res = await fetch(`${fnBase()}/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || `${name} failed`);
  }
  return res.json();
}
