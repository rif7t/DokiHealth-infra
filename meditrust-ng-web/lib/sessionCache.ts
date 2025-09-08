// lib/sessionCache.ts
import { supabase } from "@/lib/supabaseClient";

let currentSession: any = null;

// Initialize once
(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  currentSession = session;
})();

supabase.auth.onAuthStateChange((_event, newSession) => {
  currentSession = newSession;
});

export function getSession() {
  return currentSession;
}
