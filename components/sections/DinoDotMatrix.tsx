"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Play } from "lucide-react";

// Grid geometry: dynamic cols x 36 rows (-1 dot pixel height overall per user request)
// Gap between Dino and clouds reduced by 1 row
// Ground line at row 30 with 5 full rows of visible soil/dirt underneath (rows 31-35)
const ROWS = 36;
const GROUND_Y = 30; // Ground line row (0-indexed)
const CELL_SIZE = 8; // ~8px per dot cell, matching or slightly denser than hero matrix

// Authentic Chrome Dino Walking Frame 1: Left leg down, Right leg raised (20 cols x 16 rows)
const DINO_F1 = [
  "...........#######..",
  "..........#.######..", // Eye at col 12
  "..........########..",
  "..........########..",
  "..........#####.....",
  "..........#######...",
  "..#......######.....",
  "..##....########....",
  "..###..#########....",
  "..##############....",
  "...###########......",
  "....#########.......",
  ".....#######........",
  "......#####.........",
  "......##..##........",
  ".......#............",
];

// Authentic Chrome Dino Walking Frame 2: Left leg raised, Right leg down (20 cols x 16 rows)
const DINO_F2 = [
  "...........#######..",
  "..........#.######..",
  "..........########..",
  "..........########..",
  "..........#####.....",
  "..........#######...",
  "..#......######.....",
  "..##....########....",
  "..###..#########....",
  "..##############....",
  "...###########......",
  "....#########.......",
  ".....#######........",
  "......#####.........",
  "......##..##........",
  "..........#.........",
];

// Authentic Chrome Saguaro Cactus Single (14 rows x 10 cols)
// Pure straight rectangular columns with flat tops and 90-degree arms (NO tree shapes)
const CACTUS_SINGLE = [
  "....###...",
  "....###...",
  "....###...",
  "....###...",
  ".##.###...",
  ".##.###.##",
  ".##.###.##",
  ".##.###.##",
  ".######.##",
  "..########",
  "....###...",
  "....###...",
  "....###...",
  "....###...",
];

// Authentic Chrome Saguaro Cactus Double (14 rows x 19 cols)
// Two distinct straight saguaro cacti side by side
const CACTUS_DOUBLE = [
  "...###.......###...",
  "...###.......###...",
  "...###.......###...",
  "...###....##.###...",
  ".#.###.##.##.###.##",
  ".#.###.##.##.###.##",
  ".#.###.##.##.###.##",
  ".#####.##.######.##",
  "..#######..########",
  "...###.......###...",
  "...###.......###...",
  "...###.......###...",
  "...###.......###...",
  "...###.......###...",
];

// Authentic Small Saguaro Cactus (10 rows x 8 cols)
const CACTUS_SMALL = [
  "..##....",
  "..##....",
  "..##....",
  "#.##....",
  "#.##.#..",
  "#.##.#..",
  "####.##.",
  ".######.",
  "..##....",
  "..##....",
];

// 1. Large Chrome Cloud Outline (6 rows x 22 cols: exact silhouette from reference image media_1790867641252.png, slightly more compact)
const CLOUD_LARGE = [
  ".........######.......",
  "........#......#......",
  ".......#........#####.",
  "....###..............#",
  "..##.................#",
  "#.#..#################",
];

// 2. Medium Chrome Cloud Outline (4 rows x 14 cols: medium cloud based on media_1790867641252.png)
const CLOUD_MEDIUM = [
  ".....###......",
  "..###...##..#.",
  ".#...........#",
  "#.#.##########",
];

// 3. Small Chrome Cloud Outline (3 rows x 11 cols: mini cloud based on media_1790867641252.png)
const CLOUD_SMALL = [
  "...##......",
  ".##..##..#.",
  "#.#.#######",
];

