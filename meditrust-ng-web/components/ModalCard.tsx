"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function Modal({ show, onClose, children, title }: any) {
  return (
    <AnimatePresence>
      {show && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={onClose}
        >
          {/* Overlay */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Centered Card */}
          <motion.div
            className="relative w-full max-w-md bg-[#1A2622]/95 border border-gray-700 rounded-2xl shadow-2xl p-6 text-white"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.1, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()} // prevent close on click inside
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              {title && (
                <h2 className="text-lg font-semibold text-white">{title}</h2>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 transition"
              >
                <X className="text-gray-300" size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-3">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
