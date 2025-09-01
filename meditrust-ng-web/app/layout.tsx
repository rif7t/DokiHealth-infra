// app/layout.tsx
import "./globals.css";
import PageTransition from "@/components/PageTransition";
import SessionSync from "@/components/SessionSync";

// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full w-full">
      <body className="-full overflow-hidden overscroll-none bg-gray-100 text-slate-900 antialiased">
        <div className="h-[100dvh] w-full overflow-y-auto">
        {children}
        </div>
      </body>
    </html>
  );
}

