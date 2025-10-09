"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function HospitalsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7faff] to-white flex flex-col items-center py-24 px-6">
      {/* Header */}
      <div className="text-center mb-20 max-w-3xl">
        <h1 className="text-5xl font-semibold text-[#0B4FFF] mb-6">
          Bring Telehealth to Your Hospital
        </h1>
        <p className="text-gray-600 text-lg leading-relaxed">
          Offer secure video consultations directly from your hospital’s
          website, with no new infrastructure or vendor lock-in. Choose to
          connect with DokiHealth’s network or run it fully independently.
        </p>

        <div className="flex justify-center gap-4 mt-10 flex-wrap">
          <button
            onClick={() => router.push("/contact")}
            className="bg-gradient-to-r from-[#0B4FFF] to-[#1A73E8] text-white px-8 py-3 rounded-full shadow-md hover:opacity-90 transition-all"
          >
            Request a Demo
          </button>
          <button
            onClick={() =>
                (window.location.href =
                    "mailto:founder@dokihealth.com?subject=Hospital%20Telehealth%20Integration%20Inquiry&body=Hi%20Emmanuel,%0D%0A%0D%0AWe’d%20like%20to%20learn%20more%20about%20how%20to%20integrate%20video%20consultations%20into%20our%20hospital%20system.%0D%0A%0D%0AThanks,")
                }

            className="border border-[#0B4FFF] text-[#0B4FFF] px-8 py-3 rounded-full hover:bg-[#eaf1ff] transition-all"
          >
            Contact Us
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl w-full mb-24">
        {[
          {
            
            title: "Branded Platform",
            desc: "Your hospital’s name, logo, and domain — powered by DokiHealth’s secure infrastructure.",
          },
          {
            
            title: "Live Video Consultations",
            desc: "High-quality, encrypted video sessions for doctors and patients, accessible anywhere.",
          },
          {
           
            title: "Patient Referrals",
            desc: "Seamlessly send and receive patients through DokiHealth’s national network.",
          },
          {
            
            title: "Red Alert Integration",
            desc: "Connect emergency response systems directly to patient records for faster triage.",
          },
          {
           
            title: "New Revenue Streams",
            desc: "Convert missed appointments and follow-ups into billable, trackable consultations.",
          },
          {
           
            title: "Secure & Compliant",
            desc: "Encrypted communication and full doctor–patient data protection built in.",
          },
        ].map((feature, index) => (
          <div
            key={index}
            className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
          >
            
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </div>

      {/* Integration Options */}
      <div className="bg-white p-10 rounded-2xl shadow-md max-w-4xl text-center mb-24">
        <h2 className="text-3xl font-semibold mb-4 text-gray-800">
          Flexible Integration Options
        </h2>
        <p className="text-gray-600 leading-relaxed">
          Run your telehealth system <strong>independently</strong> under your
          brand, or <strong>connect</strong> it to DokiHealth’s national network
          for after-hours coverage, referrals, and expanded patient reach.
        </p>
      </div>

      {/* Final CTA */}
      <div className="text-center mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Let’s modernize care — together.
        </h2>
        <div className="flex justify-center gap-4 flex-wrap">
          <button
            onClick={() => router.push("/contact")}
            className="bg-gradient-to-r from-[#0B4FFF] to-[#1A73E8] text-white px-8 py-3 rounded-full shadow-md hover:opacity-90 transition-all"
          >
            Book a Demo
          </button>
          <button
            onClick={() =>
              (window.location.href = "mailto:founder@dokihealth.com")
            }
            className="border border-[#0B4FFF] text-[#0B4FFF] px-8 py-3 rounded-full hover:bg-[#eaf1ff] transition-all"
          >
            Email Us
          </button>
        </div>
      </div>
    </div>
  );
}
