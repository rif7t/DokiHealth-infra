// app/components/PageTransition.tsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

type Props = { children: React.ReactNode };

export default function PageTransition({ children }: Props) {
  const pathname = usePathname();

  const variants = {
    initial: { x: "0%" },   // new page starts off-screen right
    animate: { x: 0 },        // slides into place
    exit: { x: "0%" },     // old page slides out left
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          className="absolute inset-0"
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.1, easeInOut: [0.25, 0.8, 0.25, 1] }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
