// app/layout.tsx or app/root-layout.tsx
import "./globals.css";
import PageTransition from "@/components/PageTransition";
import SessionSync from "@/components/SessionSync";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full bg-slate-50 text-slate-900">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <SessionSync />
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}

