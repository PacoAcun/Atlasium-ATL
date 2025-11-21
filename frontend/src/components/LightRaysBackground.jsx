import React from "react";

export function LightRaysBackground({ children }) {
  return (
    <div className="relative w-full h-full overflow-hidden bg-[#191919]">
      {/* Light Rays */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% -20%, rgba(255,255,255,0.15), rgba(0,0,0,0))",
          maskImage:
            "radial-gradient(circle at 50% -20%, rgba(0,0,0,1), transparent 70%)",
        }}
      />

      {children}
    </div>
  );
}
