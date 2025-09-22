"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

// --- heartbeat hook ---
function usePresence(userId: string | null) {
  useEffect(() => {
    if (!userId) return;

    const updatePresence = async () => {
      await supabase
        .from("profile")
        .update({
          is_online: true,
          last_seen: new Date().toISOString(),
        })
        .eq("id", userId);
    };

    // run immediately when mounted
    updatePresence();

    // heartbeat every 20s
    const interval = setInterval(updatePresence, 20_000);

    // cleanup on unmount → mark offline
    return () => {
      clearInterval(interval);
      supabase
        .from("profile")
        .update({ is_online: false })
        .eq("id", userId);
    };
  }, [userId]);
}

// --- doctor layout ---
export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // check current session on mount
    const getInitialUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getInitialUser();

    // listen for login/logout/session changes
    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUserId(session.user.id);
        } else {
          setUserId(null); // logged out
        }
      }
    );

    return () => {
      subscription?.subscription.unsubscribe();
    };
  }, []);

  usePresence(userId);

  return <div className="doctor-dashboard">{children}</div>;
}
