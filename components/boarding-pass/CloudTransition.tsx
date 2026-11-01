"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

type CloudTransitionEventDetail = {
  onMidpoint?: () => void;
  onComplete?: () => void;
};

const CLOUD_EVENT_NAME = "edgar:cloud-transition";

/**
 * Imperatively trigger the fullscreen bottom-to-top Clash-of-Clans / Anime
 * cel-shaded cloud transition from anywhere in the app (duration ~2.5s).
 */
export function triggerCloudTransition(detail?: CloudTransitionEventDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<CloudTransitionEventDetail>(CLOUD_EVENT_NAME, { detail })
  );
}

/**
 * Synthesizes a two-stage airy cloud whoosh (Clash of Clans raid search style):
 * 1) Deep, warm billowing rush as clouds surge up from bottom to cover screen
 * 2) Breezy upward parting whoosh as clouds clear upward to reveal the target page
 */
function playCloudWhooshSound() {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const duration = 2.55;
    const sampleRate = ctx.sampleRate;
    const bufferSize = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    // Pink-ish filtered noise for a lush, warm cloud rush
    let b0 = 0,
      b1 = 0,
      b2 = 0,
      b3 = 0,
      b4 = 0,
      b5 = 0,
      b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.042;
      b6 = white * 0.115926;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.setValueAtTime(1.05, ctx.currentTime);
    filter.frequency.setValueAtTime(170, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(640, ctx.currentTime + 0.85);
    filter.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 1.25);
    filter.frequency.exponentialRampToValueAtTime(820, ctx.currentTime + 1.95);
    filter.frequency.exponentialRampToValueAtTime(210, ctx.currentTime + 2.5);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    // Swell 1: Surge from bottom
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.55);
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 1.15);
    // Swell 2: Upward parting reveal
    gain.gain.linearRampToValueAtTime(0.28, ctx.currentTime + 1.65);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
    noise.stop(ctx.currentTime + duration);
  } catch {
    // Ignore audio context errors if blocked
  }
}

/**
 * Dense, fractal-like scalloped circle definitions for the massive 2D cel-shaded
 * mountain cumulus cloud bank (viewBox: 0 0 1600 1500, strict 1:1 circle aspect ratio).
 * Modeled on frames 00:01–00:07 of the reference video + Clash of Clans clouds.
 */
const CUMULUS_DOMES: Array<{ cx: number; cy: number; r: number }> = [
  // Central towering mountain peak (like 00:05 of reference video)
  { cx: 820, cy: 230, r: 150 },
  { cx: 700, cy: 275, r: 135 },
  { cx: 945, cy: 270, r: 138 },
  { cx: 775, cy: 175, r: 98 },
  { cx: 880, cy: 185, r: 92 },
  { cx: 830, cy: 140, r: 68 },
  // Tight bubbly curls along central peak
  { cx: 635, cy: 235, r: 56 },
  { cx: 680, cy: 198, r: 46 },
  { cx: 735, cy: 155, r: 40 },
  { cx: 938, cy: 175, r: 48 },
  { cx: 990, cy: 210, r: 56 },
  { cx: 1040, cy: 248, r: 50 },

  // Left billowing ridge
  { cx: 555, cy: 325, r: 145 },
  { cx: 420, cy: 365, r: 150 },
  { cx: 280, cy: 395, r: 158 },
  { cx: 130, cy: 420, r: 170 },
  { cx: -20, cy: 445, r: 180 },
  // Left tight bubbly curls
  { cx: 505, cy: 252, r: 62 },
  { cx: 458, cy: 278, r: 48 },
  { cx: 375, cy: 282, r: 65 },
  { cx: 322, cy: 312, r: 52 },
  { cx: 230, cy: 302, r: 68 },
  { cx: 175, cy: 328, r: 54 },
  { cx: 80, cy: 325, r: 72 },
  { cx: 25, cy: 355, r: 58 },

  // Right billowing ridge
  { cx: 1075, cy: 320, r: 148 },
  { cx: 1215, cy: 360, r: 152 },
  { cx: 1360, cy: 390, r: 162 },
  { cx: 1505, cy: 415, r: 170 },
  { cx: 1630, cy: 440, r: 180 },
  // Right tight bubbly curls
  { cx: 1125, cy: 248, r: 64 },
  { cx: 1175, cy: 278, r: 48 },
  { cx: 1265, cy: 278, r: 66 },
  { cx: 1320, cy: 308, r: 52 },
  { cx: 1415, cy: 302, r: 68 },
  { cx: 1470, cy: 332, r: 55 },
  { cx: 1560, cy: 328, r: 72 },

  // Dense middle body domes (guarantees thick, solid interior on tall mobile viewports)
  { cx: 120, cy: 620, r: 240 },
  { cx: 460, cy: 580, r: 260 },
  { cx: 800, cy: 560, r: 280 },
  { cx: 1140, cy: 580, r: 260 },
  { cx: 1480, cy: 620, r: 240 },

  { cx: 120, cy: 880, r: 240 },
  { cx: 460, cy: 860, r: 260 },
  { cx: 800, cy: 850, r: 280 },
  { cx: 1140, cy: 860, r: 260 },
  { cx: 1480, cy: 880, r: 240 },
];

