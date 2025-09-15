"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { publish } from "@/lib/eventBus";

export default function DoctorBell({ pendingConsults, setPendingConsults }) {
  const [open, setOpen] = useState(false);
  const [userid, setUserid] = useState("");
  

  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
      fetchConsults();
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };

    
  
  }, [open]);

  // fetch pending consults for this doctor
  const fetchConsults = async () => {

    // supabase
    // .channel('testing')
    // .on(
    //   'postgres_changes',
    //   { event: '*', schema: 'public', table: 'profile' },
    //   payload => console.log('Change:', payload)
    // )
    // .subscribe();

  //   supabase
  // .channel("testing")
  // .on(
  //   "postgres_changes",
  //   { event: "UPDATE", schema: "public", table: "profile" },
  //   (payload) => {
  //     console.log("Change:", payload);
  //     if(payload.new.status === true ){
        
  //     }
  //   }
  // )
  // .subscribe();





    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) return;
    setUserid(user.user.id);

    const { data, error } = await supabase
      .from("consult")
      .select("*")
      .eq("doctor_id", user.user.id)
      .eq("status", "requested")
      .order("requested_at", { ascending: true })
      .limit(1);

    if (!error && data) setPendingConsults(data);
  };
  // accept consult
  const acceptConsult = async (consultId: number) => {
  try {
    setOpen(false);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch("/api/accept-consult", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      // 👇 convert number → string because your API expects string
      body: JSON.stringify({ consult_id: String(consultId) }),
    });

    if (!res.ok) throw new Error(await res.text());
    const result = await res.json();

    console.log("✅ Consult accepted:", result);
    alert(`Consult ${consultId} accepted`);

    // remove from pending list
    setPendingConsults((prev) => prev.filter((c) => c.id !== consultId));

    publish("consult:accepted", consultId);
  } catch (err) {
    console.error("Error accepting consult:", err);
    alert("❌ Failed to accept consult");
  }
};

  // reject consult
  const rejectConsult = async (consultId: number) => {
  try {
    setOpen(false);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch("/api/reject-consult", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      // 👇 convert number → string for API
      body: JSON.stringify({ consult_id: String(consultId) }),
    });

    if (!res.ok) throw new Error(await res.text());
    await res.json();

    alert(`❌ Consult ${consultId} rejected`);
    console.log("❌ Consult rejected:", consultId);

    // Tell patient flow to retry
    await fetch("/api/verify-consult", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ consult_id: String(consultId) }),
    });

    // remove from pending list
    setPendingConsults((prev) => prev.filter((c) => c.id !== consultId));

    publish("consult:rejected", consultId);
  } catch (err) {
    console.error("Error rejecting consult:", err);
    alert("❌ Failed to reject consult");
  }
};
return (
    <div className="relative">
      {/* 🔔 bell button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative text-2xl"
      >
        🔔
        {pendingConsults.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5">
            {pendingConsults.length}
          </span>
        )}
      </button>

      {/* Popup card */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={popupRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-80 max-h-[70vh] overflow-y-auto bg-white shadow-lg rounded-xl border p-4 z-50"
          >
            <h3 className="font-semibold mb-3 text-gray-900">Pending Consult</h3>

            {pendingConsults.length === 0 ? (
              <p className="text-sm text-gray-500">No new consults</p>
            ) : (
              <ul className="space-y-3">
                {pendingConsults.map((c) => (
                  <li
                    key={c.id}
                    className="p-3 border rounded-lg bg-gray-50 flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-800">
                        Consult #{c.id}
                      </span>
                      <span className="text-xs text-gray-500">
                        {c.created_at ? new Date(c.created_at).toLocaleString() : ""}
                      </span>
                    </div>

                    <span className="text-sm text-gray-600">{c.symptoms}</span>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => acceptConsult(c.id)}
                        className="flex-1 bg-green-500 text-white rounded-md px-3 py-1 hover:bg-green-600 transition"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => rejectConsult(c.id)}
                        className="flex-1 bg-red-500 text-white rounded-md px-3 py-1 hover:bg-red-600 transition"
                      >
                        Reject
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
