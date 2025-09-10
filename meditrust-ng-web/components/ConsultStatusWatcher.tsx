// "use client";
// import { supabase } from "@/lib/supabaseClient";
// import { useEffect,useRef,  useState } from "react";
// import { Loader2 } from "lucide-react"; // nice spinner icon
// import { KeyboardDismissWrapper } from "@/components/KeyboardDismissWrapper";
// import { Card, CardContent } from "@/components/ui/Card";



//   type OnReady = (payload: { consultId: string; room: string }) => Promise<void> | void;
//   type RC = ReturnType<typeof supabase.channel>;

// export function ConsultStatusWatcher() {
//   const [status, setStatus] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const chRef = useRef<RC | null>(null);
//   const authSubRef = useRef<{ unsubscribe: () => void } | null>(null);

//   useEffect(() => {
//     let cancelled = false;

//     const subscribeWithCurrentToken = async () => {
//       // 1) Ensure socket has the latest token BEFORE we subscribe
//       const { data: { session } } = await supabase.auth.getSession();
//       supabase.realtime.setAuth(session?.access_token ?? "");

//       // 2) (Re)create the channel fresh each time
//       if (chRef.current) supabase.removeChannel(chRef.current);
//       const ch = supabase
//         .channel("consult-realtime")
//         .on(
//           "postgres_changes",
//           { event: "*", schema: "public", table: "consult" },
//           async (payload) => {
//             console.log("Consult Change received!", payload);

//             if (payload.eventType === "UPDATE") {
//               const newRow = (payload as any).new;
//               const newStatus = (payload as any).new?.status;
//               if (typeof newStatus === "string") setStatus(newStatus);

//               if (newStatus === "accepted") {
//                 try {
//                   // your existing flow
//                   const paymentResult = await initPayment((payload as any).new.id);
//                   console.log("Payment initialized:", paymentResult);

//                   const authorization_url= paymentResult.authorization_url;
//                   const reference = paymentResult.reference;

//                    try { localStorage.setItem("paystack_ref", reference); } catch {}

//                   const u = new URL(authorization_url);
//                   if (/(\.|^)paystack\.com$/i.test(u.hostname)) {
//                     window.location.assign(u.toString());
//                   } else {
//                     console.error("Unexpected checkout host:", u.hostname);
//                   }
//                 } catch (err: any) {
//                   console.error("Payment error:", err);
//                   setError(err?.message ?? "Payment failed");
//                 }
//               }
//               else if(newStatus === "connecting" && newRow?.twilio_room){

//               }
//             }
//           }
//         );

//       ch.subscribe((s) => console.log("[consult-realtime] status:", s));
//       chRef.current = ch;
//     };

//     // first subscribe after we’ve set the token
//     subscribeWithCurrentToken();

//     // 3) If the session changes later, refresh socket auth AND resubscribe
//     const { data } = supabase.auth.onAuthStateChange((_evt, newSession) => {
//       supabase.realtime.setAuth(newSession?.access_token ?? "");
//       if (!cancelled) subscribeWithCurrentToken();
//     });
//     authSubRef.current = data.subscription;

//     return () => {
//       cancelled = true;
//       if (chRef.current) supabase.removeChannel(chRef.current);
//       authSubRef.current?.unsubscribe();
//     };
//   }, []);

//   return (
//     <KeyboardDismissWrapper>
//     <div className="fixed inset-0 flex items-center justify-center z-50">
//       <Card className="shadow-2xl rounded-xl border border-blue-200 bg-white w-80">
//         <CardContent className="flex flex-col items-center justify-center p-6">
//           <h3 className="text-blue-500 font-semibold mb-4">Consult Status</h3>
//           <div className="flex flex-col items-center gap-3">
//             <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
//             <p className="text-blue-500 text-lg font-bold">
//               {status ?? "Waiting for updates…"}
//             </p>
//           </div>
//           {error && <p className="text-red-500">{error}</p>}
//         </CardContent>
//       </Card>
//     </div>
//     </KeyboardDismissWrapper>
//   );
// }

// export async function initPayment(consultId: string) {
//   const { data: { session } } = await supabase.auth.getSession();
//   const token = session?.access_token;
//   if (!token) throw new Error("not_authenticated");

//   const res = await fetch("/api/payment-init", {
//     method: "POST",
//     headers: {
//       "content-type": "application/json",
//       authorization: `Bearer ${token}`,
//       // optional: trace or dedupe
//       "x-request-id": crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
//     },
//     body: JSON.stringify({ consult_id: consultId }),
//     cache: "no-store",
//   });

//   let body: any = null;
//   try { body = await res.json(); } catch { /* ignore parse errs */ }

//   if (!res.ok) {
//     const msg = body?.error ?? res.statusText ?? "payment_init_failed";
//     throw new Error(msg);
//   }
//   return body;
// }


// // export async function initPayment(consultId: string) {
// //   try {
// //     console.log("Gets Here");
// //     const {
// //         data: { session },
// //       } = await supabase.auth.getSession();
    
