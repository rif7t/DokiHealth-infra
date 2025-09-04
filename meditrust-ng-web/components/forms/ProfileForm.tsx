"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export default function ProfileForm() {
  const router = useRouter();
  const [role, setRole] = useState<"doctor" | "patient">("patient");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [licenseNumber, setLicenseNumber] = useState(""); // doctor-only, may not exist in DB
  const [specialization, setSpecialization] = useState(""); // doctor-only
  const [experience, setExperience] = useState(""); // doctor-only
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        alert("You must be signed in to create a profile");
        return;
      }

      // Insert or update into profile table
      const { error } = await supabase.from("profile").upsert({
        id: session.user.id, // tie to auth.uid
        name,
        phone,
        role,
        // These fields are placeholders if not in DB
        licenseNumber,
        specialization,
        experience: experience ? Number(experience) : null,
      });

      if (error) {
        console.error("Profile save error:", error);
        alert("Could not save profile. Check console for details.");
        return;
      }

      // Redirect based on role
      if (role === "doctor") {
        router.replace("/dashboard/doctor");
      } else {
        router.replace("/dashboard/patient");
      }
    } catch (err: any) {
      console.error("Profile form error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mobile-card space-y-4">
  <div>
  <label className="block text-sm font-medium text-slate-700">
    First Name
  </label>
  <input
    type="text"
    value={firstName}
    onChange={(e) => setFirstName(e.target.value)}
    className="mobile-input"
  />
</div>

<div>
  <label className="block text-sm font-medium text-slate-700">
    Last Name
  </label>
  <input
    type="text"
    value={lastName}
    onChange={(e) => setLastName(e.target.value)}
    className="mobile-input"
  />
</div>


  <div>
    <label className="block text-sm font-medium text-slate-700">
      Phone Number
    </label>
    <input
      type="tel"
      value={phone}
      onChange={(e) => setPhone(e.target.value)}
      className="mobile-input"
    />
  </div>

  <div>
    <label className="block text-sm font-medium text-slate-700">
      Role
    </label>
    <select
      value={role}
      onChange={(e) => setRole(e.target.value as "doctor" | "patient")}
      className="mobile-input"
    >
      <option value="patient">Patient</option>
      <option value="doctor">Doctor</option>
    </select>
  </div>
    
  {role === "doctor" && (
    <>
        
    
      <div>
        <label className="block text-sm font-medium text-slate-700">
          License Number
        </label>
        <input
          type="text"
          value={licenseNumber}
          onChange={(e) => setLicenseNumber(e.target.value)}
          className="mobile-input"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Specialization
        </label>
        <input
          type="text"
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
          className="mobile-input"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Years of Experience
        </label>
        <input
          type="number"
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          className="mobile-input"
        />
      </div>
    </>
  )}

  <Button type="submit" isLoading={loading}>
    Save Profile
  </Button>
</form>

  );
}
