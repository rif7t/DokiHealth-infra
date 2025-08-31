"use client";
import Link from "next/link";
import MobileOnly from "@/components/MobileOnly";
import BackgroundLayout from "@/components/BackgroundLayout";


export default function Home() {
  return (
    <MobileOnly>
      <BackgroundLayout>
        <main className="h-full flex flex-col justify-between items-center text-center">
          {/* Hero Section */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 mt-2">
            <h2 className="text-3xl font-bold text-white mb-3">
              Welcome to{" "}
              <span className="text-[#98FF98]">Medi</span>
              <span className="text-[#00CFC1]">Trust</span>
            </h2>
            <p className="text-gray-300 max-w-xs">
              Trusted telemedicine right on your phone. Connect with doctors,
              anytime, anywhere.
            </p>
          </div>

          {/* Action Button */}
          <div className="pb-16 px-6 w-full">
            <Link
              href="/onboarding"
              className="block w-full py-3 rounded-lg bg-[#98FF98] text-[#0A0F0D] font-semibold shadow-md hover:bg-[#00e6d7] transition"
            >
              Get Started
            </Link>
          </div>
        </main>
      </BackgroundLayout>
    </MobileOnly>
  );
}
