"use client";
import RequireAuth from "@/components/RequireAuth";
import { useEffect, useState } from "react";
import SuccessModal from "@/components/SuccessModal";
import { useRouter } from "next/navigation";
import MobileOnly from "@/components/MobileOnly";
import BackgroundLayout from "@/components/BackgroundLayout";
import { supabase } from "@/lib/supabaseClient";
import {
  UserIcon,
  PhoneIcon,
  ShieldCheckIcon,
  FileTextIcon,
} from "lucide-react";

function ProfileContent() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [isDoctor, setIsDoctor] = useState(false);
  const [showModal, setShowModal] = useState(false);

  async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) return;

    const res = await fetch("/api/profile", {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });
    const data = await res.json();
    setProfile(data.profile || {});
    setIsDoctor(data.role === "doctor");
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

    if (data.ok) {
      setShowModal(true);
    } else alert(data.error || "Error saving profile");
  };

  const handleContinue = () => {
    setShowModal(false);
    if (isDoctor) router.replace("/dashboard/doctor");
    else router.replace("/dashboard/patient");
  };

  return (
    <MobileOnly>
      <BackgroundLayout>
        <div className="flex flex-col items-center justify-center h-full px-6">
          <div className="w-full max-w-sm bg-[#1A2622]/90 border border-gray-700 rounded-xl p-6 shadow-lg space-y-4 mt-10">
            <h1 className="text-2xl font-semibold text-white text-center mb-4">
              Your Profile
            </h1>

            {/* Title */}
            <div className="relative">
              <FileTextIcon
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />
              <input
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#0A0F0D]/80 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00CFC1]"
                placeholder="Title (Mr/Mrs/Dr)"
                value={profile?.title || ""}
                onChange={(e) =>
                  setProfile({ ...profile, title: e.target.value })
                }
              />
            </div>

            {/* First Name */}
            <div className="relative">
              <UserIcon
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />
              <input
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#0A0F0D]/80 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00CFC1]"
                placeholder="First Name"
                value={profile?.first_name || ""}
                onChange={(e) =>
                  setProfile({ ...profile, first_name: e.target.value })
                }
              />
            </div>

            {/* Last Name */}
            <div className="relative">
              <UserIcon
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />
              <input
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#0A0F0D]/80 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00CFC1]"
                placeholder="Last Name"
                value={profile?.last_name || ""}
                onChange={(e) =>
                  setProfile({ ...profile, last_name: e.target.value })
                }
              />
            </div>

            {/* Phone */}
            <div className="relative">
              <PhoneIcon
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />
              <input
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#0A0F0D]/80 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00CFC1]"
                placeholder="Phone Number"
                value={profile?.phone_number || ""}
                onChange={(e) =>
                  setProfile({ ...profile, phone_number: e.target.value })
                }
              />
            </div>

            {/* Doctor toggle */}
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={isDoctor}
                onChange={(e) => setIsDoctor(e.target.checked)}
              />
              I am a doctor
            </label>

            {isDoctor && (
              <div className="relative">
                <ShieldCheckIcon
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />
                <input
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#0A0F0D]/80 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00CFC1]"
                  placeholder="Specialty"
                  value={profile?.specialty || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, specialty: e.target.value })
                  }
                />
              </div>
            )}

            <button
              className="w-full py-3 rounded-lg bg-[#00CFC1] text-[#0A0F0D] font-semibold shadow-md disabled:opacity-50"
              onClick={save}
            >
              Save Profile
            </button>
          </div>

          {/* Success Modal */}
          <SuccessModal
            show={showModal}
            onClose={handleContinue}
            message="Profile created successfully!"
          />
        </div>
      </BackgroundLayout>
    </MobileOnly>
  );
}

export default function ProfilePage() {
  return (
    <MobileOnly>
      <RequireAuth>
        <ProfileContent />
      </RequireAuth>
    </MobileOnly>
  );
}
