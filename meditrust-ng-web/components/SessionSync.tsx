// components/SessionSync.tsx
"use client";
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export let accessToken: string | null = null; // global token

export default function SessionSync() {
  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) accessToken = session.access_token;
    });

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      accessToken = session ? session.access_token : null;
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return null;
}