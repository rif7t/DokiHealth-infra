"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { publish } from "@/lib/eventBus";

export default function DoctorBell() {
  const [open, setOpen] = useState(false);
  const [userid, setUserid] = useState("");
  const [pendingConsults, setPendingConsults] = useState<any[]>([]);

  // fetch pending consults for this doctor
  const fetchConsults = async () => {

    supabase
    .channel('testing')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'profile' },
      payload => console.log('Change:', payload)
    )
    .subscribe();



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

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        className="relative p-2 rounded-lg bg-blue-50 text-blue-600"
        onClick={async () => {
          setOpen(!open);
          if (!open) {
            await fetchConsults();
          }
        }}
      >
        🔔
        {pendingConsults.length > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
        )}
      </button>

      {/* Popup card */}
      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white shadow-lg rounded-lg border p-4 z-50">
          <h3 className="font-semibold mb-2 text-gray-900">Pending Consult</h3>
          {pendingConsults.length === 0 ? (
            <p className="text-sm text-gray-500">No new consults</p>
          ) : (
            <ul className="space-y-2">
              {pendingConsults.map((c) => (
                <li
                  key={c.id}
                  className="p-2 border rounded-lg bg-gray-50 flex flex-col gap-1"
                >
                  <span className="font-medium text-gray-800">
                    Consult #{c.id}
                  </span>
                  <span className="text-xs text-gray-500">{c.symptoms}</span>

                  <div className="flex gap-2 mt-2">
                    {/* Accept button */}
                    <button
                      onClick={async () => {
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
                            body: JSON.stringify({ consult_id: c.id }),
                          });

                          if (!res.ok) throw new Error(await res.text());
                          const result = await res.json();

                          console.log("✅ Consult accepted:", result);
                          alert(`Consult ${c.id} accepted`);

                          publish("consult:accepted", c.id);
                        } catch (err) {
                          console.error("Error accepting consult:", err);
                          alert("❌ Failed to accept consult");
                        }
                      }}
                      className="flex-1 bg-green-500 text-white rounded px-2 py-1"
                    >
                      Accept
                    </button>

                    {/* Reject button */}
                    <button
                      onClick={async () => {
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
                            body: JSON.stringify({ consult_id: c.id }),
                          });

                          if (!res.ok) throw new Error(await res.text());
                          await res.json();

                          alert(`❌ Consult ${c.id} rejected`);
                          console.log("❌ Consult rejected:", c.id);

                          // Tell patient flow to retry
                          await fetch("/api/verify-consult", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ consult_id: c.id }),
                          });

                          publish("consult:rejected", c.id);
                        } catch (err) {
                          console.error("Error rejecting consult:", err);
                          alert("❌ Failed to reject consult");
                        }
                      }}
                      className="flex-1 bg-red-500 text-white rounded px-2 py-1"
                    >
                      Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
