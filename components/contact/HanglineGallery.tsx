"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import {
  SlidersHorizontal,
  X,
  ArrowLeft,
  ArrowRight,
  Award,
  Maximize2,
  HelpCircle,
  Compass,
} from "lucide-react";
import { HANGLINE_ITEMS, HanglineItem } from "@/data/hangline-items";
import { api } from "@/lib/api-client";

interface HanglineGalleryProps {
  externalOpenSignal?: number;
}

/**
 * Realistic 3D Wooden Clothespin Component
 * Matching Framer reference images:
 * - 50% handle prongs extend above the wire (user can squeeze)
 * - 50% clamping jaws extend below the wire (gripping the photo print)
 * - The clothesline wire passes horizontally right through the MIDDLE waist of the clothespin!
 * - Features center torsion spring wire coil in the waist notch (cy = 38).
 */
function WoodenClothespin({
  layer,
  className = "",
}: {
  layer: "back" | "front";
  className?: string;
}) {
  if (layer === "back") {
    // Back wooden prong (stands behind photo and wire)
    return (
      <svg
        viewBox="0 0 28 76"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="woodBackShade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7E6C4E" />
            <stop offset="40%" stopColor="#9E8866" />
            <stop offset="100%" stopColor="#635237" />
          </linearGradient>
          <linearGradient id="woodBackTop" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#CDBB9B" />
            <stop offset="100%" stopColor="#8C7756" />
          </linearGradient>
        </defs>
        {/* Soft shadow cast behind */}
        <ellipse cx="13" cy="73" rx="6" ry="2.5" fill="rgba(0,0,0,0.35)" />
        {/* Back prong body spanning from top to bottom (y=4 to 71) */}
        <path
          d="M6 5 C6 4.2 6.8 3.5 7.8 3.5 H18.2 C19.2 3.5 20 4.2 20 5 V70 C20 70.8 19.2 71.5 18.2 71.5 H7.8 C6.8 71.5 6 70.8 6 70 Z"
          fill="url(#woodBackShade)"
        />
        {/* Angled top end-grain oval (visible above front jaw) */}
        <ellipse cx="13" cy="4.5" rx="5.5" ry="2" fill="url(#woodBackTop)" stroke="#635237" strokeWidth="0.5" />
        {/* Middle waist notch where clothesline wire and spring rest (cy = 38) */}
        <rect x="5.5" y="34.5" width="15" height="7" rx="1.5" fill="#2E251A" opacity="0.95" />
      </svg>
    );
  }

  // Front wooden prong (sits in front of photo and in front of wire)
  // Sits centered with the wire passing right through its middle waist (cy = 38)
  return (
    <svg
      viewBox="0 0 28 76"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="woodFrontFace" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FAF4E8" />
          <stop offset="30%" stopColor="#EFE5D3" />
          <stop offset="75%" stopColor="#DACBB1" />
          <stop offset="100%" stopColor="#BAA98B" />
        </linearGradient>
        <linearGradient id="woodBevelSide" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#CBB897" />
          <stop offset="100%" stopColor="#7B694D" />
        </linearGradient>
        <linearGradient id="springMetalGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="30%" stopColor="#E4E4E7" />
          <stop offset="70%" stopColor="#71717A" />
          <stop offset="100%" stopColor="#27272A" />
        </linearGradient>
      </defs>

      {/* Soft contact shadow cast by front jaw onto photo print */}
      <ellipse cx="12" cy="73" rx="7" ry="2.5" fill="rgba(0,0,0,0.3)" />

      {/* Upper Squeeze Handle Prongs (y = 5 to 35) */}
      <path
        d="M5 6 C5 5 5.8 4.2 6.8 4.2 H19.2 C20.2 4.2 21 5 21 6 V35 C21 35.8 20.4 36.5 19.5 36.5 H6.5 C5.6 36.5 5 35.8 5 35 Z"
        fill="url(#woodFrontFace)"
      />

      {/* Top end-grain beveled oval */}
      <ellipse cx="13" cy="5" rx="6" ry="1.8" fill="#FFFDF8" stroke="#DACBB1" strokeWidth="0.5" />

      {/* 3D Right Side Bevel on Upper Handle */}
      <path d="M21 6 L24 4.5 V33.5 L21 35 Z" fill="url(#woodBevelSide)" />

      {/* Vertical slit between upper squeeze prongs */}
      <line
        x1="13"
        y1="8"
        x2="13"
        y2="30"
        stroke="#4A3E2D"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.85"
      />
      {/* Keyhole circular relief above the middle waist */}
      <circle
        cx="13"
        cy="32"
        r="1.8"
        fill="#2A2217"
        stroke="#5C4D38"
        strokeWidth="0.5"
      />

      {/* ========================================================
          MIDDLE WAIST (cy = 38): Wire notch & Metallic Spring Coil
          The clothesline wire passes right through the middle waist!
          ======================================================== */}
      {/* Waist indent notch */}
      <path
        d="M 5 36 Q 7 38 5 40 H 21 Q 19 38 21 36 Z"
        fill="#2C2318"
        opacity="0.95"
      />

      {/* Metallic Spring Wire Coil Wrapping the Waist */}
      <g>
        {/* Spring wire shadow */}
        <ellipse cx="13" cy="39.2" rx="7.2" ry="2.2" fill="rgba(0,0,0,0.3)" />
        {/* Front Metal Spring Ring / Coil in middle waist */}
        <path
          d="M 5 38.5 Q 13 36.5 21 38.5"
          fill="none"
          stroke="url(#springMetalGrad)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* Specular White Highlight on Spring wire */}
        <path
          d="M 9 37.8 Q 13 36.8 17 37.8"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="0.8"
          strokeLinecap="round"
          opacity="0.9"
        />
      </g>

      {/* ========================================================
          LOWER CLAMPING JAW (y = 39 to 71): Gripping photo below wire
          ======================================================== */}
      <path
        d="M5 39.5 C5 39 5.8 38.5 6.8 38.5 H19.2 C20.2 38.5 21 39 21 39.5 V69 C21 70.1 20.1 71 19 71 H7 C5.9 71 5 70.1 5 69 Z"
        fill="url(#woodFrontFace)"
      />

      {/* 3D Right Side Bevel on Lower Jaw */}
      <path d="M21 39.5 L24 38 V67 L21 69 Z" fill="url(#woodBevelSide)" />

      {/* Bottom chamfered edge */}
      <path d="M6 70.5 L20 70.5 L23 68.5 L7 68.5 Z" fill="#9C8868" opacity="0.85" />

      {/* Subtle vertical wood grain fibers on jaw */}
      <line x1="9" y1="42" x2="9" y2="67" stroke="#ECE0CB" strokeWidth="0.5" opacity="0.6" />
      <line x1="16.5" y1="42" x2="16.5" y2="67" stroke="#FFFBF2" strokeWidth="0.4" opacity="0.7" />
    </svg>
  );
}

