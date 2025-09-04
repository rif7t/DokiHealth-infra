"use client";

export function KeyboardDismissWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-dvh w-full overflow-y-auto"
      onClick={(e) => {
        if (
          e.target instanceof HTMLElement &&
          !["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)
        ) {
          (document.activeElement as HTMLElement)?.blur();
        }
      }}
    >
      {children}
    </div>
  );
}
