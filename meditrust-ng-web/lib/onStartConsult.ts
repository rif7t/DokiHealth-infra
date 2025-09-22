// lib/onStartConsult.ts
import { publish } from "@/lib/eventBus";
// lib/onStartConsult.ts
import { getSession } from "./sessionCache";

type TriageResponse = {
  triage_id: string;
  // add other fields you expect here
};

export async function startConsult(symptom: string) {
  const session = getSession();
  if (!session) throw new Error("No active session. Please sign in again.");

  try {
    // 1. Call Triage API
    const res = await fetch("/api/triage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ symptoms: symptom }),
    });
    if (!res.ok) throw new Error(await res.text());
    const result = (await res.json()) as TriageResponse;
    const triageID = result.triage_id;

    // 2. Request a consult
    const res1 = await fetch("/api/consult-request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ triage_id: triageID }),
    });
    if (!res1.ok) throw new Error(await res1.text());
    const output = await res1.json();

    // 3. Assign doctor + start payment flow
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
    if (!res2.ok) throw new Error(await res2.text());
    const result2 = await res2.json();

    console.log("Consult status:", result2.status);
    console.log("Doctor assigned:", result2.doctor_id);

    // 4. Publish event back to app
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


