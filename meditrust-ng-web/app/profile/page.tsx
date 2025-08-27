"use client";
import RequireAuth from "@/components/RequireAuth";
import { useEffect, useState } from "react";
import SuccessModal from "@/components/SuccessModal";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import MobileOnly from "@/components/MobileOnly";
import BackgroundLayout from "@/components/BackgroundLayout";

function ProfileContent() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [isDoctor, setIsDoctor] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/profile");
      const data = await res.json();
      setProfile(data.profile || {});
      setIsDoctor(!!data.doctor);
    })();
  }, []);

  const save = async () => {
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile, isDoctor }),
    });
    const data = await res.json();
    if (data.ok) {
      Cookies.set("seenOnboarding", "true", { expires: 365 });
      setShowModal(true);
    } else alert(data.error || "Error");
  };

  const handleContinue = () => {
    setShowModal(false);
    if (isDoctor) router.replace("/dashboard/doctor");
    else router.replace("/dashboard/patient");
  };

  return (
    <MobileOnly>
      <BackgroundLayout>
        <main className="mobile-shell p-4 space-y-4">
          <div className="card space-y-4 mt-40">
            <h1 className="text-xl font-semibold">Your Profile</h1>
            <input
              className="input"
              placeholder="Full name"
              value={profile?.full_name || ""}
              onChange={(e) =>
                setProfile({ ...profile, full_name: e.target.value })
              }
            />
            <input
              className="input"
              placeholder="Phone"
              value={profile?.phone || ""}
              onChange={(e) =>
                setProfile({ ...profile, phone: e.target.value })
              }
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isDoctor}
                onChange={(e) => setIsDoctor(e.target.checked)}
              />
              I am a doctor
            </label>
            {isDoctor && (
              <>
                <input
                  className="input"
                  placeholder="Specialty"
                  value={profile?.specialty || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, specialty: e.target.value })
                  }
                />
                <textarea
                  className="input h-24"
                  placeholder="Bio"
                  value={profile?.bio || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                />
              </>
            )}
            <button className="btn-primary w-full" onClick={save}>
              Create Profile
            </button>
          </div>

          <SuccessModal
            show={showModal}
            onClose={handleContinue}
            message="Profile created successfully!"
          />
        </main>
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
