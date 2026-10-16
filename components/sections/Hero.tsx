"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import localFont from "next/font/local";
import { easeOut, fadeUp, staggerChildren } from "@/lib/motion";
import PixelDotGrid from "./PixelDotGrid";
import { Project } from "@/types";
import { Sparkles, ExternalLink, X } from "lucide-react";

const borel = localFont({
  src: "../../public/Borel-Regular.ttf",
  weight: "400",
  style: "normal",
  display: "swap",
});

interface HeroProps {
  projects?: Project[];
}

export default function Hero({ projects = [] }: HeroProps) {
  const [selected, setSelected] = useState<any | null>(null);
  const reduceMotion = useReducedMotion();

  // Design carousel items (using projects with images, or aesthetic UI placeholders)
  const carouselItems =
    projects.length > 0
      ? projects
      : [
        {
          id: "seekr",
          title: "Seekr Platform",
          subtitle: "Outbound intelligence automation",
          description: "AI-driven customer prospecting and pipeline workflows",
          imageUrl: "",
        },
        {
          id: "clean-cut",
          title: "Clean Cut Confidence",
          subtitle: "Editorial grooming & art direction",
          description: "Visual identity and modern typography poster",
          imageUrl: "",
        },
        {
          id: "mylk",
          title: "mylk Renders",
          subtitle: "Plant-based packaging renders",
          description: "3D packaging renders and brand identity system",
          imageUrl: "",
        },
        {
          id: "pulsestream",
          title: "PulseStream Observability",
          subtitle: "Cloud metrics streaming engine",
          description: "Real-time telemetry processing 1.2M events/sec",
          imageUrl: "",
        },
        {
          id: "type-o-matic",
          title: "Type-O-Matic",
          subtitle: "Tactile typewriter simulator",
          description: "Vintage mechanical typing experience with audio-haptics",
          imageUrl: "",
        },
      ];

  // Duplicate for seamless 50% loop
  const displayItems = [...carouselItems, ...carouselItems];

  return (
    <section
      id="hero"
      className="relative z-10 flex pt-32 sm:pt-32 md:pt-28 pb-10 flex-col max-w-304 w-full mx-auto px-6 sm:px-10 md:px-12 lg:px-16 justify-center"
    >
      {/* Top Part: Intro Text + Pixel Dot Grid */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12 lg:gap-14 w-full">
        {/* Left Column: Text content */}
        <motion.div
          className="flex flex-col flex-1 max-w-xl"
          variants={staggerChildren(0.12)}
          initial={reduceMotion ? false : "hidden"}
          animate="visible"
        >
          {/* Headline: hello, i'm [frame avatar] edgar. an informatics student and builder. */}
          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.7, ease: easeOut }}
            className="text-3xl sm:text-[34px] font-bold text-[#302f2d] leading-[1.25] tracking-tight"
          >
            <span className="inline-flex items-center align-baseline">
              <span
                className={`${borel.className} font-normal text-3xl sm:text-[34px] text-[#302f2d] mr-2.5 leading-none inline-block relative top-[9px] sm:top-[10px]`}
                style={{ letterSpacing: "normal" }}
              >
                hello,
              </span>
              <span>i&apos;m</span>
              <Image
                src="/edgar.jpg"
                alt="edgar"
                width={120}
                height={120}
                priority
                className="size-8 sm:size-9 md:size-10 border-3 border-white rounded-xl shadow-[0px_6px_6px_0px_#00000015] inline-block -rotate-7 mx-2 object-cover overflow-hidden shrink-0"
              />
              <span>edgar.</span>
            </span>
            <span className="block">
              an informatics student and builder.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.7, ease: easeOut }}
            className="mt-3.5 sm:mt-4 text-[#302f2d]/70 text-sm sm:text-[14px] leading-relaxed max-w-xl font-normal"
          >
            i build things with code - from scalable management systems to tactile web experiences.
          </motion.p>

          {/* Actions */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.7, ease: easeOut }}
            className="flex items-center gap-3 sm:gap-4 mt-6 sm:mt-7 flex-wrap sm:flex-nowrap"
          >
            <Link
              href="#projects"
              className="serif py-3 px-6 min-h-11 rounded-[13px] text-[18px] hover:scale-105 active:scale-95 transition-all duration-300 font-bold cursor-pointer text-white bg-[#302f2d] shadow-lg shadow-black/15 w-fit flex items-center justify-center"
            >
              welcome to my world
            </Link>
            <Link
              href="#boarding-pass"
              className="py-3 px-4 min-h-11 rounded-[13px] text-[14px] font-medium text-base/60 bg-[#f5f5f5] hover:bg-[#eae8e4] hover:text-base transition-all duration-200 flex items-center"
            >
              boarding pass →
            </Link>
          </motion.div>
        </motion.div>

        {/* Right Column: Interactive Pixel Dot Grid (Hidden on mobile, visible on desktop) */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.25, ease: easeOut }}
          className="hidden lg:flex shrink-0 lg:w-auto justify-end -translate-x-[3px]"
        >
          <PixelDotGrid />
        </motion.div>
      </div>

      {/* Carousel — integrated directly into Hero section matching Tayo source code */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.45, ease: easeOut }}
        className="mt-10 sm:mt-12 relative z-10 overflow-hidden w-[calc(100%+3rem)] sm:w-[calc(100%+5rem)] md:w-[calc(100%+6rem)] -mx-6 sm:-mx-10 md:-mx-12 py-8 select-none"
        style={{
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
          maskImage:
            "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
        }}
      >
        <div className="flex w-max marquee-track">
          {displayItems.map((item, i) => {
            const hasImage = Boolean(item.imageUrl && item.imageUrl.trim() !== "");

            return hasImage ? (
              <img
                key={`${item.id}-${i}`}
                src={item.imageUrl}
                alt={item.title}
                onClick={() => setSelected(item)}
                className="h-44 sm:h-56 md:h-72 w-auto border-4 sm:border-8 border-white rounded-2xl sm:rounded-3xl shadow-[15px_15px_15px_0px_#00000015,inset_0_0_14px_#000000] mx-2 cursor-pointer hover:scale-[1.02] transition-transform duration-300 object-cover shrink-0"
              />
            ) : (
              <div
                key={`${item.id}-${i}`}
                onClick={() => setSelected(item)}
                className={`h-44 sm:h-56 md:h-72 border-4 sm:border-8 border-white rounded-2xl sm:rounded-3xl shadow-[15px_15px_15px_0px_#00000015] mx-2 cursor-pointer hover:scale-[1.02] transition-transform duration-300 overflow-hidden relative shrink-0 ${i % 3 === 0
                  ? "w-72 sm:w-96 md:w-[480px]"
                  : i % 3 === 1
                    ? "w-48 sm:w-60 md:w-72"
                    : "w-60 sm:w-80 md:w-96"
                  }`}
              >
                {/* Visual UI Mockup Placeholder */}
                {i % 3 === 0 ? (
                  /* Seekr Auth Mockup */
                  <div className="w-full h-full grid grid-cols-12 bg-white text-base overflow-hidden">
                    <div className="col-span-7 p-3 sm:p-5 flex flex-col justify-between border-r border-black/5 bg-[#FAFAFA]">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 mb-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="tracking-wide uppercase text-[10px] sm:text-xs">
                            {item.title.split(" ")[0]}
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-zinc-900 leading-snug">
                          Welcome to {item.title.split(" ")[0]}
                        </h4>
                      </div>
                      <div className="space-y-1 my-auto">
                        <div className="w-full py-1 px-2 rounded bg-zinc-100 text-[9px] text-zinc-400 border border-zinc-200/60 font-mono">
                          enter email...
                        </div>
                        <div className="w-full py-1 rounded bg-zinc-900 text-white text-[9px] font-medium text-center">
                          Continue
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                      </div>
                    </div>
                    <div className="col-span-5 bg-[#1E7B85] p-3 flex flex-col justify-center items-center text-white text-center relative overflow-hidden">
                      <svg
                        className="absolute inset-0 w-full h-full opacity-40 text-white pointer-events-none"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                      >
                        <path
                          d="M-10,30 Q30,10 50,50 T110,70"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3.5"
                        />
                      </svg>
                      <div className="relative z-10 bg-white/95 text-zinc-800 p-2 rounded-lg shadow text-[8px] leading-tight">
                        &ldquo;Fast, clean API engine.&rdquo;
                      </div>
                    </div>
                  </div>
                ) : i % 3 === 1 ? (
                  /* Clean Cut Poster Mockup */
                  <div className="w-full h-full bg-[#EBE5DE] p-3 sm:p-4 flex flex-col justify-between text-center relative overflow-hidden">
                    <div>
                      <span className="text-[7px] tracking-[0.2em] uppercase font-mono text-zinc-500">
                        Editorial
                      </span>
                      <h4 className="text-xs sm:text-sm font-black uppercase tracking-tight text-zinc-900 mt-0.5">
                        {item.title}
                      </h4>
                    </div>
                    <div className="w-16 h-20 sm:w-20 sm:h-24 mx-auto rounded-lg bg-zinc-900 p-2 flex flex-col items-center justify-center text-white">
                      <Sparkles className="w-4 h-4 text-amber-400 mb-1" />
                      <span className="text-[8px] font-mono uppercase tracking-wider text-white/60">
                        Design
                      </span>
                    </div>
                    <p className="text-[8px] text-zinc-600 italic font-serif truncate">
                      {item.subtitle}
                    </p>
                  </div>
                ) : (
                  /* mylk 2x3 Grid Mockup */
                  <div className="w-full h-full bg-[#B29D8E] flex flex-col justify-between text-white p-2 sm:p-2.5">
                    <div className="grid grid-cols-3 gap-1 flex-1">
                      {[1, 2, 3, 4, 5, 6].map((cell) => (
                        <div
                          key={cell}
                          className="bg-black/15 rounded flex flex-col items-center justify-center p-1"
                        >
                          <div className="w-4 h-8 rounded-full bg-white/20 border border-white/30" />
                          <span className="text-[6px] uppercase tracking-tighter opacity-60 mt-0.5 font-mono">
                            #{cell}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-1 pt-1 border-t border-white/20 flex items-center justify-between text-[7px] font-mono uppercase">
                      <span className="serif text-xs font-bold">{item.title.split(" ")[0]}</span>
                      <span className="opacity-75">3D Render</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Fullscreen modal matching Tayo source code */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6 cursor-zoom-out animate-fadeIn"
        >
          <button
            onClick={() => setSelected(null)}
            className="absolute top-6 right-6 w-11 h-11 flex items-center justify-center text-white text-xl rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-4xl w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center justify-center text-center cursor-default"
          >
            {selected.imageUrl ? (
              <img
                src={selected.imageUrl}
                alt={selected.title}
                className="max-h-[60vh] max-w-full rounded-2xl object-contain shadow-lg"
              />
            ) : (
              <div className="p-8 text-zinc-800">
                <h3 className="text-2xl font-bold uppercase tracking-tight">{selected.title}</h3>
                <p className="text-sm text-zinc-500 mt-2 max-w-md mx-auto">{selected.description}</p>
                <span className="inline-block px-3 py-1 mt-4 rounded-full bg-zinc-100 text-xs font-mono text-zinc-600">
                  Image can be uploaded via Admin CMS
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CSS matching Tayo source code: brisk speed (25s) & pause immediately on hover */}
      <style jsx global>{`
        .marquee-track {
          animation: marquee 25s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused !important;
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track {
            animation: none;
          }
        }
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}
