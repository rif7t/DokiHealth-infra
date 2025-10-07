"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  consultId: string;
  doctorId: string;
  isAssigned?:boolean;
  onUnmount?: (reason: "ended" | "unassigned" | "error") => void;
};

export default function DoctorConsultWatcher({ consultId, doctorId, isAssigned=true, onUnmount }: Props) {
  const [status, setStatus] = useState<
    "watching" | "ended" | "unassigned" | "error"
  >("watching");

   useEffect(() => {
    
    if (!isAssigned) {
      console.log(" Doctor unassigned — stopping watcher");
      setStatus("unassigned");
      onUnmount?.("unassigned");
    }
  }, [isAssigned, onUnmount]);

  useEffect(() => {
    let cancelled = false;

    async function prime() {
      const { data, error } = await supabase
        .from("consult")
        .select("id, status, doctor_id")
        .eq("id", consultId)
        .maybeSingle();

      if (error || !data || data.doctor_id !== doctorId) {
        if (!cancelled) {
          setStatus("unassigned");
          onUnmount?.("unassigned");
        }
        return;
      }

      // subscribe to consult changes
      const channel = supabase
        .channel(`consult:${consultId}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "consult", filter: `id=eq.${consultId}` },
          (payload) => {
            const row = payload.new as any;
            if (row.status === "ended") {
              setStatus("ended");
              onUnmount?.("ended");
              channel.unsubscribe();
              return;
            }
            if (row.doctor_id !== doctorId) {
              setStatus("unassigned");
              onUnmount?.("unassigned");
              channel.unsubscribe();
              return;
            }
          }
        )
        .subscribe();

      // cleanup
      return () => {
        channel.unsubscribe();
      };
    }

    prime().catch(() => {
      if (!cancelled) {
        setStatus("error");
        onUnmount?.("error");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [consultId, doctorId, onUnmount]);

  // ---- UI card ----
  const getCard = () => {
    switch (status) {
      case "watching":
        return {
          title: `Consult #${consultId}`,
          message: "Waiting for Patient to complete payment, monitoring consult status…",
          color: "border-blue-500 bg-blue-50 text-blue-800",
        };
      case "ended":
        return {
          title: `Consult #${consultId}`,
          message: " This consult has ended.",
          color: "border-green-500 bg-green-50 text-green-800",
        };
      case "unassigned":
        return {
          title: `Consult #${consultId}`,
          message: " You are no longer assigned to this consult.",
          color: "border-yellow-500 bg-yellow-50 text-yellow-800",
        };
      case "error":
        return {
          title: `Consult #${consultId}`,
          message: "❌ Error while monitoring consult.",
          color: "border-red-500 bg-red-50 text-red-800",
        };
      default:
        return { title: "", message: "", color: "bg-gray-100" };
    }
  };

  const card = getCard();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
      <div
        className={`w-full max-w-md rounded-xl shadow-lg border p-6 ${card.color}`}
      >
        <h2 className="text-lg font-semibold mb-2">{card.title}</h2>
        <p className="text-sm">{card.message}</p>
      </div>
    </div>
  );
}