/**
 * Trailing bottom-edge scalloped cloud domes (creates the round, un-stretched bumpy
 * cloud tail as the cloud wall sweeps UP and exits the top of the screen).
 */
const TRAILING_EDGE_DOMES: Array<{ cx: number; cy: number; r: number }> = [
  { cx: -30, cy: 1060, r: 165 },
  { cx: 95, cy: 1100, r: 138 },
  { cx: 205, cy: 1140, r: 150 },
  { cx: 310, cy: 1105, r: 125 },
  { cx: 415, cy: 1170, r: 158 },
  { cx: 530, cy: 1115, r: 140 },
  { cx: 640, cy: 1075, r: 130 },
  { cx: 745, cy: 1150, r: 155 },
  { cx: 860, cy: 1195, r: 168 },
  { cx: 975, cy: 1140, r: 145 },
  { cx: 1085, cy: 1085, r: 132 },
  { cx: 1195, cy: 1165, r: 158 },
  { cx: 1315, cy: 1110, r: 140 },
  { cx: 1425, cy: 1145, r: 152 },
  { cx: 1535, cy: 1090, r: 140 },
  { cx: 1640, cy: 1055, r: 165 },
  // Small trailing curls on the bottom edge
  { cx: 148, cy: 1210, r: 54 },
  { cx: 355, cy: 1230, r: 56 },
  { cx: 470, cy: 1245, r: 46 },
  { cx: 685, cy: 1215, r: 50 },
  { cx: 800, cy: 1275, r: 60 },
  { cx: 915, cy: 1265, r: 48 },
  { cx: 1135, cy: 1225, r: 54 },
  { cx: 1250, cy: 1240, r: 46 },
  { cx: 1475, cy: 1215, r: 52 },
];

/**
 * Watertight core polygon connecting the upper ridge dome centers down to the
 * trailing bottom dome centers so there is never a gap inside the cloud bank.
 */
const CORE_FILL_POINTS =
  "-80,445 130,420 280,395 420,365 555,325 700,275 820,230 945,270 1075,320 1215,360 1360,390 1505,415 1680,440 1680,1080 1535,1090 1425,1145 1315,1110 1195,1165 1085,1085 975,1140 860,1195 745,1150 640,1075 530,1115 415,1170 310,1105 205,1140 95,1100 -80,1080";

/**
 * Clash of Clans style standalone billowing cumulus cloud cluster (used for
 * staggered multi-layer raid cloud waves rising from bottom to top).
 */
