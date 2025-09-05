"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signInLoading, setSignInLoading] = useState(false);
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  const isLoading = signInLoading || signUpLoading;

  // ---- SIGN IN ----
  const handleSignIn = async () => {
    if (!email || !password) {
      setErrorMessage("Email and password required");
      setErrorModal(true);
      return;
    }

    setSignInLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setErrorModal(true);
      setSignInLoading(false);
      return;
    }

    const session = data.session;
    if (!session) {
      setErrorMessage("Could not start session");
      setErrorModal(true);
      setSignInLoading(false);
      return;
    }
    
    // Show success state ⭐
    setSuccess(true);

    setTimeout(async () => {
      const { data: profile } = await supabase
        .from("profile")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (!profile) {
        router.replace("/profile");
      } else if (profile.role === "doctor") {
        router.replace("/dashboard/doctor");
      } else if (profile.role === "patient") {
        router.replace("/dashboard/patient");
      } else {
        router.replace("/profile"); // fallback
      }

      setSignInLoading(false);
      setSuccess(false);
    }, 1200);
  };

  // ---- SIGN UP ----
  const handleSignUp = async () => {
    if (!email || !password) {
      setErrorMessage("Email and password required");
      setErrorModal(true);
      return;
    }

    setSignUpLoading(true);

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setErrorMessage(error.message);
      setErrorModal(true);
      setSignUpLoading(false);
      return;
    }

    if (data.session) {
      // User is logged in immediately (no email confirmation required)
      router.replace("/profile");
    } else {
      // Email confirmation flow
      setErrorMessage("Check your email to confirm your account.");
      setErrorModal(true);
    }

    setSignUpLoading(false);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-white to-slate-100 overflow-hidden">
      {/* subtle silhouettes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[15%] right-[10%] w-[120px] h-[180px] bg-blue-400 opacity-5 rounded-lg animate-pulse" />
        <div className="absolute bottom-[20%] left-[5%] w-[100px] h-[150px] bg-blue-700 opacity-5 rounded-lg animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-md relative z-10 -translate-y-20">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/40">
          <div className="text-3xl font-bold text-blue-700 text-center mb-6">
            MediTrust
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border-2 border-slate-200 p-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border-2 border-slate-200 p-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              autoComplete="current-password"
            />
          </div>

          {/* Sign In */}
          <button
            onClick={handleSignIn}
            disabled={isLoading}
            className="w-full mb-4 py-4 rounded-2xl bg-gradient-to-r from-blue-400 to-blue-700 text-white font-semibold shadow hover:scale-[1.02] transition"
          >
            Sign In
          </button>

          {/* Sign Up */}
          <button
            onClick={handleSignUp}
            disabled={isLoading}
            className="w-full py-4 rounded-2xl bg-white border-2 border-blue-600 text-blue-600 font-semibold shadow hover:bg-blue-600 hover:text-white transition"
          >
            Create New Account
          </button>
        </div>
      </div>

      {/* Full-screen loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-50 animate-fade-slide-up">
          {!success ? (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mb-6"></div>
              <p className="text-white text-lg font-semibold">
                {signInLoading ? "Signing you in..." : "Creating your account..."}
              </p>
            </>
          ) : (
            <>
              <div className="text-6xl text-green-400 mb-4 animate-bounce">⭐</div>
              <p className="text-white text-lg font-semibold">
                Staying on top of your health - we love it!
              </p>
            </>
          )}
        </div>
      )}

      {/* Error Modal */}
      {errorModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center w-[90%] max-w-md">
            <div className="text-4xl mb-4 text-red-500">⚠️</div>
            <h2 className="text-xl font-bold text-slate-700 mb-2">Error</h2>
            <p className="text-slate-600 mb-6">{errorMessage}</p>
            <button
              onClick={() => setErrorModal(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
