"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

// Virtual rope is 145px long and anchored at y = -148 (well above the top of the viewport).
// Only the bottom ~33px is visible on screen, giving us the clean short-cord look
// while the Verlet physics engine simulates a full, supple 145px rope!
const SEGMENTS = 16;
const CONSTRAINT_ITERS = 20;
const ROPE_LEN = 145;
const REST_SOCKET_Y = -3; // Socket top at y=-3 so the glass bulb (y=4..23) aligns dead-center with the 18px navbar icons
const ANCHOR_X = 16;
const ANCHOR_Y = REST_SOCKET_Y - ROPE_LEN; // -148 (above the browser viewport)
const PULL_THRESHOLD = 22; // Pull distance (px) to trigger theme switch
const MAX_STRETCH = 55; // Elastic stretch limit when pulling
const GRAVITY = 1.0;
const DAMPING = 0.25;
const KNOB_SIZE = 27; // Slightly larger miniature bulb (27px scale)
const STORAGE_KEY = "edgar-theme";

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
  quiet: number;
  calm: number;
}

function initRope(sim: SimState) {
  const step = sim.len / SEGMENTS;
  sim.pts = [];
  for (let i = 0; i <= SEGMENTS; i++) {
    const y = sim.ay + step * i;
    sim.pts.push({ x: sim.ax, y, px: sim.ax, py: y });
  }
  sim.quiet = 0;
  sim.calm = 0;
}

function stepVerlet(sim: SimState) {
  const pts = sim.pts;
  const segLen = sim.len / SEGMENTS;
  const grav = GRAVITY * 0.55;
  const velDamping = 0.985 - Math.max(0, Math.min(1, DAMPING)) * 0.05;

  for (let i = 1; i < pts.length; i++) {
    const p = pts[i];
    let vx = (p.x - p.px) * velDamping;
    let vy = (p.y - p.py) * velDamping;
    const speed = Math.hypot(vx, vy);
    if (speed > 12) {
      vx *= 12 / speed;
      vy *= 12 / speed;
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
    relaxSegments(sim, 0.5);
  }
}

function relaxSegments(sim: SimState, factor: number) {
  const pts = sim.pts;
  const segLen = sim.len / SEGMENTS;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.hypot(dx, dy) || 1e-4;
    const rx = (a.x + (dx / dist) * segLen - b.x) * factor;
    const ry = (a.y + (dy / dist) * segLen - b.y) * factor;
    b.x += rx;
    b.y += ry;
    b.px += rx;
    b.py += ry;
  }
}