function CoCRaidCloudCluster({
  flip = false,
  className = "",
}: {
  flip?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 680 420"
      className={`overflow-visible ${className}`}
      style={{
        transform: flip ? "scaleX(-1)" : undefined,
        filter: "drop-shadow(0 14px 28px rgba(35, 48, 72, 0.16))",
      }}
    >
      {/* Deep CoC Blue-Grey Underbelly Shadow (#C2CCE0) */}
      <g fill="#C4CFE2" transform="translate(0, 18)">
        <path d="M 80,260 L 600,260 L 580,330 L 100,330 Z" />
        <circle cx="110" cy="255" r="78" />
        <circle cx="220" cy="280" r="88" />
        <circle cx="345" cy="295" r="96" />
        <circle cx="470" cy="280" r="88" />
        <circle cx="575" cy="255" r="76" />
        <circle cx="170" cy="195" r="82" />
        <circle cx="330" cy="165" r="108" />
        <circle cx="485" cy="190" r="86" />
      </g>

      {/* Mid-Tone Cel-Shaded Layer (#DFE5F2) */}
      <g fill="#DFE5F2" transform="translate(0, 8)">
        <path d="M 80,250 L 600,250 L 580,320 L 100,320 Z" />
        <circle cx="110" cy="250" r="78" />
        <circle cx="220" cy="272" r="88" />
        <circle cx="345" cy="285" r="96" />
        <circle cx="470" cy="272" r="88" />
        <circle cx="575" cy="250" r="76" />
        <circle cx="170" cy="188" r="84" />
        <circle cx="330" cy="155" r="110" />
        <circle cx="485" cy="182" r="88" />
        <circle cx="250" cy="128" r="64" />
        <circle cx="415" cy="132" r="62" />
      </g>

      {/* Pure Crisp White Cumulus Tops (#FFFFFF) */}
      <g fill="#FFFFFF">
        <path d="M 90,235 L 590,235 L 570,295 L 110,295 Z" />
        <circle cx="110" cy="240" r="76" />
        <circle cx="220" cy="260" r="86" />
        <circle cx="345" cy="272" r="94" />
        <circle cx="470" cy="260" r="86" />
        <circle cx="575" cy="240" r="74" />
        <circle cx="170" cy="178" r="84" />
        <circle cx="330" cy="145" r="108" />
        <circle cx="485" cy="172" r="86" />
        {/* Tight bubbly curls */}
        <circle cx="248" cy="116" r="62" />
        <circle cx="415" cy="120" r="60" />
        <circle cx="105" cy="175" r="44" />
        <circle cx="555" cy="175" r="46" />
        <circle cx="335" cy="68" r="48" />
        <circle cx="288" cy="82" r="36" />
        <circle cx="382" cy="84" r="38" />
      </g>

      {/* Inner Cartoon Crescent Shadows */}
      <g fill="#D8E0EE">
        <path d="M 255 195 A 70 70 0 0 0 405 185 A 64 56 0 0 1 255 195 Z" />
        <path d="M 120 245 A 55 55 0 0 0 230 235 A 50 44 0 0 1 120 245 Z" />
        <path d="M 435 240 A 55 55 0 0 0 545 230 A 50 44 0 0 1 435 240 Z" />
      </g>
    </svg>
  );
}

/**
 * Individual cel-shaded mini cloud puff cluster with satellite vapor droplets
 * (matches the little burst puffs in frames 00:00, 00:02, 00:05, 00:09).
 */
function MiniCloudPuff({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 140"
      className={`overflow-visible ${className}`}
      fill="none"
    >
      {/* Cel-shaded grey shadow base */}
      <g fill="#D5DCE8" transform="translate(0, 10)">
        <circle cx="110" cy="72" r="38" />
        <circle cx="76" cy="80" r="28" />
        <circle cx="144" cy="78" r="30" />
        <circle cx="56" cy="88" r="18" />
        <circle cx="166" cy="86" r="19" />
      </g>
      {/* Crisp white foreground puff */}
      <g fill="#FFFFFF">
        <circle cx="110" cy="68" r="38" />
        <circle cx="76" cy="76" r="28" />
        <circle cx="144" cy="74" r="30" />
        <circle cx="92" cy="50" r="24" />
        <circle cx="128" cy="52" r="22" />
        <circle cx="56" cy="84" r="18" />
        <circle cx="166" cy="82" r="19" />
        {/* Satellite vapor droplets */}
        <circle cx="28" cy="64" r="8" />
        <circle cx="16" cy="52" r="4.5" />
        <circle cx="42" cy="44" r="5" />
        <circle cx="190" cy="58" r="9" />
        <circle cx="204" cy="44" r="5" />
        <circle cx="176" cy="38" r="5.5" />
        <circle cx="108" cy="20" r="7" />
        <circle cx="124" cy="12" r="4" />
      </g>
    </svg>
  );
}

/**
 * Corner / Flank Cel-Shaded Cloud Bank (Clash of Clans style diagonal surge & part).
 * Uses `xMidYMid meet` inside an aspect-matched container so circles NEVER stretch on mobile.
 */
