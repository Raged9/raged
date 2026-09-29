"use client";

import React, { useRef, useCallback, useEffect } from "react";

// 36x36 Pixel Art Matrix sampled and refined from public/porto-icon.jpg (Edgar Avatar)
const ICON_MATRIX_36 = [
  "....................................",
  "....................................",
  "....................####............",
  ".............##############.........",
  "...........##################.......",
  "..........####################......",
  ".........######################.....",
  "........#######################.....",
  ".......#########################....",
  ".......##############....#######....",
  "......##############......######....",
  "......##############......#######...",
  ".....###############......#######...",
  ".....###############......#######...",
  ".....###############......######....",
  ".....################....#######....",
  "......################..#######.....",
  "......##############..#########.....",
  "......#############...######.##.....",
  ".......#####...####...##.###.##.....",
  ".......#####...##....###.###.##.....",
  ".......#####...##....###.###.##.....",
  ".......##.#....##....###.###.##.....",
  "........###.....##..###...##.#......",
  "........####.......##......###......",
  "..........##.......#####...##.......",
  "...........##..............##.......",
  "...........###............##........",
  "............###..........###........",
  "..................##....###.........",
  "..................########..........",
  "....................................",
  "....................................",
  "....................................",
  "....................................",
  "....................................",
];

const COLS = 36;
const ROWS = 36;

// Pre-compute lookup table for dark icon dots (1 = icon dot, 0 = faint background dot)
const IS_DARK = new Uint8Array(COLS * ROWS);
for (let r = 0; r < ROWS; r++) {
  const rowStr = ICON_MATRIX_36[r] || "";
  for (let c = 0; c < COLS; c++) {
    if (rowStr[c] === "#") {
      IS_DARK[r * COLS + c] = 1;
    }
  }
}

