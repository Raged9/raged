"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { BoardingPass, playPaperSlideSound } from "@/components/boarding-pass";
import { RotateCcw } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { easeOut, viewportOnce } from "@/lib/motion";

export default function BoardingPassSection() {
  const [progress, setProgress] = useState(0);
  const [detach, setDetach] = useState(0);
  const [showClouds, setShowClouds] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const [altitude, setAltitude] = useState(1500);
  const reduceMotion = useReducedMotion();
  const router = useRouter();

  // Restore detached state if user previously tore the ticket (e.g. returning from typewriter)
  useEffect(() => {
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
  }, []);

  const cloudTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tickerRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger detachment and delayed flight cloud transition to typewriter page
  const triggerDetachment = () => {
    // Instantly separate the ticket pieces
    setDetach(1);
    setProgress(1);

    try {
      sessionStorage.setItem("edgar_boarding_pass_detached", "true");
      localStorage.setItem("edgar_boarding_pass_detached", "true");
    } catch {
      // Ignore storage errors
    }

    // Clear any previous timers
    if (cloudTimeoutRef.current) clearTimeout(cloudTimeoutRef.current);
    if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
    if (tickerRef.current) clearInterval(tickerRef.current);

    // Delay the appearance of clouds (~200ms): snappy & punchy so user catches the tear and immediately transitions
    cloudTimeoutRef.current = setTimeout(() => {
      setShowClouds(true);
      setAltitude(1500);

      const startTime = Date.now();
      tickerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const pct = Math.min(elapsed / 750, 1);
        setAltitude(Math.round(1500 + pct * 30500));
      }, 30);

      // Navigate to dedicated typewriter page at peak of cloud transition (750ms after clouds appear)
      navTimeoutRef.current = setTimeout(() => {
        if (tickerRef.current) clearInterval(tickerRef.current);
        router.push("/typewriter");
      }, 750);
    }, 200);
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
    // Clear any pending cloud transition or navigation timers
    if (cloudTimeoutRef.current) clearTimeout(cloudTimeoutRef.current);
    if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
    if (tickerRef.current) clearInterval(tickerRef.current);
    setShowClouds(false);

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

  // Clean up all timers on unmount
  useEffect(() => {
    return () => {
      if (cloudTimeoutRef.current) clearTimeout(cloudTimeoutRef.current);
      if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
      if (tickerRef.current) clearInterval(tickerRef.current);
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
        <span className="text-xs uppercase tracking-widest text-[#302f2d]/50 font-mono font-medium mb-2 block">
          Flight Clearance • IT-1030
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#302f2d]">
          ready for departure<span className="text-[#302f2d]/30">?</span>
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[#302f2d]/60 leading-relaxed font-normal">
          tear your boarding stub (drag down or press Enter) to take off through the clouds
          into the vintage typewriter terminal.
        </p>
      </motion.div>

      {/* Responsive Ticket Container */}
      <div className="w-full flex justify-center items-center py-4 overflow-x-visible">
        <div className="w-[672px] h-[336px] origin-center transform scale-[0.50] xs:scale-[0.56] sm:scale-[0.76] md:scale-95 lg:scale-100 transition-transform duration-200">
          <BoardingPass
            progress={progress}
            detach={detach}
            onTear={handleTear}
            onRelease={handleRelease}
            onKeyboardTear={handleKeyboardTear}
            onReattach={handleReattach}
          />
        </div>
      </div>

      {/* Fullscreen High-Performance Flight Departure & Cloud Ascent Overlay */}
      {showClouds && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#FAF9F5]/90 backdrop-blur-xl transition-all duration-500 animate-fadeIn"
          style={{ willChange: "opacity" }}
        >
          {/* Ambient Sky Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#EAE6DF] via-[#F4F1EA] to-[#E3DFD5] opacity-80" />

          {/* Cloud Layer 1 - Deep Cumulus Puffs Rising (Pure GPU Transforms) */}
          <motion.div
            initial={{ y: "50vh", scale: 0.85, opacity: 0.3 }}
            animate={{ y: "-25vh", scale: 1.25, opacity: 0.95 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute -bottom-20 left-1/2 -translate-x-1/2 pointer-events-none"
            style={{ willChange: "transform, opacity" }}
          >
            <div className="w-[125vw] max-w-[1600px] h-[65vh] bg-gradient-to-t from-white via-white/95 to-transparent rounded-[50%] blur-2xl opacity-90" />
          </motion.div>

          {/* Cloud Layer 2 - Left Drifting Cloud Bank */}
          <motion.div
            initial={{ x: "-35vw", y: "15vh", opacity: 0.3 }}
            animate={{ x: "10vw", y: "-15vh", opacity: 0.85 }}
            transition={{ duration: 1.3, ease: "easeOut" }}
            className="absolute top-1/4 left-0 pointer-events-none"
            style={{ willChange: "transform, opacity" }}
          >
            <div className="w-[65vw] h-[50vh] bg-gradient-to-tr from-white via-white/90 to-transparent rounded-[60%] blur-xl opacity-80" />
          </motion.div>

          {/* Cloud Layer 3 - Right Drifting Cloud Bank */}
          <motion.div
            initial={{ x: "35vw", y: "20vh", opacity: 0.3 }}
            animate={{ x: "-10vw", y: "-10vh", opacity: 0.85 }}
            transition={{ duration: 1.3, ease: "easeOut" }}
            className="absolute top-1/3 right-0 pointer-events-none"
            style={{ willChange: "transform, opacity" }}
          >
            <div className="w-[70vw] h-[55vh] bg-gradient-to-tl from-white via-white/90 to-transparent rounded-[55%] blur-xl opacity-80" />
          </motion.div>

          {/* Center Flight Avionics HUD Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative z-20 max-w-md w-full mx-4 p-6 sm:p-7 rounded-3xl bg-white/95 border border-black/10 shadow-[0_20px_50px_rgba(48,47,45,0.15)] flex flex-col items-center text-center font-mono"
          >
            {/* Top Flight Badge */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#302f2d]/5 border border-[#302f2d]/10 text-[11px] font-semibold tracking-wider text-[#302f2d] uppercase mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              <span>EDGAR AIRWAYS • FLIGHT IT-1030</span>
            </div>

            {/* Flight Route Corridor with Animated Plane */}
            <div className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-[#FBFAF9] border border-black/5 mb-4">
              <div className="text-left">
                <span className="text-[10px] text-[#302f2d]/50 block">ORIGIN</span>
                <span className="text-lg font-bold text-[#302f2d]">CGK</span>
                <span className="text-[10px] text-[#302f2d]/60 block">JAKARTA</span>
              </div>

              {/* Animated Flight Path */}
              <div className="flex-1 px-4 flex flex-col items-center">
                <motion.div
                  animate={{ x: [-15, 15, -15] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="text-base text-[#302f2d]"
                >
                  ✈️
                </motion.div>
                <div className="w-full h-0.5 border-t-2 border-dashed border-[#302f2d]/25 mt-1" />
                <span className="text-[9px] text-[#302f2d]/50 tracking-widest uppercase mt-1">
                  CRUISING SPEED 480 KTS
                </span>
              </div>

              <div className="text-right">
                <span className="text-xs text-[#302f2d]/50 block">DESTINATION</span>
                <span className="text-lg font-bold text-[#302f2d]">TERMINAL</span>
                <span className="text-[10px] text-[#302f2d]/60 block">TYPE-O-MATIC</span>
              </div>
            </div>

            {/* Live Climbing Altitude Gauge */}
            <div className="w-full bg-[#302f2d] text-white rounded-2xl p-3.5 mb-3 flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] text-white/60 uppercase tracking-widest block font-sans">
                  CURRENT ALTITUDE
                </span>
                <span className="text-xl font-bold tracking-tight text-[#E5E0D8]">
                  {altitude.toLocaleString()} <span className="text-xs font-normal text-white/60">FT</span>
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                  CLIMBING
                </span>
                <span className="text-xs text-white/70">
                  LEVEL 320
                </span>
              </div>
            </div>

            <p className="text-xs text-[#302f2d]/70 flex items-center gap-2">
              <span className="animate-spin inline-block">⚙️</span>
              <span>Entering the typewriter terminal...</span>
            </p>
          </motion.div>
        </div>
      )}
    </section>
  );
}