export default function DinoDotMatrix() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const colsRef = useRef<number>(160);

  // Mouse hover ripple position
  const mousePosRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -100,
    y: -100,
    active: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let lastTime = 0;
    let stepTimer = 0;
    let legTimer = 0;
    let cloudTimer = 0;

    // Simulation state
    let scrollX = 0;
    let legFrame = 0;

    // Varied non-overlapping clouds (large, medium, small) drifting at identical speeds
    const clouds: { x: number; y: number; type: "large" | "medium" | "small" }[] = [
      { x: 30, y: 2, type: "large" },
      { x: 115, y: 3, type: "medium" },
      { x: 195, y: 4, type: "small" },
      { x: 275, y: 2, type: "large" },
    ];

    // Obstacles track
    const obstacles: { x: number; type: "single" | "double" | "small" }[] = [
      { x: 55, type: "single" },
      { x: 110, type: "double" },
      { x: 165, type: "small" },
    ];

    const resize = () => {
      if (!canvas || !container) return;
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const newCols = Math.max(50, Math.floor(rect.width / CELL_SIZE));
      colsRef.current = newCols;
    };

    resize();
    window.addEventListener("resize", resize);

    const render = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      const currentCols = colsRef.current;
      const cloudSpacing = Math.max(75, Math.floor(currentCols / 2.3));

      stepTimer += delta;
      legTimer += delta;
      cloudTimer += delta;

      // Move ground and obstacles
      if (stepTimer >= 80) {
        stepTimer = 0;
        scrollX = (scrollX + 1) % 1000;

        // Advance obstacles
        for (const obs of obstacles) {
          obs.x -= 1;
          if (obs.x < -22) {
            const maxX = Math.max(...obstacles.map((k) => k.x));
            const minSpacing = Math.max(38, Math.floor(currentCols * 0.28));
            obs.x = Math.max(currentCols + 10, maxX + minSpacing + Math.floor(Math.random() * 25));
            const rand = Math.random();
            obs.type = rand < 0.4 ? "single" : rand < 0.75 ? "double" : "small";
          }
        }
      }

      // Leg animation: toggle running frames every 120ms
      if (legTimer >= 120) {
        legTimer = 0;
        legFrame = (legFrame + 1) % 2;
      }

      // Cloud drift: all clouds drift at the exact same uniform speed so they NEVER bunch up/overlap
      if (cloudTimer >= 100) {
        cloudTimer = 0;
        for (const cl of clouds) {
          cl.x -= 0.35;
          if (cl.x < -24) {
            const maxX = Math.max(...clouds.map((k) => k.x));
            cl.x = Math.max(currentCols + 15, maxX + cloudSpacing);
            // Cycle between large, medium, small
            const rand = Math.random();
            if (rand < 0.35) {
              cl.type = "large";
              cl.y = 2;
            } else if (rand < 0.7) {
              cl.type = "medium";
              cl.y = 3;
            } else {
              cl.type = "small";
              cl.y = 4;
            }
          }
        }
      }

      // Grid buffer (0 = faint paper dot, 1 = dark charcoal dot)
      const grid = new Uint8Array(currentCols * ROWS);

      // Helper to paint sprite onto grid
      const drawSprite = (sprite: string[], startX: number, startY: number) => {
        const sH = sprite.length;
        const sW = sprite[0].length;
        for (let r = 0; r < sH; r++) {
          for (let c = 0; c < sW; c++) {
            if (sprite[r][c] === "#") {
              const gx = Math.round(startX) + c;
              const gy = startY + r;
              if (gx >= 0 && gx < currentCols && gy >= 0 && gy < ROWS) {
                grid[gy * currentCols + gx] = 1;
              }
            }
          }
        }
      };

      // 1. Draw Clouds in high sky (rows 2 to 7, non-overlapping: large, medium, small)
      for (const cl of clouds) {
        if (cl.x >= -24 && cl.x < currentCols + 10) {
          const sprite =
            cl.type === "large"
              ? CLOUD_LARGE
              : cl.type === "medium"
              ? CLOUD_MEDIUM
              : CLOUD_SMALL;
          drawSprite(sprite, Math.round(cl.x), cl.y);
        }
      }

      // 2. Draw Ground Line with authentic mounds (gundukan) - hapus dot bawahnya!
      for (let c = 0; c < currentCols; c++) {
        const worldX = c + scrollX;

        // Gundukan: 3-dot solid mound stepping up to GROUND_Y - 1 every ~58 dots
        const isMound =
          worldX % 58 === 0 ||
          (worldX - 1) % 58 === 0 ||
          (worldX - 2) % 58 === 0;

        if (isMound) {
          // Gundukan rises to GROUND_Y - 1
          grid[(GROUND_Y - 1) * currentCols + c] = 1;
          // Hapus dot bawahnya (ground line directly underneath is 0)
          grid[GROUND_Y * currentCols + c] = 0;
        } else {
          // Normal ground baseline
          grid[GROUND_Y * currentCols + c] = 1;
        }
      }

      // Sub-surface dirt specks beneath the ground line (Rows 33-37: 5 full rows of visible soil)
      for (let c = 0; c < currentCols; c++) {
        const worldX = c + scrollX;
        // Clean single specks distributed sparsely across desert depth (no phantom double clusters)
        if ((worldX * 11 + 7) % 23 === 0 && GROUND_Y + 1 < ROWS) {
          grid[(GROUND_Y + 1) * currentCols + c] = 1;
        }
        if ((worldX * 17 + 13) % 31 === 0 && GROUND_Y + 2 < ROWS) {
          grid[(GROUND_Y + 2) * currentCols + c] = 1;
        }
        if ((worldX * 7 + 19) % 37 === 0 && GROUND_Y + 3 < ROWS) {
          grid[(GROUND_Y + 3) * currentCols + c] = 1;
        }
        if ((worldX * 13 + 5) % 43 === 0 && GROUND_Y + 4 < ROWS) {
          grid[(GROUND_Y + 4) * currentCols + c] = 1;
        }
        if ((worldX * 19 + 11) % 47 === 0 && GROUND_Y + 5 < ROWS) {
          grid[(GROUND_Y + 5) * currentCols + c] = 1;
        }
      }

      // 3. Draw Cacti (standing on Row 32, pure saguaro Chrome shape)
      for (const obs of obstacles) {
        if (obs.x >= -22 && obs.x < currentCols) {
          const sprite =
            obs.type === "double"
              ? CACTUS_DOUBLE
              : obs.type === "small"
              ? CACTUS_SMALL
              : CACTUS_SINGLE;
          const cacY = GROUND_Y - sprite.length;
          drawSprite(sprite, obs.x, cacY);
        }
      }

      // 4. Draw Walking T-Rex Dino (feet on row 30 directly on ground 30, shifted 3 dots to the right)
      const dinoSprite = legFrame === 0 ? DINO_F1 : DINO_F2;
      const dinoX = Math.max(13, Math.floor(currentCols * 0.1) + 5);
      const dinoY = GROUND_Y - dinoSprite.length;
      drawSprite(dinoSprite, dinoX, dinoY);

      // 5. Render dots on Canvas
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cellW = canvas.width / currentCols;
      const cellH = canvas.height / ROWS;
      const dotRadius = Math.min(cellW, cellH) * 0.38;

      const mouse = mousePosRef.current;
      const mc = mouse.active ? Math.round((mouse.x / rect.width) * currentCols) : -100;
      const mr = mouse.active ? Math.round((mouse.y / rect.height) * ROWS) : -100;

      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < currentCols; c++) {
          const isDark = grid[r * currentCols + c] === 1;
          const cx = (c + 0.5) * cellW;
          const cy = (r + 0.5) * cellH;

          // Interactive 5-pixel '+' cursor: tengah, atas, bawah, kiri, kanan
          const isCursorPlus =
            mouse.active &&
            ((c === mc && r === mr) || // tengah
              (c === mc && r === mr - 1) || // atas
              (c === mc && r === mr + 1) || // bawah
              (c === mc - 1 && r === mr) || // kiri
              (c === mc + 1 && r === mr)); // kanan

          ctx.beginPath();
          ctx.arc(cx, cy, isCursorPlus ? dotRadius * 1.35 : dotRadius, 0, Math.PI * 2);

          if (isCursorPlus) {
            ctx.fillStyle = "#18181b"; // Active 5-pixel cross dot
          } else if (isDark) {
            ctx.fillStyle = "#18181b";
          } else {
            ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
          }
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mousePosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    };
  }, []);

  const handlePointerLeave = useCallback(() => {
    mousePosRef.current = { x: -100, y: -100, active: false };
  }, []);

  return (
    <section className="relative z-30 w-full left-0 right-0 m-0 p-0 overflow-hidden select-none bg-[#FBFAF9]">
      {/* Top Header sitting directly on paper (No numbers / highscore) */}
      <div className="w-full max-w-304 mx-auto px-6 sm:px-9 pb-3 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold tracking-wider uppercase text-[11px] text-base/40">
            Chrome Dino Runner
          </span>
        </div>
      </div>

      {/* Full-bleed Edge-to-Edge Canvas touching left (0px), right (0px), and bottom (0px) */}
      <div
        ref={containerRef}
        className="relative w-full h-72 sm:h-80 md:h-88 flex items-center justify-center p-0 m-0"
      >
        <canvas
          ref={canvasRef}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          className="w-full h-full touch-none block m-0 p-0"
          style={{
            cursor:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='9' height='9' viewBox='0 0 9 9' shape-rendering='crispEdges'%3E%3Crect x='3' y='0' width='3' height='3' fill='%2318181b'/%3E%3Crect x='0' y='3' width='3' height='3' fill='%2318181b'/%3E%3Crect x='3' y='3' width='3' height='3' fill='%2318181b'/%3E%3Crect x='6' y='3' width='3' height='3' fill='%2318181b'/%3E%3Crect x='3' y='6' width='3' height='3' fill='%2318181b'/%3E%3C/svg%3E\") 4 4, crosshair",
          }}
          aria-label="High Resolution Chrome Dino Pixel Dot Matrix on Paper"
        />

        {/* Centered Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Link
            href="/dino"
            className="pointer-events-auto group inline-flex items-center gap-2 px-5 py-2 sm:px-6 sm:py-2 rounded-full bg-transparent hover:bg-black/5 text-black border border-black hover:scale-105 active:scale-95 transition-all duration-200 backdrop-blur-[2px]"
          >
            <Play className="w-3.5 h-3.5 fill-current group-hover:scale-110 transition-transform duration-200" />
            <span className="font-mono text-xs sm:text-sm font-semibold tracking-wider uppercase">
              Play
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
