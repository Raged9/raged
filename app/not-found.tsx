"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const COLS = 60;
const ROWS = 26;
const GROUND_Y = 20;

// Standing T-Rex Dino (both feet planted on ground, matching reference image)
const DINO_STANDING = [
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
  "......#...#.........",
  "......##..##........",
];

// Single Saguaro Cactus (10 cols x 14 rows, matching reference image)
const CACTUS_SINGLE = [
  "....###...",
  "....###...",
  "....###.#.",
  ".#..###.##",
  ".##.###.##",
  ".##.###.##",
  ".##.###.##",
  ".######.##",
  "..#######.",
  "....###...",
  "....###...",
  "....###...",
  "....###...",
  "....###...",
];

// Single Chrome Cloud (16 cols x 5 rows, upper right sky)
const CLOUD_SINGLE = [
  ".......####.....",
  "....###....#....",
  "..##.......#.##.",
  ".#............#.",
  "#..#############",
];

function buildSceneMatrix(): Uint8Array {
  const grid = new Uint8Array(COLS * ROWS);

  const drawSprite = (sprite: string[], startX: number, startY: number) => {
    for (let r = 0; r < sprite.length; r++) {
      const row = sprite[r];
      for (let c = 0; c < row.length; c++) {
        if (row[c] === "#") {
          const gx = startX + c;
          const gy = startY + r;
          if (gx >= 0 && gx < COLS && gy >= 0 && gy < ROWS) {
            grid[gy * COLS + gx] = 1;
          }
        }
      }
    }
  };

  // 1. Horizontal Ground Line at GROUND_Y (with small natural gaps around Dino feet)
  for (let c = 2; c < COLS - 2; c++) {
    if (c === 8 || c === 9 || c === 13 || c === 16) continue;
    grid[GROUND_Y * COLS + c] = 1;
  }

  // 2. Sparse desert dirt dashes below the ground line (matching reference image)
  const dirtRow1: number[] = [3, 4, 15, 22, 23, 32, 33, 47, 48];
  const dirtRow2: number[] = [2, 3, 16, 26, 27, 28, 29, 45];
  for (const c of dirtRow1) {
    if (GROUND_Y + 2 < ROWS) grid[(GROUND_Y + 2) * COLS + c] = 1;
  }
  for (const c of dirtRow2) {
    if (GROUND_Y + 4 < ROWS) grid[(GROUND_Y + 4) * COLS + c] = 1;
  }

  // 3. Draw One Cloud in Upper-Right Sky
  drawSprite(CLOUD_SINGLE, 41, 2);

  // 4. Draw One Saguaro Cactus in Center-Right
  drawSprite(CACTUS_SINGLE, 34, GROUND_Y - CACTUS_SINGLE.length + 2);

  // 5. Draw Standing T-Rex Dino on Left
  drawSprite(DINO_STANDING, 4, GROUND_Y - DINO_STANDING.length + 2);

  return grid;
}

export default function NotFound() {
  const scene = useMemo(() => buildSceneMatrix(), []);

  return (
    <div className="flex relative flex-col min-h-screen items-center bg-bg text-fg overflow-x-hidden">
      {/* Tayo's distinctive dashed vertical margin lines */}
      <div className="hidden lg:block h-full min-h-screen z-0 absolute left-8 xl:left-24 border text-base/10 border-long-dashed pointer-events-none" />
      <div className="hidden lg:block h-full min-h-screen z-0 absolute right-8 xl:right-24 border text-base/10 border-long-dashed pointer-events-none" />

      <Navbar />

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center w-full max-w-304 mx-auto px-6 pt-28 pb-20 text-center">
        {/* Minimal Dot Illustration: Only active dots for Dino, 1 Cactus, 1 Cloud, and Ground (no outline box, inactive dots completely off) */}
        <div
          className="grid select-none mx-auto mb-8"
          style={{
            gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
          }}
          aria-label="404 Dino, Cactus, and Cloud Dot Illustration"
        >
          {Array.from({ length: COLS * ROWS }).map((_, idx) => {
            const isActive = scene[idx] === 1;
            return (
              <div
                key={idx}
                className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 flex items-center justify-center"
              >
                {isActive && (
                  <div
                    className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-[7px] md:h-[7px] rounded-full pointer-events-none"
                    style={{
                      backgroundColor: "var(--dot-on)",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-fg">
          404 — page not found.
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-fg/50 max-w-xs leading-relaxed">
          looks like this route doesn&apos;t exist.
        </p>

        <Link
          href="/"
          className="mt-6 serif py-2.5 px-6 rounded-[13px] text-[17px] hover:scale-105 active:scale-95 transition-all duration-300 font-bold cursor-pointer text-bg bg-base shadow-md"
        >
          back to home
        </Link>
      </main>
    </div>
  );
}
