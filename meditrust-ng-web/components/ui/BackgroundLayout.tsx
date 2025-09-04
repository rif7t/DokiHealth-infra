import React from "react";

interface BackgroundLayoutProps {
  children: React.ReactNode;
}

const BackgroundLayout: React.FC<BackgroundLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen relative">
      {/* Background gradient & blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-stone-50 to-gray-100"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-radial from-blue-50/40 via-transparent to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-0 w-80 h-80 bg-gradient-radial from-orange-50/30 via-transparent to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Content always on top */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default BackgroundLayout;
