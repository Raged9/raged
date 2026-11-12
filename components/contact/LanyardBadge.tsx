"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { RotateCw } from "lucide-react";

// 5x7 Dot-Matrix Font for Card Badge
const DOT_FONT: Record<string, string[]> = {
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  G: ["01111", "10000", "10000", "10011", "10001", "10001", "01111"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  ".": ["000", "000", "000", "000", "000", "011", "011"],
};

function buildDotMatrixWord(word: string): number[][] {
  const rows = 7;
  const grid: number[][] = Array.from({ length: rows }, () => []);
  const chars = word.split("");

  chars.forEach((ch, idx) => {
    const glyph = DOT_FONT[ch] || DOT_FONT["."];
    for (let r = 0; r < rows; r++) {
      for (const bit of glyph[r]) {
        grid[r].push(bit === "1" ? 1 : 0);
      }
      if (idx < chars.length - 1) {
        grid[r].push(0);
      }
    }
  });

  return grid;
}

const RAGED_MATRIX: number[][] = buildDotMatrixWord("RAGED.");

// Physics constants — React Bits 3D Lanyard feel
// Anchored at y = -140 so the lanyard strap attaches directly to the top roof of the website
const SEGMENTS = 20;
const CONSTRAINT_ITERS = 24;
const ROPE_LEN = 205;
const ANCHOR_X = 200;
const ANCHOR_Y = -140;
const MAX_STRETCH = 95;
const GRAVITY = 1.15;
const DAMPING = 0.14;

interface RopePoint {
  x: number;
  y: number;
  px: number;
  py: number;
}

interface SimState {
  pts: RopePoint[];
  ax: number;
  ay: number;
  len: number;
  dragging: boolean;
  tx: number;
  ty: number;
  // 3D Rotational physics state (like React Bits Three.js Lanyard)
  rotY: number; // current Y rotation in degrees (0 = front, 180 = back)
  velRotY: number; // angular velocity around Y
  targetBaseRotY: number; // 0 for front, 180 for back (multiples of 180)
  rotX: number; // pitch tilt
  velRotX: number;
  quiet: number;
}

function initRope(sim: SimState) {
  const step = sim.len / SEGMENTS;
  sim.pts = [];
  for (let i = 0; i <= SEGMENTS; i++) {
    const y = sim.ay + step * i;
    // Drop-in swing impulse on initial load (like React Bits Lanyard)
    const swingOffset = Math.sin((i / SEGMENTS) * Math.PI * 0.5) * 38;
    sim.pts.push({
      x: sim.ax + swingOffset,
      y: y - (1 - i / SEGMENTS) * 10,
      px: sim.ax + swingOffset * 0.78,
      py: y - 14,
    });
  }
  sim.rotY = -22;
  sim.velRotY = 3.2;
  sim.targetBaseRotY = 0;
  sim.rotX = 8;
  sim.velRotX = 0;
  sim.quiet = 0;
}

function stepPhysics(sim: SimState) {
  const pts = sim.pts;
  const segLen = sim.len / SEGMENTS;
  const grav = GRAVITY * 0.6;
  const velDamping = 0.989 - Math.max(0, Math.min(1, DAMPING)) * 0.035;

  const prevLastX = pts[pts.length - 1]?.x ?? sim.ax;
  const prevLastY = pts[pts.length - 1]?.y ?? sim.ay + sim.len;

  for (let i = 1; i < pts.length; i++) {
    const p = pts[i];
    let vx = (p.x - p.px) * velDamping;
    let vy = (p.y - p.py) * velDamping;
    const speed = Math.hypot(vx, vy);
    if (speed > 18) {
      vx *= 18 / speed;
      vy *= 18 / speed;
    }
    p.px = p.x;
    p.py = p.y;
    p.x += vx;
    p.y += vy + grav;
  }

  let tx = sim.tx;
  let ty = sim.ty;
  if (sim.dragging) {
    const dx = tx - sim.ax;
    const dy = ty - sim.ay;
    const dist = Math.hypot(dx, dy) || 1;
    const maxLen = sim.len + MAX_STRETCH;
    if (dist > maxLen) {
      tx = sim.ax + (dx / dist) * maxLen;
      ty = sim.ay + (dy / dist) * maxLen;
    }
    ty = Math.max(sim.ay + 40, ty);
  }

  const last = pts[pts.length - 1];
  for (let iter = 0; iter < CONSTRAINT_ITERS; iter++) {
    pts[0].x = sim.ax;
    pts[0].y = sim.ay;
    if (sim.dragging) {
      last.x = tx;
      last.y = ty;
    }
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      const dist = Math.hypot(dx, dy) || 1e-4;
      const diff = (dist - segLen) / dist;
      const wa = i === 0 ? 0 : 0.5;
      const wb = sim.dragging && i === pts.length - 2 ? 0 : i === 0 ? 1 : 0.5;
      const wSum = wa + wb || 1;
      dx *= diff;
      dy *= diff;
      a.x += (wa / wSum) * dx;
      a.y += (wa / wSum) * dy;
      b.x -= (wb / wSum) * dx;
      b.y -= (wb / wSum) * dy;
    }
  }

  pts[0].x = sim.ax;
  pts[0].y = sim.ay;
  if (sim.dragging) {
    last.x = tx;
    last.y = ty;
  } else {
    // Smooth segment relaxation
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy) || 1e-4;
      const rx = (a.x + (dx / dist) * segLen - b.x) * 0.35;
      const ry = (a.y + (dy / dist) * segLen - b.y) * 0.35;
      b.x += rx;
      b.y += ry;
      b.px += rx;
      b.py += ry;
    }
  }

  // Compute 3D rotational physics (yaw rotY + pitch rotX) coupled to motion
  const tipVx = last.x - prevLastX;
  const tipVy = last.y - prevLastY;

  if (sim.dragging) {
    // While dragging, horizontal movement induces 3D Y-axis twist
    sim.velRotY = sim.velRotY * 0.82 + tipVx * 1.35;
    sim.rotY += sim.velRotY * 0.35;
    // Clamp twist around targetBaseRotY while dragging unless flicked
    const relY = sim.rotY - sim.targetBaseRotY;
    sim.rotY = sim.targetBaseRotY + Math.max(-55, Math.min(55, relY));

    // Vertical pull tilts card in X
    const targetX = Math.max(-22, Math.min(22, -tipVy * 1.4));
    sim.rotX += (targetX - sim.rotX) * 0.25;
  } else {
    // Spring back toward targetBaseRotY (0 deg front or 180 deg back) with realistic angular momentum
    const springK = 0.065;
    const angularDamp = 0.88;
    const diffY = sim.targetBaseRotY - sim.rotY;
    sim.velRotY = (sim.velRotY + diffY * springK + tipVx * 0.22) * angularDamp;
    sim.rotY += sim.velRotY;

    sim.velRotX = (sim.velRotX - sim.rotX * 0.08 - tipVy * 0.15) * 0.85;
    sim.rotX += sim.velRotX;
  }
}

