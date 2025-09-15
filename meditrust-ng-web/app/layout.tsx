import BackgroundLayout from "@/components/ui/BackgroundLayout";
import { SessionProvider } from "@/components/SessionProvider";
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <BackgroundLayout>{children}</BackgroundLayout>
      </body>
    </html>
  );
}
