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

    let userError;
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      userError = error;
    } else {
      console.log("sign-in");
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log(data.user);
      userError = error;
    }

    setLoading(false);

    if (userError) {
      alert(userError.message);
    } else {
      // Get fresh access token
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        alert("No session found after auth");
        return;
      }

      // Call API with token
      const res = await fetch("/api/profile", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await res.json();

      console.log(data.profile);

      if (data.error) {
        alert(data.error);
        return;
      }

      // Decide dashboard based on role or create a profile
      if (data.profile.role == "doctor") {
        router.replace("/dashboard/doctor");
      } else if (data.profile.role == "patient") {
        router.replace("/dashboard/patient");
      } else router.replace("/profile");
    }
  };

  return (
    <MobileOnly>
      <BackgroundLayout>
        <div className="flex flex-col items-center justify-center h-full px-6">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-white">
              {isSignUp ? "Let's get you started!" : "Welcome back! Sign in."}
            </h1>
            <p className="text-gray-300 text-sm mt-1">
              {isSignUp
                ? "Sign up with your email to begin"
                : "Sign in with your email and password"}
            </p>
          </div>

          <div className="w-full max-w-sm space-y-4">
            <form onSubmit={handleAuth} className="space-y-4">
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

                <KeyboardIcon
                  className="absolute left-3 top-[68px] text-gray-400"
                  size={18}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(p) => setPassword(p.target.value)}
                  placeholder="Your password"
                  className="w-full pl-10 pr-4 mt-2 py-3 rounded-lg bg-[#0A0F0D]/80 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00CFC1]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-[#00CFC1] text-[#0A0F0D] font-semibold shadow-md disabled:opacity-50"
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
            <p className="text-center text-sm text-gray-400 mt-4">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-[#00CFC1] font-medium hover:underline"
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
