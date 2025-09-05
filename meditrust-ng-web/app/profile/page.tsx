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

  const handleRoleSelect = (r: "doctor" | "patient") => setRole(r);

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
        //payload.date_of_birth = dob;
        //payload.emergency_contact = emergencyContact;
      } else if (role === "doctor") {
        payload.license_number = licenseNumber;
        payload.specialty = specialization;
        //payload.experience = experience;
        payload.bank_account_number = accountNumber;
        payload.bank_name = bank;
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
        setStep(3);
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

  // Stepper style utils
  const stepClasses = (i: number) =>
    step === i
      ? "bg-blue-500 text-white"
      : step > i
      ? "bg-green-500 text-white"
      : "bg-slate-200 text-slate-600";

  const labelClasses = (i: number) =>
    step === i
      ? "text-blue-600 font-semibold"
      : step > i
      ? "text-green-600 font-semibold"
      : "text-slate-500";

  return (
    <KeyboardDismissWrapper>
      <div className="relative min-h-dvh bg-gradient-to-br from-white via-slate-50 to-slate-100 flex items-center justify-center px-4">
        
        {/* Enhanced Floating medical icons */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-8 left-8 opacity-5 text-6xl animate-pulse">
            <span className="text-blue-400">🩺</span>
          </div>
          <div className="absolute top-16 right-10 opacity-5 text-5xl animate-bounce delay-300">
            <span className="text-green-400">💊</span>
          </div>
          <div className="absolute bottom-32 left-12 opacity-5 text-7xl animate-pulse delay-500">
            <span className="text-blue-500">🏥</span>
          </div>
          <div className="absolute bottom-8 right-8 opacity-5 text-5xl animate-bounce delay-700">
            <span className="text-red-400">❤️</span>
          </div>
          <div className="absolute top-1/2 left-4 opacity-5 text-4xl animate-pulse delay-1000">
            <span className="text-purple-400">🔬</span>
          </div>
          <div className="absolute top-1/3 right-6 opacity-5 text-5xl animate-bounce delay-200">
            <span className="text-orange-400">💉</span>
          </div>
        </div>

        <div className="relative z-10 w-full max-w-xl mx-auto bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
          
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🏥</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Create Your Profile</h1>
            </div>
            <p className="text-blue-100 text-sm">Join the MediTrust healthcare community</p>
          </div>

          {/* Progress Steps */}
          <div className="px-8 py-6 bg-gray-50">
            <div className="flex justify-between items-center">
              {["Role", "Info", "Complete"].map((label, i) => (
                <div key={label} className="flex-1 text-center relative">
                  <div
                    className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${stepClasses(
                      i + 1
                    )}`}
                  >
                    {step > i + 1 ? "✓" : i + 1}
                  </div>
                  <div className={`mt-2 text-xs font-medium transition-colors duration-300 ${labelClasses(i + 1)}`}>
                    {label}
                  </div>

                  {/* Enhanced Connector line */}
                  {i < 2 && (
                    <div className="absolute top-5 left-1/2 w-full h-1 -z-10 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          step > i + 1 ? "w-full bg-gradient-to-r from-green-400 to-green-500" : "w-0 bg-gray-200"
                        }`}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="px-8 py-8">
            
            {/* Step 1: Role selection */}
            {step === 1 && (
              <div className="space-y-6">
                {/* Welcome Message */}
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-bold text-gray-800">Welcome to MediTrust!</h2>
                  <p className="text-gray-600">Choose your role to get started</p>
                </div>

                {/* Role Selection Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleRoleSelect("patient")}
                    className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                      role === "patient"
                        ? "border-blue-500 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg"
                        : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md text-gray-700"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className={`text-4xl ${role === "patient" ? "" : "group-hover:scale-110 transition-transform"}`}>
                        🧑‍💼
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Patient</h3>
                        <p className={`text-sm ${role === "patient" ? "text-blue-100" : "text-gray-500"}`}>
                          Seek medical consultation
                        </p>
                      </div>
                    </div>
                    {role === "patient" && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <span className="text-blue-500 text-sm">✓</span>
                      </div>
                    )}
                  </button>

                  <button
                    onClick={() => handleRoleSelect("doctor")}
                    className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                      role === "doctor"
                        ? "border-blue-500 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg"
                        : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md text-gray-700"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className={`text-4xl ${role === "doctor" ? "" : "group-hover:scale-110 transition-transform"}`}>
                        👨‍⚕️
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Doctor</h3>
                        <p className={`text-sm ${role === "doctor" ? "text-blue-100" : "text-gray-500"}`}>
                          Provide medical services
                        </p>
                      </div>
                    </div>
                    {role === "doctor" && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <span className="text-blue-500 text-sm">✓</span>
                      </div>
                    )}
                  </button>
                </div>

                {/* Role Benefits */}
                {role && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
                    <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                      <span>ℹ️</span>
                      {role === "patient" ? "As a Patient, you can:" : "As a Doctor, you can:"}
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      {role === "patient" ? (
                        <>
                          <li>• Book consultations with verified doctors</li>
                          <li>• Access your medical records securely</li>
                          <li>• Get prescriptions and treatment plans</li>
                        </>
                      ) : (
                        <>
                          <li>• Accept consultation requests from patients</li>
                          <li>• Manage your medical practice digitally</li>
                          <li>• Receive secure payments through escrow</li>
                        </>
                      )}
                    </ul>
                  </div>
                )}

                {/* Continue Button */}
                <button
                  disabled={!role}
                  onClick={() => setStep(2)}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 
                             hover:from-blue-700 hover:to-blue-800 
                             disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed
                             text-white font-semibold shadow-lg hover:shadow-xl 
                             transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100
                             flex items-center justify-center gap-2"
                >
                  {role ? (
                    <>
                      <span>Continue as {role === "patient" ? "Patient" : "Doctor"}</span>
                      <span>→</span>
                    </>
                  ) : (
                    "Select a role to continue"
                  )}
                </button>
              </div>
            )}

            {/* Step 2: Info form */}
            {step === 2 && (
              <div className="space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-bold text-gray-800">
                    Complete Your {role === "patient" ? "Patient" : "Doctor"} Profile
                  </h2>
                  <p className="text-gray-600">
                    {role === "patient" 
                      ? "Tell us about yourself to receive personalized care" 
                      : "Provide your professional details to start helping patients"
                    }
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveProfile();
                  }}
                  className="space-y-5"
                >
                  {/* Personal Information Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide border-b border-gray-200 pb-2">
                      Personal Information
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-700">First Name</label>
                        <input
                          type="text"
                          placeholder="Enter first name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                          className="w-full rounded-lg border border-gray-200 p-2.5 text-gray-800 text-sm
                                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                                     hover:border-gray-300 transition-colors duration-200
                                     bg-gray-50 focus:bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-700">Last Name</label>
                        <input
                          type="text"
                          placeholder="Enter last name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                          className="w-full rounded-lg border border-gray-200 p-2.5 text-gray-800 text-sm
                                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                                     hover:border-gray-300 transition-colors duration-200
                                     bg-gray-50 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-700">Phone Number</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                          <span className="text-gray-400 text-sm">📱</span>
                        </div>
                        <input
                          type="tel"
                          placeholder="08012345678"
                          value={phone}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, "");
                            if (digits.length <= 11) setPhone(digits);
                          }}
                          required
                          className="w-full rounded-lg border border-gray-200 p-2.5 pl-8 text-gray-800 text-sm
                                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                                     hover:border-gray-300 transition-colors duration-200
                                     bg-gray-50 focus:bg-white"
                        />
                      </div>
                      <p className="text-xs text-gray-500">11-digit Nigerian number</p>
                    </div>
                  </div>

                  {/* Patient-specific fields */}
                  {role === "patient" && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide border-b border-gray-200 pb-2">
                        Medical Information
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-700">Date of Birth</label>
                          <input
                            type="date"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 p-2.5 text-gray-800 text-sm
                                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                                       hover:border-gray-300 transition-colors duration-200
                                       bg-gray-50 focus:bg-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-700">Emergency Contact</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                              <span className="text-gray-400 text-sm">🚨</span>
                            </div>
                            <input
                              type="text"
                              placeholder="Emergency number"
                              value={emergencyContact}
                              onChange={(e) => setEmergencyContact(e.target.value)}
                              className="w-full rounded-lg border border-gray-200 p-2.5 pl-8 text-gray-800 text-sm
                                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                                         hover:border-gray-300 transition-colors duration-200
                                         bg-gray-50 focus:bg-white"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-700">Medical History (Optional)</label>
                        <textarea
                          placeholder="Any allergies, medications, or conditions..."
                          value={medicalHistory}
                          onChange={(e) => setMedicalHistory(e.target.value)}
                          rows={3}
                          className="w-full rounded-lg border border-gray-200 p-2.5 text-gray-800 text-sm
                                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                                     hover:border-gray-300 transition-colors duration-200
                                     bg-gray-50 focus:bg-white resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Doctor-specific fields */}
                  {role === "doctor" && (
                    <div className="space-y-5">
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide border-b border-gray-200 pb-2">
                        Professional Information
                      </h3>
                      
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-700">Medical License Number</label>
                        <input
                          type="text"
                          placeholder="License number"
                          value={licenseNumber}
                          onChange={(e) => setLicenseNumber(e.target.value)}
                          className="w-full rounded-lg border border-gray-200 p-2.5 text-gray-800 text-sm
                                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                                     hover:border-gray-300 transition-colors duration-200
                                     bg-gray-50 focus:bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-700">Specialization</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                              <span className="text-gray-400 text-sm">🩺</span>
                            </div>
                            <select
                              value={specialization}
                              onChange={(e) => setSpecialization(e.target.value)}
                              className="w-full rounded-lg border border-gray-200 p-2.5 pl-8 text-gray-800 text-sm
                                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                                         hover:border-gray-300 transition-colors duration-200
                                         bg-gray-50 focus:bg-white appearance-none"
                            >
                              <option value="">Select specialization</option>
                              {SPECIALIZATIONS.map((s) => (
                                <option key={s.value} value={s.value}>
                                  {s.label}
                                </option>
                              ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
                              <span className="text-gray-400 text-sm">▼</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-700">Years Experience</label>
                          <input
                            type="number"
                            placeholder="e.g., 5"
                            value={experience}
                            onChange={(e) => setExperience(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 p-2.5 text-gray-800 text-sm
                                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                                       hover:border-gray-300 transition-colors duration-200
                                       bg-gray-50 focus:bg-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide border-b border-gray-200 pb-2">
                          Payment Information
                        </h4>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-xs text-blue-700 flex items-center gap-1">
                            <span>🔒</span>
                            Your banking info is encrypted and secure
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-700">Bank Name</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                                <span className="text-gray-400 text-sm">🏦</span>
                              </div>
                              <select
                                value={bank}
                                onChange={(e) => setBank(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 p-2.5 pl-8 text-gray-800 text-sm
                                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                                           hover:border-gray-300 transition-colors duration-200
                                           bg-gray-50 focus:bg-white appearance-none"
                              >
                                <option value="">Select bank</option>
                                <option value="Access Bank">Access Bank</option>
                                <option value="United Bank for Africa">UBA</option>
                                <option value="Wema/Alat">Wema/Alat</option>
                                <option value="Zenith Bank">Zenith Bank</option>
                              </select>
                              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
                                <span className="text-gray-400 text-sm">▼</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-700">Account Number</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                                <span className="text-gray-400 text-sm">💳</span>
                              </div>
                              <input
                                type="tel"
                                placeholder="Account number"
                                value={accountNumber}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, "");
                                  if (val.length <= 10) setAccountNumber(val);
                                }}
                                className="w-full rounded-lg border border-gray-200 p-2.5 pl-8 text-gray-800 text-sm
                                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                                           hover:border-gray-300 transition-colors duration-200
                                           bg-gray-50 focus:bg-white"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-700">Professional Bio</label>
                        <textarea
                          placeholder="Tell patients about your background and expertise..."
                          value={doctorBio}
                          onChange={(e) => setDoctorBio(e.target.value)}
                          rows={3}
                          className="w-full rounded-lg border border-gray-200 p-2.5 text-gray-800 text-sm
                                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                                     hover:border-gray-300 transition-colors duration-200
                                     bg-gray-50 focus:bg-white resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-700 text-xs flex items-center gap-2">
                        <span>⚠️</span>
                        {error}
                      </p>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-full sm:flex-1 py-3 rounded-lg sm:rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95
                                 text-gray-700 font-semibold transition-all duration-200 text-sm sm:text-base"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:flex-1 py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 
                                 hover:from-blue-700 hover:to-blue-800 active:scale-95
                                 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed
                                 text-white font-semibold shadow-lg hover:shadow-xl 
                                 transition-all duration-200 disabled:active:scale-100
                                 flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <span>Create Profile</span>
                          <span>✓</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 3: Success */}
            {step === 3 && showSuccess && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white text-4xl">✓</span>
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Profile Created Successfully! 🎉
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    Welcome to MediTrust! Your {role} account is now ready. 
                    {role === "patient" 
                      ? " You can now book consultations with our verified doctors."
                      : " You can start accepting patient consultations and building your practice."
                    }
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <h4 className="font-semibold text-green-800 mb-2">What's next?</h4>
                  <ul className="text-sm text-green-700 space-y-1 text-left">
                    {role === "patient" ? (
                      <>
                        <li>• Complete your medical history</li>
                        <li>• Browse and book consultations</li>
                        <li>• Set up your preferred doctors</li>
                      </>
                    ) : (
                      <>
                        <li>• Set your availability schedule</li>
                        <li>• Review and accept patient requests</li>
                        <li>• Start earning through consultations</li>
                      </>
                    )}
                  </ul>
                </div>

                <button
                  onClick={goToDashboard}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 
                             hover:from-green-600 hover:to-green-700 
                             text-white font-semibold shadow-lg hover:shadow-xl 
                             transition-all duration-200 transform hover:scale-[1.02]
                             flex items-center justify-center gap-2"
                >
                  <span>Continue to Dashboard</span>
                  <span>→</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </KeyboardDismissWrapper>
  );
}