/**
 * Renders either a rich archival certificate/award overlay or a clean photographic print
 */
function PrintSurface({
  item,
  isSelected,
}: {
  item: HanglineItem;
  isSelected: boolean;
}) {
  const cert = item.certificateOverlay;

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#18181B] select-none">
      <img
        src={item.image || "/edgar-warm.jpg"}
        alt={item.title}
        draggable={false}
        className={`w-full h-full object-cover transition-transform duration-700 ${
          cert
            ? "scale-105 brightness-[0.42] contrast-110"
            : "brightness-[0.98]"
        } ${isSelected ? "object-center" : "object-center"}`}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, transparent 55%, rgba(0,0,0,0.25) 100%)",
        }}
      />

      {cert ? (
        <div className="absolute inset-0 p-3 sm:p-5 flex flex-col justify-between text-white pointer-events-none">
          <div className="absolute inset-2 sm:inset-3 border border-white/25 rounded-sm pointer-events-none" />
          <div className="absolute inset-3 sm:inset-4 border border-white/10 pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between gap-2 px-1 pt-0.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: cert.accentColor || "#10B981" }}
              />
              <span className="text-[8px] sm:text-[9px] font-mono uppercase tracking-[0.18em] text-white/80 truncate">
                {cert.issuerLogoText}
              </span>
            </div>
            <span className="text-[8px] sm:text-[9px] font-mono text-white/60 shrink-0">
              {cert.date}
            </span>
          </div>

          <div className="relative z-10 px-1.5 my-auto space-y-1">
            <span
              className="inline-block text-[7px] sm:text-[8px] font-mono uppercase tracking-[0.2em] px-1.5 py-0.5 rounded bg-white/15 text-white/90 backdrop-blur-xs"
              style={{
                borderLeft: `2px solid ${cert.accentColor || "#10B981"}`,
              }}
            >
              {cert.type === "award"
                ? "OFFICIAL RECORD"
                : "CREDENTIAL PRINT"}
            </span>
            <h4 className="text-sm sm:text-base md:text-lg font-bold tracking-tight text-white leading-tight drop-shadow-sm font-sans line-clamp-2">
              {item.title}
            </h4>
            <p className="text-[9px] sm:text-[10px] text-white/75 font-mono uppercase tracking-wider truncate">
              {cert.recipient || "Christopher Edgar"}
            </p>
          </div>

          <div className="relative z-10 flex items-end justify-between px-1 pb-0.5">
            <div>
              <span className="text-[7px] font-mono uppercase tracking-widest text-white/45 block">
                ID
              </span>
              <span className="text-[8px] sm:text-[9px] font-mono text-white/80">
                {cert.credentialId}
              </span>
            </div>

            <div
              className="size-6 sm:size-7 rounded-full border border-white/40 flex items-center justify-center backdrop-blur-xs shadow-md"
              style={{ backgroundColor: `${cert.accentColor || "#10B981"}33` }}
            >
              <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
            </div>
          </div>
        </div>
      ) : (
        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 bg-gradient-to-t from-black/75 via-black/30 to-transparent flex items-end justify-between pointer-events-none">
          <div>
            {item.badgeText && (
              <span className="inline-block text-[7px] sm:text-[8px] font-mono uppercase tracking-[0.2em] px-1.5 py-0.5 rounded bg-white/20 text-white backdrop-blur-xs mb-0.5">
                {item.badgeText}
              </span>
            )}
            <h4 className="text-xs sm:text-sm font-semibold text-white tracking-tight drop-shadow-xs font-sans line-clamp-1">
              {item.title}
            </h4>
          </div>
          <span className="text-[9px] font-mono text-white/75">
            {item.number}
          </span>
        </div>
      )}
    </div>
  );
}

