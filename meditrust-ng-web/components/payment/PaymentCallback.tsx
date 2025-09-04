// // src/pages/PaymentCallback.tsx (or a route component)
// import React from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import { finalizePaymentByConsult, finalizePaymentByReference } from "@/app/api/consult-request/route";

// export default function PaymentCallback() {
//   const [sp] = useSearchParams();
//   const navigate = useNavigate();
//   const [msg, setMsg] = React.useState("Finalizing payment...");

//   React.useEffect(() => {
//     (async () => {
//       const ref = sp.get("reference");
//       // optionally, if you also pass consultId in state/query:
//       const consultId = sp.get("consult_id") || "";

//       try {
//         if (!ref && !consultId) throw new Error("Missing reference or consult_id");
//         const res = ref 
//           ? await finalizePaymentByReference(ref)
//           : await finalizePaymentByConsult(consultId);
                    
//         if (res?.escrow?.status === "held" || res?.verify?.status === "success") {
//           setMsg("Payment confirmed. Joining consult...");
//           // Route to your consult room UI
//           navigate(`/consult/${consultId || res?.escrow?.consult_id || ""}`, { replace: true });
//         } else {
//           setMsg("Payment not confirmed. Please try again.");
//         }
//       } catch (e: any) {
//         setMsg(e?.message || "Payment failed");
//       }
//     })();
//   }, []);

//   return <p>{msg}</p>;
// }
