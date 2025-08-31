"use client";
import { useState, useEffect } from "react";
import MobileOnly from "@/components/MobileOnly";
import BackgroundLayout from "@/components/BackgroundLayout";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const slides = ["/onboarding_1.svg", "/onboarding_2.svg", "/onboarding_3.svg"];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const router = useRouter();

  const finish = () => {
    Cookies.set("seenOnboarding", "true", { expires: 365 });
    try {
      localStorage.setItem("seenOnboarding", "true");
    } catch {}
    router.replace("/sign-in");
  };

  // Lock the page from scrolling
  useEffect(() => {
    document.body.style.overflow = "hidden";
    (document.documentElement as HTMLElement).style.overscrollBehavior = "none";
    return () => {
      document.body.style.overflow = "";
      (document.documentElement as HTMLElement).style.overscrollBehavior = "";
    };
  }, []);

  // ▶️ Right Arrow key: next slide or finish on last slide
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        if (step === slides.length - 1) finish();
        else setStep((s) => Math.min(s + 1, slides.length - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]); // depends on step so it uses the latest

  return (
    <MobileOnly>
      <BackgroundLayout>
        <div className="h-screen overflow-hidden relative flex items-center justify-center">
          {/* Content */}
          <div className="flex-1 flex flex-col items-center justify-start px-6 pt-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ x: 120, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, delay:0.15 }}
                className="w-full flex flex-col items-center"
>         
                {/* Image */}
                <motion.img
                  src={slides[step]}
                  alt="Onboarding Visual"
                  width={400}
                  height={400}
                  className="object-contain mt-16"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, delay:0.15 }}
/>


                {/* Headline + Body */}
                <div className="mt-4 text-center">
                  <h1 className="text-base font-semibold text-slate-900">
                    {step === 0 && (
                      <>
                        <span className="text-yellow-500">Verified</span>{" "}
                        <span className="text-white">Doctors</span>,{" "}
                        <span className="text-yellow-500">Real</span>{" "}
                        <span className="text-white">Credentials</span>
                      </>
                    )}
                    {step === 1 && (
                      <>
                        <span className="text-yellow-500">Secure</span>{" "}
                        <span className="text-white">Payments</span>{" "}
                        <span className="text-white">with</span>{" "}
                        <span className="text-yellow-500">Escrow</span>
                      </>
                    )}
                    {step === 2 && (
                      <>
                        <span className="text-yellow-500">Medicine</span>{" "}
                        <span className="text-white">Verification</span>{" "}
                        <span className="text-white">&</span>{" "}
                        <span className="text-yellow-500">Tracking</span>
                      </>
                    )}
                  </h1>

                  <p className="mt-2 text-xs text-white max-w-sm mx-auto leading-relaxed">
                    {step === 0 &&
                      "All clinicians are credential-checked. Tell us how you feel and we'll get you a doctor in minutes."}
                    {step === 1 &&
                      "Pay in ₦aira. Your money sits safely in escrow until care is delivered."}
                    {step === 2 &&
                      "Scan pack codes, verify authenticity, and keep your health records all in one place."}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Nav */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 z-30 bg-white/90 backdrop-blur border border-slate-200 rounded-full pl-4 pr-2 py-2 shadow-lg">
            <button
              className="text-slate-600 text-sm hover:text-slate-900 transition"
              onClick={finish}
            >
              Skip
            </button>

            <div className="flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`h-2 w-2 rounded-full transition-all ${
                    i === step ? "bg-teal-500 w-4" : "bg-slate-300"
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() =>
                step === slides.length - 1 ? finish() : setStep(step + 1)
              }
              className="bg-teal-500 hover:bg-teal-600 active:scale-95 text-white rounded-full p-3 shadow-md flex items-center justify-center"
              aria-keyshortcuts="ArrowRight"
              title="Next (→)"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </BackgroundLayout>
    </MobileOnly>
  );
}