export default function HanglineGallery({
  externalOpenSignal = 0,
}: HanglineGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const [items, setItems] = useState<HanglineItem[]>(HANGLINE_ITEMS);

  useEffect(() => {
    api
      .getHanglineItems()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setItems(data);
        }
      })
      .catch(() => {});
  }, []);

  const [activeCategory, setActiveCategory] = useState<
    "all" | "milestone" | "certificate" | "competition" | "event"
  >("all");

  const filteredItems =
    activeCategory === "all"
      ? items
      : items.filter((item) => item.category === activeCategory);

  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoverPointer, setHoverPointer] = useState<{
    idx: number | null;
    rx: number;
    ry: number;
  }>({ idx: null, rx: 0, ry: 0 });
  const [renderPos, setRenderPos] = useState(0);
  const targetPosRef = useRef(0);
  const currentPosRef = useRef(0);
  const velocityRef = useRef(0);
  const [swayAngle, setSwayAngle] = useState(0);

  const [selectedItem, setSelectedItem] = useState<HanglineItem | null>(null);
  const [lightboxItem, setLightboxItem] = useState<HanglineItem | null>(null);

  const activePreviewItem =
    (hoveredIndex !== null ? filteredItems[hoveredIndex] : filteredItems[activeIndex]) ||
    filteredItems[0];

  const [showHowToUse, setShowHowToUse] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [spacingMode, setSpacingMode] = useState<"compact" | "standard" | "wide">(
    "standard"
  );
  const [tiltIntensity, setTiltIntensity] = useState<"classic" | "deep">("classic");

  const [viewport, setViewport] = useState<"mobile" | "tablet" | "desktop">(
    "desktop"
  );

  // Initial gentle breeze sway triggered when Hangline first scrolls into view
  const [initialWindSway, setInitialWindSway] = useState(0);
  const initialWindElapsedRef = useRef(-1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || reduceMotion) return;

    let rafId = 0;
    let observer: IntersectionObserver | null = null;

    observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && initialWindElapsedRef.current === -1) {
          observer?.disconnect();
          initialWindElapsedRef.current = 0;

          const startT = performance.now();
          const animateWind = (now: number) => {
            const t = (now - startT) / 1000;
            initialWindElapsedRef.current = t;
            if (t > 2.8) {
              setInitialWindSway(0);
              return;
            }
            // Natural damped harmonic breeze oscillation (gust of ~4.6 deg, smoothly decaying)
            const decay = Math.exp(-t * 1.65);
            const gust = 4.6 * decay * Math.sin(t * 4.8);
            setInitialWindSway(gust);
            rafId = requestAnimationFrame(animateWind);
          };

          rafId = requestAnimationFrame(animateWind);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);

    return () => {
      observer?.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [reduceMotion]);

  useEffect(() => {
    const updateViewport = () => {
      if (window.innerWidth < 640) setViewport("mobile");
      else if (window.innerWidth < 1024) setViewport("tablet");
      else setViewport("desktop");
    };
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    if (externalOpenSignal > 0) {
      containerRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [externalOpenSignal]);

  // Reset target position when category changes
  useEffect(() => {
    targetPosRef.current = 0;
    currentPosRef.current = 0;
    setRenderPos(0);
    setActiveIndex(0);
    setHoveredIndex(null);
    setHoverPointer({ idx: null, rx: 0, ry: 0 });
    setSelectedItem(null);
  }, [activeCategory]);

  // Smooth spring physics loop with dynamic viewport-aware scroll mapping
  // Dynamically adapts based on the number of certificates/items:
  // Balances noticeable, satisfying slide per certificate (~75px) while keeping cards centered!
  useEffect(() => {
    let rafId = 0;
    const tick = () => {
      const N = filteredItems.length;

      // When reaching the last card (N - 1), it shouldn't be thrown down to rel = 0 (bottom-left corner),
      // nor should it freeze. Instead, it settles at a natural centered position (rel = 1.0 - 1.4)
      // allowing a healthy, satisfying ~0.55 - 0.70 slide step per certificate!
      const lastRelTarget =
        N <= 1
          ? 0
          : viewport === "mobile"
          ? Math.min(1.2, Math.max(0.6, 0.35 * (N - 1)))
          : Math.min(1.8, Math.max(0.8, 0.45 * (N - 1)));

      const maxScroll = Math.max(0, (N - 1) - lastRelTarget);

      // Map targetPosRef (0 .. N - 1) to target scroll offset (0 .. maxScroll)
      const targetIndex = targetPosRef.current;
      const targetScroll =
        N <= 1 ? 0 : (targetIndex / Math.max(1, N - 1)) * maxScroll;

      const current = currentPosRef.current;
      const diff = targetScroll - current;

      const step = diff * 0.15;
      const next = Math.abs(diff) < 0.0008 ? targetScroll : current + step;
      const instVel = next - current;

      currentPosRef.current = next;
      velocityRef.current = velocityRef.current * 0.82 + instVel * 0.18;

      setRenderPos(next);
      setActiveIndex(
        Math.max(
          0,
          Math.min(filteredItems.length - 1, Math.round(targetIndex))
        )
      );

      if (!reduceMotion) {
        const clampedSway = Math.max(
          -8,
          Math.min(8, -velocityRef.current * 36)
        );
        setSwayAngle(Math.abs(clampedSway) < 0.05 ? 0 : clampedSway);
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [filteredItems.length, viewport, reduceMotion]);

  const setClampedTarget = useCallback(
    (val: number, snap = false) => {
      const maxIdx = Math.max(0, filteredItems.length - 1);
      const clamped = snap
        ? Math.max(0, Math.min(maxIdx, Math.round(val)))
        : Math.max(-0.35, Math.min(maxIdx + 0.35, val));
      targetPosRef.current = clamped;
    },
    [filteredItems.length]
  );

  // Drag gesture handling
  const dragStateRef = useRef({
    isDown: false,
    startX: 0,
    startY: 0,
    startTarget: 0,
    moved: 0,
  });

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (selectedItem) return;
    dragStateRef.current = {
      isDown: true,
      startX: e.clientX,
      startY: e.clientY,
      startTarget: targetPosRef.current,
      moved: 0,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current.isDown || selectedItem) return;
    const dx = e.clientX - dragStateRef.current.startX;
    const dy = e.clientY - dragStateRef.current.startY;
    dragStateRef.current.moved = Math.hypot(dx, dy);

    const sensitivity = viewport === "mobile" ? 110 : 150;
    const deltaIndex = (-dx * 0.95 - dy * 0.45) / sensitivity;
    setClampedTarget(dragStateRef.current.startTarget + deltaIndex, false);
  };

  const handlePointerUp = () => {
    if (!dragStateRef.current.isDown) return;
    dragStateRef.current.isDown = false;
    setClampedTarget(targetPosRef.current, true);
  };

  // Dedicated wheel handler with Intentional Boundary Escape Delay (1.2s):
  // - While hovering over Hangline, wheel strictly drives Hangline cards.
  // - When reaching start or end boundaries, holds scroll for 1.2s absorbing momentum.
  // - Only after 1.2s of deliberate continuous scrolling at the edge does it release to page scroll,
  //   preventing accidental page jumps while avoiding scroll traps!
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    let wheelSnapTimeout: ReturnType<typeof setTimeout> | null = null;
    let boundaryHit: { dir: "start" | "end"; timestamp: number } | null = null;
    let boundaryResetTimer: ReturnType<typeof setTimeout> | null = null;

    const onWheel = (e: WheelEvent) => {
      if (selectedItem) return;

      const rawDelta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (Math.abs(rawDelta) < 1) return;

      const maxIdx = Math.max(0, filteredItems.length - 1);
      if (maxIdx === 0) return;

      const atStart = targetPosRef.current <= 0.02 && rawDelta < 0;
      const atEnd = targetPosRef.current >= maxIdx - 0.02 && rawDelta > 0;

      // If user reverses scroll direction back into cards, immediately reset boundary lock
      if (
        (boundaryHit?.dir === "start" && rawDelta > 0) ||
        (boundaryHit?.dir === "end" && rawDelta < 0)
      ) {
        boundaryHit = null;
      }

      // Reset timer if user stops scrolling for > 450ms
      if (boundaryResetTimer) clearTimeout(boundaryResetTimer);
      boundaryResetTimer = setTimeout(() => {
        boundaryHit = null;
      }, 450);

      // Boundary Hold with 1.2s Intentional Delay:
      // While at the edge, lock the page for 1.2s so trackpad momentum / fast wheel
      // NEVER accidentally yanks the page away.
      if (atStart || atEnd) {
        const currentDir = atStart ? "start" : "end";
        const now = performance.now();

        if (!boundaryHit || boundaryHit.dir !== currentDir) {
          // First tick hitting the boundary: start the 1.2s resistance timer
          boundaryHit = { dir: currentDir, timestamp: now };
          e.preventDefault();
          return;
        }

        const elapsed = now - boundaryHit.timestamp;
        const DELAY_MS = 1200; // 1.2s intentional delay

        if (elapsed < DELAY_MS) {
          // Hold the lock during the delay window: page stays steady!
          e.preventDefault();
          return;
        }

        // Delay elapsed! User has intentionally continued scrolling at the boundary:
        // Allow natural page scroll to release the user gracefully without trap!
        return;
      }

      // Inside normal card range: Hangline captures wheel exclusively
      e.preventDefault();
      boundaryHit = null;

      const sensitivity = 0.0032;
      const nextTarget = Math.max(
        0,
        Math.min(maxIdx, targetPosRef.current + rawDelta * sensitivity)
      );
      targetPosRef.current = nextTarget;

      if (wheelSnapTimeout) clearTimeout(wheelSnapTimeout);
      wheelSnapTimeout = setTimeout(() => {
        targetPosRef.current = Math.round(targetPosRef.current);
      }, 240);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      if (wheelSnapTimeout) clearTimeout(wheelSnapTimeout);
      if (boundaryResetTimer) clearTimeout(boundaryResetTimer);
    };
  }, [selectedItem, filteredItems.length]);

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (lightboxItem) setLightboxItem(null);
        else if (selectedItem) setSelectedItem(null);
      } else if (e.key === "ArrowRight") {
        setClampedTarget(Math.round(targetPosRef.current) + 1, true);
      } else if (e.key === "ArrowLeft") {
        setClampedTarget(Math.round(targetPosRef.current) - 1, true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedItem, lightboxItem, setClampedTarget]);

  // ========================================================
  // REVERSE-ENGINEERED FRAMER HANGLINE GEOMETRY & CAMERA:
  // In the real Hangline screenshot:
  // - On desktop: Foreground card sits down-left touching the bottom/side edge,
  //   wire climbs steeply toward top-right corner.
  // - On mobile: Cards are anchored at bottom-left/bottom-right
  //   climbing upwards across the right half of the canvas with a steep slope,
  //   leaving the top-left quadrant completely clear for the title & editorial text!
  // ========================================================
  const spacingMultiplier =
    spacingMode === "compact" ? 0.85 : spacingMode === "wide" ? 1.18 : 1;

  const itemCount = filteredItems.length;

  // Adapt spacing based on the number of certificates/items:
  // When there are fewer items (e.g. 4), widen spacing so they span across the stage majestically!
  const countFactor =
    itemCount <= 3 ? 1.35 : itemCount <= 4 ? 1.25 : itemCount <= 5 ? 1.12 : 1.0;

  // Step vector (direction of clothesline line in 2D space)
  const stepX =
    (viewport === "mobile" ? 68 : viewport === "tablet" ? 98 : 134) *
    spacingMultiplier *
    countFactor;
  const stepY =
    (viewport === "mobile" ? 42 : viewport === "tablet" ? 60 : 76) *
    spacingMultiplier *
    (countFactor > 1 ? 1.1 : 1.0);

  // Dynamically center baseLeft based on total span width when items fit inside stage
  const baseLeft =
    viewport === "mobile"
      ? itemCount <= 3
        ? 20
        : -20
      : viewport === "tablet"
      ? itemCount <= 4
        ? 110
        : 85
      : itemCount <= 3
      ? 200
      : itemCount <= 4
      ? 160
      : 140;

  const baseTop =
    viewport === "mobile" ? 425 : viewport === "tablet" ? 420 : 450;

  // Real Hangline wide print dimensions (3:2 / 16:10 format)
  // Slightly zoomed on mobile as user requested ("lebih zoom jadi yang terlihat hanya 3-4 gambar")
  const cardWidth =
    viewport === "mobile" ? 280 : viewport === "tablet" ? 380 : 490;
  const cardHeight =
    viewport === "mobile" ? 180 : viewport === "tablet" ? 240 : 310;

  // Real 3D orientation matching Framer Hangline:
  // Exactly matches Framer Camera settings from screenshot (media_1794222776981_722605f6.jpg):
  // Canvas Yaw: -24
  // Canvas Roll: 3.00
  // Camera FOV: 87
  // Camera Pos X: 0.74, Pos Y: 0.24
  const rotYDeg = tiltIntensity === "deep" ? -30 : -24;
  const rotXDeg = 4.5;
  const rotZDeg = 3.0;

  // Continuous sagging clothesline wire path
  // Creates natural catenary curves that sag organically between each wooden clothespin
  const buildClotheslinePath = () => {
    const pinPoints: { x: number; y: number; scale: number; isAnchor?: boolean }[] = [];

    // Start offscreen bottom-left
    pinPoints.push({
      x: baseLeft + 26 - stepX * 2.2,
      y: baseTop + stepY * 2.2 + (viewport === "mobile" ? 14 : 20),
      scale: 1.15,
      isAnchor: true,
    });

    for (let i = 0; i < filteredItems.length; i++) {
      const rel = i - renderPos;
      if (rel < -2.5 || rel > 9.5) continue;
      const scale = Math.pow(0.92, rel);
      // Wire passes right through the middle waist of the wooden clothespin (cy = 38)
      const x = baseLeft + rel * stepX + 26 * scale;
      const y = baseTop - rel * stepY + 0.5 * scale;
      pinPoints.push({ x, y, scale });
    }

    // End offscreen top-right
    const lastRel = Math.max(
      filteredItems.length <= 4 ? 4.2 : 5.5,
      filteredItems.length - renderPos + 1.6
    );
    pinPoints.push({
      x: baseLeft + lastRel * stepX + 90,
      y: baseTop - lastRel * stepY - 38,
      scale: 0.5,
      isAnchor: true,
    });

    pinPoints.sort((a, b) => a.x - b.x);

    if (pinPoints.length < 2) return "";
    let d = `M ${pinPoints[0].x.toFixed(1)} ${pinPoints[0].y.toFixed(1)}`;
    for (let i = 0; i < pinPoints.length - 1; i++) {
      const p1 = pinPoints[i];
      const p2 = pinPoints[i + 1];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const spanDist = Math.hypot(dx, dy);

      // Perspective-scaled catenary sag: deeper sag for foreground pins, natural drape across cards
      const avgScale = (p1.scale + p2.scale) / 2;
      const baseSag = viewport === "mobile" ? 22 : 30;
      const sag = Math.max(10, Math.min(38, (spanDist / 120) * baseSag * Math.pow(avgScale, 0.75)));

      // Cubic Bézier U-shaped catenary drape between clips
      const cp1x = p1.x + dx * 0.28;
      const cp1y = p1.y + dy * 0.28 + sag * 1.05;
      const cp2x = p1.x + dx * 0.72;
      const cp2y = p1.y + dy * 0.72 + sag * 1.05;

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  };

  const wirePath = buildClotheslinePath();
  const displayIndex = String(activeIndex + 1).padStart(2, "0");
  const displayTotal = String(filteredItems.length).padStart(2, "0");
  const progressRatio =
    filteredItems.length > 1
      ? Math.max(0, Math.min(1, activeIndex / (filteredItems.length - 1)))
      : 1;

  return (
    <section
      id="hangline"
      ref={containerRef}
      className="relative pt-8 border-t border-base/10 scroll-mt-24 space-y-4"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <span className="text-xs sm:text-sm font-mono uppercase tracking-[0.2em] text-base/60 font-semibold block mb-1.5">
            ORIGINAL 3D CLOTHESLINE · CMS ARCHIVE
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-base tracking-tight font-sans">
            certificates, events &amp; milestones.
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-base/55 flex items-center gap-2">
          <Compass className="w-3.5 h-3.5 text-base/60 shrink-0" />
          <span>
            Drag kartu secara horizontal untuk menjelajah, atau klik print untuk melihat detail.
          </span>
        </p>
      </div>

      {/* MAIN 3D HANGLINE STAGE (1:1 with hangline.framer.website) */}
      <div
        ref={stageRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="relative -mx-6 sm:mx-0 w-[calc(100%+3rem)] sm:w-full min-h-[580px] xs:min-h-[620px] sm:min-h-[640px] lg:min-h-[680px] rounded-none sm:rounded-3xl border-y sm:border border-x-0 sm:border-x border-base/12 bg-[#FAF9F5] dark:bg-[#121316] overflow-hidden select-none shadow-[0_20px_60px_-20px_rgba(0,0,0,0.12)] cursor-grab active:cursor-grabbing"
      >
        {/* TOP HUD BAR: Clean HUD matching Framer ("HOW TO USE ->" in center, counter on right) */}
        <div className="relative z-30 flex items-center justify-between px-4 sm:px-8 pt-4 sm:pt-7 pointer-events-none">
          {/* Left spacer keeping top-left title & editorial text 100% unobstructed */}
          <div className="w-12 sm:w-24 pointer-events-none" />

          {/* Center Pill: HOW TO USE -> */}
          <div className="pointer-events-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowHowToUse((prev) => !prev);
                setShowSettings(false);
              }}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#EAE8E1] dark:bg-white/10 hover:bg-[#E2DFD7] dark:hover:bg-white/15 text-base/85 text-[10px] sm:text-[11px] font-mono uppercase tracking-widest inline-flex items-center gap-2 transition cursor-pointer shadow-2xs"
            >
              <span>HOW TO USE</span>
              <span>→</span>
            </button>
          </div>

          {/* Right Counter Pill: 01 — 11 (Reflects hovered/active card, matching screenshot) */}
          <div className="pointer-events-auto flex items-center gap-2 shrink-0">
            <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#EAE8E1] dark:bg-white/10 text-base/90 text-[11px] sm:text-xs font-mono tracking-widest font-medium shadow-2xs">
              {selectedItem
                ? `${selectedItem.number} — ${displayTotal}`
                : `${activePreviewItem.number} — ${displayTotal}`}
            </div>
          </div>
        </div>

        {/* HOW TO USE Popover */}
        <AnimatePresence>
          {showHowToUse && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute top-16 sm:top-18 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-md rounded-2xl bg-surface border border-base/15 p-5 shadow-xl space-y-3 pointer-events-auto"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-widest text-base/60 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" />
                  How to explore Hangline
                </span>
                <button
                  type="button"
                  onClick={() => setShowHowToUse(false)}
                  className="p-1 rounded-lg hover:bg-base/10 text-base/60 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ul className="text-xs text-base/75 space-y-2 leading-relaxed">
                <li>
                  • <strong>Scroll Wheel / Drag:</strong> Scroll mouse wheel saat kursor di atas kartu, atau klik &amp; geser untuk menggerakkan deretan print di tali.
                </li>
                <li>
                  • <strong>Inspect Print:</strong> Klik foto mana saja (atau jepitan kayunya) untuk melihat detail print secara utuh.
                </li>
                <li>
                  • <strong>Keyboard:</strong> Gunakan panah kiri{" "}
                  <kbd className="px-1.5 py-0.5 rounded bg-base/10 font-mono text-[10px]">←</kbd>{" "}
                  dan kanan{" "}
                  <kbd className="px-1.5 py-0.5 rounded bg-base/10 font-mono text-[10px]">→</kbd>{" "}
                  untuk berpindah antar kartu, serta{" "}
                  <kbd className="px-1.5 py-0.5 rounded bg-base/10 font-mono text-[10px]">Esc</kbd>{" "}
                  untuk menutup inspect view.
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LEFT EDITORIAL PANEL:
            In Framer Hangline (Screenshot 1 & 4), the left panel is fixed at top-left:
            "HANGLINE", divider line, and description paragraph.
            On mobile, it sits comfortably on the left without overlapping with cards or top pills. */}
        <div className="absolute top-16 sm:top-10 left-4 sm:left-10 md:left-12 z-20 max-w-[195px] xs:max-w-[225px] sm:max-w-[340px] pointer-events-none">
          {/* Big Ultra-Condensed Title: EXACTLY MATCHES Framer Hangline */}
          <h3
            className="text-5xl sm:text-7xl md:text-[84px] uppercase tracking-[-0.035em] text-base leading-[0.85] select-none font-impact"
            style={{
              fontFamily: '"Anton", Impact, "Arial Black", sans-serif',
              fontWeight: 900,
            }}
          >
            HANGLINE
          </h3>

          <div className="w-8 sm:w-10 h-px bg-base/20 my-3 sm:my-5" />

          <AnimatePresence mode="wait">
            {!selectedItem ? (
              <motion.div
                key={activePreviewItem ? activePreviewItem.id : "overview-panel"}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="space-y-2 sm:space-y-2.5 pointer-events-auto"
              >
                {/* 1:1 Reactive Brief Info matching Framer Hangline (media_1794222919378_10ca7b9a.jpg) */}
                {activePreviewItem ? (
                  <>
                    <div className="space-y-0.5">
                      <h4 className="text-xl sm:text-2xl font-bold text-base tracking-tight font-sans leading-tight">
                        {activePreviewItem.title}
                      </h4>
                      <p className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.14em] text-base/50">
                        {activePreviewItem.subtitle}
                      </p>
                    </div>

                    <p className="text-xs sm:text-[13px] text-base/65 leading-relaxed line-clamp-3 sm:line-clamp-4 max-w-[260px] sm:max-w-[300px]">
                      {activePreviewItem.description}
                    </p>

                    <div className="pt-0.5">
                      <span className="block text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.16em] text-base/45">
                        SCROLL OR DRAG TO EXPLORE
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-[11px] sm:text-sm text-base/65 leading-relaxed">
                      Certificates, hackathons, and engineering milestones. {filteredItems.length} prints,
                      hung on one line running away from you.
                    </p>
                    <div className="pt-0.5">
                      <span className="block text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.16em] text-base/45">
                        SCROLL OR DRAG TO EXPLORE
                      </span>
                    </div>
                  </>
                )}

                {/* Desktop Quick Nav Controls */}
                <div className="hidden sm:flex items-center gap-2 pt-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setClampedTarget(activeIndex - 1, true);
                    }}
                    disabled={activeIndex <= 0}
                    className="size-8 rounded-full border border-base/15 bg-surface/80 hover:bg-surface flex items-center justify-center text-base disabled:opacity-30 transition cursor-pointer"
                    title="Previous print"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setClampedTarget(activeIndex + 1, true);
                    }}
                    disabled={activeIndex >= filteredItems.length - 1}
                    className="size-8 rounded-full border border-base/15 bg-surface/80 hover:bg-surface flex items-center justify-center text-base disabled:opacity-30 transition cursor-pointer"
                    title="Next print"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ) : (
              /* Desktop Selected Print Metadata in Left Panel (Screenshot 2) */
              <motion.div
                key={`detail-${selectedItem.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="hidden lg:block space-y-3.5 pointer-events-auto"
              >
                <h4 className="text-xl sm:text-2xl font-bold text-base tracking-tight leading-snug font-sans">
                  {selectedItem.title}
                </h4>

                <div className="space-y-0.5 text-[11px] font-mono uppercase tracking-[0.14em] text-base/50 leading-relaxed">
                  <p>{selectedItem.subtitle}</p>
                  <p className="text-base/40">{selectedItem.specs}</p>
                </div>

                <p className="text-xs sm:text-sm text-base/65 leading-relaxed line-clamp-4">
                  {selectedItem.description}
                </p>

                <div className="flex items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItem(null);
                    }}
                    className="px-4 py-2 rounded-full bg-white dark:bg-white/10 border border-base/12 text-base text-xs font-medium hover:bg-base/5 transition cursor-pointer shadow-2xs"
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxItem(selectedItem);
                    }}
                    className="px-4 py-2 rounded-full bg-[#141413] dark:bg-white text-white dark:text-[#141413] text-[10px] font-mono uppercase tracking-widest hover:opacity-90 transition inline-flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <span>VIEW PRINT</span>
                    <span>→</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* MOBILE / TABLET DEDICATED DETAIL VIEW (ZERO OVERLAPPING GUARANTEED) */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              key="mobile-detail-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="lg:hidden absolute inset-0 z-40 bg-[#FAF9F5] dark:bg-[#121316] overflow-y-auto p-4 sm:p-6 flex flex-col justify-start gap-4 pointer-events-auto"
            >
              {/* Header row */}
              <div className="flex items-center justify-between pb-3 border-b border-base/10">
                <div className="flex items-center gap-2.5">
                  <span
                    className="font-impact text-2xl uppercase tracking-tight text-base"
                    style={{ fontFamily: '"Anton", Impact, sans-serif' }}
                  >
                    HANGLINE
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-base/8 text-base/80">
                    {selectedItem.number} — {displayTotal}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-3 py-1.5 rounded-full bg-base/10 hover:bg-base/15 text-base text-xs font-mono uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Close</span>
                </button>
              </div>

              {/* Photo Card Preview */}
              <div
                onClick={() => setLightboxItem(selectedItem)}
                className="w-full max-w-sm mx-auto aspect-[4/3] rounded-sm shadow-xl border-[4px] border-[#EAE6DC] dark:border-[#2A2926] cursor-zoom-in relative overflow-hidden shrink-0"
              >
                <PrintSurface item={selectedItem} isSelected={true} />
              </div>

              {/* Text & Metadata */}
              <div className="space-y-2.5 max-w-md mx-auto w-full">
                <h4 className="text-lg sm:text-xl font-bold text-base tracking-tight leading-snug">
                  {selectedItem.title}
                </h4>
                <div className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-base/50 space-y-0.5">
                  <p>{selectedItem.subtitle}</p>
                  <p className="text-base/40">{selectedItem.specs}</p>
                </div>
                <p className="text-xs text-base/70 leading-relaxed">
                  {selectedItem.description}
                </p>

                {/* Bottom Actions */}
                <div className="flex items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedItem(null)}
                    className="flex-1 py-2.5 rounded-full border border-base/15 text-base text-xs font-medium hover:bg-base/5 transition cursor-pointer text-center"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => setLightboxItem(selectedItem)}
                    className="flex-1 py-2.5 rounded-full bg-base text-bg text-[11px] font-mono uppercase tracking-wider hover:opacity-90 transition inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <span>VIEW PRINT</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3D CLOTHESLINE WIRE & HANGING PRINTS STAGE */}
        <div
          className={`
            ${
              selectedItem
                ? "absolute inset-0 px-6 lg:p-0 hidden lg:flex items-center justify-end lg:pr-14"
                : "absolute inset-0"
            }
            z-10 pointer-events-none overflow-visible
          `}
          style={{
            perspective: tiltIntensity === "deep" ? "720px" : "800px",
          }}
        >
          {/* Continuous Diagonal Clothesline Wire SVG */}
          <svg
            className={`
              absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-500 z-15
              ${selectedItem ? "opacity-0" : "opacity-100"}
            `}
          >
            {/* Soft wire shadow on wall */}
            <path
              d={wirePath}
              fill="none"
              stroke="rgba(0,0,0,0.11)"
              strokeWidth="3.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              transform="translate(0, 6)"
            />
            {/* Organic twisted clothesline rope */}
            <path
              d={wirePath}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[#38332A] dark:text-[#A6A094]"
            />
            {/* Subtle top specular highlight */}
            <path
              d={wirePath}
              fill="none"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="0.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              transform="translate(0, -0.6)"
            />
          </svg>

          <AnimatePresence mode="wait">
            {selectedItem ? (
              /* Flat View on the Right (When a print is clicked) */
              <motion.div
                key={`flat-${selectedItem.id}`}
                initial={{
                  opacity: 0,
                  scale: 0.86,
                  rotateY: -22,
                  rotateZ: 4,
                  x: 40,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  rotateY: 0,
                  rotateZ: 0,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.9,
                  rotateY: -15,
                }}
                transition={{
                  duration: 0.55,
                  ease: [0.22, 1, 0.36, 1],
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxItem(selectedItem);
                }}
                className="pointer-events-auto relative w-full max-w-[500px] aspect-[4/3] rounded-[3px] shadow-[0_32px_70px_-15px_rgba(0,0,0,0.35)] border-[5px] border-[#EAE6DC] dark:border-[#2A2926] cursor-zoom-in group"
              >
                <PrintSurface item={selectedItem} isSelected={true} />

                <div className="absolute top-3 right-3 px-2.5 py-1.5 rounded-full bg-black/55 text-white text-[10px] font-mono uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 backdrop-blur-xs">
                  <Maximize2 className="w-3 h-3" />
                  <span>Full View</span>
                </div>
              </motion.div>
            ) : (
              /* DIAGONAL 3D CLOTHESLINE (1:1 reverse-engineered matching Screenshot 1 & 4) */
              <motion.div
                key="diagonal-line-cards"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0 pointer-events-none"
                style={{ transformStyle: "preserve-3d" }}
              >
                {filteredItems.map((item, idx) => {
                  const rel = idx - renderPos;
                  if (rel < -2.5 || rel > 9.5) return null;

                  const scale = Math.pow(0.92, rel);
                  const x = baseLeft + rel * stepX;
                  const y = baseTop - rel * stepY;

                  // Foreground prints (smaller rel) have HIGHER z-index and overlap cards behind them
                  const zIndex = Math.round(130 - rel * 10);

                  const opacity =
                    rel < -0.8
                      ? Math.max(0, 1 + (rel + 0.8) * 1.6)
                      : rel > 7.5
                      ? Math.max(0, 1 - (rel - 7.5))
                      : 1;

                  const isHovered = hoverPointer.idx === idx;
                  const isNeighbor =
                    hoverPointer.idx !== null && Math.abs(hoverPointer.idx - idx) === 1;

                  // Natural aerodynamic hover lift, tilt & pendulum sway under gravity
                  const liftY = isHovered ? -12 : isNeighbor ? -3.5 : 0;
                  const liftZ = isHovered ? 28 : isNeighbor ? 8 : 0;
                  const tiltX = isHovered ? -hoverPointer.ry * 6.5 : 0;
                  const tiltY = isHovered ? hoverPointer.rx * 5.5 : 0;
                  const swayZ = isHovered
                    ? hoverPointer.rx * 4.5
                    : isNeighbor
                    ? hoverPointer.rx * 1.5
                    : 0;

                  // Initial breeze wave ripple across hanging cards when first visible
                  const ripplePhase = Math.max(
                    0,
                    (initialWindElapsedRef.current >= 0 ? initialWindElapsedRef.current : 0) * 4.8 - idx * 0.28
                  );
                  const cardGust =
                    initialWindSway !== 0
                      ? initialWindSway * Math.cos(ripplePhase)
                      : 0;
                  const totalSway = swayAngle + cardGust;

                  return (
                    <div
                      key={item.id}
                      style={{
                        position: "absolute",
                        left: `${x}px`,
                        top: `${y}px`,
                        width: `${cardWidth}px`,
                        height: `${cardHeight}px`,
                        zIndex: isHovered ? 160 : zIndex,
                        opacity,
                        transformOrigin: "26px 0px",
                        transform: `scale(${scale.toFixed(4)}) rotateZ(${totalSway.toFixed(2)}deg)`,
                      }}
                      className="pointer-events-auto"
                    >
                      {/* ========================================================
                          1. BACK CLOTHESPIN JAW (Behind the print)
                          ======================================================== */}
                      <div
                        className="absolute -top-[32px] left-[14px] w-[22px] sm:w-[24px] pointer-events-none"
                        style={{
                          zIndex: 1,
                          transform: `rotateZ(${(-totalSway * 0.35 + (isHovered ? swayZ * 0.35 : 0)).toFixed(2)}deg)`,
                          transition: "transform 0.28s cubic-bezier(0.18, 0.89, 0.32, 1.28)",
                        }}
                      >
                        <WoodenClothespin layer="back" className="w-full h-auto drop-shadow-sm" />
                      </div>

                      {/* ========================================================
                          2. 3D ANGLED PRINT CONTAINER
                          ======================================================== */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          if (dragStateRef.current.moved > 8) return;
                          setClampedTarget(idx, true);
                          setSelectedItem(item);
                        }}
                        onPointerEnter={(e) => {
                          setHoveredIndex(idx);
                          const rect = e.currentTarget.getBoundingClientRect();
                          const rx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
                          const ry = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
                          setHoverPointer({ idx, rx, ry });
                        }}
                        onPointerMove={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const rx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
                          const ry = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
                          setHoverPointer({ idx, rx, ry });
                        }}
                        onPointerLeave={() => {
                          setHoveredIndex((prev) => (prev === idx ? null : prev));
                          setHoverPointer({ idx: null, rx: 0, ry: 0 });
                        }}
                        style={{
                          zIndex: 5,
                          transformOrigin: "26px 0px",
                          transform: `translate3d(0, ${liftY}px, ${liftZ}px) rotateY(${(rotYDeg + tiltY).toFixed(1)}deg) rotateX(${(rotXDeg + tiltX).toFixed(1)}deg) rotateZ(${(rotZDeg + swayZ).toFixed(1)}deg)`,
                          transition: "transform 0.28s cubic-bezier(0.18, 0.89, 0.32, 1.28), box-shadow 0.28s ease",
                        }}
                        className="group relative w-full h-full cursor-pointer"
                      >
                        {/* 3D Physical Top Edge Slab (Only at top, no border around photo) */}
                        <div
                          className="absolute -top-[3.5px] left-0 w-full h-[3.5px] bg-[#EDE9DF] dark:bg-[#3C3A34] origin-bottom pointer-events-none"
                          style={{
                            transform: "skewX(-45deg)",
                            borderTop: "1px solid rgba(255,255,255,0.85)",
                          }}
                        />

                        {/* 3D Physical Right Edge Slab (Only at right, no border around photo) */}
                        <div
                          className="absolute top-0 -right-[4px] w-[4px] h-full bg-[#D4CEBE] dark:bg-[#282622] origin-left pointer-events-none"
                          style={{
                            transform: "skewY(-45deg)",
                            borderRight: "1px solid rgba(0,0,0,0.18)",
                          }}
                        />

                        {/* Full-Bleed Photo Print Face (NO border on left or bottom, exact 3D look) */}
                        <div
                          className={`relative w-full h-full overflow-hidden transition-shadow duration-300 ${
                            isHovered
                              ? "shadow-[-22px_32px_55px_rgba(0,0,0,0.48)] brightness-[1.03]"
                              : "shadow-[-16px_22px_45px_rgba(0,0,0,0.36)]"
                          }`}
                        >
                          <PrintSurface item={item} isSelected={false} />
                          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors pointer-events-none" />
                        </div>
                      </div>

                      {/* ========================================================
                          3. FRONT CLOTHESPIN JAW (In front of the print)
                          ======================================================== */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          if (dragStateRef.current.moved > 8) return;
                          setClampedTarget(idx, true);
                          setSelectedItem(item);
                        }}
                        className="absolute -top-[32px] left-[14px] w-[22px] sm:w-[24px] pointer-events-auto cursor-pointer"
                        style={{
                          zIndex: 10,
                          transform: `rotateZ(${(-totalSway * 0.35 + (isHovered ? swayZ * 0.35 : 0)).toFixed(2)}deg)`,
                          transition: "transform 0.28s cubic-bezier(0.18, 0.89, 0.32, 1.28)",
                        }}
                      >
                        <WoodenClothespin layer="front" className="w-full h-auto drop-shadow-md" />
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BOTTOM CONTROLS & LINE PROGRESS BAR */}
        <div className="absolute bottom-4 sm:bottom-6 inset-x-4 sm:inset-x-8 z-30 flex items-center justify-between gap-4 pointer-events-none">
          <div className="flex items-center gap-3 pointer-events-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowSettings((prev) => !prev);
                setShowHowToUse(false);
              }}
              className="px-4 py-2 rounded-full bg-[#DCE4EE]/90 dark:bg-white/10 hover:bg-[#CFD9E6] dark:hover:bg-white/15 backdrop-blur-md border border-base/10 text-base text-[11px] font-mono uppercase tracking-widest inline-flex items-center gap-2.5 transition cursor-pointer shadow-sm"
            >
              <span className="size-6 rounded-full bg-[#141413] text-white dark:bg-white dark:text-[#141413] flex items-center justify-center -ml-1.5">
                <SlidersHorizontal className="w-3 h-3" />
              </span>
              <span>SETTINGS</span>
            </button>
          </div>

          {!selectedItem && filteredItems.length > 1 && (
            <div className="hidden sm:flex items-center gap-3 bg-[#EAE8E1]/85 dark:bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-base/8 pointer-events-auto">
              <span className="text-[10px] font-mono uppercase tracking-widest text-base/55">
                LINE PROGRESS
              </span>
              <div className="w-28 md:w-36 h-1.5 rounded-full bg-base/15 overflow-hidden">
                <div
                  className="h-full bg-base rounded-full transition-all duration-150"
                  style={{ width: `${Math.round(progressRatio * 100)}%` }}
                />
              </div>
              <span className="text-[10px] font-mono font-semibold text-base/80">
                {displayIndex}/{displayTotal}
              </span>
            </div>
          )}
        </div>

        {/* SETTINGS Popover */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-16 sm:bottom-18 left-4 sm:left-8 z-40 w-[calc(100%-2rem)] max-w-xs sm:w-80 rounded-2xl bg-surface border border-base/15 p-4 shadow-xl space-y-4 pointer-events-auto"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-widest text-base/60">
                  Hangline Settings
                </span>
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="p-1 rounded-lg hover:bg-base/10 text-base/60 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Category Filter (Moved from HUD into Settings to keep title unobstructed) */}
              <div className="space-y-2 pb-3 border-b border-base/10">
                <span className="text-[10px] font-mono uppercase tracking-wider text-base/50 block">
                  Category Filter
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      { id: "all", label: "All" },
                      { id: "milestone", label: "Milestones" },
                      { id: "certificate", label: "Certificates" },
                      { id: "competition", label: "Competitions" },
                      { id: "event", label: "Events" },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveCategory(tab.id);
                        setClampedTarget(0, true);
                      }}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider cursor-pointer transition ${
                        activeCategory === tab.id
                          ? "bg-base text-bg font-semibold shadow-xs"
                          : "bg-base/5 hover:bg-base/10 text-base/70"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-base/50 block">
                  Print Spacing
                </span>
                <div className="grid grid-cols-3 gap-1.5 bg-surface-muted p-1 rounded-xl">
                  {(["compact", "standard", "wide"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSpacingMode(m)}
                      className={`py-1 rounded-lg text-[10px] font-mono uppercase cursor-pointer transition ${
                        spacingMode === m
                          ? "bg-base text-bg font-semibold"
                          : "text-base/65 hover:text-base"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-base/50 block">
                  3D Perspective Depth
                </span>
                <div className="grid grid-cols-2 gap-1.5 bg-surface-muted p-1 rounded-xl">
                  {(["classic", "deep"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTiltIntensity(t)}
                      className={`py-1 rounded-lg text-[10px] font-mono uppercase cursor-pointer transition ${
                        tiltIntensity === t
                          ? "bg-base text-bg font-semibold"
                          : "text-base/65 hover:text-base"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FULL-SCREEN HIGH-RES LIGHTBOX MODAL */}
      <AnimatePresence>
        {lightboxItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxItem(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-surface border border-base/15 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12"
            >
              <div className="lg:col-span-7 aspect-[4/3] bg-black relative">
                <PrintSurface item={lightboxItem} isSelected={true} />
              </div>

              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-widest text-base/50">
                      PRINT #{lightboxItem.number}
                    </span>
                    <button
                      type="button"
                      onClick={() => setLightboxItem(null)}
                      className="p-1.5 rounded-full hover:bg-base/10 text-base/70 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-2xl font-bold text-base tracking-tight font-sans">
                    {lightboxItem.title}
                  </h3>
                  <p className="text-[11px] font-mono uppercase tracking-wider text-base/55">
                    {lightboxItem.subtitle}
                  </p>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-base/45 border-y border-base/10 py-2">
                    {lightboxItem.specs}
                  </p>
                  <p className="text-sm text-base/75 leading-relaxed pt-1">
                    {lightboxItem.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-base/10">
                  <span className="text-xs font-mono text-base/50">
                    {lightboxItem.issuer || "Christopher Edgar Archive"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setLightboxItem(null)}
                    className="px-5 py-2 rounded-full bg-base text-bg text-xs font-mono uppercase tracking-wider cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
