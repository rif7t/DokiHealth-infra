// app/layout.tsx or app/root-layout.tsx
import "./globals.css";
import PageTransition from "@/components/PageTransition";
import SessionSync from "@/components/SessionSync";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionSync /> {/* mounted once globally */}
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}