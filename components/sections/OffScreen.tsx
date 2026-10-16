"use client";

import React, { useState } from "react";
import { OffScreenPhoto } from "@/types";
import { Coffee, Moon, Sun, Compass, Monitor, Sparkles } from "lucide-react";

interface OffScreenProps {
  initialPhotos?: OffScreenPhoto[];
}

const rotations = [-10, -8, -6, -4, -1, 4, 6, 8];

export default function OffScreen({ initialPhotos = [] }: OffScreenProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const photos =
    initialPhotos.length > 0
      ? initialPhotos
      : [
          { id: "photo-1", caption: "morning coffee & toast", imageUrl: "", order: 1 },
          { id: "photo-2", caption: "night lights", imageUrl: "", order: 2 },
          { id: "photo-3", caption: "workspace desk", imageUrl: "", order: 3 },
          { id: "photo-4", caption: "sketching with cat", imageUrl: "", order: 4 },
          { id: "photo-5", caption: "crescent moon at 2am", imageUrl: "", order: 5 },
          { id: "photo-6", caption: "passport red backdrop", imageUrl: "", order: 6 },
          { id: "photo-7", caption: "rocky ocean cove", imageUrl: "", order: 7 },
          { id: "photo-8", caption: "dog in the sun", imageUrl: "", order: 8 },
        ];

  const anyHovered = hovered !== null;

  return (
    <section className="flex flex-col max-w-4xl w-full p-6 sm:p-7 mx-auto justify-center items-center py-12 sm:py-16 select-none">
      <div className="flex w-full flex-col">
        {/* Title matching Tayo source code */}
        <h2 className="serif text-2xl sm:text-3xl font-bold text-base mb-8 ml-0 sm:ml-8 text-left">
          off screen.
        </h2>

        {/* Fanned Polaroids Container matching Tayo source code */}
        <div className="flex w-full items-center justify-start md:justify-center overflow-x-auto md:overflow-visible pb-6 md:pb-0 no-scrollbar">
          {photos.map((photo, i) => {
            const isHovered = hovered === i;
            const hasImage = Boolean(photo.imageUrl && photo.imageUrl.trim() !== "");

            return (
              <div
                key={photo.id || i}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                className={`
                  relative bg-white p-2 pb-4 shadow-lg shrink-0
                  transition-all duration-300 ease-out cursor-pointer
                  ${anyHovered ? "-mx-2" : "-mx-3"}
                `}
                style={{
                  transform: isHovered
                    ? "translateY(-12px) rotate(0deg) scale(1.08)"
                    : `rotate(${rotations[i % rotations.length]}deg)`,
                  zIndex: isHovered ? 20 : i,
                  boxShadow: isHovered
                    ? "0 20px 30px -10px rgba(45,25,9,0.35)"
                    : "0 8px 12px -4px rgba(45,25,9,0.15)",
                }}
              >
                {/* Photo container */}
                <div className="w-20 h-28 sm:w-24 sm:h-32 overflow-hidden bg-neutral-200">
                  {hasImage ? (
                    <img
                      src={photo.imageUrl}
                      alt={photo.caption}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    /* Thematic analog placeholder */
                    <div className="w-full h-full flex flex-col items-center justify-center p-1.5 text-center relative select-none">
                      {i === 0 ? (
                        <div className="w-full h-full bg-[#3B2820] flex flex-col items-center justify-center text-amber-100">
                          <Coffee className="w-5 h-5 text-pink-200" />
                          <span className="text-[7px] font-mono mt-1 opacity-70">08:30 AM</span>
                        </div>
                      ) : i === 1 ? (
                        <div className="w-full h-full bg-[#0E1528] flex flex-col items-center justify-center text-cyan-200">
                          <Compass className="w-5 h-5 text-cyan-300" />
                          <span className="text-[6px] font-mono mt-1 text-cyan-200/70 uppercase">
                            Night
                          </span>
                        </div>
                      ) : i === 2 ? (
                        <div className="w-full h-full bg-[#1A1C23] flex flex-col items-center justify-center text-emerald-300">
                          <Monitor className="w-5 h-5 text-zinc-400" />
                          <span className="text-[6px] font-mono mt-1 text-zinc-400 uppercase">
                            Desk
                          </span>
                        </div>
                      ) : i === 3 ? (
                        <div className="w-full h-full bg-[#F5F2EB] flex flex-col items-center justify-center text-zinc-800">
                          <span className="serif text-xs font-bold">ฅ^•ﻌ•^ฅ</span>
                          <span className="text-[6px] font-mono mt-1 text-zinc-500 uppercase">
                            Doodle
                          </span>
                        </div>
                      ) : i === 4 ? (
                        <div className="w-full h-full bg-[#0B1021] flex flex-col items-center justify-center text-amber-200">
                          <Moon className="w-5 h-5 fill-amber-200 text-amber-200" />
                          <span className="text-[6px] font-mono mt-1 text-white/50">02:44 AM</span>
                        </div>
                      ) : i === 5 ? (
                        <div className="w-full h-full bg-[#C91A25] flex flex-col items-center justify-center text-white">
                          <span className="serif text-xs font-bold">Edgar</span>
                          <span className="text-[6px] font-mono mt-1 uppercase text-white/70">
                            Passport
                          </span>
                        </div>
                      ) : i === 6 ? (
                        <div className="w-full h-full bg-[#143D4A] flex flex-col items-center justify-center text-teal-200">
                          <Sparkles className="w-5 h-5 text-teal-300" />
                          <span className="text-[6px] font-mono mt-1 uppercase text-teal-100">
                            Coast
                          </span>
                        </div>
                      ) : (
                        <div className="w-full h-full bg-[#7C4724] flex flex-col items-center justify-center text-amber-100">
                          <Sun className="w-5 h-5 text-amber-300" />
                          <span className="serif text-[9px] font-bold text-amber-100 mt-1">
                            dog
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Tooltip reveal matching Tayo source code */}
                <span
                  className={`
                    absolute left-1/2 bg-white shadow-md shadow-black/10 rounded-full px-3 py-1 text-base/80 font-bold -translate-x-1/2 -top-10
                    text-xs whitespace-nowrap hidden md:block border border-black/5
                    transition-all duration-300 ease-out
                    ${
                      isHovered
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-2 pointer-events-none"
                    }
                  `}
                >
                  {photo.caption}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