export default function PixelDotGrid() {
  const gridRef = useRef<HTMLDivElement>(null);
  const dotElementsRef = useRef<(HTMLDivElement | null)[]>([]);
  const timersRef = useRef<Map<number, NodeJS.Timeout>>(new Map());
  const currentHoveredIdxRef = useRef<number | null>(null);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  // Smoothly schedule fade back to base color
  const scheduleFade = useCallback((idx: number, isDark: boolean) => {
    // If user's cursor is currently resting directly on this cell, don't fade yet
    if (currentHoveredIdxRef.current === idx) return;

    // Clear any previous scheduled fade
    const existing = timersRef.current.get(idx);
    if (existing) {
      clearTimeout(existing);
      timersRef.current.delete(idx);
    }

    const timer = setTimeout(() => {
      const el = dotElementsRef.current[idx];
      if (el) {
        el.style.transition =
          "background-color 800ms ease-out, transform 800ms ease-out, box-shadow 800ms ease-out";
        el.style.boxShadow = "none";
        if (isDark) {
          el.style.backgroundColor = "#18181b";
          el.style.transform = "scale(1)";
        } else {
          el.style.backgroundColor = "rgba(0, 0, 0, 0.06)";
          el.style.transform = "scale(1)";
        }
      }
      timersRef.current.delete(idx);
    }, 1000);

    timersRef.current.set(idx, timer);
  }, []);

  // Instantly activate a dot (change black -> gray #9ca3af)
  const activateDot = useCallback(
    (idx: number, isDirectHover = false) => {
      if (idx < 0 || idx >= COLS * ROWS) return;
      const el = dotElementsRef.current[idx];
      if (!el) return;

      const isDark = IS_DARK[idx] === 1;

      // Cancel existing timer
      const existing = timersRef.current.get(idx);
      if (existing) {
        clearTimeout(existing);
        timersRef.current.delete(idx);
      }

      // 0ms instant color activation via direct DOM manipulation
      el.style.transition = "none";
      if (isDark) {
        // Black dot turns gray (#9ca3af)
        el.style.backgroundColor = "#9ca3af";
        el.style.transform = "scale(1.2)";
        el.style.boxShadow = "0 1px 3px rgba(156, 163, 175, 0.35)";
      } else {
        // Faint background dot illuminates slightly
        el.style.backgroundColor = "rgba(156, 163, 175, 0.4)";
        el.style.transform = "scale(1.1)";
      }

      // If not directly resting hover, schedule fade-out
      if (!isDirectHover) {
        scheduleFade(idx, isDark);
      }
    },
    [scheduleFade]
  );

  // Activate dots within refined brush radius (~0.92 cell units: 1-2 dots wide, sleeker than before)
  const activateAtCoord = useCallback(
    (x: number, y: number, width: number, height: number) => {
      const colFloat = (x / width) * COLS;
      const rowFloat = (y / height) * ROWS;

      // Refined brush radius: smaller than 1.35, but larger than initial single dot (covers 1-2 dots wide)
      const radius = 0.92;
      const minR = Math.max(0, Math.floor(rowFloat - radius));
      const maxR = Math.min(ROWS - 1, Math.ceil(rowFloat + radius));
      const minC = Math.max(0, Math.floor(colFloat - radius));
      const maxC = Math.min(COLS - 1, Math.ceil(colFloat + radius));

      for (let r = minR; r <= maxR; r++) {
        for (let c = minC; c <= maxC; c++) {
          const dist = Math.hypot(c + 0.5 - colFloat, r + 0.5 - rowFloat);
          if (dist <= radius) {
            const idx = r * COLS + c;
            if (idx !== currentHoveredIdxRef.current) {
              activateDot(idx, false);
            }
          }
        }
      }
    },
    [activateDot]
  );

  // Pointer move handler with linear path interpolation for zero missed dots even on fast flicks
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const grid = gridRef.current;
      if (!grid) return;
      const rect = grid.getBoundingClientRect();
      const currX = e.clientX - rect.left;
      const currY = e.clientY - rect.top;

      if (currX < 0 || currX > rect.width || currY < 0 || currY > rect.height) {
        lastPosRef.current = null;
        return;
      }

      const lastPos = lastPosRef.current;
      if (!lastPos) {
        activateAtCoord(currX, currY, rect.width, rect.height);
      } else {
        const dx = currX - lastPos.x;
        const dy = currY - lastPos.y;
        const dist = Math.hypot(dx, dy);
        // Step every ~3.5px along the line for continuous stroke
        const step = 3.5;
        const steps = Math.max(1, Math.ceil(dist / step));
        for (let i = 1; i <= steps; i++) {
          const t = i / steps;
          const x = lastPos.x + dx * t;
          const y = lastPos.y + dy * t;
          activateAtCoord(x, y, rect.width, rect.height);
        }
      }

      lastPosRef.current = { x: currX, y: currY };
    },
    [activateAtCoord]
  );

  const handleCellPointerEnter = useCallback(
    (idx: number) => {
      currentHoveredIdxRef.current = idx;
      activateDot(idx, true);
    },
    [activateDot]
  );

  const handleCellPointerLeave = useCallback(
    (idx: number) => {
      if (currentHoveredIdxRef.current === idx) {
        currentHoveredIdxRef.current = null;
      }
      scheduleFade(idx, IS_DARK[idx] === 1);
    },
    [scheduleFade]
  );

  const handleGridPointerLeave = useCallback(() => {
    lastPosRef.current = null;
    if (currentHoveredIdxRef.current !== null) {
      const prev = currentHoveredIdxRef.current;
      currentHoveredIdxRef.current = null;
      scheduleFade(prev, IS_DARK[prev] === 1);
    }
  }, [scheduleFade]);

  // Clean up all timers on unmount
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);

  return (
    <div className="relative flex items-center justify-center select-none bg-transparent touch-none">
      {/* 36x36 Dot Matrix Pixel Art */}
      <div
        ref={gridRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handleGridPointerLeave}
        className="grid select-none cursor-crosshair p-2"
        style={{
          gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
        }}
        aria-label="Interactive Pixel Art Matrix"
      >
        {Array.from({ length: COLS * ROWS }).map((_, index) => {
          const isDark = IS_DARK[index] === 1;

          return (
            <div
              key={index}
              data-dot-index={index}
              onPointerEnter={() => handleCellPointerEnter(index)}
              onPointerLeave={() => handleCellPointerLeave(index)}
              className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 flex items-center justify-center cursor-crosshair"
            >
              <div
                ref={(el) => {
                  dotElementsRef.current[index] = el;
                }}
                className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full pointer-events-none transition-all duration-700 ease-out"
                style={{
                  backgroundColor: isDark ? "#18181b" : "rgba(0, 0, 0, 0.06)",
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
