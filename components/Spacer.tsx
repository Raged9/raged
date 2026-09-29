"use client";

import React from "react";

export default function Spacer() {
  return (
    <div className="bg-[#FBFAF9] text-base h-14 w-full max-w-304 mx-auto flex relative overflow-hidden my-6">
      {/* Top dashed border */}
      <div className="absolute left-0 top-0 z-10 border-t w-full text-black/10 border-long-dashed2" />
      {/* Bottom dashed border */}
      <div className="absolute left-0 bottom-0 z-10 border-t w-full text-black/10 border-long-dashed2" />
      {/* Diagonal hatching area */}
      <div className="flex-1 self-stretch relative overflow-hidden opacity-40">
        <div className="absolute left-[-40px] top-[-120px] flex flex-col pointer-events-none">
          {Array.from({ length: 80 }).map((_, i) => (
            <div
              key={i}
              className="h-3.5 w-[200vw] -rotate-45 origin-top-left border-b border-[#E5E3DF]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
