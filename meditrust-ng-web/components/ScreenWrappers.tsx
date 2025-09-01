"use client";

import React from "react";

//  Full-screen lock (no scroll, always one viewport tall)
export function ScreenLock({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-[100dvh] w-full overflow-hidden flex flex-col">
      {children}
    </div>
  );
}

//  Scrollable screen (fills viewport, scrolls if needed)
export function ScrollScreen({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-[100dvh] w-full overflow-y-auto flex flex-col">
      {children}
    </div>
  );
}
