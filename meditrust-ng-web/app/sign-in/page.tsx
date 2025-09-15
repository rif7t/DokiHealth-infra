"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/sessionCache";


export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signInLoading, setSignInLoading] = useState(false);
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
   const [checking, setChecking] = useState(true); 
   const [session, setSession] = useState(null);
   const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const isLoading = signInLoading || signUpLoading;

   useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session ?? null);
        setChecking(false);
      }
    );

    // also check immediately on mount
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setChecking(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!success || checking) return;     // ⬅️ wait until Supabase is ready
    if (!session) {
      router.replace("/sign-in");
      return;
    }

    (async () => {
      const { data: profile } = await supabase
        .from("profile")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profile.role === "doctor") {
        router.replace("/dashboard/doctor");
      } else if (profile.role === "patient") {
        router.replace("/dashboard/patient");
      }
      
    })();
  }, [checking, session]);

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

    const session = getSession();
    if (!session) {
      setErrorMessage("Could not start session");
      setErrorModal(true);
      setSignInLoading(false);
      return;
    }
    
    // Show success state ⭐
    setSuccess(true);

    console.log("Session check:", data.session, "Error:", error);
    if(signInLoading){
        return <div className="flex items-center justify-center h-screen">Loading...</div>;

    }
    

  };
  
  // ---- SIGN UP ----
  const handleSignUp = async () => {
    if (!email || !password) {
      setErrorMessage("Email and password required");
      setErrorModal(true);
      return;
    }
    localStorage.setItem("justSignedUp", "true");
    setSignUpLoading(true);

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setErrorMessage(error.message);
      setErrorModal(true);
      setSignUpLoading(false);
      return;
    }

    if (data.session) {
      setSignUpLoading(false);
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
    <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 bg-gradient-to-br from-white via-slate-50 to-slate-100 overflow-hidden">
  {/* Enhanced Background Elements */}
  <div className="absolute inset-0 pointer-events-none">
    <div className="absolute top-[10%] right-[8%] w-[140px] h-[200px] bg-gradient-to-br from-blue-400 to-blue-500 opacity-[0.03] rounded-2xl animate-pulse transform rotate-12" />
    <div className="absolute bottom-[15%] left-[3%] w-[110px] h-[170px] bg-gradient-to-br from-blue-600 to-blue-700 opacity-[0.03] rounded-2xl animate-pulse delay-1000 transform -rotate-6" />
    <div className="absolute top-[50%] left-[85%] w-[80px] h-[120px] bg-gradient-to-br from-blue-300 to-blue-400 opacity-[0.02] rounded-xl animate-pulse delay-500 transform rotate-45" />
  </div>

  <div className="w-full max-w-md relative z-10 transform -translate-y-8 sm:-translate-y-12">
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
      
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-center">
        <div className="flex items-center mt-6 justify-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="text-2xl">🏥</span>
          </div>
          <h1 className="text-2xl font-bold text-white">MediTrust</h1>
        </div>
        <p className="text-blue-100 text-sm">Your trusted healthcare platform</p>
      </div>

      {/* Form Section */}
      <div className="p-8 space-y-6">
        
        {/* Welcome Message */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-1">Welcome Back</h2>
          <p className="text-sm text-gray-600">Sign in to access your healthcare dashboard</p>
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-gray-400">📧</span>
            </div>
            <input
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border-2 border-gray-200 p-4 pl-12 text-gray-800 
                         placeholder-gray-400 bg-gray-50 
                         focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 
                         focus:bg-white hover:border-gray-300
                         transition-all duration-200"
              autoComplete="email"
            />
          </div>
        </div>

        

        {/* Password Field */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Password
          </label>
          <div className="relative">
            {/* Left-side lock icon */}
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-gray-400">🔐</span>
            </div>

            {/* Input field */}
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your secure password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border-2 border-gray-200 p-4 pl-12 pr-12 text-gray-800 
                        placeholder-gray-400 bg-gray-50 
                        focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 
                        focus:bg-white hover:border-gray-300
                        transition-all duration-200"
              autoComplete="current-password"
            />

            {/* Right-side toggle button */}
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-blue-500 hover:text-blue-700"
            >
              {showPassword ? (<svg xmlns="http://www.w3.org/2000/svg" 
     className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth={2} />
</svg>
) : (<svg xmlns="http://www.w3.org/2000/svg" 
     className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M3 3l18 18M10.58 10.58A3 3 0 0113.42 13.42M6.7 6.7A9.77 9.77 0 003 12c1.274 4.057 5.065 7 9.542 7 
           2.045 0 3.93-.613 5.5-1.657M17.3 17.3A9.77 9.77 0 0021 12c-1.274-4.057-5.065-7-9.542-7-1.292 0-2.523.252-3.658.7" />
</svg>
)}
            </button>
          </div>
        </div>

        {/* Forgot Password Link */}
        <div className="text-right">
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors">
            Forgot your password?
          </button>
        </div>

        {/* Sign In Button */}
        <button
          onClick={handleSignIn}
          disabled={checking || signInLoading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 
                     hover:from-blue-700 hover:to-blue-800 
                     disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed
                     text-white font-semibold shadow-lg hover:shadow-xl 
                     transition-all duration-400 transform hover:scale-[1.02] disabled:hover:scale-100
                     flex items-center justify-center gap-2"
        >
          {signInLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Signing In...
            </>
          ) : (
            <>
              <span>🔓</span>
              Sign In
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative flex items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink-0 px-4 text-sm text-gray-500 bg-white">or</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        {/* Create Account Button */}
        <button
          onClick={handleSignUp}
          disabled={isLoading}
          className="w-full py-4 rounded-2xl bg-white border-2 border-blue-600 
                     text-blue-600 font-semibold shadow-md 
                     hover:bg-blue-600 hover:text-white hover:shadow-lg
                     disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed
                     transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100
                     flex items-center justify-center gap-2"
        >
          {isLoading && !signInLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              Creating Account...
            </>
          ) : (
            <>
              <span>✨</span>
              Create New Account
            </>
          )}
        </button>

        {/* Footer Text */}
        <p className="text-xs text-gray-500 text-center mt-6 leading-relaxed">
          By continuing, you agree to our Terms of Service and Privacy Policy. 
          Your health data is protected and encrypted.
        </p>
      </div>
    </div>
  </div>

  {/* Enhanced Loading Overlay */}
  {isLoading && (
  <div className="fixed inset-0 bg-white/40 backdrop-blur-md flex flex-col items-center justify-center z-50 transition-opacity duration-400">
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 p-10 text-center max-w-md">
      {!success ? (
        <>
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-gray-800 text-xl font-bold mb-2">
            {signInLoading ? "Signing You In" : "Creating Your Account"}
          </h3>
          <p className="text-gray-600 text-sm">
            {signInLoading
              ? "Accessing your healthcare dashboard..."
              : "Setting up your personalized health profile..."}
          </p>
        </>
      ) : (
        <>
          <div className="relative mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-3xl">✓</span>
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-full opacity-30 flex items-center justify-center shadow-md" />
          </div>
          <h3 className="text-gray-800 text-xl font-bold mb-2">
            Welcome to MediTrust!
          </h3>
          <p className="text-gray-600 text-sm">
            Your healthcare journey begins now
          </p>
        </>
      )}
    </div>
  </div>
)}



  {/* Enhanced Error Modal */}
  {errorModal && (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-md">
        
        {/* Error Header */}
        <div className="bg-red-50 px-6 py-4 border-b border-red-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <span className="text-red-500 text-xl">⚠️</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-800">Authentication Error</h3>
              <p className="text-sm text-red-600">Something went wrong</p>
            </div>
          </div>
        </div>

        {/* Error Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-6 leading-relaxed">{errorMessage}</p>
          
          <div className="flex gap-3">
            <button
              onClick={() => setErrorModal(false)}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 
                         hover:from-blue-700 hover:to-blue-800 
                         text-white font-semibold shadow-lg hover:shadow-xl 
                         transition-all duration-200 transform hover:scale-[1.02]
                         flex items-center justify-center gap-2"
            >
              <span>🔄</span>
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  )}
</div>
  );
}
