"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  BoardingPass,
  playPaperSlideSound,
  triggerCloudTransition,
} from "@/components/boarding-pass";
import { motion, useReducedMotion } from "motion/react";
import { easeOut, viewportOnce } from "@/lib/motion";
import { RotateCcw } from "lucide-react";

export default function BoardingPassSection() {
  const [progress, setProgress] = useState(0);
  const [detach, setDetach] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const router = useRouter();

  // Prefetch /typewriter and restore detached state if user previously tore the ticket
  useEffect(() => {
    router.prefetch("/typewriter");
    try {
      const isDetached =
        sessionStorage.getItem("edgar_boarding_pass_detached") === "true" ||
        localStorage.getItem("edgar_boarding_pass_detached") === "true";
      if (isDetached) {
        setProgress(1);
        setDetach(1);
      }
    } catch {
      // Ignore storage errors in private browsing/sandboxed contexts
    }
  }, [router]);

  const cloudTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger detachment and bottom-to-top Clash-of-Clans cloud transition to /typewriter
  const triggerDetachment = () => {
    setDetach(1);
    setProgress(1);

    try {
      sessionStorage.setItem("edgar_boarding_pass_detached", "true");
      localStorage.setItem("edgar_boarding_pass_detached", "true");
    } catch {
      // Ignore storage errors
    }

    if (cloudTimeoutRef.current) clearTimeout(cloudTimeoutRef.current);

    // Let the user see the ticket stub snap off (~180ms), then launch the 2.5s bottom-to-top cloud transition
    cloudTimeoutRef.current = setTimeout(() => {
      triggerCloudTransition({
        onMidpoint: () => {
          router.push("/typewriter");
        },
      });
    }, 180);
  };

  const handleTear = (val: number) => {
    setProgress(val);
    if (val >= 1) {
      triggerDetachment();
    }
  };

  const handleRelease = () => {
    if (detach < 1) {
      setProgress(0);
    }
  };

  const handleKeyboardTear = (delta: number) => {
    const next = Math.max(Math.min(progress + delta, 1), 0);
    setProgress(next);
    if (next >= 1) {
      triggerDetachment();
    }
  };

  const handleReattach = () => {
    if (cloudTimeoutRef.current) clearTimeout(cloudTimeoutRef.current);

    try {
      sessionStorage.removeItem("edgar_boarding_pass_detached");
      localStorage.removeItem("edgar_boarding_pass_detached");
    } catch {
      // Ignore storage errors
    }
    playPaperSlideSound();
    setDetach(0);
    setProgress(0);
  };

  useEffect(() => {
    return () => {
      if (cloudTimeoutRef.current) clearTimeout(cloudTimeoutRef.current);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="boarding-pass"
      aria-label="Boarding Pass Section"
      className="relative min-h-[85vh] flex flex-col items-center justify-center py-20 px-4 overflow-hidden max-w-304 w-full mx-auto"
    >
      {/* Section Header */}
      <motion.div
        className="text-center max-w-xl mx-auto mb-10"
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewportOnce}
        transition={{ duration: 0.6, ease: easeOut }}
      >
        <span className="text-xs sm:text-sm uppercase tracking-[0.22em] text-base/60 font-mono font-bold mb-3 block">
          Flight Clearance • IT-1030
        </span>
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-base leading-tight mb-4">
          ready for departure<span className="text-base/30">?</span>
        </h2>
        <p className="text-base sm:text-lg text-base/75 leading-relaxed font-normal max-w-lg mx-auto">
          tear your boarding stub (drag down or press Enter) to take off through the clouds
          into the vintage typewriter terminal.
        </p>
      </motion.div>

      {/* Responsive Ticket Container */}
      <div className="w-full flex flex-col justify-center items-center py-4 overflow-x-visible">
        <div className="w-[672px] h-[336px] origin-center transform scale-[0.56] xs:scale-[0.64] sm:scale-[0.80] md:scale-95 lg:scale-100 transition-transform duration-200">
          <BoardingPass
            progress={progress}
            detach={detach}
            onTear={handleTear}
            onRelease={handleRelease}
            onKeyboardTear={handleKeyboardTear}
            onReattach={handleReattach}
          />
        </div>

        {/* Mobile-Friendly Prominent Reattach CTA (shows when ticket stub is detached) */}
        {detach >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex flex-col items-center gap-2 md:hidden z-20"
          >
            <button
              type="button"
              onClick={handleReattach}
              className="px-7 py-3.5 rounded-full bg-base text-bg text-sm sm:text-base font-mono font-bold uppercase tracking-wider flex items-center gap-2.5 shadow-xl shadow-black/25 active:scale-95 transition cursor-pointer"
              aria-label="Reattach ticket stub"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reattach Ticket</span>
            </button>
            <span className="text-xs font-mono text-base/60 font-medium">
              Ticket Detached • Tap to reassemble
            </span>
          </motion.div>
        )}
      </div>
    </section>
  );
}