function FlankCloudBank({ side }: { side: "left" | "right" }) {
  const isLeft = side === "left";
  return (
    <svg
      viewBox="0 0 1000 1050"
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full overflow-visible"
      style={{
        transform: isLeft ? "none" : "scaleX(-1)",
        filter: "drop-shadow(0 -12px 28px rgba(45, 55, 75, 0.14))",
      }}
    >
      {/* Deep slate-grey outer shadow layer */}
      <g fill="#C9D2E2" transform="translate(18, -18)">
        <circle cx="120" cy="180" r="180" />
        <circle cx="310" cy="240" r="165" />
        <circle cx="480" cy="320" r="155" />
        <circle cx="620" cy="430" r="150" />
        <circle cx="740" cy="560" r="160" />
        <circle cx="840" cy="710" r="175" />
        {/* Tight curls */}
        <circle cx="235" cy="130" r="65" />
        <circle cx="410" cy="205" r="58" />
        <circle cx="565" cy="295" r="54" />
        <circle cx="695" cy="415" r="58" />
        <circle cx="810" cy="545" r="62" />
      </g>

      {/* Mid-tone cool grey cel-shaded layer */}
      <g fill="#E1E6F0" transform="translate(9, -9)">
        <polygon points="-120,180 120,180 310,240 480,320 620,430 740,560 840,710 840,890 -120,890" />
        <circle cx="120" cy="180" r="180" />
        <circle cx="310" cy="240" r="165" />
        <circle cx="480" cy="320" r="155" />
        <circle cx="620" cy="430" r="150" />
        <circle cx="740" cy="560" r="160" />
        <circle cx="840" cy="710" r="175" />
        <circle cx="235" cy="130" r="65" />
        <circle cx="410" cy="205" r="58" />
        <circle cx="565" cy="295" r="54" />
        <circle cx="695" cy="415" r="58" />
        <circle cx="810" cy="545" r="62" />
        {/* Trailing bottom scallops */}
        <circle cx="95" cy="875" r="150" />
        <circle cx="280" cy="900" r="145" />
        <circle cx="460" cy="885" r="155" />
        <circle cx="640" cy="905" r="145" />
      </g>

      {/* Pure crisp white main cloud body */}
      <g fill="#FFFFFF">
        <polygon points="-120,195 110,195 295,255 465,335 605,445 725,575 825,725 825,890 -120,890" />
        <circle cx="110" cy="195" r="180" />
        <circle cx="295" cy="255" r="165" />
        <circle cx="465" cy="335" r="155" />
        <circle cx="605" cy="445" r="150" />
        <circle cx="725" cy="575" r="160" />
        <circle cx="825" cy="725" r="175" />
        {/* Bubbly perimeter curls */}
        <circle cx="220" cy="145" r="64" />
        <circle cx="275" cy="165" r="46" />
        <circle cx="395" cy="220" r="58" />
        <circle cx="445" cy="245" r="44" />
        <circle cx="550" cy="310" r="54" />
        <circle cx="595" cy="345" r="42" />
        <circle cx="680" cy="430" r="58" />
        <circle cx="795" cy="560" r="62" />
        {/* Trailing bottom scallops */}
        <circle cx="95" cy="860" r="150" />
        <circle cx="280" cy="885" r="145" />
        <circle cx="460" cy="870" r="155" />
        <circle cx="640" cy="890" r="145" />
      </g>

      {/* Anime / Clash of Clans inner crescent shadow accents */}
      <g fill="#DCE2EE">
        <path d="M 220 310 A 85 85 0 0 0 365 290 A 75 70 0 0 1 220 310 Z" />
        <path d="M 410 415 A 75 75 0 0 0 535 395 A 68 62 0 0 1 410 415 Z" />
        <path d="M 555 545 A 80 80 0 0 0 685 520 A 72 66 0 0 1 555 545 Z" />
        <path d="M 110 460 A 95 95 0 0 0 270 435 A 85 78 0 0 1 110 460 Z" />
      </g>
    </svg>
  );
}

/**
 * Massive Full-Width Bottom-to-Top Mountain Cumulus Bank
 * Uses `preserveAspectRatio="xMidYMid meet"` inside an aspect-[16/15] container
 * so all circular domes stay 100% round and never stretch on mobile portrait screens!
 */
