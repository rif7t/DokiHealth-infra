"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "/app/onboarding/onboarding.css"; // custom CSS for silhouettes & animations

export default function OnboardingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
   const router = useRouter();
  const totalSlides = 6;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const slides = [
    
    {
      icon: "🔍",
      title: "Find Your Doctor",
      desc: "Browse our network of certified healthcare professionals. Filter by specialty, availability, language, and ratings to find the perfect match.",
    },
    {
      icon: "💬",
      title: "Live Consultation",
      desc: "Choose from video calls, voice calls, or secure messaging based on your needs.",
    },
    {
      icon: "🚨",
      title: "Red Alert Emergency",
      desc: "Need urgent help? Use Red Alert to alert the nearest hospital while you’re still in the app — when every second matters.",
    },
    {
      icon: "💳",
      title: "Secure Escrow Payments",
      desc: "Your money is held safely in escrow. Patients get refunds when things go wrong, and doctors are guaranteed payment for completed sessions. Our policies protect both sides.",
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

const handleFinish = async () => {
    // Hit an API route to set cookie
    await fetch("/api/seen-onboarding", { method: "POST" });
    router.replace("/sign-in"); // or wherever your next step is
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
  <div className="relative z-10 w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl px-4 text-center">
  <div className="w-full flex justify-center -pt-2">
  <div className="flex items-center">
    <img src="/logo.png" alt="MediTrust Logo" className="w-10 h-10" />
    <span className="text-2xl font-bold text-blue-700">MediTrust</span>
  </div>
</div>



    {/* <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-800 mb-8">
      How MediTrust Works for You
    </h1> */}

    {/* Slider */}
    <div className="relative w-full overflow-hidden rounded-2xl shadow-lg">
      <div
        className="flex transition-transform duration-500"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((s, i) => (
          <div
            key={i}
            className="min-w-full bg-white/90 backdrop-blur p-6 sm:p-8 md:p-10 flex flex-col items-center"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-700 text-4xl sm:text-5xl md:text-6xl text-white shadow-lg mb-6">
              {s.icon}
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-3">
              {s.title}
            </h3>
            <p className="text-slate-600 text-sm sm:text-base max-w-md">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-3 mt-6 mb-2">
        {slides.map((_, i) => (
          <span
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`w-3.5 h-3.5 sm:w-3 sm:h-4 rounded-full cursor-pointer transition-all ${
              currentSlide === i ? "bg-blue-500 scale-125" : "bg-blue-300/40"
            }`}
          />
        ))}
      </div>
    </div>

    {/* CTA */}
    <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
      <button
        onClick={() => router.push("/sign-in")}
        className="w-full sm:w-auto px-2 py-4 rounded-full bg-gradient-to-r from-blue-400 to-blue-700 text-white font-semibold shadow hover:scale-105 transition"
      >
        Get Started Now
      </button>
      <button className="w-full sm:w-auto px-6 py-3 rounded-full border-2 border-blue-500 text-blue-600 font-semibold hover:bg-blue-500 hover:text-white transition">
        Learn More
      </button>
    </div>

    <div className="mt-6 flex flex-wrap justify-center gap-2">
  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
    🛡️ Refund-Backed Escrow
  </span>
  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
    ⚖️ Doctor & Patient Protection
  </span>
  
</div>
  </div>
</div>

  );
}
