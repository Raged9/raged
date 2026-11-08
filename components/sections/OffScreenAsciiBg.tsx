"use client";

import React, { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

// Exact 10-character classic ASCII luminance ramp from devault-ascii (darkest -> brightest)
const DEVAULT_RAMP = " .:-=+*#%@";

interface SampledPixel {
  isBg: boolean;
  /** True ONLY for the movable carriage (paper + upper roller/bail + left knob x<=16 + left shadow) */
  isCarriage: boolean;
  /** 1 = white paper sheet, 2 = mint keyboard keys, 3 = chassis/carriage/shadow */
  region: number;
  lum: number;
  r: number;
  g: number;
  b: number;
  baseCharIdx: number;
}

/**
 * Left Side: Pure Classic ASCII Typewriter (NO dark background underlay — ASCII characters only!)
 * - Strict pixel-verified separation between the movable carriage and the stationary blue body:
 *   - Left carriage knob (x <= 16, y = 21..30) & left carriage desk shadow (x <= 26, y = 32..38) move.
 *   - Left blue body shoulder (x >= 17, y >= 21) and all turquoise body pixels NEVER move!
 */
function DevaultAsciiTypewriter({ reduceMotion }: { reduceMotion: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const COLS = 112;
    const ROWS = 54;
    const CHAR_W = 4.6;
    const CHAR_H = 7.6;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const logicalW = Math.round(COLS * CHAR_W);
    const logicalH = Math.round(ROWS * CHAR_H);
    canvas.width = Math.round(logicalW * dpr);
    canvas.height = Math.round(logicalH * dpr);

    let cells: SampledPixel[] | null = null;
    let seamFillCells: (SampledPixel | null)[] | null = null;
    let animId = 0;
    let isCancelled = false;

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = "/ascii-typewriter.png";

    /**
     * Exact pixel-verified carriage boundary (from the 112x54 pixel dump of ascii-typewriter.png):
     * - No turquoise-blue body pixel (b > r + 12 && g > r + 5) is ever part of the moving carriage.
     * - Left carriage knob is strictly at gx <= 16 (rows 20..30); gx >= 17 in rows 21..30 is the stationary blue shoulder!
     * - Left carriage desk shadow ("bayangan carriage di kiri") is at gx <= 26, rows 32..38.
     * - Upper paper sheet + silver carriage bar + right knob sit strictly above the blue hood line.
     */
    const isCarriageCoord = (
      gx: number,
      gy: number,
      r: number,
      g: number,
      b: number
    ): boolean => {
      // Never pull any turquoise-blue body pixel!
      if (b > r + 12 && g > r + 5 && gy >= 15) {
        return false;
      }

      // 0. Everything in the top 20 rows (gy < 20) is 100% the upper paper sheet & top carriage (never cut off the top-left paper tip!)
      if (gy < 20) {
        return true;
      }

      // 1. Left carriage cast shadow on the desk (rows 32..38, gx <= 26)
      if (gx <= 26 && gy >= 32 && gy <= 38.5) {
        return true;
      }

      // 2. Left carriage knob & lever (strictly gx <= 16 in rows 20..30; gx >= 17 is the blue body shoulder!)
      if (gx <= 16 && gy >= 20 && gy <= 30.5) {
        return true;
      }

      // 3. Lower paper sheet & silver carriage ruler (rows 20..23.5) strictly above the blue hood
      if (gx >= 20) {
        // Slanted line right along the bottom of the paper & carriage ruler, strictly above the blue hood
        let maxY: number;
        if (gx <= 34) {
          // Avoid the left blue shoulder at gx = 20..25, gy = 21..23; only white paper (r > 215) moves here
          if (gy >= 20.5 && !(r > 215 && g > 215 && b > 210)) {
            return false;
          }
          maxY = 23.2;
        } else if (gx <= 62) {
          maxY = 23.0 - ((gx - 34) / 28) * 3.8;
        } else {
          maxY = 18.2 - ((gx - 62) / 32) * 1.5;
        }
        return gy <= maxY;
      }

      return false;
    };

    img.onload = () => {
      if (isCancelled) return;

      const sx = img.width * 0.13;
      const sy = img.height * 0.16;
      const sw = img.width * 0.64;
      const sh = img.height * 0.64;

      const off = document.createElement("canvas");
      off.width = COLS;
      off.height = ROWS;
      const offCtx = off.getContext("2d");
      if (!offCtx) return;
      offCtx.drawImage(img, sx, sy, sw, sh, 0, 0, COLS, ROWS);

      const data = offCtx.getImageData(0, 0, COLS, ROWS).data;
      const bgR = data[0];
      const bgG = data[1];
      const bgB = data[2];

      const maxRamp = DEVAULT_RAMP.length - 1;
      const parsed: SampledPixel[] = new Array(COLS * ROWS);

      for (let y = 0; y < ROWS; y++) {
        const yn = y / ROWS;
        for (let x = 0; x < COLS; x++) {
          const xn = x / COLS;
          const i = (y * COLS + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          const distBg = Math.hypot(r - bgR, g - bgG, b - bgB);
          if (a < 40 || distBg < 19) {
            parsed[y * COLS + x] = {
              isBg: true,
              isCarriage: false,
              region: 0,
              lum: 0,
              r: 0,
              g: 0,
              b: 0,
              baseCharIdx: 0,
            };
            continue;
          }

          const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          const baseCharIdx = Math.min(
            maxRamp,
            Math.max(1, Math.floor(lum * (maxRamp + 0.99)))
          );

          const isCarriage = isCarriageCoord(x, y, r, g, b);

          let region = 3;
          if (isCarriage && r > 225 && g > 225 && b > 220 && y <= 23) {
            region = 1; // White paper sheet
          } else if (
            !isCarriage &&
            yn >= 0.48 &&
            yn <= 0.82 &&
            xn >= 0.28 &&
            xn <= 0.88
          ) {
            region = 2; // Mint-green keyboard keys
          }

          parsed[y * COLS + x] = {
            isBg: false,
            isCarriage,
            region,
            lum,
            r,
            g,
            b,
            baseCharIdx,
          };
        }
      }

      // Build under-seam fill map so when the carriage & left carriage shadow shift left/right,
      // the boundary between the carriage/shadow and the stationary body NEVER has a gap ("bolong")!
      const fillMap: (SampledPixel | null)[] = new Array(COLS * ROWS).fill(null);
      for (let y = 16; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          const c = parsed[y * COLS + x];
          if (!c.isCarriage || c.isBg) continue;

          for (let dx = 1; dx <= 6; dx++) {
            if (x + dx < COLS) {
              const rightNeighbor = parsed[y * COLS + (x + dx)];
              if (!rightNeighbor.isBg && !rightNeighbor.isCarriage) {
                fillMap[y * COLS + x] = rightNeighbor;
                break;
              }
            }
          }
          if (!fillMap[y * COLS + x] && y + 1 < ROWS) {
            const downNeighbor = parsed[(y + 1) * COLS + x];
            if (!downNeighbor.isBg && !downNeighbor.isCarriage) {
              fillMap[y * COLS + x] = downNeighbor;
            }
          }
        }
      }

      cells = parsed;
      seamFillCells = fillMap;
      renderFrame(0);
    };

    const renderFrame = (timeMs: number) => {
      if (isCancelled || !canvas || !cells || !seamFillCells) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const t = timeMs * 0.001;
      const isDark = document.documentElement.classList.contains("dark");

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, logicalW, logicalH);
      ctx.font = "900 7.8px monospace";
      ctx.textBaseline = "top";

      const cycleDur = 4.15;
      const cyclePhase = (t % cycleDur) / cycleDur;
      const typingProgress =
        cyclePhase < 0.86
          ? Math.floor((cyclePhase / 0.86) * 14) / 14
          : 1 - (cyclePhase - 0.86) / 0.14;

      // Entire carriage + paper + left carriage shadow shifts together (+2 -> -4 cols)
      const carriageShiftX = reduceMotion
        ? 0
        : Math.round(2 - typingProgress * 6);

      const isTypingActive = !reduceMotion && cyclePhase < 0.86;
      const stepNum = Math.floor(t * 11);
      const activeKeyX = 36 + ((stepNum * 17) % 52);
      const activeKeyY = 30 + ((stepNum * 7) % 12);

      const TYPED_LINE_CHARS = "-=+*#%:";

      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          const baseCell = cells[y * COLS + x];
          const shiftedX = x - carriageShiftX;

          let cell: SampledPixel | null = null;
          let isFromShiftedCarriage = false;

          if (
            shiftedX >= 0 &&
            shiftedX < COLS &&
            cells[y * COLS + shiftedX].isCarriage &&
            !cells[y * COLS + shiftedX].isBg
          ) {
            cell = cells[y * COLS + shiftedX];
            isFromShiftedCarriage = true;
          } else if (!baseCell.isCarriage && !baseCell.isBg) {
            cell = baseCell;
          } else if (seamFillCells[y * COLS + x]) {
            cell = seamFillCells[y * COLS + x];
          }

          if (!cell) continue;

          let charIdx = cell.baseCharIdx;
          if (!isDark && cell.lum < 0.28) {
            charIdx = Math.max(2, charIdx);
          }

          let ch = DEVAULT_RAMP[charIdx];
          let r = cell.r;
          let g = cell.g;
          let b = cell.b;
          let isTypedInk = false;

          if (isFromShiftedCarriage && cell.region === 1 && !reduceMotion) {
            const srcX = shiftedX;
            if (srcX >= 29 && srcX <= 57) {
              const tiltOffset = Math.round((srcX - 29) * 0.075);
              const line1Y = 14 - tiltOffset;
              const line2Y = 16 - tiltOffset;
              const line3Y = 18 - tiltOffset;

              const isCompletedLine = y === line1Y || y === line2Y;
              const maxTypedX = 29 + Math.floor(typingProgress * 28);
              const isCurrentTypingLine = y === line3Y && srcX <= maxTypedX;

              if (isCompletedLine || isCurrentTypingLine) {
                const relX = srcX - 29;
                if (relX % 6 !== 4) {
                  const glyphIdx =
                    (relX * 3 + y * 5) % TYPED_LINE_CHARS.length;
                  ch = TYPED_LINE_CHARS[glyphIdx];
                  isTypedInk = true;
                }
              }
            }
          } else if (!isFromShiftedCarriage && cell.region === 2 && isTypingActive) {
            const distKey = Math.hypot(x - activeKeyX, y - activeKeyY);
            if (distKey < 2.2) {
              ch = "@";
              r = Math.min(255, r + 45);
              g = Math.min(255, g + 45);
              b = Math.min(255, b + 45);
            }
          }

          // Pure ASCII character rendering (NO background fill!)
          if (isDark) {
            if (isTypedInk) {
              ctx.fillStyle = "rgb(40, 50, 58)";
            } else {
              ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            }
          } else {
            if (isTypedInk) {
              ctx.fillStyle = "rgb(28, 32, 36)";
            } else if (cell.region === 1) {
              ctx.fillStyle = "rgb(112, 124, 136)";
            } else if (cell.lum < 0.26) {
              ctx.fillStyle = "rgb(36, 33, 30)";
            } else {
              const avg = (r + g + b) / 3;
              const satR = Math.max(
                12,
                Math.min(215, Math.round(avg * 0.56 + (r - avg) * 1.85))
              );
              const satG = Math.max(
                18,
                Math.min(215, Math.round(avg * 0.58 + (g - avg) * 1.85))
              );
              const satB = Math.max(
                22,
                Math.min(225, Math.round(avg * 0.60 + (b - avg) * 1.85))
              );
              ctx.fillStyle = `rgb(${satR}, ${satG}, ${satB})`;
            }
          }

          ctx.fillText(ch, x * CHAR_W, y * CHAR_H);
        }
      }

      ctx.restore();

      if (!reduceMotion) {
        animId = window.requestAnimationFrame(renderFrame);
      }
    };

    return () => {
      isCancelled = true;
      if (animId) window.cancelAnimationFrame(animId);
    };
  }, [reduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="w-[360px] sm:w-[440px] md:w-[500px] h-auto select-none pointer-events-none"
    />
  );
}