function MountainCumulusBank() {
  return (
    <svg
      viewBox="0 0 1600 1500"
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full overflow-visible"
      style={{
        filter: "drop-shadow(0 -16px 34px rgba(35, 45, 65, 0.15))",
      }}
    >
      {/* Layer 1: Deep Slate-Grey Outer Rim / Back Cloud Shadow (#C7D0E0) */}
      <g fill="#C8D1E1" transform="translate(0, -28)">
        <polygon points={CORE_FILL_POINTS} />
        {CUMULUS_DOMES.map((d, i) => (
          <circle key={`back-${i}`} cx={d.cx + 12} cy={d.cy} r={d.r} />
        ))}
      </g>

      {/* Layer 2: Soft Cool-Grey Cel-Shaded Mid-Tone (#E1E6EF) */}
      <g fill="#E1E6EF" transform="translate(0, -14)">
        <polygon points={CORE_FILL_POINTS} />
        {CUMULUS_DOMES.map((d, i) => (
          <circle key={`mid-${i}`} cx={d.cx - 8} cy={d.cy} r={d.r} />
        ))}
        {TRAILING_EDGE_DOMES.map((d, i) => (
          <circle key={`tmid-${i}`} cx={d.cx} cy={d.cy + 22} r={d.r} />
        ))}
      </g>

      {/* Layer 3: Pure Crisp White Foreground Cumulus Body (#FFFFFF) */}
      <g fill="#FFFFFF">
        <polygon points={CORE_FILL_POINTS} />
        {CUMULUS_DOMES.map((d, i) => (
          <circle key={`front-${i}`} cx={d.cx} cy={d.cy} r={d.r} />
        ))}
        {TRAILING_EDGE_DOMES.map((d, i) => (
          <circle key={`tfront-${i}`} cx={d.cx} cy={d.cy} r={d.r} />
        ))}
      </g>

      {/* Layer 4: Inner Cel-Shaded Crescent Accents (like 00:02 & 00:06 of video) */}
      <g fill="#DDE3EE">
        <path d="M 710 310 A 95 95 0 0 0 890 295 A 85 76 0 0 1 710 310 Z" />
        <path d="M 480 410 A 88 88 0 0 0 640 390 A 78 70 0 0 1 480 410 Z" />
        <path d="M 960 395 A 90 90 0 0 0 1125 380 A 80 72 0 0 1 960 395 Z" />
        <path d="M 210 475 A 95 95 0 0 0 385 455 A 85 75 0 0 1 210 475 Z" />
        <path d="M 1210 465 A 95 95 0 0 0 1385 445 A 85 75 0 0 1 1210 465 Z" />
        <path d="M 650 560 A 120 120 0 0 0 880 540 A 110 96 0 0 1 650 560 Z" />
        <path d="M 340 650 A 105 105 0 0 0 530 630 A 95 82 0 0 1 340 650 Z" />
        <path d="M 1030 645 A 105 105 0 0 0 1220 625 A 95 82 0 0 1 1030 645 Z" />
        <path d="M 660 880 A 115 115 0 0 0 875 860 A 105 90 0 0 1 660 880 Z" />
      </g>
    </svg>
  );
}

/**
 * Detached satellite puffs & cloud droplets (like frames 00:00, 00:05, 00:09)
 * that shoot upward ahead of and behind the main cloud mass.
 */
const SATELLITE_PUFFS: Array<{
  id: string;
  x: string;
  startY: string;
  endY: string;
  scale: number;
  delay: number;
  duration: number;
}> = [
  // Leading scout puffs surging up ahead of the main cloud wall
  { id: "p1", x: "14%", startY: "104vh", endY: "-28vh", scale: 0.95, delay: 0.0, duration: 1.32 },
  { id: "p2", x: "29%", startY: "110vh", endY: "-32vh", scale: 1.2, delay: 0.04, duration: 1.38 },
  { id: "p3", x: "48%", startY: "102vh", endY: "-36vh", scale: 1.35, delay: 0.0, duration: 1.28 },
  { id: "p4", x: "66%", startY: "108vh", endY: "-30vh", scale: 1.1, delay: 0.05, duration: 1.35 },
  { id: "p5", x: "83%", startY: "112vh", endY: "-26vh", scale: 0.95, delay: 0.02, duration: 1.4 },
  // Trailing puffs rising & dissipating as the cloud wall clears upward to reveal /typewriter
  { id: "p6", x: "16%", startY: "92vh", endY: "-38vh", scale: 1.15, delay: 0.98, duration: 1.4 },
  { id: "p7", x: "36%", startY: "98vh", endY: "-44vh", scale: 1.38, delay: 1.05, duration: 1.42 },
  { id: "p8", x: "54%", startY: "94vh", endY: "-46vh", scale: 1.25, delay: 1.0, duration: 1.4 },
  { id: "p9", x: "73%", startY: "98vh", endY: "-40vh", scale: 1.1, delay: 1.06, duration: 1.38 },
  { id: "p10", x: "87%", startY: "90vh", endY: "-35vh", scale: 0.9, delay: 1.02, duration: 1.34 },
];

