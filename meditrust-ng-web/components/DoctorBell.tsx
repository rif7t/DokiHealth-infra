"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { publish } from "@/lib/eventBus";
import { useRouter } from "next/navigation";
import DoctorConsultWatcher from "@/components/DoctorConsultWatcher";

export default function DoctorBell({ pendingConsults, setPendingConsults }) {
  const [open, setOpen] = useState(false);
  const [userid, setUserid] = useState("");
  const [watching, setWatching] = useState(false);
  const [activeConsultId, setActiveConsultId] = useState<string | null>(null);
  const [loadingConsults, setLoadingConsults] = useState(false);

  const popupRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // --- Close popup when clicking outside or pressing Escape ---
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
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

  // --- Fetch pending consults for this doctor ---
  const fetchConsults = async () => {
    setLoadingConsults(true);

    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) {
      setLoadingConsults(false);
      return;
    }
    setUserid(user.user.id);

    const { data, error } = await supabase
      .from("consult")
      .select("*")
      .eq("doctor_id", user.user.id)
      .eq("status", "requested")
      .order("requested_at", { ascending: true })
      .limit(1);

    // Small delay to allow fields like `symptoms` to be populated in DB
    // (sometimes they’re inserted in a separate query/transaction)
    if (!error && data && data.length > 0) {
      const waitUntilReady = async (retries = 5) => {
        for (let i = 0; i < retries; i++) {
          const consult = data[0];
          if (consult.symptoms && consult.symptoms.trim() !== "") {
            setPendingConsults(data);
            setLoadingConsults(false);
            return;
          }

          // Wait 1 second and recheck
          await new Promise((r) => setTimeout(r, 1000));
          const { data: updated } = await supabase
            .from("consult")
            .select("*")
            .eq("id", consult.id)
            .single();

          if (updated?.symptoms && updated.symptoms.trim() !== "") {
            setPendingConsults([updated]);
            setLoadingConsults(false);
            return;
          }
        }

        // If not ready after retries, still show fallback
        setPendingConsults(data);
        setLoadingConsults(false);
      };

      await waitUntilReady();
    } else {
      setLoadingConsults(false);
    }
  };

  // --- Accept consult ---
  const acceptConsult = async (consultId: number) => {
    try {
      setOpen(false);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/accept-consult", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ consult_id: String(consultId) }),
      });

      if (!res.ok) throw new Error(await res.text());
      await res.json();

      setPendingConsults((prev) => prev.filter((c) => c.id !== consultId));
      publish("consult:accepted", consultId);
      setActiveConsultId(String(consultId));
      setWatching(true);
    } catch (err) {
      console.error("Error accepting consult:", err);
      alert("❌ Failed to accept consult");
    }
  };

  // --- Reject consult ---
  const rejectConsult = async (consultId: number) => {
    try {
      setOpen(false);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/reject-consult", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ consult_id: String(consultId) }),
      });

      if (!res.ok) throw new Error(await res.text());
      await res.json();

      await fetch("/api/verify-consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consult_id: String(consultId) }),
      });

      setPendingConsults((prev) => prev.filter((c) => c.id !== consultId));
      publish("consult:rejected", consultId);
    } catch (err) {
      console.error("Error rejecting consult:", err);
      alert("❌ Failed to reject consult");
    }
  };

 return (
  <div className="relative">
    {/* 🔔 Bell button */}
    <button
      onClick={() => setOpen((prev) => !prev)}
      className="relative text-2xl"
    >
      🔔
      {pendingConsults.length > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5">
          {1}
        </span>
      )}
    </button>

    {/* Popup */}
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

          {loadingConsults ? (
            <p className="text-sm text-gray-500 animate-pulse">
              Loading consult...
            </p>
          ) : pendingConsults.length === 0 ? (
            <p className="text-sm text-gray-500">No new consults</p>
          ) : (
            <ul className="space-y-3">
              {pendingConsults.slice(-1).map((c) => {
                const isIncomplete =
                  !c.symptoms || c.symptoms.trim() === "" || c.symptoms === null;

                return (
                  <li
                    key={c.id}
                    className="p-3 border rounded-lg bg-gray-50 flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-800">
                        Consult #{c.id}
                      </span>
                      <span className="text-xs text-gray-500">
                        {c.created_at
                          ? new Date(c.created_at).toLocaleString()
                          : ""}
                      </span>
                    </div>

                    {isIncomplete ? (
                      <p className="text-sm text-gray-400 italic animate-pulse">
                        Loading consult details…
                      </p>
                    ) : (
                      <span className="text-sm text-gray-600">
                        {c.symptoms}
                      </span>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button
                        disabled={isIncomplete}
                        onClick={() => acceptConsult(c.id)}
                        className={`flex-1 rounded-md px-3 py-1 transition ${
                          isIncomplete
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-green-500 text-white hover:bg-green-600"
                        }`}
                      >
                        Accept
                      </button>
                      <button
                        disabled={isIncomplete}
                        onClick={() => rejectConsult(c.id)}
                        className={`flex-1 rounded-md px-3 py-1 transition ${
                          isIncomplete
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-red-500 text-white hover:bg-red-600"
                        }`}
                      >
                        Reject
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </motion.div>
      )}
    </AnimatePresence>

    {/* Active consult watcher */}
    {watching && activeConsultId && userid && (
      <DoctorConsultWatcher
        consultId={activeConsultId}
        doctorId={userid}
        onUnmount={(reason) => {
          setWatching(false);
          setActiveConsultId(null);
          router.push("/dashboard/doctor");
        }}
      />
    )}
  </div>
);

}
