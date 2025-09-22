"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  User,
  Heart,
  AlertTriangle,
  Pill,
  Phone,
  CheckCircle,
} from "lucide-react";

export default function MedicalHistoryForms({onComplete}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    // Basic info
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    age: "", // will be derived from DOB when submitting
    gender: "",
    phone: "",
    email: "",

    // Medical info
    bloodType: "",
    chronicConditions: [] as string[],
    previousSurgeries: "",
    familyHistory: "",

    // Allergies
    drugAllergies: "",
    foodAllergies: "",
    environmentalAllergies: "",

    // Current medications
    prescriptions: "",
    overTheCounter: "",
    supplements: "",

    // Emergency contact
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelation: "",
  });

  const totalSteps = 5;

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleConditionToggle = (condition: string) => {
    if (formData.chronicConditions.includes(condition)) {
      updateFormData(
        "chronicConditions",
        formData.chronicConditions.filter((c) => c !== condition)
      );
    } else {
      updateFormData("chronicConditions", [
        ...formData.chronicConditions,
        condition,
      ]);
    }
  };

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

    const age = calculateAge(formData.dateOfBirth);

    const payload = {
  id: user.id,                // must always include id
  role: "patient",
  first_name: formData.firstName,
  last_name: formData.lastName,
  date_of_birth: formData.dateOfBirth,
  age,
  gender: formData.gender,
  phone_number: formData.phone,
  email: user.email,
  emergency_contact: formData.emergencyPhone,

  // Medical history
  blood_type: formData.bloodType,
  chronic_conditions: formData.chronicConditions,  // must be string[]
  previous_surgeries: formData.previousSurgeries,
  family_history: formData.familyHistory,

  // Allergies
  drug_allergies: formData.drugAllergies,
  food_allergies: formData.foodAllergies,
  environmental_allergies: formData.environmentalAllergies,

  // Current meds
  prescriptions: formData.prescriptions,

  // system defaults
  is_online: true,
  is_assigned: false,
};

    const { data, error } = await supabase
  .from("profile")
  .upsert(payload, { onConflict: "id" }) // ensures one row per user
  .select()
  .single();

    setLoading(false);

    if (error) {
      console.error(error);
      alert("Failed to save medical history");
    } else {
       
      alert("Medical history saved successfully!");
      //router.replace("/dashboard/patient");
    }
    if(onComplete && data) onComplete(data);
    
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

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="text-blue-600" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Basic Information</h2>
        <p className="text-gray-600">Let's start with some basic details about you</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => updateFormData("firstName", e.target.value)}
              placeholder="First name"
              className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => updateFormData("lastName", e.target.value)}
              placeholder="Last name"
              className="w-full px-4 py-3 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => updateFormData("dateOfBirth", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            <select
              value={formData.gender}
              onChange={(e) => updateFormData("gender", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Blood Type (if known)</label>
            <select
              value={formData.bloodType}
              onChange={(e) => updateFormData("bloodType", e.target.value)}
              className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select blood type</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="unknown">Don't know</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => updateFormData("phone", e.target.value)}
            placeholder="Phone number"
            className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );

  const renderMedicalHistory = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="text-blue-600" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Medical History</h2>
        <p className="text-gray-600">Tell us about your medical background</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Do you have any chronic conditions? (Check all that apply)</label>
        <div className="grid grid-cols-2 gap-3">
          {['Diabetes', 'Hypertension', 'Heart Disease', 'Asthma', 'Arthritis', 'Depression', 'Anxiety', 'Other'].map((condition) => (
            <label key={condition} className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-blue-50 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.chronicConditions.includes(condition)}
                onChange={() => handleConditionToggle(condition)}
                className="text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{condition}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Previous Surgeries or Hospitalizations</label>
        <textarea
          value={formData.previousSurgeries}
          onChange={(e) => updateFormData("previousSurgeries", e.target.value)}
          placeholder="Please list any surgeries or hospital stays with approximate dates..."
          className="w-full px-4 py-3 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Family Medical History</label>
        <textarea
          value={formData.familyHistory}
          onChange={(e) => updateFormData("familyHistory", e.target.value)}
          placeholder="Any significant medical conditions in your immediate family..."
          className="w-full px-4 py-3 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
        />
      </div>
    </div>
  );

  const renderAllergies = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="text-blue-600" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Allergies</h2>
        <p className="text-gray-600">Important information about your allergies</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Drug/Medication Allergies</label>
        <textarea
          value={formData.drugAllergies}
          onChange={(e) => updateFormData("drugAllergies", e.target.value)}
          placeholder="List any medications you're allergic to and the reactions..."
          className="w-full px-4 py-3  text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
        />
        <p className="text-xs text-black mt-1">This is critical information - please be thorough</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Food Allergies</label>
        <textarea
          value={formData.foodAllergies}
          onChange={(e) => updateFormData("foodAllergies", e.target.value)}
          placeholder="Any food allergies or intolerances..."
          className="w-full px-4 py-3 border  text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Environmental/Other Allergies</label>
        <textarea
          value={formData.environmentalAllergies}
          onChange={(e) => updateFormData("environmentalAllergies", e.target.value)}
          placeholder="Pollen, pets, latex, etc..."
          className="w-full px-4 py-3 border  text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20 resize-none"
        />
      </div>
    </div>
  );

  const renderMedications = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Pill className="text-blue-600" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Current Medications</h2>
        <p className="text-gray-600">List all medications you're currently taking</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Prescription Medications</label>
        <textarea
          value={formData.prescriptions}
          onChange={(e) => updateFormData("prescriptions", e.target.value)}
          placeholder="Include medication name, dosage, and frequency (e.g., Lisinopril 10mg once daily)..."
          className="w-full  text-black px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-28 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Over-the-Counter Medications</label>
        <textarea
          value={formData.overTheCounter}
          onChange={(e) => updateFormData("overTheCounter", e.target.value)}
          placeholder="Pain relievers, antacids, etc. that you take regularly..."
          className="w-full px-4  text-black py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Vitamins & Supplements</label>
        <textarea
          value={formData.supplements}
          onChange={(e) => updateFormData("supplements", e.target.value)}
          placeholder="Vitamins, herbs, supplements, etc..."
          className="w-full px-4  text-black py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
        />
      </div>
    </div>
  );

  const renderEmergencyContact = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Phone className="text-blue-600" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Emergency Contact</h2>
        <p className="text-gray-600">Someone we can contact in case of emergency</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
        <input
          type="text"
          value={formData.emergencyName}
          onChange={(e) => updateFormData("emergencyName", e.target.value)}
          placeholder="Emergency contact's full name"
          className="w-full px-4 py-3 border  text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
        <input
          type="tel"
          value={formData.emergencyPhone}
          onChange={(e) => updateFormData("emergencyPhone", e.target.value)}
          placeholder="Phone number"
          className="w-full px-4 py-3 border  text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
        <select
          value={formData.emergencyRelation}
          onChange={(e) => updateFormData("emergencyRelation", e.target.value)}
          className="w-full px-4 py-3 border  text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select relationship</option>
          <option value="spouse">Spouse</option>
          <option value="parent">Parent</option>
          <option value="child">Child</option>
          <option value="sibling">Sibling</option>
          <option value="friend">Friend</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-8">
        <div className="flex items-center">
          <CheckCircle className="text-green-600 mr-3" size={24} />
          <div>
            <h3 className="font-medium text-green-800">Almost Done!</h3>
            <p className="text-sm text-green-700">You're completing the final step of your medical history.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const getCurrentStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInfo();
      case 2:
        return renderMedicalHistory();
      case 3:
        return renderAllergies();
      case 4:
        return renderMedications();
      case 5:
        return renderEmergencyContact();
      default:
        return renderBasicInfo();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">Medical History</h1>
          <p className="text-gray-600 text-center">Help us provide you with the best care</p>
        </div>

        {/* Main Form Container */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {renderProgressBar()}
          {getCurrentStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                currentStep === 1 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              <ChevronLeft size={20} />
              Previous
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all transform hover:scale-105"
              >
                Continue
                <ChevronRight size={20} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle size={20} />
                {loading ? "Saving..." : "Complete"}
              </button>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-6 text-sm text-gray-600">
          🔒 Your information is secure and confidential
        </div>
      </div>
    </div>
  );
}