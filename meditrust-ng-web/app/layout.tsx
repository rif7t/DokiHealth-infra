import './globals.css'
import SessionSync from '@/components/SessionSync'
import PageTransition from '@/components/PageTransition'
import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'MediTrust — Telemedicine' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionSync />
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  )
}
