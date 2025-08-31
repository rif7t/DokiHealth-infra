// components/BackgroundLayout.tsx
'use client'

import Image from 'next/image'

export default function BackgroundLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <Image
        src="/groupMeditrust.png"   // replace with your preferred bg
        alt="background"
        fill
        className="object-cover"
        priority
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B1A16]/50 to-[#14B8A6] z-10" />

      {/* Logo Top Left */}
      <div className="absolute top-4 left-4 flex items-center z-20">
        <Image
          src="/logo.png"   // <- put your logo here
          alt="MediTrust Logo"
          width={48}
          height={48}
          className="mr-2"
        />
        <h2 className="text-white font-bold text-xl">MediTrust</h2>
      </div>

      {/* Foreground */}
      <div className="relative z-20 h-full">{children}</div>
    </div>
  )
}