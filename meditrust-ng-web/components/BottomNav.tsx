'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav({ role }: { role: 'patient' | 'doctor' }) {
  const pathname = usePathname()

  const items = role === 'patient'
    ? [
        { href: '/dashboard/patient', label: 'Home' },
        { href: '/appointments', label: 'Appointments' },
        { href: '/doctors', label: 'Doctors' },
        { href: '/profile', label: 'Profile' },
      ]
    : [
        { href: '/dashboard/doctor', label: 'Home' },
        { href: '/appointments', label: 'Consults' },
        { href: '/patients', label: 'Patients' },
        { href: '/profile', label: 'Profile' },
      ]

  return (
    <nav className="bottom-nav">
      {items.map(item => (
        <Link key={item.href} href={item.href} className={`flex flex-col items-center text-xs ${pathname === item.href ? 'text-brand-cyan' : 'text-gray-500'}`}>
          <span className="font-semibold">{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}