type Vec3 = [number, number, number];

function normalize3(v: Vec3): Vec3 {
  const len = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / len, v[1] / len, v[2] / len];
}

function cross3(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

/**
 * Right Side: Compact, Agile Paper Airplane Flight with a Spacious 360° Roller-Coaster Loop
 * Smaller airplane proportions so the 360° vertical loop looks natural and aerodynamic!
 */
function AsciiRollerCoasterPlane({ reduceMotion }: { reduceMotion: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const COLS = 92;
    const ROWS = 72;
    const CHAR_W = 5.0;
    const CHAR_H = 7.2;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(COLS * CHAR_W * dpr);
    canvas.height = Math.round(ROWS * CHAR_H * dpr);

    const zbuf = new Float32Array(COLS * ROWS);
    const ibuf = new Float32Array(COLS * ROWS);
    let animId = 0;
    let isCancelled = false;

    const localVerts: Vec3[] = [
      [0, 0.04, 1.65],      // 0: Sharp pointed nose tip
      [-1.30, 0.22, -0.95], // 1: Left outer delta wingtip
      [-0.20, 0.08, -0.88], // 2: Left inner fuselage fold
      [0, -0.45, -1.02],    // 3: Bottom keel crease
      [0.20, 0.08, -0.88],  // 4: Right inner fuselage fold
      [1.30, 0.22, -0.95],  // 5: Right outer delta wingtip
    ];

    const faces: { indices: [number, number, number]; shadeBias: number }[] = [
      { indices: [0, 1, 2], shadeBias: 1.0 },
      { indices: [0, 4, 5], shadeBias: 0.85 },
      { indices: [0, 2, 3], shadeBias: 0.62 },
      { indices: [0, 3, 4], shadeBias: 0.48 },
    ];

    // Spacious roller-coaster loop trajectory so the smaller plane executes a wide, graceful 360° loop
    const getTrajectoryPoint = (phi: number): Vec3 => {
      const a = 0.165;
      const R = 0.275;

      const d = a * phi - R * Math.sin(phi);
      const n = R * (1 + Math.cos(phi)) - 0.18;

      const ux = 0.42;
      const uy = 0.907;
      const nx = 0.907;
      const ny = -0.42;

      const worldX = COLS * 0.44 + (d * ux + n * nx) * (COLS * 0.74);
      const worldY = ROWS * 0.54 + (d * uy + n * ny) * (ROWS * 0.80);
      const worldZ = Math.sin(phi * 0.65) * 0.55 + Math.cos(phi) * 0.25;

      return [worldX, worldY, worldZ];
    };

    const drawTriangle = (
      p0: Vec3,
      p1: Vec3,
      p2: Vec3,
      intensity: number
    ) => {
      const minX = Math.max(0, Math.floor(Math.min(p0[0], p1[0], p2[0])));
      const maxX = Math.min(COLS - 1, Math.ceil(Math.max(p0[0], p1[0], p2[0])));
      const minY = Math.max(0, Math.floor(Math.min(p0[1], p1[1], p2[1])));
      const maxY = Math.min(ROWS - 1, Math.ceil(Math.max(p0[1], p1[1], p2[1])));

      const denom =
        (p1[1] - p2[1]) * (p0[0] - p2[0]) + (p2[0] - p1[0]) * (p0[1] - p2[1]);
      if (Math.abs(denom) < 0.0001) return;

      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          const px = x + 0.5;
          const py = y + 0.5;
          const w0 =
            ((p1[1] - p2[1]) * (px - p2[0]) + (p2[0] - p1[0]) * (py - p2[1])) /
            denom;
          const w1 =
            ((p2[1] - p0[1]) * (px - p2[0]) + (p0[0] - p2[0]) * (py - p2[1])) /
            denom;
          const w2 = 1 - w0 - w1;

          if (w0 >= -0.02 && w1 >= -0.02 && w2 >= -0.02) {
            const z = w0 * p0[2] + w1 * p1[2] + w2 * p2[2];
            const idx = y * COLS + x;
            if (z > zbuf[idx]) {
              zbuf[idx] = z;
              const isEdge = w0 < 0.1 || w1 < 0.1 || w2 < 0.1;
              ibuf[idx] = isEdge ? Math.min(1, intensity + 0.28) : intensity;
            }
          }
        }
      }
    };

    const renderFrame = (timeMs: number) => {
      if (isCancelled || !canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const cycleDuration = 5.0;
      const rawU = reduceMotion ? 0.42 : ((timeMs * 0.001) / cycleDuration) % 1;
      const phi = -3.35 + rawU * 6.7;

      zbuf.fill(-999);
      ibuf.fill(0);

      const pos = getTrajectoryPoint(phi);
      const nextPos = getTrajectoryPoint(phi + 0.04);

      const F = normalize3([
        (nextPos[0] - pos[0]) / 12,
        -(nextPos[1] - pos[1]) / 8.5,
        nextPos[2] - pos[2],
      ]);

      const bankRoll = 0.42 * Math.sin(phi * 0.9);
      const refSide = normalize3([
        0.38 * Math.cos(bankRoll),
        0.32 * Math.sin(bankRoll),
        0.88,
      ]);

      const Up = normalize3(cross3(refSide, F));
      const Right = normalize3(cross3(F, Up));

      // Balanced medium-size paper airplane (between 5.8 and 11.2)
      const scaleX = 8.4;
      const scaleY = 6.3;

      const worldVerts: Vec3[] = localVerts.map(([lx, ly, lz]) => {
        const wx = lx * Right[0] + ly * Up[0] + lz * F[0];
        const wy = lx * Right[1] + ly * Up[1] + lz * F[1];
        const wz = lx * Right[2] + ly * Up[2] + lz * F[2];
        return [pos[0] + wx * scaleX, pos[1] - wy * scaleY, pos[2] + wz];
      });

      const lightDir: Vec3 = normalize3([-0.4, 0.75, 0.52]);

      for (const face of faces) {
        const [i0, i1, i2] = face.indices;
        const p0 = worldVerts[i0];
        const p1 = worldVerts[i1];
        const p2 = worldVerts[i2];

        const ux = p1[0] - p0[0];
        const uy = p1[1] - p0[1];
        const uz = (p1[2] - p0[2]) * 10;
        const vx = p2[0] - p0[0];
        const vy = p2[1] - p0[1];
        const vz = (p2[2] - p0[2]) * 10;

        const norm = normalize3([
          uy * vz - uz * vy,
          uz * vx - ux * vz,
          ux * vy - uy * vx,
        ]);

        const dot = Math.abs(
          norm[0] * lightDir[0] + norm[1] * lightDir[1] + norm[2] * lightDir[2]
        );
        const intensity = Math.max(
          0.28,
          Math.min(0.99, (0.38 + dot * 0.62) * face.shadeBias)
        );

        drawTriangle(p0, p1, p2, intensity);
      }

      // Crisp dotted ASCII contrail tracing the roller-coaster loop behind the plane
      for (let step = 1; step <= 56; step++) {
        const trailPhi = phi - step * 0.048;
        if (trailPhi < -3.35) continue;
        const tp = getTrajectoryPoint(trailPhi);
        const fade = Math.max(0.1, (1 - step / 57) * 0.58);

        const tx = Math.round(tp[0]);
        const ty = Math.round(tp[1]);
        if (tx >= 0 && tx < COLS && ty >= 0 && ty < ROWS) {
          const idx = ty * COLS + tx;
          if (ibuf[idx] === 0) {
            ibuf[idx] = fade;
          }
        }
      }

      const isDark = document.documentElement.classList.contains("dark");
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, COLS * CHAR_W, ROWS * CHAR_H);
      ctx.font = "bold 7.2px monospace";
      ctx.textBaseline = "top";
      ctx.fillStyle = isDark ? "rgba(234, 230, 223, 0.80)" : "rgba(48, 47, 45, 0.75)";

      const maxIdx = DEVAULT_RAMP.length - 1;
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          const val = ibuf[y * COLS + x];
          if (val <= 0.02) continue;
          const ci = Math.min(maxIdx, Math.max(1, Math.floor(val * maxIdx)));
          ctx.fillText(DEVAULT_RAMP[ci], x * CHAR_W, y * CHAR_H);
        }
      }

      ctx.restore();

      if (!reduceMotion) {
        animId = window.requestAnimationFrame(renderFrame);
      }
    };

    renderFrame(0);

    return () => {
      isCancelled = true;
      if (animId) window.cancelAnimationFrame(animId);
    };
  }, [reduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="w-[340px] sm:w-[410px] md:w-[450px] h-auto select-none pointer-events-none"
    />
  );
}

export default function OffScreenAsciiBg() {
  const reduceMotion = Boolean(useReducedMotion());

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -inset-y-16 left-1/2 -translate-x-1/2 w-screen max-w-[1640px] flex items-center justify-between px-1 sm:px-4 lg:px-8 z-0 overflow-hidden"
    >
      {/* Left Background: Pure Classic ASCII Typewriter */}
      <div className="opacity-95 transition-opacity duration-500 -ml-10 sm:-ml-4 lg:ml-0">
        <DevaultAsciiTypewriter reduceMotion={reduceMotion} />
      </div>

      {/* Right Background: Compact 3D ASCII Paper Airplane (Top Glide -> 360° Loop -> Bottom Glide) */}
      <div className="opacity-45 sm:opacity-65 lg:opacity-75 transition-opacity duration-500 -mr-10 sm:-mr-4 lg:mr-0">
        <AsciiRollerCoasterPlane reduceMotion={reduceMotion} />
      </div>
    </div>
  );
}
