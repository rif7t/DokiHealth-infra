"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { SPECIALIZATIONS } from "@/lib/constants";
import { KeyboardDismissWrapper } from "@/components/KeyboardDismissWrapper";

export default function CreateProfile() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState<"doctor" | "patient" | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Common fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  // Patient-only
  const [dob, setDob] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [medicalHistory, setMedicalHistory] = useState(""); // ⚠️ not in DB yet

  // Doctor-only
  const [licenseNumber, setLicenseNumber] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [doctorBio, setDoctorBio] = useState(""); // ⚠️ not in DB yet
  const [accountNumber, setAccountNumber] = useState("");
  const [bank, setBank] = useState("");

  // const handleRoleSelect = (r: "doctor" | "patient") => setRole(r);

  const handleRoleSelect = async (r: "doctor" | "patient") => {
  setRole(r);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Upsert profile with role (insert if doesn't exist, update if exists)
  await supabase.from("profile").upsert({
    id: user.id,
    role: r,
  });

  // Route to dashboard based on role
  if (r === "doctor") {
    router.replace("/dashboard/doctor?new=1");
  } else {
    router.replace("/dashboard/patient?new=1");
  }
};

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-lg mx-auto bg-white rounded-3xl shadow-2xl border border-gray-200 p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome to MediTrust 🎉</h1>
          <p className="text-gray-600">Choose your role to continue</p>
        </div>

        {/* Role selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => handleRoleSelect("patient")}
            className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
              role === "patient"
                ? "border-blue-500 bg-blue-600 text-white shadow-lg"
                : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md text-gray-700"
            }`}
          >
            <div className="space-y-2">
              <div className="text-4xl">🧑‍💼</div>
              <h3 className="font-bold text-lg">Patient</h3>
              <p className={`text-sm ${role === "patient" ? "text-blue-100" : "text-gray-500"}`}>
                Seek medical consultation
              </p>
            </div>
            {role === "patient" && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">✓</span>
              </div>
            )}
          </button>

          <button
            onClick={() => handleRoleSelect("doctor")}
            className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
              role === "doctor"
                ? "border-blue-500 bg-blue-600 text-white shadow-lg"
                : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md text-gray-700"
            }`}
          >
            <div className="space-y-2">
              <div className="text-4xl">👨‍⚕️</div>
              <h3 className="font-bold text-lg">Doctor</h3>
              <p className={`text-sm ${role === "doctor" ? "text-blue-100" : "text-gray-500"}`}>
                Provide medical services
              </p>
            </div>
            {role === "doctor" && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">✓</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}