/**
 * Staggered Clash of Clans raid cloud clusters that billow & rise from bottom to top,
 * creating multi-layered parallax cloud depth before and after the main wall.
 */
const COC_CLUSTERS: Array<{
  id: string;
  x: string;
  width: string;
  flip: boolean;
  delay: number;
  duration: number;
  driftX: string;
}> = [
  { id: "c1", x: "12%", width: "54vw", flip: false, delay: 0.02, duration: 2.35, driftX: "-12vw" },
  { id: "c2", x: "82%", width: "54vw", flip: true, delay: 0.05, duration: 2.38, driftX: "12vw" },
  { id: "c3", x: "48%", width: "62vw", flip: false, delay: 0.0, duration: 2.32, driftX: "0vw" },
  { id: "c4", x: "26%", width: "56vw", flip: true, delay: 0.14, duration: 2.42, driftX: "-18vw" },
  { id: "c5", x: "74%", width: "56vw", flip: false, delay: 0.16, duration: 2.42, driftX: "18vw" },
];

export default function CloudTransition() {
  const [active, setActive] = useState(false);
  const reduceMotion = useReducedMotion();
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  }, []);

  useEffect(() => {
    const handleTrigger = (e: Event) => {
      const customEvent = e as CustomEvent<CloudTransitionEventDetail>;
      const onMidpoint = customEvent.detail?.onMidpoint;
      const onComplete = customEvent.detail?.onComplete;

      clearTimers();
      setActive(true);

      if (reduceMotion) {
        const t1 = setTimeout(() => {
          onMidpoint?.();
        }, 250);
        const t2 = setTimeout(() => {
          setActive(false);
          onComplete?.();
        }, 600);
        timersRef.current.push(t1, t2);
        return;
      }

      playCloudWhooshSound();

      // Midpoint at 1.08s when clouds 100% blanket the viewport: swap route underneath!
      const tMid = setTimeout(() => {
        onMidpoint?.();
      }, 1080);

      // Complete at 2.55s once all clouds have swept up and parted off the top of the screen
      const tEnd = setTimeout(() => {
        setActive(false);
        onComplete?.();
      }, 2550);

      timersRef.current.push(tMid, tEnd);
    };

    window.addEventListener(CLOUD_EVENT_NAME, handleTrigger);
    return () => {
      window.removeEventListener(CLOUD_EVENT_NAME, handleTrigger);
      clearTimers();
    };
  }, [clearTimers, reduceMotion]);

  if (!active) return null;

  return (
    <AnimatePresence>
      {active && (
        <div
          role="status"
          aria-live="polite"
          aria-label="Transitioning through the clouds"
          className="fixed inset-0 z-[9999] pointer-events-auto overflow-hidden select-none"
        >
          {/* Solid Mid-Transition Cloud Fill Blanket (ensures 100% opaque cloud sea at midpoint 0.90s - 1.48s) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0, 1, 1, 0, 0] }}
            transition={{
              duration: 2.5,
              times: [0, 0.33, 0.41, 0.56, 0.67, 1],
              ease: "easeInOut",
            }}
            className="absolute inset-0 bg-[#E8EDF5]"
          />

          {/* WAVE 1: Fast Scout Satellite Cloud Puffs Shooting Bottom-to-Top (Frames 00:00, 00:05, 00:09) */}
          {!reduceMotion &&
            SATELLITE_PUFFS.map((puff) => (
              <motion.div
                key={puff.id}
                initial={{
                  y: puff.startY,
                  scale: puff.scale * 0.45,
                  opacity: 0,
                }}
                animate={{
                  y: puff.endY,
                  scale: [
                    puff.scale * 0.45,
                    puff.scale * 1.18,
                    puff.scale * 0.92,
                    puff.scale * 0.2,
                  ],
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  duration: puff.duration,
                  delay: puff.delay,
                  ease: [0.2, 0.85, 0.35, 1],
                }}
                style={{ left: puff.x }}
                className="absolute top-0 -translate-x-1/2 w-[190px] sm:w-[270px] pointer-events-none z-40"
              >
                <MiniCloudPuff />
              </motion.div>
            ))}

          {/* WAVE 2: Clash of Clans Billowing Cumulus Clusters (Surge Up from Bottom & Part Outward at Top) */}
          {!reduceMotion &&
            COC_CLUSTERS.map((c) => (
              <motion.div
                key={c.id}
                initial={{
                  x: "-50%",
                  y: "108vh",
                  scale: 0.78,
                }}
                animate={{
                  x: [
                    "-50%",
                    "-50%",
                    `calc(-50% + ${c.driftX})`,
                  ],
                  y: ["108vh", "12vh", "-115vh"],
                  scale: [0.78, 1.22, 1.05],
                }}
                transition={{
                  duration: c.duration,
                  delay: c.delay,
                  times: [0, 0.45, 1],
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{ left: c.x, width: c.width }}
                className="absolute top-0 min-w-[340px] sm:min-w-[440px] pointer-events-none z-30"
              >
                <CoCRaidCloudCluster flip={c.flip} />
              </motion.div>
            ))}

          {/* WAVE 3A: Bottom-Left Clash-of-Clans Flank Cloud Curtain (Strict 1:1 Aspect Ratio) */}
          <motion.div
            initial={{ x: "-55%", y: "105vh", scale: 1.02, rotate: 6 }}
            animate={{
              x: ["-55%", "-8%", "-8%", "-65%"],
              y: ["105vh", "-6vh", "-14vh", "-115%"],
              scale: [1.02, 1.14, 1.16, 1.04],
              rotate: [6, 0, -2, -8],
            }}
            transition={{
              duration: 2.5,
              times: [0, 0.41, 0.54, 1],
              ease: ["circOut", "linear", "circIn"],
            }}
            className="absolute top-0 left-0 w-[135vw] sm:w-[95vw] md:w-[75vw] min-w-[680px] aspect-[1000/1050] pointer-events-none z-20"
            style={{ willChange: "transform" }}
          >
            <FlankCloudBank side="left" />
          </motion.div>

          {/* WAVE 3B: Bottom-Right Clash-of-Clans Flank Cloud Curtain (Strict 1:1 Aspect Ratio) */}
          <motion.div
            initial={{ x: "55%", y: "105vh", scale: 1.02, rotate: -6 }}
            animate={{
              x: ["55%", "8%", "8%", "65%"],
              y: ["105vh", "-6vh", "-14vh", "-115%"],
              scale: [1.02, 1.14, 1.16, 1.04],
              rotate: [-6, 0, 2, 8],
            }}
            transition={{
              duration: 2.5,
              times: [0, 0.41, 0.54, 1],
              ease: ["circOut", "linear", "circIn"],
            }}
            className="absolute top-0 right-0 w-[135vw] sm:w-[95vw] md:w-[75vw] min-w-[680px] aspect-[1000/1050] pointer-events-none z-20"
            style={{ willChange: "transform" }}
          >
            <FlankCloudBank side="right" />
          </motion.div>

          {/* WAVE 4: Background Secondary Mountain Cloud Mass (Uniform 1:1 Scale, No Stretching on Mobile) */}
          <motion.div
            initial={{ x: "-50%", y: "108vh", scale: 1.02 }}
            animate={{
              x: "-50%",
              y: ["108vh", "-12%", "-20%", "-112%"],
              scale: [1.02, 1.16, 1.2, 1.14],
            }}
            transition={{
              duration: 2.45,
              times: [0, 0.4, 0.55, 1],
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute top-0 left-1/2 w-[260vw] sm:w-[165vw] md:w-[118vw] min-w-[1220px] aspect-[1600/1500] opacity-95 pointer-events-none z-10"
            style={{
              willChange: "transform",
              filter: "brightness(0.95)",
            }}
          >
            <div className="w-full h-full transform -scale-x-100">
              <MountainCumulusBank />
            </div>
          </motion.div>

          {/* WAVE 5: Hero Central Mountain Cumulus Surge (Strict 1:1 Aspect Ratio, Bottom-to-Top Sweep) */}
          <motion.div
            initial={{ x: "-50%", y: "104vh", scale: 0.98 }}
            animate={{
              x: "-50%",
              y: ["104vh", "-14%", "-22%", "-115%"],
              scale: [0.98, 1.12, 1.16, 1.2],
            }}
            transition={{
              duration: 2.5,
              times: [0, 0.42, 0.55, 1],
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute top-0 left-1/2 w-[250vw] sm:w-[160vw] md:w-[114vw] min-w-[1180px] aspect-[1600/1500] pointer-events-none z-25"
            style={{ willChange: "transform" }}
          >
            <MountainCumulusBank />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
