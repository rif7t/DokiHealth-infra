// lib/onStartConsult.ts
import { supabase } from "@/lib/supabaseClient";
import { publish } from "@/lib/eventBus";
import { TriageResponse } from "@/app/api/triage/route";

export async function startConsult(symptom: string) {
  try {
    // 1. Get session
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    // 2. Call Triage API
    const res = await fetch("/api/triage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ symptoms: symptom }),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText);
    }
    const result: TriageResponse = await res.json();
    const triageID = result.triage_id;

    // 3. Request a consult
    const res1 = await fetch("/api/consult-request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ triage_id: triageID }),
    });
    if (!res1.ok) {
      const errText = await res1.text();
      throw new Error(errText);
    }
    const output = await res1.json();

    // 4. Assign doctor + start payment flow
    const res2 = await fetch("/api/assign-consult-and-pay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        consult_id: output.consult_id,
        specialty: output.specialty,
      }),
    });

    if (!res2.ok) {
      const errText = await res2.text();
      throw new Error(errText);
    }
    const result2 = await res2.json();
    
    console.log("Consult status:", result2.status);
    console.log("Doctor assigned:", result2.doctor_id);

    // 5. Publish event back to app
    if (result2.status === "requested") {
      publish("requested", 1);
    } else {
      publish("not requested", 0);
    }

    return result2;
  } catch (e) {
    console.error("Consult Request Error:", e);
    throw e;
  }
}
