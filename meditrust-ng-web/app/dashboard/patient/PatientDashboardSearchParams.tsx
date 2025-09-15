"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function PatientDashboardSearchParams({
  onNewUser,
}: {
  onNewUser: (flag: boolean) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      onNewUser(true);

      // Strip the query param so it doesn’t persist
      const url = new URL(window.location.href);
      url.searchParams.delete("new");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams, onNewUser]);

  return null;
}
