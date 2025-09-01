// components/BackgroundLayout.tsx
'use client'

import Image from 'next/image'

export default function BackgroundLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-[100dvh] w-full overflow-hidden overscroll-none bg-slate-50">
      {/* Background Image */}
      <Image
        src="/groupMeditrust.png"   // replace with your preferred bg
        alt="background"
        fill
        className="w-full, h-full object-cover"
        priority
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B1A16]/30 to-[#14B8A6]/50 z-10 overscroll-none, overflow-hidden" />

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
      <div className="relative z-20 h-full w-full overflow-hidden overscroll-none flex flex-col ">{children}</div>
    </div>
  )
}