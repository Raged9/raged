"use client";

import React, { useEffect, useState } from "react";
import localFont from "next/font/local";
import { motion } from "framer-motion";
import {
  Download,
  Copy,
  Check,
  MapPin,
  GraduationCap,
  Briefcase,
  ArrowUpRight,
  Mail,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import LanyardBadge from "@/components/contact/LanyardBadge";
import HanglineGallery from "@/components/contact/HanglineGallery";
import DinoDotMatrix from "@/components/sections/DinoDotMatrix";
import { api, ProfileSettings } from "@/lib/api-client";
import { sendContactMessage } from "@/lib/contact";
import { easeOut, fadeUp, staggerChildren } from "@/lib/motion";

const borel = localFont({
  src: "../../public/Borel-Regular.ttf",
  weight: "400",
  style: "normal",
  display: "swap",
});

const DEFAULT_PROFILE: ProfileSettings = {
  fullName: "Christopher Edgar",
  nickname: "RAGED.",
  role: "Informatics Student & Full-Stack / AI Builder",
  bio: "An Informatics student passionate about turning complex problems into clean, fast, and tactile digital products — from full-stack management systems and cross-platform Flutter mobile apps to NLP & AI explorations.",
  location: "Kebon Jeruk, West Jakarta, Indonesia",
  university: "B.Sc. in Informatics (S.Kom.)",
  gpa: "3.78/4",
  focus: "Web · Mobile · AI/NLP",
  email: "edgar.edmanata@gmail.com",
  availability: "Available for internships, freelance & collaborations",
  cvUrl: "/CV-Christopher-Edgar.pdf",
  cvFileName: "CV-Christopher-Edgar.pdf",
};

interface TechStickerItem {
  name: string;
  category: string;
  bg: string;
  tilt: string;
  icon: React.ReactNode;
}

// Tech Stack & Skills formatted as tactile Hero-style square stickers
// (border-3 border-white rounded-xl shadow-[0px_6px_6px_0px_#00000015] -rotate-...)
const TECH_STICKERS: TechStickerItem[] = [
  {
    name: "JavaScript",
    category: "Language",
    bg: "bg-[#F7DF1E]",
    tilt: "-rotate-6",
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" aria-hidden="true">
        <path
          fill="#000000"
          d="M10.8 17.6c0 1.9-1.1 2.8-2.7 2.8-1.4 0-2.3-.7-2.7-1.6l1.5-.9c.3.5.6.9 1.2.9.6 0 1-.2 1-1.2v-6.5h1.7v6.5zm5.8 2.8c-1.7 0-2.8-.8-3.3-1.9l1.5-.9c.4.7.9 1.2 1.8 1.2.8 0 1.3-.4 1.3-.9 0-.6-.5-.9-1.4-1.3l-.5-.2c-1.4-.6-2.3-1.3-2.3-2.9 0-1.4 1.1-2.5 2.8-2.5 1.2 0 2.1.4 2.7 1.5l-1.4.9c-.3-.6-.7-.8-1.3-.8-.6 0-1 .4-1 .8 0 .6.4.8 1.2 1.2l.5.2c1.6.7 2.5 1.4 2.5 3 0 1.7-1.3 2.6-3.1 2.6z"
        />
      </svg>
    ),
  },
  {
    name: "TypeScript",
    category: "Language",
    bg: "bg-[#3178C6]",
    tilt: "rotate-4",
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white" aria-hidden="true">
        <path d="M13.2 12.6h-2.5v7.4H8.9v-7.4H6.4V11h6.8v1.6zm4.7 7.6c-1.6 0-2.8-.7-3.4-1.8l1.5-.9c.4.7 1 1.1 1.9 1.1.8 0 1.3-.4 1.3-.9 0-.6-.5-.8-1.5-1.2l-.5-.2c-1.4-.6-2.3-1.3-2.3-2.8 0-1.4 1.1-2.5 2.8-2.5 1.2 0 2.1.4 2.7 1.5l-1.4.9c-.3-.5-.7-.8-1.3-.8-.6 0-1 .3-1 .8 0 .5.4.8 1.3 1.1l.5.2c1.6.7 2.5 1.4 2.5 2.9 0 1.7-1.3 2.8-3.1 2.8z" />
      </svg>
    ),
  },
  {
    name: "Next.js",
    category: "Frontend",
    bg: "bg-[#111113]",
    tilt: "-rotate-3",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" aria-hidden="true">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.65 14.85L9.5 7.5H7.75v9h1.5v-6.6l6.15 7.95c.45-.28.87-.61 1.25-1zm-.9-9.35h1.5v6h-1.5v-6z" />
      </svg>
    ),
  },
  {
    name: "React",
    category: "Frontend",
    bg: "bg-[#20232A]",
    tilt: "rotate-5",
    icon: (
      <svg viewBox="-11.5 -10.232 23 20.463" className="w-6 h-6 text-[#61DAFB] fill-current" aria-hidden="true">
        <circle r="2.05" />
        <g stroke="currentColor" strokeWidth="1.2" fill="none">
          <ellipse rx="11" ry="4.2" />
          <ellipse rx="11" ry="4.2" transform="rotate(60)" />
          <ellipse rx="11" ry="4.2" transform="rotate(120)" />
        </g>
      </svg>
    ),
  },
  {
    name: "Node.js",
    category: "Backend",
    bg: "bg-[#1B2A1A]",
    tilt: "-rotate-4",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#68A063]" aria-hidden="true">
        <path d="M12 1.85c-.27 0-.55.07-.78.2l-7.44 4.3c-.48.28-.78.8-.78 1.36v8.58c0 .56.3 1.08.78 1.36l7.44 4.3c.46.26 1.04.26 1.5 0l7.44-4.3c.48-.28.78-.8.78-1.36V7.71c0-.56-.3-1.08-.78-1.36l-7.44-4.3c-.23-.13-.51-.2-.72-.2zm2.22 14.37c-1.66 0-2.66-.76-2.92-2.06h1.45c.16.64.65.96 1.48.96.92 0 1.43-.38 1.43-.96 0-.47-.35-.73-1.3-.95l-.95-.22c-1.34-.31-2.05-.94-2.05-2.08 0-1.26 1.04-2.11 2.66-2.11 1.54 0 2.55.8 2.69 2.02h-1.43c-.13-.57-.58-.91-1.3-.91-.78 0-1.24.34-1.24.87 0 .45.34.7 1.22.9l.96.22c1.45.33 2.13.94 2.13 2.13 0 1.36-1.08 2.2-2.83 2.2z" />
      </svg>
    ),
  },
  {
    name: "Python",
    category: "AI & NLP",
    bg: "bg-[#1E293B]",
    tilt: "rotate-3",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
        <path
          fill="#3776AB"
          d="M11.9 2C7.6 2 7.9 3.9 7.9 3.9v2h4.1v.6H6.2S2 6 2 10.2s3.6 4 3.6 4h2.1v-2.8s-.1-2.5 2.4-2.5h4.1s2.3 0 2.3-2.2V3.9S16.9 2 11.9 2zm-2.3 1.4c.5 0 .8.4.8.8s-.4.8-.8.8-.8-.4-.8-.8.4-.8.8-.8z"
        />
        <path
          fill="#FFD43B"
          d="M12.1 22c4.3 0 4-1.9 4-1.9v-2H12v-.6h5.8S22 18 22 13.8s-3.6-4-3.6-4h-2.1v2.8s.1 2.5-2.4 2.5H9.8s-2.3 0-2.3 2.2v2.8s-.4 1.9 4.6 1.9zm2.3-1.4c-.5 0-.8-.4-.8-.8s.4-.8.8-.8.8.4.8.8-.4.8-.8.8z"
        />
      </svg>
    ),
  },
  {
    name: "Flutter",
    category: "Mobile",
    bg: "bg-[#042B59]",
    tilt: "-rotate-5",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#47C5FB]" aria-hidden="true">
        <path d="M14.314 0L2.3 12 6 15.7 21.684.013h-7.357zm.014 11.072L7.857 17.53l6.47 6.47H21.7l-6.46-6.468 6.46-6.46h-7.37z" />
      </svg>
    ),
  },
  {
    name: "MongoDB",
    category: "Database",
    bg: "bg-[#001E2B]",
    tilt: "rotate-6",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
        <path
          fill="#00ED64"
          d="M17.193 9.555c-1.264-5.58-4.252-7.414-4.573-8.115-.28-.394-.53-.954-.735-1.44-.036.495-.055.685-.523 1.184-.723.566-4.438 3.682-4.74 10.02-.282 5.912 4.27 9.435 4.888 9.884l.07.05A73.49 73.49 0 0111.91 24h.481c.114-1.032.284-2.056.51-3.07.417-.296.604-.463.85-.693a11.342 11.342 0 003.639-8.464c.01-.814-.103-1.662-.197-2.218zm-5.336 8.195s0-8.291.275-8.29c.213 0 .49 10.695.49 10.695-.381-.045-.765-1.76-.765-2.405z"
        />
      </svg>
    ),
  },
  {
    name: "PostgreSQL",
    category: "Database",
    bg: "bg-[#336791]",
    tilt: "-rotate-4",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" aria-hidden="true">
        <path d="M17.1 3.3c-1.5-.6-3.3-.6-4.8-.1-.8-.3-1.8-.4-2.8-.2C6.4 3.5 4.2 6.1 4.2 9.4c0 2.5 1.3 4.6 3.2 5.4.1 1.6.8 2.9 2 3.3.9.3 1.9 0 2.6-.7.3 2 .9 3.6 2.1 3.6 1.3 0 2-1.8 2.1-4.5 2.1-.9 3.6-3.4 3.6-6.6 0-3.2-1.1-5.6-2.7-6.6zm-7.8 6.8c-.6 0-1.1-.5-1.1-1.1s.5-1.1 1.1-1.1 1.1.5 1.1 1.1-.5 1.1-1.1 1.1zm5.8 0c-.6 0-1.1-.5-1.1-1.1s.5-1.1 1.1-1.1 1.1.5 1.1 1.1-.5 1.1-1.1 1.1zm-1.1 4.8c-.8.8-2.2.8-3 0l.9-.9c.3.3.9.3 1.2 0l.9.9z" />
      </svg>
    ),
  },
  {
    name: "Tailwind CSS",
    category: "Styling",
    bg: "bg-[#0F172A]",
    tilt: "rotate-4",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#38BDF8]" aria-hidden="true">
        <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z" />
      </svg>
    ),
  },
  {
    name: "FastAPI",
    category: "Backend AI",
    bg: "bg-[#009688]",
    tilt: "-rotate-5",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" aria-hidden="true">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1.15 15.6v-4.7H7.8l5.35-8.5v4.7h3.05l-5.35 8.5z" />
      </svg>
    ),
  },
  {
    name: "Git & GitHub",
    category: "DevOps",
    bg: "bg-[#24292E]",
    tilt: "rotate-3",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" aria-hidden="true">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        />
      </svg>
    ),
  },
  {
    name: "Figma / UI·UX",
    category: "Design",
    bg: "bg-[#1E1E24]",
    tilt: "-rotate-6",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
        <path fill="#F24E1E" d="M8.5 2h3.5v7H8.5a3.5 3.5 0 110-7z" />
        <path fill="#FF7262" d="M12 2h3.5a3.5 3.5 0 110 7H12V2z" />
        <path fill="#A259FF" d="M8.5 9h3.5v7H8.5a3.5 3.5 0 110-7z" />
        <path fill="#1ABCFE" d="M15.5 9a3.5 3.5 0 110 7 3.5 3.5 0 010-7z" />
        <path fill="#0ACF83" d="M8.5 16h3.5v3.5a3.5 3.5 0 11-3.5-3.5z" />
      </svg>
    ),
  },
  {
    name: "NLP & AI",
    category: "AI Core",
    bg: "bg-[#3B1D5A]",
    tilt: "rotate-5",
    icon: (
      <Sparkles className="w-6 h-6 text-[#E9D5FF]" />
    ),
  },
];

