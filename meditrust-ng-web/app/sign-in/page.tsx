"use client";
import { KeyboardIcon, Mail } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import BackgroundLayout from "@/components/BackgroundLayout";
import MobileOnly from "@/components/MobileOnly";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let userError = null;

      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        userError = error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        userError = error;
      }

      if (userError) {
        alert(userError.message);
        return;
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        alert("Could not fetch session after authentication.");
        return;
      }

      const res = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();

      if (data.error) {
        router.replace("/profile");
        return;
      }

      if (data.profile.role === "doctor") {
        router.replace("/dashboard/doctor");
      } else if (data.profile.role === "patient") {
        router.replace("/dashboard/patient");
      } else {
        router.replace("/profile");
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileOnly>
      <BackgroundLayout>
        <div className="flex flex-col items-center justify-center h-full px-6 mt-16">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-white">
              {isSignUp ? "Let's get you started!" : "Welcome back!"}
            </h1>
            <p className="text-white text-sm mt-1">
              {isSignUp
                ? "Sign up with your email to begin"
                : "Sign in with your email and password"}
            </p>
          </div>

          <div className="w-full max-w-sm space-y-4">
            <form onSubmit={handleAuth} className="space-y-4">
              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 
                             placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00CFC1] focus:border-[#00CFC1]"
                  required
                />
              </div>

              {/* Password */}
              <div className="relative">
                <KeyboardIcon className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(p) => setPassword(p.target.value)}
                  placeholder="Your password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 
                             placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00CFC1] focus:border-[#00CFC1]"
                  required
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#00CFC1] text-[#0A0F0D] font-semibold shadow-md hover:bg-[#00B5A8] disabled:opacity-50 transition-colors"
              >
                {loading
                  ? isSignUp
                    ? "Signing up..."
                    : "Signing in..."
                  : isSignUp
                  ? "Sign Up"
                  : "Sign In"}
              </button>
            </form>

            {/* Toggle Between Sign In & Sign Up */}
            <p className="text-center text-sm text-white mt-4">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                type="button"
                className="text-yellow-300 font-medium hover:underline"
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </div>
        </div>
      </BackgroundLayout>
    </MobileOnly>
  );
}