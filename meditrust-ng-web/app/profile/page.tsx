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

  const handleRoleSelect = (r: "doctor" | "patient") => {
    setRole(r);
  };

  const saveProfile = async () => {
    if (!role) return;

    setLoading(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Not signed in");

      const payload: any = {
        role,
        first_name: firstName,
        last_name: lastName,
        phone_number: phone,
      };

      if (role === "patient") {
        payload.date_of_birth = dob;
        payload.emergency_contact = emergencyContact;
        // medicalHistory not in DB yet ⚠️
      } else if (role === "doctor") {
        payload.license_number = licenseNumber;
        payload.specialty = specialization;
        payload.experience = experience;
        // doctorBio not in DB yet ⚠️
      }

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ profile: payload, isDoctor: role === "doctor" }),
      });

      const data = await res.json();
      if (data.ok) {
        setShowSuccess(true);
        setStep(3); // ✅ move to final step
      } else {
        throw new Error(data.error || "Failed to save profile");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const goToDashboard = () => {
    setShowSuccess(false);
    router.replace(role === "doctor" ? "/dashboard/doctor" : "/dashboard/patient");
  };

  // Utility: return correct style for step circle + label
  const stepClasses = (i: number) => {
    if (step === i) return "bg-blue-500 text-white"; // active
    if (step > i) return "bg-green-500 text-white"; // completed
    return "bg-slate-200 text-slate-600"; // pending
  };

  const labelClasses = (i: number) => {
    if (step === i) return "text-blue-600 font-semibold";
    if (step > i) return "text-green-600 font-semibold";
    return "text-slate-500";
  };

  return (
    <div className="relative min-h-dvh bg-gradient-to-br from-white to-slate-100 flex items-center justify-center px-4">
      {/* Floating medical icons */}
      <div className="absolute inset-0 pointer-events-none opacity-10 text-4xl">
        <div className="absolute top-10 left-10 animate-bounce">🩺</div>
        <div className="absolute top-20 right-12 animate-pulse">💊</div>
        <div className="absolute bottom-28 left-16 animate-pulse">🏥</div>
        <div className="absolute bottom-12 right-10 animate-bounce">❤️</div>
        <div className="absolute top-1/2 left-5 animate-pulse">🔬</div>
      </div>

      <div className="relative z-10 w-full max-w-lg bg-white/90 backdrop-blur rounded-3xl shadow-xl p-8 border border-slate-200">
        <h1 className="text-2xl font-bold text-blue-700 text-center mb-4">
          Create Your Profile
        </h1>

        {/* Progress Steps */}
        <div className="flex justify-between mb-8">
          {["Role", "Info", "Complete"].map((label, i) => (
            <div key={label} className="flex-1 text-center relative">
              <div
                className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center font-semibold ${stepClasses(
                  i + 1
                )}`}
              >
                {i + 1}
              </div>
              <div className={`mt-2 text-sm ${labelClasses(i + 1)}`}>{label}</div>

              {/* Connector line */}
              {i < 2 && (
                <div
                  className={`absolute top-4 left-1/2 w-full h-0.5 -z-10 ${
                    step > i + 1 ? "bg-green-500" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Role selection */}
        {step === 1 && (
          <div>
            <p className="mb-6 text-center text-blue-500">I am a...</p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => handleRoleSelect("patient")}
                className={`p-6 rounded-2xl border-2 ${
                  role === "patient"
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "border-slate-200 bg-green-200 text-blue-600"
                }`}
              >
                🧑‍💼 Patient
              </button>
              <button
                onClick={() => handleRoleSelect("doctor")}
                className={`p-6 rounded-2xl border-2 ${
                  role === "doctor"
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "border-slate-300 bg-green-200 text-blue-600"
                }`}
              >
                👨‍⚕️ Doctor
              </button>
            </div>
            <button
              disabled={!role}
              onClick={() => setStep(2)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold shadow disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Info form */}
        {step === 2 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveProfile();
            }}
            className="space-y-4"
          >
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full rounded-xl border bg-white border-blue-600 p-4 text-black"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full rounded-xl border bg-white border-blue-600 p-4 text-black"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, ""); // keep only numbers
                if (digits.length <= 11) {
                  setPhone(digits);
                }
              }}
              required
              maxLength={11} // optional extra safeguard
              className="w-full rounded-xl border bg-white border-blue-600 p-4 text-black"
            />


            {role === "patient" && (
              <>
                <label
                htmlFor="dob"
                className="block text-sm font-large text-black"
              >
                Date of Birth
              </label>
              <input
                id="dob"
                type="date"
                className="w-full rounded-lg border border-blue-600 bg-white text-slate-800 px-3 py-2 
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  />
                <input
                  type="text"
                  placeholder="Emergency Contact"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="w-full rounded-xl border bg-white text-black border-blue-600 p-4"
                />
                <textarea
                  placeholder="Medical History (optional)"
                  value={medicalHistory}
                  onChange={(e) => setMedicalHistory(e.target.value)}
                  className="w-full rounded-xl border bg-white border-blue-600 p-4"
                />
              </>
            )}

            {role === "doctor" && (
              <>
                <input
                  type="text"
                  placeholder="Medical License Number"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full rounded-xl border border-blue-600 p-4 text-black"
              />
              {/* Specialization Dropdown */}
                <select
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full rounded-xl border border-blue-600 p-4 bg-white text-black"
                >
                  <option value="">Select Specialization</option>
                  {SPECIALIZATIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>

              {/* 🔹 New: Account Number (limit 11 digits) */}
                <input
                  type="tel"
                  placeholder="Account Number"
                  value={accountNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, ""); // only digits
                    if (val.length <= 11) setAccountNumber(val);
                  }}
                  className="w-full rounded-xl border bg-white text-black border-blue-600 p-4"
                />
                {/* 🔹 Bank Dropdown */}
                <select
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  className="w-full rounded-xl border border-blue-600 p-4 bg-white text-slate-700"
                  required
                >
                  <option value="">Select Bank</option>
                  <option value="Access Bank">Access Bank</option>
                  <option value="United Bank for Africa">United Bank for Africa (UBA)</option>
                  <option value="Wema/Alat">Wema / Alat</option>
                  <option value="Zenith Bank">Zenith Bank</option>
                </select>
                
                <input
                  type="number"
                  placeholder="Years of Experience"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full rounded-xl border border-blue-600 p-4 text-black"
                />
                <textarea
                  placeholder="Professional Bio"
                  value={doctorBio}
                  onChange={(e) => setDoctorBio(e.target.value)}
                  className="w-full rounded-xl border bg-white border-blue-600 p-4 text-black"
                />
              </>
            )}

            {error && <p className="text-red-500 text-center">{error}</p>}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl bg-slate-200 text-slate-700"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold shadow disabled:opacity-50"
              >
                {loading ? "Saving..." : "Create Profile"}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Success */}
        {step === 3 && showSuccess && (
          <div className="text-center">
            <div className="text-5xl mb-4"></div>
            <h2 className="text-xl font-semibold mb-2 text-blue-500">
              Profile Created Successfully!
            </h2>
            <p className="text-slate-600 mb-6">
              Your account is ready. You can now continue to your dashboard.
            </p>
            <button
              onClick={goToDashboard}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold shadow"
            >
              Continue to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
