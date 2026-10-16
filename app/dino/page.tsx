"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Volume2, VolumeX } from "lucide-react";

export default function DinoGamePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<"idle" | "playing" | "gameover">("idle");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const gameStateRef = useRef<"idle" | "playing" | "gameover">("idle");
  const scoreRef = useRef(0);
  const highScoreRef = useRef(0);
  const soundEnabledRef = useRef(true);

  gameStateRef.current = gameState;
  scoreRef.current = score;
  highScoreRef.current = highScore;
  soundEnabledRef.current = soundEnabled;

  // Sound generator using Web Audio API
  const playBeep = useCallback((freq: number, type: OscillatorType = "square", duration = 0.08) => {
    if (!soundEnabledRef.current) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  }, []);

  // Load high score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("chrome_dino_high_score");
    if (saved) {
      const val = parseInt(saved, 10);
      if (!isNaN(val)) {
        setHighScore(val);
        highScoreRef.current = val;
      }
    }
  }, []);

  // Main game engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    // Virtual game canvas resolution
    const VW = 800;
    const VH = 280;
    const GROUND_Y = 220;

    // Dino state
    const dino = {
      x: 60,
      y: GROUND_Y - 44,
      w: 40,
      h: 44,
      vy: 0,
      gravity: 0.85,
      jumpForce: -13.5,
      isGrounded: true,
      legFrame: 0,
      legTimer: 0,
    };

    // Obstacles & decor
    interface Obstacle {
      x: number;
      y: number;
      w: number;
      h: number;
      type: "cactus_single" | "cactus_double";
    }

    interface Cloud {
      x: number;
      y: number;
      speed: number;
    }

    let obstacles: Obstacle[] = [];
    let clouds: Cloud[] = [
      { x: 200, y: 50, speed: 0.4 },
      { x: 500, y: 35, speed: 0.3 },
      { x: 750, y: 65, speed: 0.5 },
    ];

    let speed = 6;
    let nextObstacleDistance = 350;
    let groundOffset = 0;

    const resetGame = () => {
      dino.y = GROUND_Y - 44;
      dino.vy = 0;
      dino.isGrounded = true;
      dino.legFrame = 0;
      obstacles = [];
      speed = 6;
      nextObstacleDistance = 300;
      setScore(0);
      scoreRef.current = 0;
    };

    const jump = () => {
      if (gameStateRef.current === "idle" || gameStateRef.current === "gameover") {
        resetGame();
        setGameState("playing");
        gameStateRef.current = "playing";
        playBeep(450, "square", 0.08);
        return;
      }

      if (dino.isGrounded && gameStateRef.current === "playing") {
        dino.vy = dino.jumpForce;
        dino.isGrounded = false;
        playBeep(520, "square", 0.09);
      }
    };

    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Responsive Canvas Resize
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Drawing helper for T-Rex
    const drawDino = (scaleX: number, scaleY: number) => {
      ctx.fillStyle = "#27272a";
      const dx = dino.x * scaleX;
      const dy = dino.y * scaleY;
      const dw = dino.w * scaleX;
      const dh = dino.h * scaleY;

      // Head
      ctx.fillRect(dx + dw * 0.45, dy, dw * 0.55, dh * 0.35);
      // Snout
      ctx.fillRect(dx + dw * 0.45, dy + dh * 0.35, dw * 0.45, dh * 0.12);
      // Eye (cutout)
      ctx.fillStyle = "#FBFAF9";
      ctx.fillRect(dx + dw * 0.6, dy + dh * 0.08, dw * 0.1, dh * 0.1);

      // Back & Body
      ctx.fillStyle = "#27272a";
      ctx.fillRect(dx + dw * 0.15, dy + dh * 0.35, dw * 0.45, dh * 0.42);
      // Tail
      ctx.fillRect(dx, dy + dh * 0.42, dw * 0.2, dh * 0.25);
      ctx.fillRect(dx - dw * 0.08, dy + dh * 0.35, dw * 0.1, dh * 0.18);
      // Arm
      ctx.fillRect(dx + dw * 0.6, dy + dh * 0.5, dw * 0.15, dh * 0.08);
      ctx.fillRect(dx + dw * 0.72, dy + dh * 0.54, dw * 0.05, dh * 0.08);

      // Legs
      if (!dino.isGrounded) {
        // Tucked jump legs
        ctx.fillRect(dx + dw * 0.25, dy + dh * 0.77, dw * 0.12, dh * 0.18);
        ctx.fillRect(dx + dw * 0.45, dy + dh * 0.77, dw * 0.12, dh * 0.18);
      } else if (dino.legFrame === 0) {
        // Leg 1 straight, Leg 2 raised
        ctx.fillRect(dx + dw * 0.25, dy + dh * 0.77, dw * 0.1, dh * 0.23);
        ctx.fillRect(dx + dw * 0.48, dy + dh * 0.77, dw * 0.14, dh * 0.12);
      } else {
        // Leg 1 raised, Leg 2 straight
        ctx.fillRect(dx + dw * 0.22, dy + dh * 0.77, dw * 0.14, dh * 0.12);
        ctx.fillRect(dx + dw * 0.45, dy + dh * 0.77, dw * 0.1, dh * 0.23);
      }
    };

    // Drawing helper for Cactus
    const drawCactus = (c: Obstacle, scaleX: number, scaleY: number) => {
      ctx.fillStyle = "#27272a";
      const cx = c.x * scaleX;
      const cy = c.y * scaleY;
      const cw = c.w * scaleX;
      const ch = c.h * scaleY;

      // Main trunk
      const trunkW = cw * 0.35;
      const trunkX = cx + (cw - trunkW) / 2;
      ctx.fillRect(trunkX, cy, trunkW, ch);

      // Left arm
      ctx.fillRect(cx, cy + ch * 0.28, cw * 0.25, ch * 0.42);
      ctx.fillRect(cx, cy + ch * 0.28, cw * 0.45, trunkW * 0.6);

      // Right arm
      ctx.fillRect(cx + cw * 0.75, cy + ch * 0.18, cw * 0.25, ch * 0.45);
      ctx.fillRect(cx + cw * 0.45, cy + ch * 0.52, cw * 0.45, trunkW * 0.6);
    };

    // Drawing helper for Cloud
    const drawCloud = (cl: Cloud, scaleX: number, scaleY: number) => {
      ctx.strokeStyle = "#a1a1aa";
      ctx.lineWidth = 1.5;
      const cx = cl.x * scaleX;
      const cy = cl.y * scaleY;
      const cw = 44 * scaleX;
      const ch = 14 * scaleY;

      ctx.beginPath();
      ctx.moveTo(cx, cy + ch);
      ctx.lineTo(cx + cw, cy + ch);
      ctx.arcTo(cx + cw, cy, cx + cw * 0.6, cy, ch * 0.5);
      ctx.arcTo(cx + cw * 0.5, cy - ch * 0.4, cx + cw * 0.2, cy, ch * 0.6);
      ctx.arcTo(cx, cy, cx, cy + ch, ch * 0.5);
      ctx.stroke();
    };

    // Main Game Loop
    const loop = (currentTime: number) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      const scaleX = canvas.width / VW;
      const scaleY = canvas.height / VH;

      // Clear Canvas
      ctx.fillStyle = "#FBFAF9";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 1. Update Clouds
      for (const cl of clouds) {
        cl.x -= cl.speed;
        if (cl.x < -60) cl.x = VW + 40;
        drawCloud(cl, scaleX, scaleY);
      }

      // 2. Draw Ground
      groundOffset = (groundOffset + speed) % 24;
      ctx.strokeStyle = "#52525b";
      ctx.lineWidth = 2 * scaleY;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y * scaleY);
      ctx.lineTo(canvas.width, GROUND_Y * scaleY);
      ctx.stroke();

      // Ground bumps & specks
      ctx.fillStyle = "#71717a";
      for (let x = -groundOffset; x < VW; x += 36) {
        ctx.fillRect(x * scaleX, (GROUND_Y + 4) * scaleY, 6 * scaleX, 2 * scaleY);
        ctx.fillRect((x + 16) * scaleX, (GROUND_Y + 10) * scaleY, 3 * scaleX, 2 * scaleY);
      }

      // 3. Game Running State Logic
      if (gameStateRef.current === "playing") {
        // Dino Physics
        dino.vy += dino.gravity;
        dino.y += dino.vy;

        if (dino.y >= GROUND_Y - dino.h) {
          dino.y = GROUND_Y - dino.h;
          dino.vy = 0;
          dino.isGrounded = true;
        }

        // Leg running animation
        dino.legTimer += delta;
        if (dino.legTimer >= 0.1) {
          dino.legTimer = 0;
          dino.legFrame = (dino.legFrame + 1) % 2;
        }

        // Increase score & speed gradually
        const newScore = scoreRef.current + 1;
        setScore(newScore);
        scoreRef.current = newScore;
        if (newScore % 100 === 0) {
          playBeep(880, "square", 0.12);
        }

        speed = 6 + Math.min(6, Math.floor(newScore / 250) * 0.6);

        // Spawn obstacles
        nextObstacleDistance -= speed;
        if (nextObstacleDistance <= 0) {
          const type = Math.random() > 0.4 ? "cactus_single" : "cactus_double";
          const obsW = type === "cactus_single" ? 22 : 36;
          const obsH = 40;
          obstacles.push({
            x: VW + 20,
            y: GROUND_Y - obsH,
            w: obsW,
            h: obsH,
            type,
          });
          nextObstacleDistance = 220 + Math.random() * 240;
        }

        // Update obstacles & check collision
        for (let i = obstacles.length - 1; i >= 0; i--) {
          const obs = obstacles[i];
          obs.x -= speed;

          // AABB Collision Detection with tight hitbox margin
          const pad = 6;
          const dinoBox = {
            left: dino.x + pad,
            right: dino.x + dino.w - pad,
            top: dino.y + pad,
            bottom: dino.y + dino.h,
          };
          const obsBox = {
            left: obs.x + pad,
            right: obs.x + obs.w - pad,
            top: obs.y + pad,
            bottom: obs.y + obs.h,
          };

          const isColliding =
            dinoBox.right > obsBox.left &&
            dinoBox.left < obsBox.right &&
            dinoBox.bottom > obsBox.top &&
            dinoBox.top < obsBox.bottom;

          if (isColliding) {
            // Game Over
            setGameState("gameover");
            gameStateRef.current = "gameover";
            playBeep(180, "sawtooth", 0.25);

            if (newScore > highScoreRef.current) {
              setHighScore(newScore);
              highScoreRef.current = newScore;
              localStorage.setItem("chrome_dino_high_score", newScore.toString());
            }
          }

          if (obs.x < -60) {
            obstacles.splice(i, 1);
          }
        }
      }

      // 4. Draw Obstacles
      for (const obs of obstacles) {
        drawCactus(obs, scaleX, scaleY);
      }

      // 5. Draw Dino
      drawDino(scaleX, scaleY);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [playBeep]);

  const padScore = (n: number) => n.toString().padStart(5, "0");

  const handleCanvasClick = () => {
    // Jump or start game on click / tap
    window.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FBFAF9] text-[#18181b] items-center p-6 sm:p-10 select-none">
      {/* Top Header Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-8 pb-4 border-b border-black/10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-base/70 hover:text-base transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Portfolio</span>
        </Link>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-full hover:bg-black/5 text-base/60 transition-colors cursor-pointer"
            title={soundEnabled ? "Mute sound" : "Enable sound"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Arcade Frame */}
      <div className="w-full max-w-4xl flex flex-col items-center">
        {/* Title & Instructions */}
        <div className="text-center space-y-2 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-mono uppercase">
            Chrome Dino Runner
          </h1>
          <p className="text-xs sm:text-sm text-base/60 font-mono">
            Press <kbd className="px-2 py-0.5 bg-black/5 rounded border border-black/10 text-xs">SPACE</kbd> or Tap Screen to Jump
          </p>
        </div>

        {/* Game Screen Container */}
        <div className="relative w-full bg-[#fbfaf9] border border-black/10 rounded-3xl p-6 sm:p-8 shadow-sm overflow-hidden flex flex-col items-center">
          {/* Authentic High Score Header */}
          <div className="w-full flex items-center justify-end gap-4 text-xs sm:text-sm font-mono tracking-widest text-[#52525b] mb-2">
            <span className="text-[#a1a1aa]">HI {padScore(highScore)}</span>
            <span className="font-bold text-[#18181b]">{padScore(score)}</span>
          </div>

          {/* Interactive Game Canvas */}
          <div
            onClick={handleCanvasClick}
            className="relative w-full h-56 sm:h-72 cursor-pointer touch-none"
          >
            <canvas ref={canvasRef} className="w-full h-full block" />

            {/* Start / Idle Overlay */}
            {gameState === "idle" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[2px] transition-all">
                <button className="px-8 py-3.5 rounded-full bg-[#18181b] text-white font-mono text-sm uppercase tracking-wider font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all">
                  Press Space / Tap to Start
                </button>
              </div>
            )}

            {/* Game Over Overlay */}
            {gameState === "gameover" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px] space-y-4">
                <div className="font-mono text-xl sm:text-2xl font-bold tracking-widest text-[#18181b]">
                  G A M E &nbsp; O V E R
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCanvasClick();
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#18181b] text-white font-mono text-xs uppercase tracking-wider font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Fun Footer Hint */}
        <div className="mt-8 text-center text-xs text-base/40 font-mono">
          <p>The iconic offline runner reimagined for Edgar&apos;s portfolio.</p>
        </div>
      </div>
    </div>
  );
}