function buildRopePath(pts: RopePoint[]): string {
  if (pts.length < 2) return "";
  let d = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i].x + pts[i + 1].x) / 2;
    const my = (pts[i].y + pts[i + 1].y) / 2;
    d += ` Q${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
  }
  const last = pts[pts.length - 1];
  // Extend 1.5px into the socket neck so there is never a visual gap when angled
  d += ` L${last.x.toFixed(1)} ${(last.y + 1.5).toFixed(1)}`;
  return d;
}

function playSwitchClick(audioCtxRef: React.MutableRefObject<AudioContext | null>, isOn: boolean) {
  if (typeof window === "undefined") return;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;
  try {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioCtx();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(isOn ? 1900 : 1300, now);
    osc.frequency.exponentialRampToValueAtTime(isOn ? 700 : 350, now + 0.045);
    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  } catch {
    // Ignore audio errors if blocked by browser autoplay policy
  }
}

export default function RopeToggle() {
  // isDark = false -> Light Mode (Lamp ON, warm glow #FFD166)
  // isDark = true  -> Dark Mode (Lamp OFF, matte #4A4A52)
  const [isDark, setIsDark] = useState(false);
  const [pastThreshold, setPastThreshold] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const pathBaseRef = useRef<SVGPathElement>(null);
  const pathLightRef = useRef<SVGPathElement>(null);
  const pathDarkRef = useRef<SVGPathElement>(null);
  const bulbGroupRef = useRef<SVGGElement>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number>(0);
  const runningRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const isDarkRef = useRef(false);

  const simRef = useRef<SimState>({
    pts: [],
    ax: ANCHOR_X,
    ay: ANCHOR_Y,
    len: ROPE_LEN,
    dragging: false,
    tx: ANCHOR_X,
    ty: REST_SOCKET_Y,
    quiet: 0,
    calm: 0,
  });

  const dragRef = useRef({
    pointerId: -1,
    downX: 0,
    downY: 0,
    knobX: ANCHOR_X,
    knobY: REST_SOCKET_Y,
    moved: false,
    past: false,
  });

  const applyThemeToDOM = useCallback((dark: boolean) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
    }
    try {
      localStorage.setItem(STORAGE_KEY, dark ? "dark" : "light");
    } catch {
      // Ignore storage errors
    }
  }, []);

  const syncSVG = useCallback(() => {
    const sim = simRef.current;
    const pts = sim.pts;
    if (pts.length < 2) return;

    const d = buildRopePath(pts);
    pathBaseRef.current?.setAttribute("d", d);
    pathLightRef.current?.setAttribute("d", d);
    pathDarkRef.current?.setAttribute("d", d);

    // Use pts[pts.length - 4] -> last for smooth tangent rotation at the socket neck
    const refPt = pts[Math.max(0, pts.length - 4)];
    const last = pts[pts.length - 1];
    let angle = (Math.atan2(last.y - refPt.y, last.x - refPt.x) * 180) / Math.PI - 90;
    // Normalize angle to [-180, 180] and softly clamp to [-45, 45] so it never flips upside-down
    if (angle < -180) angle += 360;
    if (angle > 180) angle -= 360;
    angle = Math.max(-45, Math.min(45, angle));

    if (bulbGroupRef.current) {
      bulbGroupRef.current.setAttribute(
        "transform",
        `translate(${last.x.toFixed(1)} ${last.y.toFixed(1)}) rotate(${angle.toFixed(1)})`
      );
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

    if (reducedMotionRef.current) {
      let endX = sim.ax;
      let endY = sim.ay + sim.len;
      if (sim.dragging) {
        const dx = sim.tx - sim.ax;
        const dy = sim.ty - sim.ay;
        const dist = Math.hypot(dx, dy) || 1;
        const clamped = Math.min(dist, sim.len + MAX_STRETCH);
        endX = sim.ax + (dx / dist) * clamped;
        endY = sim.ay + (dy / dist) * clamped;
      }
      for (let i = 0; i <= SEGMENTS; i++) {
        const t = i / SEGMENTS;
        const p = sim.pts[i];
        p.x = p.px = sim.ax + (endX - sim.ax) * t;
        p.y = p.py = sim.ay + (endY - sim.ay) * t;
      }
      syncSVG();
      if (!sim.dragging) {
        stopLoop();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    stepVerlet(sim);

    let maxDelta = 0;
    for (const p of sim.pts) {
      maxDelta = Math.max(maxDelta, Math.abs(p.x - p.px), Math.abs(p.y - p.py));
    }

    syncSVG();

    if (!sim.dragging && maxDelta < 0.08) {
      sim.quiet++;
    } else {
      sim.quiet = 0;
    }

    if (!sim.dragging && maxDelta < 0.4) {
      sim.calm++;
    } else {
      sim.calm = 0;
    }

    if (sim.quiet > 40 || sim.calm > 150) {
      relaxSegments(sim, 1);
      for (const p of sim.pts) {
        p.px = p.x;
        p.py = p.y;
      }
      syncSVG();
      stopLoop();
      return;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [syncSVG, stopLoop]);

  const startLoop = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    simRef.current.quiet = 0;
    simRef.current.calm = 0;
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const triggerToggle = useCallback(
    (applyKick: boolean) => {
      const nextDark = !isDarkRef.current;
      isDarkRef.current = nextDark;
      setIsDark(nextDark);
      applyThemeToDOM(nextDark);
      playSwitchClick(audioCtxRef, !nextDark);

      if (applyKick && !reducedMotionRef.current) {
        const pts = simRef.current.pts;
        const last = pts[pts.length - 1];
        if (last) {
          last.py -= 6.5;
          last.px -= 2.2;
        }
        startLoop();
      }
    },
    [applyThemeToDOM, startLoop]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mq.matches;

    let initialDark = false;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "dark") initialDark = true;
    } catch {
      // Ignore storage errors
    }

    isDarkRef.current = initialDark;
    setIsDark(initialDark);
    applyThemeToDOM(initialDark);

    initRope(simRef.current);
    syncSVG();

    return () => {
      stopLoop();
    };
  }, [applyThemeToDOM, syncSVG, stopLoop]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button > 0) return;
    const sim = simRef.current;
    const last = sim.pts[sim.pts.length - 1];
    if (!last) return;

    const d = dragRef.current;
    d.pointerId = e.pointerId;
    d.downX = e.clientX;
    d.downY = e.clientY;
    d.knobX = last.x;
    d.knobY = last.y;
    d.moved = false;
    d.past = false;

    sim.dragging = true;
    sim.tx = last.x;
    sim.ty = last.y;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore pointer capture errors
    }
    startLoop();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const sim = simRef.current;
    const d = dragRef.current;
    if (!sim.dragging || e.pointerId !== d.pointerId) return;

    const dx = e.clientX - d.downX;
    const dy = e.clientY - d.downY;
    if (Math.hypot(dx, dy) > 5) {
      d.moved = true;
    }

    sim.tx = d.knobX + dx;
    sim.ty = d.knobY + dy;

    const isPast = sim.ty - (sim.ay + sim.len) > PULL_THRESHOLD;
    if (isPast !== d.past) {
      d.past = isPast;
      setPastThreshold(isPast);
    }
    startLoop();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const sim = simRef.current;
    const d = dragRef.current;
    if (!sim.dragging || e.pointerId !== d.pointerId) return;

    sim.dragging = false;
    d.pointerId = -1;

    if (d.past || !d.moved) {
      triggerToggle(!d.moved);
    }
    if (d.past) {
      d.past = false;
      setPastThreshold(false);
    }

    startLoop();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      triggerToggle(true);
    }
  };

  // Lamp ON = Light Mode (!isDark), Lamp OFF = Dark Mode (isDark)
  const isLampOn = !isDark;
  const bulbFill = isLampOn ? "#FFD166" : "#4A4A52";
  const bulbFilter = isLampOn
    ? "drop-shadow(0 0 11px rgba(255, 209, 102, 0.9))"
    : "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.35))";
  const bulbScale = pastThreshold ? 1.1 : 1;
  const X = KNOB_SIZE;

  return (
    <div
      ref={rootRef}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={handleKeyDown}
      title={isDark ? "Pull or click bulb for Light Mode" : "Pull or click bulb for Dark Mode"}
      className="relative inline-flex items-center justify-center w-8 h-8 select-none touch-none outline-none cursor-grab active:cursor-grabbing"
      style={{ overflow: "visible" }}
    >
      <svg
        width="32"
        height="28"
        viewBox="0 0 32 28"
        className="block overflow-visible pointer-events-none"
        aria-hidden="true"
      >
        {/* 1. Long Braided Cord extending up past the top viewport edge (y = -148 to y = -3) */}
        <path
          ref={pathBaseRef}
          d={`M${ANCHOR_X} ${ANCHOR_Y} L${ANCHOR_X} ${REST_SOCKET_Y}`}
          fill="none"
          stroke="#C9B79C"
          strokeWidth={3.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          ref={pathLightRef}
          d={`M${ANCHOR_X} ${ANCHOR_Y} L${ANCHOR_X} ${REST_SOCKET_Y}`}
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth={1.8}
          strokeLinecap="butt"
          strokeDasharray="3.2 3.8"
        />
        <path
          ref={pathDarkRef}
          d={`M${ANCHOR_X} ${ANCHOR_Y} L${ANCHOR_X} ${REST_SOCKET_Y}`}
          fill="none"
          stroke="rgba(0,0,0,0.22)"
          strokeWidth={1.8}
          strokeLinecap="butt"
          strokeDasharray="3.2 3.8"
          strokeDashoffset={3.5}
        />

        {/* 2. Middle Bulb Knob (Socket at y=-3 so glass globe center sits at y=13.5, matching 18px icons) */}
        <g
          ref={bulbGroupRef}
          transform={`translate(${ANCHOR_X} ${REST_SOCKET_Y}) rotate(0)`}
          style={{
            filter: bulbFilter,
            transition: "filter 0.25s ease",
          }}
        >
          <g
            transform={`scale(${bulbScale})`}
            style={{ transition: "transform 0.15s ease" }}
          >
            {/* Screw Socket Neck */}
            <rect
              x={-X * 0.2}
              y={0}
              width={X * 0.4}
              height={X * 0.28}
              rx={X * 0.05}
              fill="#8E8E96"
            />
            <rect
              x={-X * 0.2}
              y={X * 0.08}
              width={X * 0.4}
              height={X * 0.05}
              fill="rgba(0,0,0,0.3)"
            />
            <rect
              x={-X * 0.2}
              y={X * 0.17}
              width={X * 0.4}
              height={X * 0.05}
              fill="rgba(0,0,0,0.3)"
            />

            {/* Glass Bulb Body */}
            <path
              d={`M${-X * 0.2} ${X * 0.28} L${-X * 0.28} ${X * 0.48} A${X * 0.48} ${X * 0.48} 0 1 0 ${X * 0.28} ${X * 0.48} L${X * 0.2} ${X * 0.28} Z`}
              fill={bulbFill}
              stroke={isLampOn ? "rgba(217, 155, 38, 0.45)" : "rgba(255,255,255,0.25)"}
              strokeWidth={1}
              style={{ transition: "fill 0.25s ease, stroke 0.25s ease" }}
            />

            {/* Inner Filament Curve */}
            <path
              d={`M${-X * 0.12} ${X * 0.48} Q0 ${X * 0.68} ${X * 0.12} ${X * 0.48}`}
              fill="none"
              stroke={isLampOn ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.28)"}
              strokeWidth={1.3}
              strokeLinecap="round"
            />

            {/* Glass Specular Reflection */}
            <circle
              cx={-X * 0.15}
              cy={X * 0.68}
              r={X * 0.09}
              fill={isLampOn ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.18)"}
            />
          </g>
        </g>
      </svg>
    </div>
  );
}