// //     console.log("INITPAYMENT: ");
// //     const response = await fetch("/api/payment-init", {
    
// //       method: "POST",
// //       headers: {
// //           "Content-Type": "application/json",
// //           Authorization: `Bearer ${session.access_token}`,
// //       },
// //       body: JSON.stringify({ consult_id: consultId }),
// //     });

// //     if (!response.ok) {
// //       throw new Error(`Payment init failed: ${response.statusText}`);
// //     }

// //     const initResponse =  await response.json();
// //     return initResponse;
// //     console.log(initResponse);
// //   } catch (error) {
// //     console.error("Error initializing payment:", error);
// //     throw error;
// //   }
// // }



"use client";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { KeyboardDismissWrapper } from "@/components/KeyboardDismissWrapper";
import { Card, CardContent } from "@/components/ui/Card";
import { connect } from "twilio-video";

type RC = ReturnType<typeof supabase.channel>;

export function ConsultStatusWatcher() {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const chRef = useRef<RC | null>(null);
  const authSubRef = useRef<{ unsubscribe: () => void } | null>(null);

  // de-dupe: prevent multiple payment inits / call joins per consult
  const launchedPaymentsRef = useRef<Set<string>>(new Set());
  const joinedCallsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    const subscribeWithCurrentToken = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      supabase.realtime.setAuth(session?.access_token ?? "");

      if (chRef.current) supabase.removeChannel(chRef.current);

      const ch = supabase
        .channel("consult-realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "consult" },
          async (payload) => {
            console.log("Consult Change received!", payload);

            if (payload.eventType !== "UPDATE") return;

            const newRow = (payload as any).new;
            const newStatus: string | undefined = newRow?.status;
            const consultId: string | undefined = newRow?.id;

            if (!consultId || !newStatus) return;
            setStatus(newStatus);

            // PATIENT: when a consult flips to "accepted", start payment (once)
            if (newStatus === "accepted") {
              try {
                const { data: { session } } = await supabase.auth.getSession();
                const uid = session?.user?.id;
                // Guard: only the patient should launch payment
                if (!uid || newRow?.patient_id !== uid) return;

                if (!launchedPaymentsRef.current.has(consultId)) {
                  launchedPaymentsRef.current.add(consultId);

                  const paymentResult = await initPayment(consultId);
                  console.log("Payment initialized:", paymentResult);

                  const authorization_url = paymentResult.authorization_url;
                  const reference = paymentResult.reference;

                  try { localStorage.setItem("paystack_ref", reference); } catch {}

                  const u = new URL(String(authorization_url));
                  if (/(\.|^)paystack\.com$/i.test(u.hostname)) {
                    window.location.assign(u.toString()); // full-page redirect to Paystack
                  } else {
                    console.error("Unexpected checkout host:", u.hostname);
                  }
                }
              } catch (err: any) {
                console.error("Payment error:", err);
                setError(err?.message ?? "Payment failed");
              }
            }

            // BOTH SIDES: when status is "connecting" and room exists, join (once)
            if (newStatus === "connecting") {
              joinConsult(consultId);
            }
          }
        );

      ch.subscribe((s) => console.log("[consult-realtime] status:", s));
      chRef.current = ch;
    };

    // first subscribe after token set
    subscribeWithCurrentToken();

    // resubscribe on auth change
    const { data } = supabase.auth.onAuthStateChange((_evt, newSession) => {
      supabase.realtime.setAuth(newSession?.access_token ?? "");
      if (!cancelled) subscribeWithCurrentToken();
    });
    authSubRef.current = data.subscription;

    return () => {
      cancelled = true;
      if (chRef.current) supabase.removeChannel(chRef.current);
      authSubRef.current?.unsubscribe();
    };
  }, []);

  return (
    <KeyboardDismissWrapper>
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <Card className="shadow-2xl rounded-xl border border-blue-200 bg-white w-80">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <h3 className="text-blue-500 font-semibold mb-4">Consult Status</h3>
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
              <p className="text-blue-500 text-lg font-bold">
                {status ?? "Waiting for updates…"}
              </p>
            </div>
            {error && <p className="text-red-500">{error}</p>}
          </CardContent>
        </Card>
      </div>
    </KeyboardDismissWrapper>
  );
}

// --- Helpers --- //

async function joinConsult(consultId: string) {

  window.location.assign(`/dashboard/patient/call?consult_id=${consultId}`);
}

export async function initPayment(consultId: string) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error("not_authenticated");

  const res = await fetch("/api/payment-init", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
      "x-request-id": crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
    },
    body: JSON.stringify({ consult_id: consultId }),
    cache: "no-store",
  });

  let body: any = null;
  try { body = await res.json(); } catch {}
  if (!res.ok) {
    const msg = body?.error ?? res.statusText ?? "payment_init_failed";
    throw new Error(msg);
  }
  return body; // { authorization_url, reference, amount_kobo, currency }
}
