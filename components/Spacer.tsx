"use client";

import React from "react";

export default function Spacer() {
  return (
    <div className="bg-bg text-base h-14 w-full max-w-304 mx-auto flex relative overflow-hidden my-6">
      {/* Top dashed border */}
      <div className="absolute left-0 top-0 z-10 border-t w-full text-base/10 border-long-dashed2" />
      {/* Bottom dashed border */}
      <div className="absolute left-0 bottom-0 z-10 border-t w-full text-base/10 border-long-dashed2" />
      {/* Diagonal hatching area (Single GPU-friendly CSS gradient instead of 80 DOM divs) */}
      <div
        className="flex-1 self-stretch relative overflow-hidden opacity-40 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-45deg, transparent, transparent 9px, rgb(var(--base-rgb) / 0.15) 9px, rgb(var(--base-rgb) / 0.15) 10px)",
        }}
      />
    </div>
  );
}