const CORE_SKILL_PILLS = [
  "Full-Stack Web Architecture",
  "RESTful API & Microservices",
  "Cross-Platform Mobile (Flutter)",
  "Natural Language Processing (TF-IDF, BM25, Embeddings)",
  "Database Schema & Indexing (PostgreSQL / MongoDB)",
  "Interactive Motion & Tactile UI",
];

function normalizeCvHref(url?: string): string {
  if (!url) return "/CV-Christopher-Edgar.pdf";
  const trimmed = url.trim();
  if (!trimmed) return "/CV-Christopher-Edgar.pdf";
  if (/^(https?:\/\/|data:|\/)/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export default function PortofolioPage() {
  const [profile, setProfile] = useState<ProfileSettings>(DEFAULT_PROFILE);
  const [copied, setCopied] = useState(false);
  const [hanglineOpenSignal, setHanglineOpenSignal] = useState(0);

  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    api
      .getProfile()
      .then((data) => {
        if (data && data.fullName) {
          const normalizedUniv =
            data.university === "B.Sc. in Informatics" || data.university === "S.Kom."
              ? "B.Sc. in Informatics (S.Kom.)"
              : data.university;
          setProfile((prev) => ({
            ...prev,
            ...data,
            university: normalizedUniv || prev.university,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email || DEFAULT_PROFILE.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;

    setStatus("loading");
    try {
      const res = await sendContactMessage(form);
      if (res.success) {
        setStatus("success");
        setStatusMessage(res.message);
        setForm({ name: "", email: "", message: "" });
      } else {
        setStatus("error");
        setStatusMessage("Failed to send message. Please try again.");
      }
    } catch {
      setStatus("error");
      setStatusMessage("An error occurred while sending your message.");
    }
  };

  const cvHref = normalizeCvHref(profile.cvUrl);
  const isExternalCv = /^https?:\/\//i.test(cvHref);
  const inputClass =
    "w-full bg-transparent text-base text-sm placeholder:text-base/30 border-b border-base/10 py-3.5 outline-none focus:border-base/40 transition-colors duration-200";

  return (
    <div className="flex scroll-smooth relative flex-col min-h-screen items-center bg-bg text-base overflow-x-clip">
      {/* Tayo's distinctive dashed vertical margin lines */}
      <div className="hidden lg:block h-full min-h-screen z-0 absolute left-8 xl:left-24 border text-base/10 border-long-dashed pointer-events-none" />
      <div className="hidden lg:block h-full min-h-screen z-0 absolute right-8 xl:right-24 border text-base/10 border-long-dashed pointer-events-none" />

      <Navbar />

      <main className="relative z-10 w-full max-w-304 mx-auto px-6 sm:px-10 md:px-12 lg:px-16 pt-28 sm:pt-32 pb-16 space-y-20">
        {/* TOP SECTION: Short Bio + Download CV (Left) & Interactive Physics Lanyard (Right) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column (7 Cols): Biodata Singkat + Download CV + Tech Stack Preview */}
          <motion.div
            className="lg:col-span-7 flex flex-col gap-6"
            variants={staggerChildren(0.1)}
            initial="hidden"
            animate="visible"
          >
            {/* Availability Pill */}
            <motion.div variants={fadeUp} transition={{ duration: 0.6, ease: easeOut }}>
              <span className="inline-flex items-center gap-2 text-xs border border-base/15 bg-surface-muted rounded-full px-3.5 py-1.5 text-base/80 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                {profile.availability}
              </span>
            </motion.div>

            {/* Editorial Headline matching Hero */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.7, ease: easeOut }}
              className="space-y-2"
            >
              <h1 className="text-2xl sm:text-[34px] md:text-[38px] font-bold text-base leading-[1.25] tracking-tight">
                <span className="inline-flex flex-wrap items-center align-baseline">
                  <span
                    className={`${borel.className} font-normal text-2xl sm:text-[34px] md:text-[38px] text-base mr-2.5 leading-none inline-block relative top-[0.29em]`}
                    style={{ letterSpacing: "normal" }}
                  >
                    meet
                  </span>
                  <span>{profile.fullName.toLowerCase()}.</span>
                </span>
              </h1>
              <p className="text-base/60 text-sm sm:text-base font-medium">
                {profile.role}
              </p>
            </motion.div>

            {/* Short Biodata Paragraph */}
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.7, ease: easeOut }}
              className="text-base/75 text-sm sm:text-[15px] leading-relaxed max-w-xl"
            >
              {profile.bio}
            </motion.p>

            {/* Quick Biodata Metadata Cards */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.7, ease: easeOut }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl"
            >
              <div className="p-3.5 rounded-2xl bg-surface-muted border border-base/8 flex items-start gap-3">
                <div className="size-9 rounded-xl bg-base/8 flex items-center justify-center text-base/70 shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-base/45 block">
                    Domicile
                  </span>
                  <span className="text-xs font-bold text-base leading-snug block">
                    {profile.location}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface-muted border border-base/8 flex items-start gap-3">
                <div className="size-9 rounded-xl bg-base/8 flex items-center justify-center text-base/70 shrink-0 mt-0.5">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-base/45 block">
                    Education
                  </span>
                  <span className="text-xs font-bold text-base leading-snug block">
                    {profile.university}
                  </span>
                  <span className="text-[10.5px] font-mono font-medium text-base/60 block mt-0.5">
                    GPA {profile.gpa || "3.78/4"}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface-muted border border-base/8 flex items-start gap-3">
                <div className="size-9 rounded-xl bg-base/8 flex items-center justify-center text-base/70 shrink-0 mt-0.5">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-base/45 block">
                    Specialization
                  </span>
                  <span className="text-xs font-bold text-base leading-snug block">
                    {profile.focus}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Primary CTA: Download CV + One-Click Copy Email */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.7, ease: easeOut }}
              className="flex flex-wrap items-center gap-3.5 pt-2"
            >
              <a
                href={cvHref}
                download={isExternalCv ? undefined : profile.cvFileName || "CV-Christopher-Edgar.pdf"}
                target="_blank"
                rel="noopener noreferrer"
                className="serif py-3 px-6 min-h-11 rounded-[13px] text-[18px] hover:scale-105 active:scale-95 transition-all duration-300 font-bold cursor-pointer text-bg bg-base shadow-lg shadow-black/15 w-fit inline-flex items-center gap-2.5"
              >
                <Download className="w-4 h-4 stroke-[2.3]" />
                <span>download cv</span>
              </a>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="py-3 px-4 min-h-11 rounded-[13px] text-[13px] font-medium text-fg/75 bg-surface-muted border border-base/10 hover:bg-base/10 hover:text-fg transition-all duration-200 inline-flex items-center gap-2 cursor-pointer"
                title="Click to copy email"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      email copied!
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 opacity-60" />
                    <span>{profile.email}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setHanglineOpenSignal((s) => s + 1)}
                className="py-3 px-4 min-h-11 rounded-[13px] text-[13px] font-medium text-fg/80 bg-surface-muted border border-base/12 hover:bg-base hover:text-bg transition-all duration-200 inline-flex items-center gap-2 cursor-pointer"
                title="Jump to Hangline Certificates & Milestones Archive"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>hangline archive ↓</span>
              </button>
            </motion.div>

            {/* Direct Social Links */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.7, ease: easeOut }}
              className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-sm"
            >
              <a
                href="https://www.linkedin.com/in/christopher-edgar-id/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-fg/65 hover:text-fg transition-colors group font-medium"
              >
                <span>LinkedIn</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </a>
              <a
                href="https://github.com/Raged9"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-fg/65 hover:text-fg transition-colors group font-medium"
              >
                <span>GitHub</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </a>
              <a
                href="https://www.instagram.com/christopheredgar_/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-fg/65 hover:text-fg transition-colors group font-medium"
              >
                <span>Instagram</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </a>
            </motion.div>
          </motion.div>

          {/* Right Column (5 Cols): Interactive Draggable Lanyard Badge */}
          <motion.div
            className="lg:col-span-5 flex justify-center items-start"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: easeOut }}
          >
            <LanyardBadge
              fullName={profile.fullName}
              nickname="RAGED."
              role={profile.role}
              location={profile.location}
            />
          </motion.div>
        </section>

        {/* SECTION 2: TECH STACK & SKILLS (Hero Dog-Avatar Square Sticker Style) */}
        <section className="pt-6 border-t border-base/10 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-base/45 block mb-1.5">
                TOOLKIT &amp; CAPABILITIES
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-base tracking-tight">
                tech stack &amp; engineering skills.
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-base/55 max-w-md">
              Core technologies and engineering capabilities I use to build scalable web applications, mobile apps, and AI systems.
            </p>
          </div>

          {/* Square Sticker Cards Grid — styled after the tilted square frame in Hero */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
            {TECH_STICKERS.map((item, idx) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: idx * 0.04, ease: easeOut }}
                className="group bg-surface-muted/80 hover:bg-surface border border-base/8 hover:border-base/20 rounded-2xl p-4 flex flex-col items-center text-center gap-3.5 transition-all duration-300"
              >
                {/* Hero-style Square Sticker Frame (border-3 border-white rounded-xl shadow-[0px_6px_6px_0px_#00000015]) */}
                <div
                  className={`size-13 sm:size-14 ${item.bg} border-3 border-white rounded-xl shadow-[0px_6px_6px_0px_#00000018] flex items-center justify-center ${item.tilt} group-hover:rotate-0 group-hover:scale-110 transition-all duration-300 shrink-0`}
                >
                  {item.icon}
                </div>

                <div className="space-y-0.5">
                  <h3 className="text-xs sm:text-sm font-bold text-base leading-tight">
                    {item.name}
                  </h3>
                  <span className="text-[10px] font-mono text-base/45 block">
                    {item.category}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Core Engineering Skill Pills */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            {CORE_SKILL_PILLS.map((skill) => (
              <span
                key={skill}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-surface-muted border border-base/10 text-base/75"
              >
                ✦ {skill}
              </span>
            ))}
          </div>
        </section>

        {/* SECTION 3: HANGLINE ARCHIVE — Certificates, Events & Milestones */}
        <HanglineGallery externalOpenSignal={hanglineOpenSignal} />

        {/* SECTION 4: DIRECT MESSAGE FORM */}
        <section className="pt-4">
          <div className="bg-surface-muted border border-base/10 rounded-3xl p-8 sm:p-12 md:p-14">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start">
              <div className="space-y-4">
                <span className="text-xs font-mono uppercase tracking-widest text-base/45 block">
                  DIRECT INBOX
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-base leading-tight tracking-tight">
                  let&apos;s build something memorable together.
                </h2>
                <p className="text-base/60 text-sm sm:text-base leading-relaxed">
                  Interested in discussing internship opportunities, collaborative projects, or just chatting about software engineering &amp; AI? Drop a direct message right here.
                </p>
                <div className="pt-2 flex items-center gap-2.5 text-sm text-base/70 font-medium">
                  <Mail className="w-4 h-4 text-base/60" />
                  <span>{profile.email}</span>
                </div>
                <div className="pt-4 border-t border-base/10">
                  <p className="serif text-base/60 text-lg">
                    Powered by JavaScript — dan kopi dari Pulau Jawa.
                  </p>
                </div>
              </div>

              <div className="w-full">
                {status === "success" ? (
                  <div className="py-12 text-center space-y-3 bg-surface rounded-2xl p-8 border border-base/10 shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-base/5 flex items-center justify-center mx-auto text-base">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h4 className="text-lg font-semibold text-base">Message Sent!</h4>
                    <p className="text-xs text-base/60 max-w-xs mx-auto">
                      {statusMessage || "Thanks for reaching out. Edgar will get back to you soon."}
                    </p>
                    <button
                      type="button"
                      onClick={() => setStatus("idle")}
                      className="mt-4 text-xs font-semibold text-base hover:opacity-75 underline inline-block cursor-pointer"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="name [or nickname, we don't judge]"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        required
                        placeholder="e-mail address"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <textarea
                        required
                        rows={4}
                        placeholder="tell me about your project, role, or idea..."
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className={`${inputClass} resize-none`}
                      />
                    </div>
                    {status === "error" && (
                      <p className="text-xs text-red-500">{statusMessage}</p>
                    )}
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="serif py-3 px-6 rounded-[13px] text-[18px] font-bold cursor-pointer text-bg bg-base hover:opacity-90 shadow-lg shadow-black/15 hover:scale-105 active:scale-95 transition-all duration-300 w-fit flex items-center gap-2 mt-2 disabled:opacity-50"
                    >
                      <span>{status === "loading" ? "sending..." : "send message"}</span>
                      <span className="text-xl">→</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <DinoDotMatrix />
    </div>
  );
}
