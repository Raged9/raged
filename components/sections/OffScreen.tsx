"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { OffScreenPhoto } from "@/types";
import {
  Coffee,
  Moon,
  Sun,
  Compass,
  Monitor,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Hand,
} from "lucide-react";
import OffScreenAsciiBg from "./OffScreenAsciiBg";
import { api } from "@/lib/api-client";

interface OffScreenProps {
  initialPhotos?: OffScreenPhoto[];
}

const rotations = [-10, -8, -6, -4, -1, 4, 6, 8];

const STACK_PRESETS = [
  { rot: 1.5, x: 0, y: 0, scale: 1, zIndex: 10, shadow: "shadow-2xl shadow-black/40" },
  { rot: -3.5, x: -3, y: 5, scale: 0.98, zIndex: 9, shadow: "shadow-xl shadow-black/30" },
  { rot: 4, x: 5, y: 9, scale: 0.96, zIndex: 8, shadow: "shadow-lg shadow-black/22" },
  { rot: -6, x: -6, y: 13, scale: 0.94, zIndex: 7, shadow: "shadow-md shadow-black/16" },
];

/**
 * Shared photographic / analog content rendered inside each polaroid frame
 */
function PolaroidFace({
  photo,
  index,
  size = "sm",
}: {
  photo: OffScreenPhoto;
  index: number;
  size?: "sm" | "lg";
}) {
  const hasImage = Boolean(photo.imageUrl && photo.imageUrl.trim() !== "");

  return (
    <div className="w-full h-full overflow-hidden bg-neutral-200 select-none">
      {hasImage ? (
        <img
          src={photo.imageUrl}
          alt={photo.caption}
          draggable={false}
          className="w-full h-full object-cover"
        />
      ) : (
        /* Thematic analog placeholder */
        <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center relative select-none">
          {index % 8 === 0 ? (
            <div className="w-full h-full bg-[#3B2820] flex flex-col items-center justify-center text-amber-100">
              <Coffee className={size === "lg" ? "w-8 h-8 text-pink-200" : "w-5 h-5 text-pink-200"} />
              <span className={`${size === "lg" ? "text-[10px]" : "text-[7px]"} font-mono mt-1 opacity-70`}>
                08:30 AM
              </span>
            </div>
          ) : index % 8 === 1 ? (
            <div className="w-full h-full bg-[#0E1528] flex flex-col items-center justify-center text-cyan-200">
              <Compass className={size === "lg" ? "w-8 h-8 text-cyan-300" : "w-5 h-5 text-cyan-300"} />
              <span className={`${size === "lg" ? "text-[9px]" : "text-[6px]"} font-mono mt-1 text-cyan-200/70 uppercase`}>
                Night
              </span>
            </div>
          ) : index % 8 === 2 ? (
            <div className="w-full h-full bg-[#1A1C23] flex flex-col items-center justify-center text-emerald-300">
              <Monitor className={size === "lg" ? "w-8 h-8 text-zinc-400" : "w-5 h-5 text-zinc-400"} />
              <span className={`${size === "lg" ? "text-[9px]" : "text-[6px]"} font-mono mt-1 text-zinc-400 uppercase`}>
                Desk
              </span>
            </div>
          ) : index % 8 === 3 ? (
            <div className="w-full h-full bg-[#F5F2EB] flex flex-col items-center justify-center text-zinc-800">
              <span className={`serif ${size === "lg" ? "text-lg" : "text-xs"} font-bold`}>ฅ^•ﻌ•^ฅ</span>
              <span className={`${size === "lg" ? "text-[9px]" : "text-[6px]"} font-mono mt-1 text-zinc-500 uppercase`}>
                Doodle
              </span>
            </div>
          ) : index % 8 === 4 ? (
            <div className="w-full h-full bg-[#0B1021] flex flex-col items-center justify-center text-amber-200">
              <Moon className={size === "lg" ? "w-8 h-8 fill-amber-200 text-amber-200" : "w-5 h-5 fill-amber-200 text-amber-200"} />
              <span className={`${size === "lg" ? "text-[9px]" : "text-[6px]"} font-mono mt-1 text-white/50`}>
                02:44 AM
              </span>
            </div>
          ) : index % 8 === 5 ? (
            <div className="w-full h-full bg-[#C91A25] flex flex-col items-center justify-center text-white">
              <span className={`serif ${size === "lg" ? "text-lg" : "text-xs"} font-bold`}>Edgar</span>
              <span className={`${size === "lg" ? "text-[9px]" : "text-[6px]"} font-mono mt-1 uppercase text-white/70`}>
                Passport
              </span>
            </div>
          ) : index % 8 === 6 ? (
            <div className="w-full h-full bg-[#143D4A] flex flex-col items-center justify-center text-teal-200">
              <Sparkles className={size === "lg" ? "w-8 h-8 text-teal-300" : "w-5 h-5 text-teal-300"} />
              <span className={`${size === "lg" ? "text-[9px]" : "text-[6px]"} font-mono mt-1 uppercase text-teal-100`}>
                Coast
              </span>
            </div>
          ) : (
            <div className="w-full h-full bg-[#7C4724] flex flex-col items-center justify-center text-amber-100">
              <Sun className={size === "lg" ? "w-8 h-8 text-amber-300" : "w-5 h-5 text-amber-300"} />
              <span className={`serif ${size === "lg" ? "text-sm" : "text-[9px]"} font-bold text-amber-100 mt-1`}>
                dog
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function OffScreen({ initialPhotos = [] }: OffScreenProps) {
  const [livePhotos, setLivePhotos] = useState<OffScreenPhoto[]>(initialPhotos);
  const [hovered, setHovered] = useState<number | null>(null);
  const [activeStackIndex, setActiveStackIndex] = useState(0);
  const reduceMotion = Boolean(useReducedMotion());

  useEffect(() => {
    api
      .getPhotos()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setLivePhotos(data);
        }
      })
      .catch(() => {});
  }, []);

  const photos =
    livePhotos.length > 0
      ? livePhotos
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

  const handleNext = () => {
    setActiveStackIndex((prev) => (prev + 1) % photos.length);
  };

  const handlePrev = () => {
    setActiveStackIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const currentPhoto = photos[activeStackIndex % photos.length];

  return (
    <section className="relative flex flex-col max-w-4xl w-full p-6 sm:p-7 mx-auto justify-center items-center py-16 sm:py-24 select-none">
      {/* Ambient Classic ASCII Animations (Left: Vintage Typewriter, Right: Orbiting Paper Airplane) */}
      <OffScreenAsciiBg />

      <div className="relative z-10 flex w-full flex-col items-center">
        {/* Title placed in the open empty space between the left and right ASCII art */}
        <div className="w-full flex flex-col items-center justify-center mb-8 sm:mb-12 text-center">
          <span className="text-xs sm:text-sm font-mono uppercase tracking-[0.25em] text-base/60 font-bold mb-2">
            analog moments & life
          </span>
          <h2 className="serif text-4xl sm:text-5xl md:text-6xl font-bold text-base tracking-tight leading-none">
            off screen<span className="text-base/30">.</span>
          </h2>
        </div>

        {/* ========================================================
            MOBILE VIEW (md:hidden): Interactive Messy Stack of Polaroids
            - Authentic Polaroid proportions: 14-16px pure white border,
              100% square photo aperture, 56-64px thick white chin.
            - 1 photo in sharp focus on top
            - 3 photos peek out underneath with realistic white edges
            - Tap or swipe to flick to the next photo
            ======================================================== */}
        <div className="md:hidden flex flex-col items-center justify-center w-full my-4">
          {/* Stack Container */}
          <div
            onClick={handleNext}
            className="relative w-[260px] xs:w-[285px] h-[345px] xs:h-[375px] flex items-center justify-center cursor-pointer select-none group"
            style={{ perspective: "1000px" }}
          >
            {/* Render 3 under-layers in reverse (offset 3, 2, 1) */}
            {[3, 2, 1].map((offset) => {
              const layerIdx = (activeStackIndex + offset) % photos.length;
              const layerPhoto = photos[layerIdx];
              const preset = STACK_PRESETS[offset];

              return (
                <div
                  key={`underlayer-${offset}`}
                  className={`absolute inset-0 bg-white p-3.5 xs:p-4 pb-14 xs:pb-16 rounded-[4px] border border-neutral-300/80 pointer-events-none transition-transform duration-300 ease-out ${preset.shadow}`}
                  style={{
                    transform: `translate3d(${preset.x}px, ${preset.y}px, 0) rotate(${preset.rot}deg) scale(${preset.scale})`,
                    zIndex: preset.zIndex,
                  }}
                >
                  <div className="relative w-full aspect-square overflow-hidden bg-neutral-900 rounded-[2px] ring-1 ring-black/15 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
                    <PolaroidFace photo={layerPhoto} index={layerIdx} size="lg" />
                  </div>
                  {/* Subtle placeholder chin */}
                  <div className="w-full flex items-center justify-center pt-3.5 px-2">
                    <div className="w-20 h-2 bg-neutral-200/80 rounded-full" />
                  </div>
                </div>
              );
            })}

            {/* Top Active Card with Flick / Slide-Off Animation */}
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={`top-card-${activeStackIndex}-${currentPhoto.id}`}
                initial={
                  reduceMotion
                    ? { opacity: 0 }
                    : { scale: 0.94, opacity: 0.8, y: 8 }
                }
                animate={{
                  scale: 1,
                  opacity: 1,
                  x: 0,
                  y: 0,
                  rotate: STACK_PRESETS[0].rot,
                  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
                }}
                exit={
                  reduceMotion
                    ? { opacity: 0 }
                    : {
                        x: 140,
                        rotate: 16,
                        opacity: 0,
                        scale: 0.88,
                        transition: { duration: 0.26, ease: "easeIn" },
                      }
                }
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.4}
                onDragEnd={(_, info) => {
                  if (Math.abs(info.offset.x) > 35) {
                    handleNext();
                  }
                }}
                className={`absolute inset-0 bg-white p-3.5 xs:p-4 pb-14 xs:pb-16 rounded-[4px] border border-neutral-300/80 cursor-pointer ${STACK_PRESETS[0].shadow}`}
                style={{ zIndex: 15 }}
              >
                {/* Photo Image / Graphic (100% square aperture with inner bevel) */}
                <div className="relative w-full aspect-square overflow-hidden bg-neutral-900 rounded-[2px] ring-1 ring-black/15 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
                  <PolaroidFace
                    photo={currentPhoto}
                    index={activeStackIndex}
                    size="lg"
                  />
                </div>

                {/* Classic Bold Polaroid Caption on Generous White Chin */}
                <div className="w-full flex flex-col items-center justify-center pt-3 px-2">
                  <p className="serif text-sm xs:text-base font-bold text-neutral-800 text-center tracking-tight truncate w-full">
                    {currentPhoto.caption}
                  </p>
                  <span className="text-[10px] xs:text-[11px] font-mono tracking-widest text-neutral-400 uppercase mt-0.5 block">
                    POLAROID • {String(activeStackIndex + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Mobile Bottom Navigation & Tap Hint */}
          <div className="flex flex-col items-center gap-2 mt-8">
            <div className="flex items-center gap-4 bg-surface/90 backdrop-blur-md px-4 py-2 rounded-full border border-base/15 shadow-sm">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="p-1.5 rounded-full text-base/60 hover:text-base active:scale-90 transition cursor-pointer"
                aria-label="Previous photo"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-mono tracking-widest text-base font-semibold">
                {String(activeStackIndex + 1).padStart(2, "0")} — {String(photos.length).padStart(2, "0")}
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="p-1.5 rounded-full text-base/60 hover:text-base active:scale-90 transition cursor-pointer"
                aria-label="Next photo"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <span className="text-xs font-mono uppercase tracking-widest text-base/50 flex items-center gap-1 pt-1 font-medium">
              <span>Tap foto untuk lanjut</span>
            </span>
          </div>
        </div>

        {/* ========================================================
            DESKTOP VIEW (hidden md:flex): Classic Fanned Polaroids Deck
            - Preserves original Tayo horizontal spread, hover lift & tooltips
            ======================================================== */}
        <div className="hidden md:flex w-full items-center justify-center overflow-visible pb-0 no-scrollbar">
          {photos.map((photo, i) => {
            const isHovered = hovered === i;

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
                  <PolaroidFace photo={photo} index={i} size="sm" />
                </div>

                {/* Tooltip reveal matching Tayo source code */}
                <span
                  className={`
                    absolute left-1/2 bg-surface shadow-md shadow-black/20 rounded-full px-3 py-1 text-base/90 font-bold -translate-x-1/2 -top-10
                    text-xs whitespace-nowrap hidden md:block border border-base/10
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
