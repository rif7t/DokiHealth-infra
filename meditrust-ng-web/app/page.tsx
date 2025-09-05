"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "/app/onboarding/onboarding.css"; // custom CSS for silhouettes & animations

export default function OnboardingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
   const router = useRouter();
  const totalSlides = 5;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const slides = [
    {
      icon: "📱",
      title: "Download & Register",
      desc: "Get started in minutes. Download MediTrust, create your secure profile, and verify your identity with our simple onboarding process.",
    },
    {
      icon: "🔍",
      title: "Find Your Doctor",
      desc: "Browse our network of certified healthcare professionals. Filter by specialty, availability, language, and ratings to find the perfect match.",
    },
    {
      icon: "💬",
      title: "Book Consultation",
      desc: "Schedule your appointment at your convenience. Choose from video calls, voice calls, or secure messaging based on your needs.",
    },
    {
      icon: "🩺",
      title: "Get Expert Care",
      desc: "Connect with your doctor from anywhere. Receive professional medical advice, prescriptions, and follow-up care plans.",
    },
    {
      icon: "📋",
      title: "Track Your Health",
      desc: "Access your medical records, track symptoms, set medication reminders, and monitor your health journey over time.",
    },
  ];

   const finishOnboarding = async () => {
  await fetch("/api/seen-onboarding", { method: "POST" });
  // Then redirect to profile/dashboard
  router.replace("/profile");
};

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 overflow-hidden">
      {/* Doctor silhouettes */}
      <div className="doctors-background">
        <div className="doctor-silhouette doctor-1"></div>
        <div className="doctor-silhouette doctor-2"></div>
        <div className="doctor-silhouette doctor-3"></div>
        <div className="doctor-silhouette doctor-4"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl text-center">
        <div className="text-3xl md:text-4xl font-bold text-blue-700 mb-6">
          MediTrust
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-800 mb-8">
          How MediTrust Works for You
        </h1>

        {/* Slider */}
        <div className="relative w-full max-w-2xl mx-auto overflow-hidden rounded-2xl shadow-lg">
          <div
            className="flex transition-transform duration-500"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slides.map((s, i) => (
              <div
                key={i}
                className="min-w-full bg-white/90 backdrop-blur p-10 flex flex-col items-center"
              >
                <div className="w-28 h-28 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-700 text-5xl text-white shadow-lg mb-6">
                  {s.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">
                  {s.title}
                </h3>
                <p className="text-slate-600 max-w-md">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-3 mt-4">
            {slides.map((_, i) => (
              <span
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-3 h-3 rounded-full cursor-pointer transition-all ${
                  currentSlide === i
                    ? "bg-blue-500 scale-125"
                    : "bg-blue-300/40"
                }`}
              />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 flex justify-center gap-4">
          <button onClick={() => router.push("/sign-in")} className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-700 text-white font-semibold shadow hover:scale-105 transition">
            Get Started Now
          </button>
          <button className="px-6 py-3 rounded-full border-2 border-blue-500 text-blue-600 font-semibold hover:bg-blue-500 hover:text-white transition">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}
