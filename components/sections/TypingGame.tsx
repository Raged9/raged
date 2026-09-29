"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { typingTexts } from "@/data/typing-texts";
import {
  Volume2,
  VolumeX,
  RotateCcw,
  SkipForward,
  Shuffle,
  Trophy,
  CheckCircle2,
  X,
  ArrowLeft,
  User,
  Shield,
  LogOut,
  Flame,
  Award,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { easeOut, easeSoft, viewportOnce } from "@/lib/motion";
import Link from "next/link";
import Image from "next/image";
import {
  api,
  getToken,
  removeToken,
  getPlayerProfile,
  setPlayerProfile,
  type PlayerProfile,
  type TypingScoreItem,
} from "@/lib/api-client";
import { audio } from "@/lib/audio";

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

const AVATAR_OPTIONS = [
  { id: "edgar-icon", name: "Edgar", src: "/porto-icon.jpg" },
  { id: "dog-avatar", name: "Raged Dog", src: "/edgar.jpg" },
];

export default function TypingGame({
  showBackLink = false,
}: {
  showBackLink?: boolean;
}) {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [tabPressed, setTabPressed] = useState(false);
  const [showRestartTooltip, setShowRestartTooltip] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [soundProfile, setSoundProfileState] = useState<"classic" | "acoustic">("classic");

  // Operator / Auth state
  const [playerProfile, setPlayerProfileState] = useState<PlayerProfile>({
    name: "Guest Pilot",
    avatar: "/porto-icon.jpg",
    highscore: 0,
    gamesPlayed: 0,
  });
  const [adminUser, setAdminUser] = useState<{ id: string; email: string } | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"profile" | "admin">("profile");
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  // Admin login form state
  const [adminEmail, setAdminEmail] = useState("admin@portfolio.local");
  const [adminPassword, setAdminPassword] = useState("admin123");
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);
  const [adminLoginSuccess, setAdminLoginSuccess] = useState(false);

  // Leaderboard data
  const [leaderboard, setLeaderboard] = useState<TypingScoreItem[]>([
    { playerName: "SpeedDemon", wpm: 124, accuracy: 98.5 },
    { playerName: "Edgar", wpm: 110, accuracy: 99.1 },
    { playerName: "Raged", wpm: 96, accuracy: 95.0 },
    { playerName: "CyberHermit", wpm: 88, accuracy: 97.4 },
    { playerName: "NeoTypist", wpm: 82, accuracy: 94.2 },
  ]);
  const [hasSubmittedScore, setHasSubmittedScore] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const currentQuote = typingTexts[quoteIndex] || typingTexts[0];
  const targetText = currentQuote.text;
  const reduceMotion = useReducedMotion();

  // Load operator profile & admin session on mount
  useEffect(() => {
    // Client-side initial random quote without SSR hydration mismatch
    setQuoteIndex(Math.floor(Math.random() * typingTexts.length));

    const profile = getPlayerProfile();
    setPlayerProfileState(profile);

    const token = getToken();
    if (token) {
      api
        .getAdminMe()
        .then((res) => {
          if (res?.user) setAdminUser(res.user);
        })
        .catch(() => {
          removeToken();
        });
    }

    // Load live leaderboard from backend
    api
      .getTypingLeaderboard(10)
      .then((data) => {
        if (data && data.length > 0) setLeaderboard(data);
      })
      .catch(() => {});
  }, []);

  // High-fidelity synthesized typewriter key clack via centralized singleton audio engine
  const playClick = useCallback(
    (key = "", isError = false) => {
      audio.setMuted(isMuted);
      audio.playTypewriterKey(key, isError);
    },
    [isMuted]
  );

  // Synthesized Typewriter Bell Ring
  const playBell = useCallback(() => {
    audio.setMuted(isMuted);
    audio.playTypewriterBell();
  }, [isMuted]);

  // Real-time timer ticker
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (startTime && !isFinished) {
      interval = setInterval(() => {
        setElapsedTime((Date.now() - startTime) / 1000);
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [startTime, isFinished]);

  // Calculate live stats
  const minutes = Math.max(elapsedTime / 60, 0.001);
  let correctChars = 0;
  for (let i = 0; i < userInput.length; i++) {
    if (userInput[i] === targetText[i]) correctChars++;
  }
  const wpm = Math.round(correctChars / 5 / minutes) || 0;
  const accuracy =
    userInput.length > 0
      ? Math.round((correctChars / userInput.length) * 100)
      : 100;

  // Handle User Input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFinished) return;

    const val = e.target.value;
    if (!startTime && val.length > 0) {
      setStartTime(Date.now());
    }

    const isAdding = val.length > userInput.length;
    const lastChar = isAdding ? val[val.length - 1] : "DEL";
    const expectedChar = targetText[val.length - 1];
    const isError = isAdding && lastChar !== expectedChar;
    playClick(lastChar, isError);

    // Trigger visual key animation
    if (isAdding) {
      const char = val[val.length - 1].toUpperCase();
      setActiveKey(char);
      setTimeout(() => setActiveKey(null), 120);
    }

    setUserInput(val);

    // Check completion
    if (val.length >= targetText.length) {
      setIsFinished(true);
      playBell();
      handleAutoSubmitScore(val);
    }
  };

  // Keyboard navigation & space bar
  const handleKeyDown = (e: React.KeyboardEvent) => {
    audio.resumeAudio();
    if (e.key === "Tab") {
      e.preventDefault();
      setTabPressed(true);
      setShowRestartTooltip(true);
      setTimeout(() => {
        setTabPressed(false);
        setShowRestartTooltip(false);
      }, 3000);
      return;
    }

    if (e.key === "Enter" && tabPressed) {
      e.preventDefault();
      handleReset(true);
      setTabPressed(false);
      setShowRestartTooltip(false);
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      handleReset(true);
      return;
    }

    if (e.key === " " && !isFinished) {
      setActiveKey("SPACE");
      setTimeout(() => setActiveKey(null), 120);
    } else if (e.key === "Backspace" && !isFinished) {
      setActiveKey("DEL");
      setTimeout(() => setActiveKey(null), 120);
    }
  };

  // Global shortcut listener for Tab + Enter and auto-focus
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (isAuthModalOpen || isLeaderboardOpen || isFinished) return;

      if (e.key === "Tab") {
        e.preventDefault();
        setTabPressed(true);
        setShowRestartTooltip(true);
        inputRef.current?.focus();
        setTimeout(() => {
          setTabPressed(false);
          setShowRestartTooltip(false);
        }, 3000);
      } else if (e.key === "Enter" && tabPressed) {
        e.preventDefault();
        handleReset(true);
        setTabPressed(false);
        setShowRestartTooltip(false);
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleReset(true);
      } else {
        if (
          document.activeElement !== inputRef.current &&
          e.key.length === 1 &&
          !e.ctrlKey &&
          !e.metaKey &&
          !e.altKey
        ) {
          inputRef.current?.focus();
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, [tabPressed, isAuthModalOpen, isLeaderboardOpen, isFinished, quoteIndex]);

  // Automatic score saving on completion
  const handleAutoSubmitScore = (finalInput: string) => {
    let cChars = 0;
    for (let i = 0; i < finalInput.length; i++) {
      if (finalInput[i] === targetText[i]) cChars++;
    }
    const finalMin = Math.max(elapsedTime / 60, 0.001);
    const finalWpm = Math.round(cChars / 5 / finalMin) || 0;
    const finalAcc =
      finalInput.length > 0
        ? Math.round((cChars / finalInput.length) * 100)
        : 100;

    const opName = adminUser?.email
      ? adminUser.email.split("@")[0]
      : playerProfile.name || "Guest";

    // Update local player stats
    const updated = setPlayerProfile({
      highscore: Math.max(playerProfile.highscore, finalWpm),
      gamesPlayed: playerProfile.gamesPlayed + 1,
    });
    setPlayerProfileState(updated);

    // Submit to backend
    api
      .submitTypingScore({
        playerName: opName,
        wpm: finalWpm,
        accuracy: finalAcc,
      })
      .then((saved) => {
        setHasSubmittedScore(true);
        // Refresh leaderboard
        api
          .getTypingLeaderboard(10)
          .then((list) => setLeaderboard(list))
          .catch(() => {
            setLeaderboard((prev) =>
              [...prev, saved].sort((a, b) => b.wpm - a.wpm).slice(0, 10)
            );
          });
      })
      .catch(() => {
        // Fallback local leaderboard
        setLeaderboard((prev) =>
          [
            ...prev,
            { playerName: opName, wpm: finalWpm, accuracy: finalAcc },
          ]
            .sort((a, b) => b.wpm - a.wpm)
            .slice(0, 10)
        );
        setHasSubmittedScore(true);
      });
  };

  // Reset quote (with random selection by default)
  const handleReset = (pickNewRandom: boolean | unknown = true) => {
    const shouldPick = typeof pickNewRandom === "boolean" ? pickNewRandom : true;
    if (shouldPick && typingTexts.length > 1) {
      let nextIdx;
      do {
        nextIdx = Math.floor(Math.random() * typingTexts.length);
      } while (nextIdx === quoteIndex);
      setQuoteIndex(nextIdx);
    }
    setUserInput("");
    setStartTime(null);
    setElapsedTime(0);
    setIsFinished(false);
    setHasSubmittedScore(false);
    setTabPressed(false);
    setShowRestartTooltip(false);
    inputRef.current?.focus();
  };

  // Load next quote (always random)
  const handleNextQuote = () => {
    handleReset(true);
  };

  // Admin login handler
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginLoading(true);
    setAdminLoginError(null);

    try {
      const res = await api.loginAdmin({
        email: adminEmail,
        password: adminPassword,
      });
      if (res?.token) {
        localStorage.setItem("porto_admin_token", res.token);
        setAdminUser(res.user);
        setAdminLoginSuccess(true);

        // Also update player profile to match admin
        const updated = setPlayerProfile({
          name: res.user.email.split("@")[0],
          avatar: "/porto-icon.jpg",
        });
        setPlayerProfileState(updated);

        setTimeout(() => {
          setIsAuthModalOpen(false);
          setAdminLoginSuccess(false);
        }, 1200);
      }
    } catch (err: any) {
      setAdminLoginError(err.message || "Failed to authenticate administrator");
    } finally {
      setAdminLoginLoading(false);
    }
  };

  // Admin logout
  const handleLogout = () => {
    removeToken();
    setAdminUser(null);
    const updated = setPlayerProfile({ name: "Guest Pilot" });
    setPlayerProfileState(updated);
  };

  return (
    <section
      id="typing-game"
      className="relative flex flex-col items-center justify-center py-12 px-4 max-w-304 w-full mx-auto"
      aria-label="Olive Type-O-Matic Typewriter Terminal"
    >
      {/* Top return link if rendered on dedicated page */}
      {showBackLink && (
        <div className="w-full flex items-center justify-between pb-8 mb-4 border-b border-black/[0.06]">
          <Link
            href="/#boarding-pass"
            className="flex items-center gap-2 text-sm font-medium text-[#302f2d]/70 hover:text-[#302f2d] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Return to Portfolio & Boarding Pass</span>
          </Link>
          <span className="font-monocraft text-xs text-[#302f2d]/50">
            TERMINAL // TYPE-O-MATIC
          </span>
        </div>
      )}

      {/* Section Header */}
      <motion.div
        className="text-center max-w-xl mx-auto mb-8"
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewportOnce}
        transition={{ duration: 0.6, ease: easeOut }}
      >
        <span className="text-xs uppercase tracking-widest text-[#302f2d]/50 font-monocraft font-medium mb-2 block">
          INTERACTIVE FINALE • OLIVE EDITION
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#302f2d]">
          type-o-matic<span className="text-[#302f2d]/30">.</span>
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[#302f2d]/60 leading-relaxed font-normal">
          test your typing velocity on our vintage olive green typewriter terminal. authenticate as operator or enter your pilot call-sign to compete on the leaderboard.
        </p>
      </motion.div>

      {/* Typewriter Machine + Side Companion Controls Layout */}
      <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center lg:items-start justify-center gap-5 sm:gap-6">
        {/* Main Vintage Sage Green Typewriter Chassis */}
        <div className="w-full max-w-3xl flex-1 rounded-3xl bg-[#52664D] border-4 border-[#3D4D37] p-5 sm:p-7 shadow-[inset_0_2px_4px_rgba(255,255,255,0.22),0_24px_60px_rgba(25,35,20,0.35)] flex flex-col items-center">
          {/* Machine Top Plate (Clean Brand & Category Plate) */}
          <div className="w-full flex items-center justify-between pb-3.5 mb-3 border-b border-white/20 text-xs font-monocraft text-[#EDECE5]">
            <div className="flex items-center gap-2.5">
              <span className="font-bold tracking-wider text-white flex items-center gap-1.5 text-xs sm:text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B5C9AC] inline-block shadow-sm animate-pulse" />
                ROYAL MODEL 10 • SAGE
              </span>
              <span className="text-white/30">•</span>
              <span className="px-2 py-0.5 rounded-full bg-black/25 text-[10px] text-white/80 border border-white/10 uppercase">
                {currentQuote.category || "QUOTE"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-white/70">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>TERMINAL READY</span>
            </div>
          </div>

        {/* Mechanical Platen Roller Bar with Chrome Turn Knobs */}
        <div className="w-full flex items-center justify-between px-1 mb-2.5">
          {/* Left Chrome Knurled Knob */}
          <div className="flex items-center gap-1">
            <div className="w-4 sm:w-5 h-8 sm:h-9 rounded bg-gradient-to-r from-[#9C9484] via-[#E2DCcf] to-[#7B7465] border border-black/50 shadow-md flex items-center justify-center">
              <div className="w-full h-0.5 bg-black/30" />
            </div>
            <div className="w-2.5 h-6 bg-[#3B4A35] rounded-sm" />
          </div>

          {/* Rubber Platen Cylinder with Margin Guide Scale */}
          <div className="flex-1 mx-2 sm:mx-3 h-5 sm:h-6 rounded-full bg-[#1C231B] border border-black/50 shadow-inner flex items-center justify-between px-3 sm:px-5 overflow-hidden">
            <div className="w-full flex items-center justify-between text-[8px] sm:text-[9px] font-monocraft text-[#93A58B]/70 tracking-[0.25em] select-none">
              <span>| 10</span>
              <span className="hidden xs:inline">| 20</span>
              <span>| 30</span>
              <span className="hidden xs:inline">| 40</span>
              <span>| 50</span>
              <span className="hidden xs:inline">| 60</span>
              <span>| 70</span>
            </div>
          </div>

          {/* Right Chrome Knurled Knob */}
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-6 bg-[#3B4A35] rounded-sm" />
            <div className="w-4 sm:w-5 h-8 sm:h-9 rounded bg-gradient-to-r from-[#7B7465] via-[#E2DCcf] to-[#9C9484] border border-black/50 shadow-md flex items-center justify-center">
              <div className="w-full h-0.5 bg-black/30" />
            </div>
          </div>
        </div>

        {/* 1. KERTAS MESIN TIK (Enlarged 3D Boxy Antique Paper Sheet Display) */}
        <div className="relative w-full">
          {/* Underlying stacked paper sheet for physical 3D paper stack depth */}
          <div className="absolute -bottom-2 -right-2 left-2 top-2 bg-[#ECE5D6] border border-[#D5CDBC] rounded-sm -z-10 shadow-sm" />

          <div
            onClick={() => inputRef.current?.focus()}
            className="relative w-full rounded-sm bg-gradient-to-b from-[#FFFDF8] via-[#FAF6EE] to-[#F2ECE0] p-6 sm:p-8 md:p-9 shadow-[0_18px_36px_-6px_rgba(0,0,0,0.22),0_6px_12px_-2px_rgba(0,0,0,0.1),inset_0_2px_4px_rgba(255,255,255,0.95)] border border-[#DDD5C5] border-r-2 border-b-2 border-r-[#C2BAAA] border-b-[#B2AA9A] cursor-text select-none min-h-[250px] sm:min-h-[290px] md:min-h-[310px] flex flex-col justify-between overflow-hidden"
          >
            {/* Top Platen Roller Shadow */}
            <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-black/15 to-transparent pointer-events-none rounded-t-sm" />

            {/* Left red guideline margin line (vintage paper rule) */}
            <div className="absolute left-6 sm:left-9 top-0 bottom-0 w-px bg-rose-400/25 pointer-events-none" />

            {/* Tab + Enter Prompt Floating Pill */}
            <AnimatePresence>
              {showRestartTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-2 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-[#302f2d] text-white text-[10px] font-monocraft shadow-xl border border-white/20 flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>TAB PRESSED! HIT [ENTER] TO RESTART WITH RANDOM TEXT</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Paper Top Stats Bar with Monocraft */}
            <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-[#302f2d]/10 font-monocraft text-xs pl-2 sm:pl-4">
              <div className="flex items-center gap-6 sm:gap-8 text-[#302f2d]">
                <div>
                  <span className="text-[#302f2d]/40 text-[9px] uppercase tracking-wider block">
                    SPEED
                  </span>
                  <span className="font-bold text-sm sm:text-base md:text-lg">
                    {wpm} <span className="text-[10px] font-normal text-[#302f2d]/60">WPM</span>
                  </span>
                </div>
                <div>
                  <span className="text-[#302f2d]/40 text-[9px] uppercase tracking-wider block">
                    ACCURACY
                  </span>
                  <span className="font-bold text-sm sm:text-base md:text-lg">
                    {accuracy}%
                  </span>
                </div>
                <div className="hidden xs:block">
                  <span className="text-[#302f2d]/40 text-[9px] uppercase tracking-wider block">
                    SOURCE
                  </span>
                  <span className="text-xs sm:text-sm text-[#302f2d]/80 truncate max-w-[160px] block">
                    {currentQuote.source || "Classic"}
                  </span>
                </div>
              </div>

              <div className="text-right text-[#302f2d]/70 text-xs">
                <span className="text-[#302f2d]/40 text-[9px] uppercase tracking-wider block">
                  TIME
                </span>
                <span className="font-bold text-sm sm:text-base md:text-lg">{Math.round(elapsedTime)}s</span>
              </div>
            </div>

            {/* Typing Text Display in Monocraft: Multi-line natural wrapping, Highlights Hijau, Continuous Coret Merah, Green Current Cursor */}
            <div className="relative font-monocraft text-sm sm:text-base md:text-[17px] leading-relaxed sm:leading-loose text-[#302f2d] py-3 min-h-[120px] sm:min-h-[150px] pl-3 sm:pl-5 whitespace-pre-wrap break-words select-none">
              {targetText.split("").map((char, index) => {
                const isTyped = index < userInput.length;
                const isCurrent = index === userInput.length;
                const isCorrect = isTyped && userInput[index] === char;
                const isIncorrect = isTyped && userInput[index] !== char;

                let charStyle = "text-[#302f2d]/30"; // Not typed yet

                if (isCorrect) {
                  // Highlights hijau (Porto-Vibe style)
                  charStyle = "bg-emerald-500/20 text-emerald-800 font-bold";
                } else if (isIncorrect) {
                  // Coret merah (Continuous red strikethrough without fragmented gaps)
                  charStyle = "line-through decoration-red-600 decoration-2 bg-red-500/20 text-red-600 font-bold";
                } else if (isCurrent) {
                  // Sedang diketik (Green highlight instead of black, clearly visible)
                  charStyle = "bg-emerald-500 text-white font-bold animate-pulse shadow-sm";
                }

                return (
                  <span
                    key={index}
                    className={`inline transition-colors ${charStyle}`}
                  >
                    {char === " " ? (isCurrent ? "\u00A0" : " ") : char}
                  </span>
                );
              })}
            </div>

            {/* Hidden Physical Input */}
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="absolute inset-0 opacity-0 cursor-default"
              aria-label="Physical keyboard typing field"
              autoFocus
            />

            {/* Paper Hint */}
            <div className="mt-3 pt-2.5 border-t border-[#302f2d]/10 flex items-center justify-between text-[11px] font-monocraft text-[#302f2d]/50 pl-2 sm:pl-4">
              <span>Click anywhere to type • Backspace to correct</span>
              <span>
                {userInput.length} / {targetText.length} chars
              </span>
            </div>
          </div>
        </div>

        {/* 2. KEYBOARD MESIN TIK (Circular Vintage Ivory Keys in Monocraft) */}
        <div className="w-full mt-5 pt-4 border-t border-white/15 flex flex-col items-center gap-2 sm:gap-2.5">
          {/* Row 1 */}
          <div className="flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2">
            {KEYBOARD_ROWS[0].map((key) => {
              const isActive = activeKey === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    if (!isFinished) {
                      handleInputChange({
                        target: { value: userInput + key.toLowerCase() },
                      } as React.ChangeEvent<HTMLInputElement>);
                    }
                  }}
                  className={`w-7 h-7 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full border-2 transition-all flex items-center justify-center font-monocraft text-[9px] sm:text-xs font-bold shadow-md ${
                    isActive
                      ? "translate-y-1 bg-[#EBE7DC] border-white text-[#2E3B27] border-b-2 shadow-none scale-95"
                      : "bg-[#FAF8F2] border-[#D6D0C2] border-b-4 border-b-[#B8B1A2] text-[#2E3B27] hover:bg-white hover:scale-105"
                  }`}
                >
                  {key}
                </button>
              );
            })}
          </div>

          {/* Row 2 */}
          <div className="flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2">
            {KEYBOARD_ROWS[1].map((key) => {
              const isActive = activeKey === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    if (!isFinished) {
                      handleInputChange({
                        target: { value: userInput + key.toLowerCase() },
                      } as React.ChangeEvent<HTMLInputElement>);
                    }
                  }}
                  className={`w-7 h-7 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full border-2 transition-all flex items-center justify-center font-monocraft text-[9px] sm:text-xs font-bold shadow-md ${
                    isActive
                      ? "translate-y-1 bg-[#EBE7DC] border-white text-[#2E3B27] border-b-2 shadow-none scale-95"
                      : "bg-[#FAF8F2] border-[#D6D0C2] border-b-4 border-b-[#B8B1A2] text-[#2E3B27] hover:bg-white hover:scale-105"
                  }`}
                >
                  {key}
                </button>
              );
            })}
          </div>

          {/* Row 3 */}
          <div className="flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2">
            {KEYBOARD_ROWS[2].map((key) => {
              const isActive = activeKey === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    if (!isFinished) {
                      handleInputChange({
                        target: { value: userInput + key.toLowerCase() },
                      } as React.ChangeEvent<HTMLInputElement>);
                    }
                  }}
                  className={`w-7 h-7 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full border-2 transition-all flex items-center justify-center font-monocraft text-[9px] sm:text-xs font-bold shadow-md ${
                    isActive
                      ? "translate-y-1 bg-[#EBE7DC] border-white text-[#2E3B27] border-b-2 shadow-none scale-95"
                      : "bg-[#FAF8F2] border-[#D6D0C2] border-b-4 border-b-[#B8B1A2] text-[#2E3B27] hover:bg-white hover:scale-105"
                  }`}
                >
                  {key}
                </button>
              );
            })}

            {/* Backspace Button */}
            <button
              onClick={() => {
                if (!isFinished && userInput.length > 0) {
                  setUserInput(userInput.slice(0, -1));
                  playClick();
                }
              }}
              className="px-2 sm:px-3 h-7 sm:h-10 md:h-11 rounded-full border-2 border-[#D6D0C2] border-b-4 border-b-[#B8B1A2] bg-[#FAF8F2] text-[#2E3B27] hover:bg-white transition-all flex items-center justify-center font-monocraft text-[8px] sm:text-[10px] font-bold shadow-md"
            >
              DEL
            </button>
          </div>

          {/* Row 4: TAB, Space Bar, ENTER */}
          <div className="w-full flex items-center justify-center gap-1.5 sm:gap-2 mt-1">
            {/* Tab Key */}
            <button
              onClick={() => {
                setTabPressed(true);
                setShowRestartTooltip(true);
                setTimeout(() => {
                  setTabPressed(false);
                  setShowRestartTooltip(false);
                }, 3000);
              }}
              className={`px-3 sm:px-4 h-7 sm:h-9 rounded-full border-2 transition-all flex items-center justify-center font-monocraft text-[9px] sm:text-[10px] font-bold shadow-md ${
                tabPressed
                  ? "translate-y-1 bg-[#B5C9AC] border-white text-[#2E3B27] border-b-2 shadow-none"
                  : "bg-[#FAF8F2] border-[#D6D0C2] border-b-4 border-b-[#B8B1A2] text-[#2E3B27] hover:bg-white"
              }`}
              title="Tab + Enter to restart"
            >
              TAB ⇥
            </button>

            {/* Space Bar */}
            <button
              onClick={() => {
                if (!isFinished) {
                  handleInputChange({
                    target: { value: userInput + " " },
                  } as React.ChangeEvent<HTMLInputElement>);
                }
              }}
              className={`w-36 sm:w-56 md:w-64 h-7 sm:h-9 rounded-full border-2 transition-all flex items-center justify-center font-monocraft text-[10px] font-bold shadow-md ${
                activeKey === "SPACE"
                  ? "translate-y-1 bg-[#EBE7DC] border-white text-[#2E3B27] border-b-2 shadow-none scale-98"
                  : "bg-[#FAF8F2] border-[#D6D0C2] border-b-4 border-b-[#B8B1A2] text-[#2E3B27] hover:bg-white"
              }`}
            >
              SPACE
            </button>

            {/* Return / Enter Key */}
            <button
              onClick={() => handleReset(true)}
              className="px-3 sm:px-4 h-7 sm:h-9 rounded-full border-2 border-[#D6D0C2] border-b-4 border-b-[#B8B1A2] bg-[#FAF8F2] text-[#2E3B27] hover:bg-white transition-all flex items-center justify-center font-monocraft text-[9px] sm:text-[10px] font-bold shadow-md"
              title="Restart with random text"
            >
              RETURN ↵
            </button>
          </div>

          {/* Keyboard Shortcut Hint for Tab + Enter */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-2 pt-2 border-t border-white/10 text-[10px] sm:text-[11px] font-monocraft text-[#EDECE5]/80">
            <kbd className={`px-1.5 py-0.5 rounded border text-white font-bold transition-all ${
              tabPressed ? "bg-emerald-600 border-white" : "bg-black/30 border-white/20"
            }`}>
              Tab
            </kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 rounded bg-black/30 border border-white/20 text-white font-bold">
              Enter
            </kbd>
            <span>- restart with random text</span>
          </div>
        </div>
      </div>

      {/* Side Control Console (Di samping mesin typewriter) */}
      <aside className="w-full lg:w-60 xl:w-64 shrink-0 flex flex-col gap-3 p-4 sm:p-5 rounded-3xl bg-[#1C231A] border-4 border-[#3D4D37] shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),0_18px_40px_rgba(15,25,12,0.3)] font-monocraft text-[#EDECE5]">
        <div className="w-full pb-2 mb-0.5 border-b border-white/10 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-[#B5C9AC] font-bold">
            TERMINAL CONTROLS
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] text-emerald-400 font-bold">ACTIVE</span>
          </span>
        </div>

        {/* 1. Operator Profile / Auth Button */}
        <div>
          <span className="text-[9px] text-white/40 uppercase tracking-wider block mb-1.5">
            OPERATOR
          </span>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-black/40 hover:bg-black/60 border border-white/10 text-white transition-all text-xs group"
            title="Operator Profile & Login"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="relative w-5 h-5 rounded-full overflow-hidden border border-white/40 shrink-0">
                <Image
                  src={playerProfile.avatar || "/porto-icon.jpg"}
                  alt="avatar"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="truncate max-w-[110px] text-left font-semibold">
                {adminUser ? adminUser.email.split("@")[0] : playerProfile.name}
              </span>
            </div>
            {adminUser ? (
              <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <User className="w-3.5 h-3.5 text-white/60 group-hover:text-white shrink-0" />
            )}
          </button>
        </div>

        {/* 2. Audio & Sound Settings */}
        <div>
          <span className="text-[9px] text-white/40 uppercase tracking-wider block mb-1.5">
            SOUND & SFX
          </span>
          <div className="flex items-center gap-1.5">
            {/* Audio Mute/Unmute */}
            <button
              onClick={() => {
                setIsMuted((prev) => {
                  const next = !prev;
                  audio.setMuted(next);
                  if (!next) audio.resumeAudio();
                  return next;
                });
              }}
              className="p-2.5 rounded-xl bg-black/40 hover:bg-black/60 border border-white/10 text-[#EDECE5] hover:text-white transition-colors flex items-center justify-center shrink-0"
              title={isMuted ? "Unmute typewriter sound" : "Mute typewriter sound"}
              aria-label={isMuted ? "Unmute sound" : "Mute sound"}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-white/50" />
              ) : (
                <Volume2 className="w-4 h-4 text-white" />
              )}
            </button>

            {/* Sound Profile Switcher */}
            <button
              onClick={() => {
                const next = soundProfile === "classic" ? "acoustic" : "classic";
                setSoundProfileState(next);
                audio.setSoundProfile(next);
                audio.resumeAudio();
                audio.playTypewriterKey("A");
              }}
              className="flex-1 px-3 py-2.5 rounded-xl bg-black/40 hover:bg-black/60 border border-white/10 text-white transition-colors flex items-center justify-between text-[11px]"
              title={`Toggle SFX: ${soundProfile === "classic" ? "Classic 8-bit click" : "Acoustic Mechanical"}`}
            >
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span className="font-bold">
                  {soundProfile === "classic" ? "SFX: CLASSIC" : "SFX: ACOUSTIC"}
                </span>
              </div>
              <span className="text-[8px] px-1 py-0.5 rounded bg-white/10 text-white/70">
                {soundProfile === "classic" ? "DEF" : "M10"}
              </span>
            </button>
          </div>
        </div>

        {/* 3. Navigation & Actions */}
        <div>
          <span className="text-[9px] text-white/40 uppercase tracking-wider block mb-1.5">
            ACTIONS
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {/* Shuffle */}
            <button
              onClick={() => handleReset(true)}
              className="p-2 rounded-xl bg-black/40 hover:bg-black/60 border border-white/10 text-[#EDECE5] hover:text-white transition-colors flex flex-col items-center gap-1 text-[9px]"
              title="Shuffle text (Random Quote)"
              aria-label="Randomize text"
            >
              <Shuffle className="w-4 h-4 text-emerald-300" />
              <span className="text-[8px]">Shuffle</span>
            </button>

            {/* Restart */}
            <button
              onClick={() => handleReset(false)}
              className="p-2 rounded-xl bg-black/40 hover:bg-black/60 border border-white/10 text-[#EDECE5] hover:text-white transition-colors flex flex-col items-center gap-1 text-[9px]"
              title="Restart current text"
              aria-label="Restart current text"
            >
              <RotateCcw className="w-4 h-4 text-blue-300" />
              <span className="text-[8px]">Reset</span>
            </button>

            {/* Next */}
            <button
              onClick={handleNextQuote}
              className="p-2 rounded-xl bg-black/40 hover:bg-black/60 border border-white/10 text-[#EDECE5] hover:text-white transition-colors flex flex-col items-center gap-1 text-[9px]"
              title="Next random quote"
              aria-label="Next quote"
            >
              <SkipForward className="w-4 h-4 text-purple-300" />
              <span className="text-[8px]">Next</span>
            </button>
          </div>
        </div>

        {/* 4. Leaderboard Quick-Jump Button */}
        <button
          onClick={() => {
            const el = document.getElementById("embedded-leaderboard");
            if (el) {
              el.scrollIntoView({ behavior: "smooth" });
            } else {
              setIsLeaderboardOpen(true);
            }
          }}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-black/40 hover:from-amber-500/30 hover:to-black/60 border border-amber-500/30 text-white transition-colors text-xs"
          title="Jump to Leaderboard"
        >
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-300" />
            <span className="font-semibold">Leaderboard</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
            TOP
          </span>
        </button>

        {/* 5. Tab + Enter Keyboard Hint */}
        <div className="pt-2 text-[10px] text-white/40 border-t border-white/10 text-center flex items-center justify-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-black/50 border border-white/20 text-white font-bold">Tab</kbd>
          <span>+</span>
          <kbd className="px-1.5 py-0.5 rounded bg-black/50 border border-white/20 text-white font-bold">Enter</kbd>
          <span className="text-[9px]">restart</span>
        </div>
      </aside>
    </div>

      {/* Embedded Permanent Leaderboard Section (directly underneath typewriter chassis) */}
      <div id="embedded-leaderboard" className="w-full max-w-5xl mt-10">
        <div className="rounded-3xl bg-[#1D251C] border-4 border-[#3D4D37] p-5 sm:p-7 shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),0_20px_50px_rgba(15,25,12,0.35)]">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-5 border-b border-white/10 font-monocraft">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
                <Trophy className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                    HALL OF FAME • TOP OPERATORS
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    LIVE STANDINGS
                  </span>
                </div>
                <p className="text-[11px] text-white/50">
                  Global velocity rankings synced with official typewriter telemetries
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                api
                  .getTypingLeaderboard(10)
                  .then((data) => {
                    if (data && data.length > 0) setLeaderboard(data);
                  })
                  .catch(() => {});
              }}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs transition-colors flex items-center gap-1.5 font-monocraft"
              title="Refresh Leaderboard"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Sync</span>
            </button>
          </div>

          {/* Table */}
          <div className="space-y-1.5 font-monocraft">
            {/* Table Header */}
            <div className="grid grid-cols-12 px-4 py-2 text-[10px] uppercase tracking-wider text-white/40 font-semibold border-b border-white/5">
              <div className="col-span-2 sm:col-span-1 text-center">Rank</div>
              <div className="col-span-5 sm:col-span-6">Operator / Pilot</div>
              <div className="col-span-3 sm:col-span-3 text-right">Speed (WPM)</div>
              <div className="col-span-2 sm:col-span-2 text-right">Accuracy</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-white/5 bg-black/40 rounded-2xl border border-white/10 overflow-hidden">
              {leaderboard.map((item, idx) => {
                const isTop1 = idx === 0;
                const isTop2 = idx === 1;
                const isTop3 = idx === 2;

                return (
                  <div
                    key={idx}
                    className={`grid grid-cols-12 items-center px-4 py-3 transition-colors ${
                      isTop1
                        ? "bg-amber-500/[0.09] hover:bg-amber-500/[0.14]"
                        : isTop2
                        ? "bg-neutral-300/[0.05] hover:bg-neutral-300/[0.10]"
                        : isTop3
                        ? "bg-amber-700/[0.05] hover:bg-amber-700/[0.10]"
                        : "hover:bg-white/[0.04]"
                    }`}
                  >
                    {/* Rank Badge */}
                    <div className="col-span-2 sm:col-span-1 flex justify-center">
                      {isTop1 ? (
                        <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-300 to-amber-500 text-black font-extrabold text-xs flex items-center justify-center shadow-md shadow-amber-500/20">
                          1
                        </span>
                      ) : isTop2 ? (
                        <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-gray-200 to-gray-400 text-black font-extrabold text-xs flex items-center justify-center shadow-sm">
                          2
                        </span>
                      ) : isTop3 ? (
                        <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 text-white font-extrabold text-xs flex items-center justify-center shadow-sm">
                          3
                        </span>
                      ) : (
                        <span className="text-white/40 font-bold text-xs">
                          #{idx + 1}
                        </span>
                      )}
                    </div>

                    {/* Operator Name */}
                    <div className="col-span-5 sm:col-span-6 flex items-center gap-2.5 min-w-0 pr-2">
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-white/10 shrink-0 border border-white/20">
                        <Image
                          src={idx === 1 ? "/porto-icon.jpg" : "/edgar.jpg"}
                          alt={item.playerName}
                          width={24}
                          height={24}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span
                        className={`text-xs sm:text-sm font-semibold truncate ${
                          isTop1 ? "text-amber-300 font-bold" : "text-white"
                        }`}
                      >
                        {item.playerName}
                      </span>
                    </div>

                    {/* Speed WPM */}
                    <div className="col-span-3 sm:col-span-3 text-right">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-xs sm:text-sm font-bold ${
                          isTop1
                            ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                            : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {item.wpm} <span className="text-[10px] font-normal opacity-80">WPM</span>
                      </span>
                    </div>

                    {/* Accuracy */}
                    <div className="col-span-2 sm:col-span-2 text-right">
                      <span className="text-xs sm:text-sm text-white/80 font-medium">
                        {item.accuracy}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Info / User Record */}
          <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between text-[11px] font-monocraft text-white/50 gap-2">
            <span>
              Current Session: <strong className="text-white">{playerProfile.name}</strong> • Best:{" "}
              <strong className="text-[#B5C9AC]">{playerProfile.highscore} WPM</strong>
            </span>
            <span className="text-white/40">
              Type all text & hit Enter to submit your score automatically
            </span>
          </div>
        </div>
      </div>

      {/* Completion Modal & Scorecard */}
      <AnimatePresence>
        {isFinished && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <motion.div
              initial={reduceMotion ? false : { scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25, ease: easeSoft }}
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-black/10 relative"
            >
              <button
                onClick={() => setIsFinished(false)}
                className="absolute top-5 right-5 text-[#302f2d]/50 hover:text-[#302f2d] transition-colors"
                aria-label="Close scorecard"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#3E4F36]/10 text-[#3E4F36] flex items-center justify-center mx-auto">
                  <Trophy className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="text-2xl font-bold text-[#302f2d]">Mission Completed!</h3>
                <p className="text-xs text-[#302f2d]/60 font-monocraft">
                  Operator:{" "}
                  <span className="font-bold text-[#302f2d]">
                    {adminUser ? adminUser.email : playerProfile.name}
                  </span>
                </p>
              </div>

              {/* Stats Box */}
              <div className="grid grid-cols-2 gap-3 my-6 p-4 rounded-2xl bg-[#FAF8F5] border border-black/5 text-center font-monocraft">
                <div>
                  <span className="text-[10px] text-[#302f2d]/50 block">SPEED</span>
                  <span className="text-2xl font-extrabold text-[#302f2d]">{wpm}</span>
                  <span className="text-[10px] text-[#302f2d]/50 block">WPM</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#302f2d]/50 block">ACCURACY</span>
                  <span className="text-2xl font-extrabold text-[#302f2d]">{accuracy}%</span>
                  <span className="text-[10px] text-[#302f2d]/50 block">ACCURATE</span>
                </div>
              </div>

              {/* Status Notice */}
              <div className="flex items-center justify-center gap-1.5 text-xs text-[#3E4F36] font-monocraft mb-6">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Score submitted to official leaderboard!</span>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleReset(true)}
                  className="flex-1 py-3 rounded-xl bg-[#302f2d] text-white text-xs font-monocraft font-bold hover:bg-black transition-colors"
                >
                  Type Again
                </button>
                <button
                  onClick={handleNextQuote}
                  className="flex-1 py-3 rounded-xl bg-[#FAF8F5] border border-black/10 text-[#302f2d] text-xs font-monocraft font-bold hover:bg-[#EDE8E0] transition-colors"
                >
                  Next Text
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Operator Authentication & Profile Modal */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <motion.div
              initial={reduceMotion ? false : { scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25, ease: easeSoft }}
              className="bg-[#1C1F1B] text-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-white/10 relative"
            >
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="absolute top-5 right-5 text-white/50 hover:text-white transition-colors"
                aria-label="Close auth modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-1 mb-6">
                <span className="text-[10px] font-monocraft uppercase tracking-widest text-[#A3B899] block">
                  TERMINAL OPERATOR CREDENTIALS
                </span>
                <h3 className="text-xl font-bold tracking-tight text-white font-monocraft">
                  Authentication & Profile
                </h3>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/10 mb-6 font-monocraft text-xs">
                <button
                  onClick={() => setAuthTab("profile")}
                  className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
                    authTab === "profile"
                      ? "border-[#A3B899] text-[#A3B899] font-bold"
                      : "border-transparent text-white/50 hover:text-white"
                  }`}
                >
                  Pilot Call-sign
                </button>
                <button
                  onClick={() => setAuthTab("admin")}
                  className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
                    authTab === "admin"
                      ? "border-[#A3B899] text-[#A3B899] font-bold"
                      : "border-transparent text-white/50 hover:text-white"
                  }`}
                >
                  Admin Login
                </button>
              </div>

              {/* Tab 1: Player Profile */}
              {authTab === "profile" && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-[11px] font-monocraft text-white/70 mb-2">
                      OPERATOR CALL-SIGN / NICKNAME
                    </label>
                    <input
                      type="text"
                      value={playerProfile.name}
                      onChange={(e) =>
                        setPlayerProfileState({
                          ...playerProfile,
                          name: e.target.value,
                        })
                      }
                      maxLength={20}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white font-monocraft text-xs focus:outline-none focus:border-[#A3B899]"
                      placeholder="e.g. Raged, Edgar, GhostWriter"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-monocraft text-white/70 mb-2">
                      CHOOSE PILOT AVATAR
                    </label>
                    <div className="flex gap-4">
                      {AVATAR_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() =>
                            setPlayerProfileState({
                              ...playerProfile,
                              avatar: opt.src,
                            })
                          }
                          className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                            playerProfile.avatar === opt.src
                              ? "border-[#A3B899] bg-[#3E4F36]/40"
                              : "border-white/10 hover:border-white/30"
                          }`}
                        >
                          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20">
                            <Image
                              src={opt.src}
                              alt={opt.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span className="font-monocraft text-xs text-white">
                            {opt.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Operator Stats */}
                  <div className="p-3.5 rounded-xl bg-black/30 border border-white/10 flex justify-around font-monocraft text-center text-xs">
                    <div>
                      <span className="text-white/40 text-[10px] block">BEST WPM</span>
                      <span className="font-bold text-[#A3B899]">
                        {playerProfile.highscore} WPM
                      </span>
                    </div>
                    <div className="w-px bg-white/10" />
                    <div>
                      <span className="text-white/40 text-[10px] block">RUNS COMPLETED</span>
                      <span className="font-bold text-white">
                        {playerProfile.gamesPlayed}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setPlayerProfile(playerProfile);
                      setIsAuthModalOpen(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#3E4F36] hover:bg-[#2E3B27] text-white font-monocraft font-bold text-xs transition-colors shadow-lg"
                  >
                    Save Operator Profile
                  </button>
                </div>
              )}

              {/* Tab 2: Admin Login */}
              {authTab === "admin" && (
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  {adminUser ? (
                    <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-monocraft text-xs space-y-3">
                      <div className="flex items-center gap-2 font-bold text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Currently Authenticated as Administrator</span>
                      </div>
                      <p className="text-[11px] text-white/70">
                        Email: {adminUser.email}
                      </p>
                      <div className="flex gap-2 pt-2">
                        <Link
                          href="/admin"
                          className="flex-1 text-center py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors"
                        >
                          Open CMS Lite
                        </Link>
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                        >
                          Log Out
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-[11px] font-monocraft text-white/70 mb-1.5">
                          ADMINISTRATOR EMAIL
                        </label>
                        <input
                          type="email"
                          required
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-white font-monocraft text-xs focus:outline-none focus:border-[#A3B899]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-monocraft text-white/70 mb-1.5">
                          PASSWORD
                        </label>
                        <input
                          type="password"
                          required
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-white font-monocraft text-xs focus:outline-none focus:border-[#A3B899]"
                        />
                      </div>

                      {/* Demo Quickfill */}
                      <button
                        type="button"
                        onClick={() => {
                          setAdminEmail("admin@portfolio.local");
                          setAdminPassword("admin123");
                        }}
                        className="text-[10px] font-monocraft text-[#A3B899] hover:underline block text-left"
                      >
                        ⚡ Click to autofill Demo Admin (admin@portfolio.local / admin123)
                      </button>

                      {adminLoginError && (
                        <p className="text-xs text-red-400 font-monocraft">
                          {adminLoginError}
                        </p>
                      )}

                      {adminLoginSuccess && (
                        <p className="text-xs text-emerald-400 font-monocraft">
                          ✓ Authentication verified! Connecting...
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={adminLoginLoading}
                        className="w-full py-2.5 rounded-xl bg-[#3E4F36] hover:bg-[#2E3B27] text-white font-monocraft font-bold text-xs transition-colors shadow-lg disabled:opacity-50"
                      >
                        {adminLoginLoading
                          ? "Verifying..."
                          : "Authenticate Administrator"}
                      </button>
                    </>
                  )}
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Leaderboard Drawer Modal */}
      <AnimatePresence>
        {isLeaderboardOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <motion.div
              initial={reduceMotion ? false : { scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25, ease: easeSoft }}
              className="bg-[#1C1F1B] text-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-white/10 relative"
            >
              <button
                onClick={() => setIsLeaderboardOpen(false)}
                className="absolute top-5 right-5 text-white/50 hover:text-white transition-colors"
                aria-label="Close leaderboard"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-1 mb-6">
                <span className="text-[10px] font-monocraft uppercase tracking-widest text-amber-400 block flex items-center justify-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  ROYAL TYPEWRITER HIGH SCORES
                </span>
                <h3 className="text-xl font-bold tracking-tight text-white font-monocraft">
                  Global Leaderboard
                </h3>
              </div>

              {/* Leaderboard Table */}
              <div className="space-y-2 mb-6 font-monocraft text-xs max-h-72 overflow-y-auto pr-1">
                <div className="divide-y divide-white/10 bg-black/40 rounded-xl border border-white/10 overflow-hidden">
                  {leaderboard.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-3.5 py-2.5 text-xs hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`font-bold w-5 ${
                            idx === 0
                              ? "text-amber-400 text-sm"
                              : idx === 1
                              ? "text-neutral-300"
                              : idx === 2
                              ? "text-amber-600"
                              : "text-white/40"
                          }`}
                        >
                          #{idx + 1}
                        </span>
                        <span className="font-semibold text-white truncate max-w-[140px]">
                          {item.playerName}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-white/70 text-[11px]">
                        <span className="font-bold text-[#A3B899]">
                          {item.wpm} WPM
                        </span>
                        <span>{item.accuracy}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setIsLeaderboardOpen(false)}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-monocraft font-bold text-xs transition-colors"
              >
                Close Leaderboard
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
