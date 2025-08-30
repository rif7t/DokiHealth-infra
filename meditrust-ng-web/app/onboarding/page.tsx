"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import BackgroundLayout from "@/components/BackgroundLayout";
import { ArrowRight } from "lucide-react";
import MobileOnly from "@/components/MobileOnly";
import Image from "next/image";

const slides = [
  {
    image: "/onboarding1.png", // put your image in /public
    headline: (
      <>
        Your <span className="text-[#98FF98]">Trusted</span>{" "}
        <span className="text-[#00CFC1]">Health Partner</span>
      </>
    ),
    body: "Connect with certified doctors anytime, anywhere, right from your phone.",
  },
  {
    image: "/onboarding2.png",
    headline: (
      <>
        Quality <span className="text-[#98FF98]">Care</span>{" "}
        <span className="text-[#00CFC1]">Anywhere</span>
      </>
    ),
    body: "Skip the waiting rooms. Get quick and reliable consultations from specialists.",
  },
  {
    image: "/onboarding3.png",
    headline: (
      <>
        Stay <span className="text-[#98FF98]">Healthy</span>{" "}
        <span className="text-[#00CFC1]">Together</span>
      </>
    ),
    body: "Track your appointments and manage your health journey in one place.",
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const router = useRouter();

  const finish = () => {
    Cookies.set("seenOnboarding", "true", { expires: 365 });
    localStorage.setItem("seenOnboarding", "true");
    router.replace("/sign-in");
  };

  return (
    <MobileOnly>
      <BackgroundLayout>
        <div className="relative flex flex-col justify-between h-full">
          {/* Slide Content */}
          <div className="flex-1 flex flex-col justify-center items-center px-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ x: 150, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -150, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center text-center space-y-6"
              >
                {/* Image with slide animation */}
                <motion.div
                  initial={{ y: -30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 30, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Image
                    src={slides[step].image}
                    alt="Onboarding Visual"
                    width={240}
                    height={240}
                    className="object-contain"
                  />
                </motion.div>

                {/* Text */}
                <div>
                  <h1 className="text-3xl font-bold leading-snug text-white">
                    {slides[step].headline}
                  </h1>
                  <p className="mt-3 text-gray-200 opacity-90 max-w-xs mx-auto">
                    {slides[step].body}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Floating Navigation */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-[#1A2622]/90 rounded-full px-6 py-3 flex items-center justify-between gap-10 shadow-lg">
            <button className="text-gray-400 text-sm" onClick={finish}>
              Skip
            </button>

            {/* Pagination Dots */}
            <div className="flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`h-2 w-2 rounded-full transition-all ${
                    i === step ? "bg-yellow-400 w-4" : "bg-gray-600"
                  }`}
                />
              ))}
            </div>

            {/* Circle Arrow Button */}
            <button
              onClick={() =>
                step === slides.length - 1 ? finish() : setStep(step + 1)
              }
              className="bg-[#00CFC1] rounded-full p-3 shadow-md flex items-center justify-center"
            >
              <ArrowRight className="text-black" size={18} />
            </button>
          </div>
        </div>
      </BackgroundLayout>
    </MobileOnly>
  );
}
