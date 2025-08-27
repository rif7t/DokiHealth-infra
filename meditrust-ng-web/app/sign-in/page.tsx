"use client";
import { Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import BackgroundLayout from "@/components/BackgroundLayout";
import MobileOnly from "@/components/MobileOnly";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [canResend, setCanResend] = useState(false);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/profile` },
    });

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      setSent(true);
      setCanResend(false);

      // allow resend after 10s
      setTimeout(() => setCanResend(true), 10000);
    }
  };

  return (
    <MobileOnly>
      <BackgroundLayout>
        <div className="flex flex-col items-center justify-center h-full px-6">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-white">
              Let's get you started!
            </h1>
            <p className="text-gray-300 text-sm mt-1">
              Securely sign in with your email
            </p>
          </div>

          <div className="w-full max-w-sm space-y-4">
            {sent ? (
              <div className="bg-[#1A2622]/90 border border-gray-700 rounded-xl p-6 shadow-lg text-center">
                <p className="text-sm text-gray-300 mb-4">
                  ✅ Check your email for a magic link to continue.
                </p>

                {canResend ? (
                  <button
                    onClick={() => handleLogin()}
                    disabled={loading}
                    className="w-full py-2 rounded-lg bg-[#00CFC1] text-[#0A0F0D] font-semibold shadow-md disabled:opacity-50"
                  >
                    {loading ? "Resending..." : "Resend Link"}
                  </button>
                ) : (
                  <p className="text-xs text-gray-500">
                    You can resend in a few seconds…
                  </p>
                )}
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-3 text-gray-400"
                    size={18}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#0A0F0D]/80 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00CFC1]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-[#00CFC1] text-[#0A0F0D] font-semibold shadow-md disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Magic Link"}
                </button>
              </form>
            )}
          </div>
        </div>
      </BackgroundLayout>
    </MobileOnly>
  );
}