function buildRibbonPath(pts: RopePoint[]): string {
  if (pts.length < 2) return "";
  let d = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i].x + pts[i + 1].x) / 2;
    const my = (pts[i].y + pts[i + 1].y) / 2;
    d += ` Q${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
  }
  const last = pts[pts.length - 1];
  d += ` L${last.x.toFixed(1)} ${last.y.toFixed(1)}`;
  return d;
}

interface LanyardBadgeProps {
  fullName?: string;
  nickname?: string;
  role?: string;
  location?: string;
}

export default function LanyardBadge({
  fullName = "Christopher Edgar",
  nickname = "RAGED.",
  role = "Informatics Student & Builder",
  location = "Kebon Jeruk, West Jakarta, Indonesia",
}: LanyardBadgeProps) {
  const ribbonEdgeRef = useRef<SVGPathElement>(null);
  const ribbonMainRef = useRef<SVGPathElement>(null);
  const ribbonStitchRef = useRef<SVGPathElement>(null);
  const ribbonDotsRef = useRef<SVGPathElement>(null);
  const ribbonTrackRef = useRef<SVGPathElement>(null);
  const claspGroupRef = useRef<SVGGElement>(null);
  const cardPositionRef = useRef<HTMLDivElement>(null);
  const card3DInnerRef = useRef<HTMLDivElement>(null);

  const [isMobile, setIsMobile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  // Front & Back photo choices from the 3 uploaded photos
  // Front default: Warm blazer portrait (/edgar-warm.jpg)
  // Back default: Red ID portrait (/edgar-red.jpg) or Beach portrait (/edgar-beach-zoom.jpg)
  const [backPhotoMode, setBackPhotoMode] = useState<"red" | "beach">("red");

  const rafRef = useRef<number>(0);
  const runningRef = useRef(false);

  const simRef = useRef<SimState>({
    pts: [],
    ax: ANCHOR_X,
    ay: ANCHOR_Y,
    len: ROPE_LEN,
    dragging: false,
    tx: ANCHOR_X,
    ty: ANCHOR_Y + ROPE_LEN,
    rotY: 0,
    velRotY: 0,
    targetBaseRotY: 0,
    rotX: 0,
    velRotX: 0,
    quiet: 0,
  });

  const dragRef = useRef({
    pointerId: -1,
    downX: 0,
    downY: 0,
    lastClientX: 0,
    startX: ANCHOR_X,
    startY: ANCHOR_Y + ROPE_LEN,
    movedDist: 0,
  });

  const syncVisuals = useCallback(() => {
    const sim = simRef.current;
    const pts = sim.pts;
    if (pts.length < 2) return;

    const d = buildRibbonPath(pts);
    ribbonEdgeRef.current?.setAttribute("d", d);
    ribbonMainRef.current?.setAttribute("d", d);
    ribbonStitchRef.current?.setAttribute("d", d);
    ribbonDotsRef.current?.setAttribute("d", d);
    ribbonTrackRef.current?.setAttribute("d", d);

    // Tangent angle at the bottom clip
    const refPt = pts[Math.max(0, pts.length - 5)];
    const last = pts[pts.length - 1];
    let angleZ = (Math.atan2(last.y - refPt.y, last.x - refPt.x) * 180) / Math.PI - 90;
    if (angleZ < -180) angleZ += 360;
    if (angleZ > 180) angleZ -= 360;
    angleZ = Math.max(-42, Math.min(42, angleZ));

    if (claspGroupRef.current) {
      claspGroupRef.current.setAttribute(
        "transform",
        `translate(${last.x.toFixed(1)} ${last.y.toFixed(1)}) rotate(${angleZ.toFixed(1)})`
      );
    }

    if (cardPositionRef.current) {
      const restY = sim.ay + sim.len;
      const dx = last.x - ANCHOR_X;
      const dy = last.y - restY;
      cardPositionRef.current.style.transform = `translate3d(${dx.toFixed(
        1
      )}px, ${dy.toFixed(1)}px, 0) rotateZ(${(angleZ * 0.78).toFixed(2)}deg)`;
    }

    if (card3DInnerRef.current) {
      card3DInnerRef.current.style.transform = `rotateX(${sim.rotX.toFixed(
        2
      )}deg) rotateY(${sim.rotY.toFixed(2)}deg)`;
    }
  }, []);

  const stopLoop = useCallback(() => {
    runningRef.current = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

  const tick = useCallback(() => {
    if (!runningRef.current) return;
    const sim = simRef.current;

    stepPhysics(sim);

    let maxDelta = 0;
    for (const p of sim.pts) {
      maxDelta = Math.max(maxDelta, Math.abs(p.x - p.px), Math.abs(p.y - p.py));
    }
    const rotDelta =
      Math.abs(sim.velRotY) +
      Math.abs(sim.targetBaseRotY - sim.rotY) +
      Math.abs(sim.rotX);

    syncVisuals();

    if (!sim.dragging && maxDelta < 0.04 && rotDelta < 0.15) {
      sim.quiet++;
    } else {
      sim.quiet = 0;
    }

    if (sim.quiet > 55) {
      sim.rotY = sim.targetBaseRotY;
      sim.rotX = 0;
      syncVisuals();
      stopLoop();
      return;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [syncVisuals, stopLoop]);

  const startLoop = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    simRef.current.quiet = 0;
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  useEffect(() => {
    const updateAnchorForViewport = () => {
      const isDesktop = window.innerWidth >= 1024;
      setIsMobile(!isDesktop);
      simRef.current.ay = isDesktop ? -140 : -22;
      simRef.current.len = isDesktop ? 205 : 92;
      initRope(simRef.current);
      syncVisuals();
      startLoop();
    };

    updateAnchorForViewport();
    window.addEventListener("resize", updateAnchorForViewport);
    return () => {
      window.removeEventListener("resize", updateAnchorForViewport);
      stopLoop();
    };
  }, [syncVisuals, startLoop, stopLoop]);

  const flipCard = useCallback(() => {
    const sim = simRef.current;
    const nextFlipped = sim.targetBaseRotY === 0;
    sim.targetBaseRotY = nextFlipped ? 180 : 0;
    // Give a small physical tug impulse when flipping
    const last = sim.pts[sim.pts.length - 1];
    if (last) {
      last.px -= nextFlipped ? 7 : -7;
      last.py -= 4;
    }
    setIsFlipped(nextFlipped);
    startLoop();
  }, [startLoop]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    const sim = simRef.current;
    const last = sim.pts[sim.pts.length - 1];

    dragRef.current.pointerId = e.pointerId;
    dragRef.current.downX = e.clientX;
    dragRef.current.downY = e.clientY;
    dragRef.current.lastClientX = e.clientX;
    dragRef.current.startX = last.x;
    dragRef.current.startY = last.y;
    dragRef.current.movedDist = 0;

    sim.dragging = true;
    sim.tx = last.x;
    sim.ty = last.y;
    setIsDragging(true);

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    startLoop();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.pointerId !== dragRef.current.pointerId) return;
    const dx = e.clientX - dragRef.current.downX;
    const dy = e.clientY - dragRef.current.downY;
    dragRef.current.movedDist = Math.hypot(dx, dy);
    dragRef.current.lastClientX = e.clientX;

    const sim = simRef.current;
    sim.tx = dragRef.current.startX + dx;
    sim.ty = dragRef.current.startY + dy;
    startLoop();
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (e.pointerId !== dragRef.current.pointerId) return;
    dragRef.current.pointerId = -1;
    const sim = simRef.current;
    sim.dragging = false;
    setIsDragging(false);

    // If user clicked without dragging, or flicked strongly horizontally, flip the 3D card!
    if (dragRef.current.movedDist < 6) {
      flipCard();
      return;
    } else if (Math.abs(sim.velRotY) > 16) {
      const nextFlipped = sim.targetBaseRotY === 0;
      sim.targetBaseRotY = nextFlipped ? 180 : 0;
      setIsFlipped(nextFlipped);
    }

    startLoop();
  };

  return (
    <div className="relative w-full max-w-[400px] h-[510px] mx-auto select-none flex flex-col items-center">
      {/* SVG Single Flat Woven Lanyard Band + Clamp (React Bits style, anchored to website ceiling on lg+) */}
      <svg
        viewBox="0 0 400 340"
        className="w-[400px] h-[340px] overflow-visible pointer-events-none relative z-20"
      >
        <defs>
          <linearGradient id="rbBandGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#121214" />
            <stop offset="50%" stopColor="#242429" />
            <stop offset="100%" stopColor="#121214" />
          </linearGradient>
          <linearGradient id="rbMetalClip" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FAFAFA" />
            <stop offset="45%" stopColor="#A1A1AA" />
            <stop offset="100%" stopColor="#52525B" />
          </linearGradient>
          <radialGradient id="blackHoleVoid" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000000" />
            <stop offset="65%" stopColor="#020204" />
            <stop offset="100%" stopColor="#121215" />
          </radialGradient>
          {/* Subtle natural shadow cast downwards from the background slit */}
          <linearGradient id="slitShadow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.4" />
            <stop offset="35%" stopColor="#000000" stopOpacity="0.18" />
            <stop offset="70%" stopColor="#000000" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </linearGradient>
          {/* Mobile-only slit clipping: hides any strap segment above the slit line (y < 0) */}
          <clipPath id="mobileSlitClip">
            <rect x="0" y={isMobile ? 0 : -300} width="400" height="700" />
          </clipPath>
        </defs>

        {/* Hidden Path for Dynamic Curving Typography via textPath */}
        <path
          id="lanyardRibbonTrack"
          ref={ribbonTrackRef}
          fill="none"
          stroke="transparent"
        />

        {/* Ribbon Tracks & Bands (Clipped at y=0 on mobile so strap emerges cleanly from slit) */}
        <g clipPath="url(#mobileSlitClip)">
          {/* Outer Ribbon Border (3D Edge Thickness) */}
          <path
            ref={ribbonEdgeRef}
            fill="none"
            stroke="#09090B"
            strokeWidth="30"
            strokeLinecap="butt"
          />

          {/* Main Woven Black Lanyard Ribbon */}
          <path
            ref={ribbonMainRef}
            fill="none"
            stroke="url(#rbBandGrad)"
            strokeWidth="26"
            strokeLinecap="butt"
          />

          {/* Woven Dual Edge Running Stitch Seams */}
          <path
            ref={ribbonStitchRef}
            fill="none"
            stroke="#FFFFFF"
            strokeOpacity="0.14"
            strokeWidth="22"
            strokeDasharray="2 3"
            strokeLinecap="butt"
          />

          {/* Physical Dot-Matrix Pattern Track (Round Dots Printed/Woven along the rope) */}
          <path
            ref={ribbonDotsRef}
            fill="none"
            stroke="#E4E4E7"
            strokeOpacity="0.32"
            strokeWidth="3"
            strokeDasharray="1.5 5"
            strokeLinecap="round"
          />

          {/* Curving Woven Typography via textPath, Flowing with Rope Physics (Mobile & Desktop) */}
          <text
            fill="#FAF9F5"
            fillOpacity="0.95"
            fontSize={isMobile ? "9.5" : "11"}
            fontWeight="bold"
            fontFamily="'Monocraft', monospace"
            letterSpacing={isMobile ? "3px" : "4.5px"}
            style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.85))" }}
          >
            <textPath
              href="#lanyardRibbonTrack"
              startOffset={isMobile ? "50%" : "82%"}
              textAnchor="middle"
              dominantBaseline="central"
            >
              ✦ RAGED. ✦
            </textPath>
          </text>
        </g>

        {/* Mobile-Only Background Slit ("Selipan di background dengan sedikit shadow") */}
        <g className="lg:hidden pointer-events-none">
          {/* Inner dark crevice where strap slips into */}
          <line
            x1={ANCHOR_X - 19}
            y1="0"
            x2={ANCHOR_X + 19}
            y2="0"
            stroke="#121214"
            strokeOpacity="0.8"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          {/* Subtle paper slit highlight seam immediately above the cut */}
          <line
            x1={ANCHOR_X - 18}
            y1="-0.8"
            x2={ANCHOR_X + 18}
            y2="-0.8"
            stroke="currentColor"
            strokeOpacity="0.12"
            strokeWidth="0.8"
            strokeLinecap="round"
          />
          {/* Soft natural drop shadow cast downwards directly over the tucked strap */}
          <rect
            x={ANCHOR_X - 18}
            y="0"
            width="36"
            height="10"
            fill="url(#slitShadow)"
          />
          {/* Subtle contact ambient occlusion right at the opening */}
          <ellipse
            cx={ANCHOR_X}
            cy="1.2"
            rx="16"
            ry="2.2"
            fill="#000000"
            fillOpacity="0.25"
          />
        </g>

        {/* React Bits Style Black Clamp + Metallic Swivel Hook */}
        <g ref={claspGroupRef}>
          {/* Matte Black Plastic Strap Clamp */}
          <rect
            x="-16"
            y="-10"
            width="32"
            height="15"
            rx="3.5"
            fill="#18181B"
            stroke="#27272A"
            strokeWidth="1.5"
          />
          <line x1="-11" y1="-2.5" x2="11" y2="-2.5" stroke="#3F3F46" strokeWidth="1.5" />

          {/* Metallic D-Ring Loop */}
          <rect
            x="-10"
            y="4"
            width="20"
            height="9"
            rx="4"
            fill="none"
            stroke="url(#rbMetalClip)"
            strokeWidth="3"
          />

          {/* Metallic Swivel Clasp Tongue Entering Card Slot */}
          <rect
            x="-5"
            y="10"
            width="10"
            height="18"
            rx="3.5"
            fill="url(#rbMetalClip)"
            stroke="#27272A"
            strokeWidth="0.8"
          />
          <circle cx="0" cy="15" r="2" fill="#27272A" />
        </g>
      </svg>

      {/* 3D Perspective ID Badge Container */}
      <div
        ref={cardPositionRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          top: `${ANCHOR_Y + ROPE_LEN + 14}px`,
          transformOrigin: "50% -10px",
          perspective: "1100px",
          touchAction: "none",
        }}
        className={`absolute z-10 w-[268px] h-[382px] ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        {/* 3D Rotating Inner Card (Preserves 3D Front & Back Faces) */}
        <div
          ref={card3DInnerRef}
          style={{
            transformStyle: "preserve-3d",
          }}
          className="relative w-full h-full"
        >
          {/* ================= FRONT FACE ================= */}
          <div
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
            className="absolute inset-0 rounded-[24px] bg-[#141417] text-white border-[3px] border-white/90 shadow-[0_26px_55px_-12px_rgba(0,0,0,0.45),0_0_0_1px_rgba(0,0,0,0.2)] p-4 flex flex-col justify-between overflow-hidden"
          >
            {/* Top Badge Slot Hole + Dot-Matrix Header */}
            <div className="relative z-10 flex flex-col items-center">
              {/* Oval Punch Hole for Clip (Matches page background: white in light mode, dark in dark mode) */}
              <div className="w-14 h-3 rounded-full bg-bg border border-black/15 dark:border-white/20 shadow-inner mb-3" />

              <div className="w-full flex items-center justify-between px-1 mb-2">
                {/* Mini Dot-Matrix "RAGED." on Card Top */}
                <div
                  className="grid gap-[1.8px]"
                  style={{
                    gridTemplateColumns: `repeat(${RAGED_MATRIX[0].length}, minmax(0, 1fr))`,
                  }}
                  aria-label="RAGED."
                >
                  {RAGED_MATRIX.map((row, rIdx) =>
                    row.map((val, cIdx) => (
                      <span
                        key={`f-${rIdx}-${cIdx}`}
                        className={`w-[3px] h-[3px] rounded-full ${
                          val === 1 ? "bg-white" : "bg-white/10"
                        }`}
                      />
                    ))
                  )}
                </div>

                <span className="text-[9px] font-mono uppercase tracking-widest text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  VERIFIED
                </span>
              </div>
            </div>

            {/* Center Portrait Window (Warm Blazer Portrait - Zoomed & Framed) */}
            <div className="relative z-10 w-full flex-1 my-1 rounded-2xl overflow-hidden border-2 border-white/15 bg-zinc-900 shadow-inner group">
              <img
                src="/edgar-warm.jpg"
                alt={fullName}
                draggable={false}
                className="w-full h-full object-cover object-center select-none pointer-events-none"
              />
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <span className="absolute bottom-2 left-2.5 text-[9px] font-mono uppercase tracking-widest text-white/80 bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded-md border border-white/15">
                FRONT // 01
              </span>
            </div>

            {/* Bottom Identity Details */}
            <div className="relative z-10 pt-2 flex items-end justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-[17px] font-bold tracking-tight text-white leading-tight truncate">
                  {fullName}
                </h3>
                <p className="text-[11px] text-white/65 truncate mt-0.5">{role}</p>
                <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest mt-1">
                  {location}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] font-mono font-bold px-2 py-1 rounded-lg bg-white/10 text-white border border-white/15 block">
                  {nickname}
                </span>
              </div>
            </div>
          </div>

          {/* ================= BACK FACE (Rotated 180 deg in 3D) ================= */}
          <div
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
            className="absolute inset-0 rounded-[24px] bg-[#141417] text-white border-[3px] border-white/90 shadow-[0_26px_55px_-12px_rgba(0,0,0,0.45),0_0_0_1px_rgba(0,0,0,0.2)] p-4 flex flex-col justify-between overflow-hidden"
          >
            {/* Top Slot Hole */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-14 h-3 rounded-full bg-bg border border-black/15 dark:border-white/20 shadow-inner mb-2.5" />

              {/* Full Width Glowing Dot-Matrix "RAGED." Banner on Back */}
              <div className="w-full rounded-xl bg-black/60 border border-white/10 py-2.5 px-2 flex flex-col items-center gap-1.5">
                <div
                  className="grid gap-[2.4px]"
                  style={{
                    gridTemplateColumns: `repeat(${RAGED_MATRIX[0].length}, minmax(0, 1fr))`,
                  }}
                  aria-label="RAGED."
                >
                  {RAGED_MATRIX.map((row, rIdx) =>
                    row.map((val, cIdx) => (
                      <span
                        key={`b-${rIdx}-${cIdx}`}
                        className={`w-[4px] h-[4px] rounded-full ${
                          val === 1
                            ? "bg-[#F4F3EF] shadow-[0_0_5px_rgba(244,243,239,0.8)]"
                            : "bg-white/10"
                        }`}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Back Photo Portrait (Red ID Photo or Casual Beach Photo) */}
            <div className="relative z-10 w-full flex-1 my-2 rounded-2xl overflow-hidden border-2 border-white/15 bg-zinc-900 shadow-inner">
              <img
                src={backPhotoMode === "red" ? "/edgar-red.jpg" : "/edgar-beach-zoom.jpg"}
                alt={`${fullName} back`}
                draggable={false}
                className="w-full h-full object-cover object-top select-none pointer-events-none"
              />
              <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/80 to-transparent" />
              <span className="absolute bottom-2 left-2.5 text-[9px] font-mono uppercase tracking-widest text-white/85 bg-black/55 backdrop-blur-xs px-2 py-0.5 rounded-md border border-white/15">
                BACK // 02
              </span>
            </div>

            {/* Bottom Barcode & Pass Clearance */}
            <div className="relative z-10 pt-1.5 border-t border-dashed border-white/15 flex items-center justify-between gap-2">
              <div className="flex items-center gap-[2px] h-5 opacity-85" aria-hidden="true">
                {[2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 2, 3, 1, 1, 2, 1, 3, 2].map((w, i) => (
                  <span
                    key={i}
                    className="h-full bg-white inline-block rounded-[0.5px]"
                    style={{ width: `${w * 1.35}px` }}
                  />
                ))}
              </div>
              <span className="text-[9px] font-mono text-white/60 tracking-widest">
                ID-RGD-2026
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Controls Bar Below Lanyard: Flip Front/Back + Choose Back Photo */}
      <div className="mt-auto pt-3 flex flex-wrap items-center justify-center gap-2.5 z-30">
        <button
          type="button"
          onClick={flipCard}
          className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-base/80 hover:text-base bg-surface-muted hover:bg-base/10 border border-base/15 px-4 py-2 rounded-full transition-all cursor-pointer shadow-xs"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>{isFlipped ? "flip to front" : "flip card (back)"}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setBackPhotoMode((prev) => (prev === "red" ? "beach" : "red"));
            if (!isFlipped) flipCard();
          }}
          className="inline-flex items-center gap-2 text-xs font-mono text-base/70 hover:text-base bg-surface-muted/70 hover:bg-surface-muted border border-base/10 px-3.5 py-2 rounded-full transition-all cursor-pointer"
          title="Switch back side photo"
        >
          <span>
            back photo: {backPhotoMode === "red" ? "red id" : "beach"}
          </span>
        </button>
      </div>
    </div>
  );
}
