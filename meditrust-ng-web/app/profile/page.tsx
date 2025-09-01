"use client";
import RequireAuth from "@/components/RequireAuth";
import MobileOnly from "@/components/MobileOnly";
import BackgroundLayout from "@/components/BackgroundLayout";
import SuccessModal from "@/components/SuccessModal";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  User as UserIcon,
  Phone,
  ShieldCheck,
  FileText,
  CreditCard,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

const specialties = ["General Practice", "Pediatrics", "Cardiology", "Dermatology"];
const banks = ["Access Bank", "United Bank of Africa", "Wema/Alat", "Zenith Bank"];
const titles = ["Mr", "Mrs", "Miss"]; // Doctors automatically get "Dr"
const genders = ["Male", "Female"];

export default function ProfileContent() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>({});
  const [isDoctor, setIsDoctor] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Load profile
  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      if (data?.profile) {
        setProfile(data.profile);
        setIsDoctor(data.profile.role === "doctor");
      }
    })();
  }, []);

  const resetForm = (doctor: boolean) => {
    setProfile(doctor ? { title: "Dr" } : {}); // default title for doctors
  };

  const save = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ profile, isDoctor }),
    });
    const data = await res.json();
    if (data.ok) setShowModal(true);
    else alert(data.error || "Error saving profile");
  };

  const continueToDash = () => {
    setShowModal(false);
    router.replace(isDoctor ? "/dashboard/doctor" : "/dashboard/patient");
  };

  return (
    <MobileOnly>
      <RequireAuth>
        <BackgroundLayout>
          <div className="mx-auto flex h-[100dvh] max-w-md items-center justify-center p-4">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Create Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Role segmented control */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-1">
                  <div className="grid grid-cols-2">
                    <button
                      type="button"
                      className={`rounded-lg px-3 py-2 text-sm font-medium ${
                        !isDoctor ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
                      }`}
                      onClick={() => {
                        setIsDoctor(false);
                        resetForm(false);
                      }}
                    >
                      Patient
                    </button>
                    <button
                      type="button"
                      className={`rounded-lg px-3 py-2 text-sm font-medium ${
                        isDoctor ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
                      }`}
                      onClick={() => {
                        setIsDoctor(true);
                        resetForm(true);
                      }}
                    >
                      Doctor
                    </button>
                  </div>
                </div>

                {/* Title Dropdown (Patients only) */}
                {!isDoctor && (
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <select
                      value={profile?.title || ""}
                      onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                      className="w-full appearance-none rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00CFC1]"
                    >
                      <option value="">Select Title</option>
                      {titles.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Common fields */}
                <TextField
                  placeholder="First Name"
                  value={profile?.first_name || ""}
                  onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                  icon={UserIcon}
                />
                <TextField
                  placeholder="Last Name"
                  value={profile?.last_name || ""}
                  onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                  icon={UserIcon}
                />

                {/* Age + Gender row */}
                <div className="grid grid-cols-2 gap-3">
                  <TextField
                    placeholder="Age"
                    type="number"
                    maxLength={2}
                    value={profile?.age || ""}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      if (val.length <= 2) setProfile({ ...profile, age: val });
                    }}
                    icon={FileText}
                  />
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <select
                      value={profile?.gender || ""}
                      onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                      className="w-full appearance-none rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00CFC1]"
                    >
                      <option value="">Gender</option>
                      {genders.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Phone number (max 11 digits) */}
                <TextField
                  placeholder="Phone Number"
                  type="tel"
                  value={profile?.phone_number || ""}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    if (val.length <= 11) {
                      setProfile({ ...profile, phone_number: val });
                    }
                  }}
                  icon={Phone}
                />

                {/* Doctor-specific fields */}
                {isDoctor && (
                  <>
                    {/* Specialty Dropdown */}
                    <div className="relative">
                      <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <select
                        value={profile?.specialty || ""}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            specialty: e.target.value,
                          })
                        }
                        className="w-full appearance-none rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00CFC1]"
                      >
                        <option value="">Select Specialty</option>
                        {specialties.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Bank Account Number (max 11 digits) */}
                    <TextField
                      placeholder="Account Number"
                      type="tel"
                      value={profile?.account_number || ""}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        if (val.length <= 11) {
                          setProfile({ ...profile, account_number: val });
                        }
                      }}
                      icon={CreditCard}
                    />

                    {/* Bank Dropdown */}
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <select
                        value={profile?.bank || ""}
                        onChange={(e) => setProfile({ ...profile, bank: e.target.value })}
                        className="w-full appearance-none rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00CFC1]"
                      >
                        <option value="">Select Bank</option>
                        {banks.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <Button onClick={save} className="w-full">
                  Save Profile
                </Button>
              </CardContent>
            </Card>
          </div>

          <SuccessModal
            show={showModal}
            onClose={continueToDash}
            message="Profile saved successfully!"
          />
        </BackgroundLayout>
      </RequireAuth>
    </MobileOnly>
  );
}