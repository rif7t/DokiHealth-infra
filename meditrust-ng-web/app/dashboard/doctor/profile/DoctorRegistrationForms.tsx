"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { SPECIALIZATIONS } from "@/lib/constants";
import {
  ChevronLeft,
  ChevronRight,
  User,
  Award,
  Stethoscope,
  CheckCircle,
} from "lucide-react";

export default function DoctorRegistrationForms({onSuccess}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    // Personal Info
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    phone: "",
    email: "",

    // Professional Credentials
    medicalLicense: "",
    licenseState: "",
    licenseExpiry: "",
    medicalSchool: "",
    graduationYear: "",
    boardCertifications: "",

    // Practice Information
    yearsOfPractice: "",
    primarySpecialty: "",
    secondarySpecialties: "",
    currentWorkplace: "",
    workplaceAddress: "",
    professionalBio: "",
  });

  const totalSteps = 3;

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-blue-600">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm text-gray-500">
          {Math.round((currentStep / totalSteps) * 100)}% Complete
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );

  const getCurrentStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderPersonalInfo();
      case 2:
        return renderCredentials();
      case 3:
        return renderPracticeInfo();
      default:
        return renderPersonalInfo();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      alert("Not signed in");
      setLoading(false);
      return;
    }
    function calculateAge(dob: string): number {
  if (!dob) return 0;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
const age = calculateAge(formData.dateOfBirth);

    const payload = {
        id: user.id,
  role: "doctor",
  title: "Dr.", // optional, safe default
  first_name: formData.firstName,
  last_name: formData.lastName,
  date_of_birth: formData.dateOfBirth,
  gender: formData.gender,
  age: age,
  phone_number: formData.phone,
  email: formData.email,
  
  medical_license: formData.medicalLicense,
  license_state: formData.licenseState,
  license_expiry: formData.licenseExpiry,
  medical_school: formData.medicalSchool,
  graduation_year: Number(formData.graduationYear) || null,
  board_certifications: formData.boardCertifications,
  years_of_practice: formData.yearsOfPractice,
  specialty: formData.primarySpecialty,
  secondary_specialties: formData.secondarySpecialties,
  current_workplace: formData.currentWorkplace,
  workplace_address: formData.workplaceAddress,
  professional_bio: formData.professionalBio,

  // status flags
  is_available: false,
  is_online: true,
  verified: false,
  is_assigned: false,
  is_connecting: false,

  // fields you can leave null for now
  bank_name: null,
  account_name: null,
  bank_account_number: null,
  paystack_recipient_code: null,
};




const {data,  error } = await supabase.from("profile").upsert(payload).select()
      .maybeSingle();



    setLoading(false);

    if (error) {
      console.error("Supabase error:", error.message, error.details, error.hint);
      alert("Failed to save doctor profile");
    } else {
      alert("Doctor profile saved successfully!");
       router.replace("/dashboard/doctor");
    }
    
    if(onSuccess && data) onSuccess(data);
    
  };

  // --- UI Renders (same structure you already had) ---
  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="text-blue-600" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Personal Information
        </h2>
        <p className="text-gray-600">
          Let's start with your basic information
        </p>
      </div>

      {/* First + Last Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name *
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => updateFormData("firstName", e.target.value)}
            className="w-full px-4 py-3 border rounded-lg text-black"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => updateFormData("lastName", e.target.value)}
            className="w-full px-4 py-3 border rounded-lg text-black"
          />
        </div>
      </div>
      {/* DOB + Gender */}
       <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth *
          </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => updateFormData("dateOfBirth", e.target.value)}
          className="w-full px-4 py-3 border rounded-lg text-black"
        />
        <select
          value={formData.gender}
          onChange={(e) => updateFormData("gender", e.target.value)}
          className="w-full px-4 py-3 border rounded-lg text-black"
        >
          <option value="">Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
    </div>
  );

  const renderCredentials = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-blue-600">Professional Credentials</h2>
      <input
        type="text"
        placeholder="Medical License"
        value={formData.medicalLicense}
        onChange={(e) => updateFormData("medicalLicense", e.target.value)}
        className="w-full px-4 py-3 border rounded-lg text-black"
      />
      {/* <input
        type="text"
        placeholder="License State"
        value={formData.licenseState}
        onChange={(e) => updateFormData("licenseState", e.target.value)}
        className="w-full px-4 py-3 border rounded-lg"
      /> */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
            License State *
        </label>
        <select
            value={formData.licenseState}
            onChange={(e) => updateFormData("licenseState", e.target.value)}
            className="w-full px-4 py-3 border rounded-lg text-black placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
            <option value="">Select state</option>
            <option value="Abia">Abia</option>
            <option value="Adamawa">Adamawa</option>
            <option value="Akwa Ibom">Akwa Ibom</option>
            <option value="Anambra">Anambra</option>
            <option value="Bauchi">Bauchi</option>
            <option value="Bayelsa">Bayelsa</option>
            <option value="Benue">Benue</option>
            <option value="Borno">Borno</option>
            <option value="Cross River">Cross River</option>
            <option value="Delta">Delta</option>
            <option value="Ebonyi">Ebonyi</option>
            <option value="Edo">Edo</option>
            <option value="Ekiti">Ekiti</option>
            <option value="Enugu">Enugu</option>
            <option value="Gombe">Gombe</option>
            <option value="Imo">Imo</option>
            <option value="Jigawa">Jigawa</option>
            <option value="Kaduna">Kaduna</option>
            <option value="Kano">Kano</option>
            <option value="Katsina">Katsina</option>
            <option value="Kebbi">Kebbi</option>
            <option value="Kogi">Kogi</option>
            <option value="Kwara">Kwara</option>
            <option value="Lagos">Lagos</option>
            <option value="Nasarawa">Nasarawa</option>
            <option value="Niger">Niger</option>
            <option value="Ogun">Ogun</option>
            <option value="Ondo">Ondo</option>
            <option value="Osun">Osun</option>
            <option value="Oyo">Oyo</option>
            <option value="Plateau">Plateau</option>
            <option value="Rivers">Rivers</option>
            <option value="Sokoto">Sokoto</option>
            <option value="Taraba">Taraba</option>
            <option value="Yobe">Yobe</option>
            <option value="Zamfara">Zamfara</option>
            <option value="FCT">Federal Capital Territory (Abuja)</option>
        </select>
        </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
            License Expiry Date *
        </label>
        <input
            type="date"
            value={formData.licenseExpiry}
            onChange={(e) => updateFormData("licenseExpiry", e.target.value)}
            className="w-full px-4 py-3 border rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
            Medical School *
        </label>
        <select
            value={formData.medicalSchool}
            onChange={(e) => updateFormData("medicalSchool", e.target.value)}
            className="w-full px-4 py-3 border rounded-lg text-black placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
            <option value="">Select medical school</option>
            <option value="University of Nigeria (Enugu Campus)">University of Nigeria (Enugu Campus)</option>
            <option value="Ahmadu Bello University, Zaria">Ahmadu Bello University, Zaria</option>
            <option value="University of Ilorin">University of Ilorin</option>
            <option value="University of Lagos">University of Lagos</option>
            <option value="Lagos State University, Ikeja">Lagos State University, Ikeja</option>
            <option value="University of Benin, Benin City">University of Benin, Benin City</option>
            <option value="Obafemi Awolowo University, Ile-Ife">Obafemi Awolowo University, Ile-Ife</option>
            <option value="University of Ibadan">University of Ibadan</option>
            <option value="Bowen University">Bowen University</option>
            {/* add more as needed */}
        </select>
        </div>
    </div>
  );

  const renderPracticeInfo = () => (
    <div className="space-y-6">
      <h2 className="text-xl text-blue-600 font-bold">Practice Information</h2>
      <select
        value={formData.yearsOfPractice}
        onChange={(e) => updateFormData("yearsOfPractice", e.target.value)}
        className="w-full px-4 py-3 border rounded-lg text-black"
      >
        <option value="">Years of Practice</option>
        <option value="0-2">0-2</option>
        <option value="3-5">3-5</option>
        <option value="6-10">6-10</option>
        <option value="more than 10 years">10-30</option>
      </select>
      <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Primary Specialty *
  </label>
  <select
    value={formData.primarySpecialty}
    onChange={(e) => updateFormData("primarySpecialty", e.target.value)}
    className="w-full px-4 py-3 border rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  >
    <option value="">Select a specialty</option>
    {SPECIALIZATIONS.map((spec) => (
      <option key={spec.value} value={spec.value}>
        {spec.label}
      </option>
    ))}
  </select>
</div>

      <textarea
        placeholder="Professional Bio"
        value={formData.professionalBio}
        onChange={(e) => updateFormData("professionalBio", e.target.value)}
        className="w-full px-4 py-3 border rounded-lg text-black"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="max-w-2xl mx-auto bg-white shadow rounded-xl p-6">
        {renderProgressBar()}
        {getCurrentStepContent()}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-6 py-3 bg-blue-600 rounded-lg"
          >
            <ChevronLeft size={20} /> Back
          </button>

          {currentStep < totalSteps ? (
            <button
              onClick={nextStep}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg"
            >
              Next <ChevronRight size={20} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg"
            >
              {loading ? "Saving..." : "Submit"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
