import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react"; // nice spinner icon
import { Card, CardContent } from "@/components/ui/Card";



  
  export function ConsultStatusWatcher() {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("SETTING UP SUBSCRIPTION");

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        supabase.realtime.setAuth(session.access_token);
        console.log("WE ARE AUTH (from getSession)");
      }
    });

    // Handle session changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (newSession) {
        supabase.realtime.setAuth(newSession.access_token);
        console.log("WE ARE AUTH (from onAuthStateChange)");
      }
    });

    // Create the subscription channel
    const channel = supabase
      .channel("consult-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "consult" },
        async (payload) => {
          console.log("Consult Change received!", payload);

          if (payload.eventType === "UPDATE") {
            const newStatus = payload.new.status;
            setStatus(newStatus);

            if (newStatus === "accepted") {
              try {
                const paymentResult = await initPayment(payload.new.id);
                console.log("Payment initialized:", paymentResult);
              } catch (err: any) {
                console.error("Payment error:", err);
                setError(err.message ?? "Payment failed");
              }
            }
          }
        }
      )
      .subscribe((status) => console.log("Subscription status:", status));

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
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
  );
}


export async function initPayment(consultId: string) {
  try {
    console.log("Gets Here");
    const {
        data: { session },
      } = await supabase.auth.getSession();
    
    console.log("INITPAYMENT: ");
    const response = await fetch("/api/payment-init", {
    
      method: "POST",
      headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ consult_id: consultId }),
    });

    if (!response.ok) {
      throw new Error(`Payment init failed: ${response.statusText}`);
    }

    const initResponse =  await response.json();
    return initResponse;
    console.log(initResponse);
  } catch (error) {
    console.error("Error initializing payment:", error);
    throw error;
  }
}