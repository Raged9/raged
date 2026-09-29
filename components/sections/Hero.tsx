"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import localFont from "next/font/local";
import { easeOut, fadeUp, staggerChildren } from "@/lib/motion";
import PixelDotGrid from "./PixelDotGrid";

const borel = localFont({
  src: "../../public/Borel-Regular.ttf",
  weight: "400",
  style: "normal",
  display: "swap",
});

export default function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="hero"
      className="flex pt-32 sm:pt-40 pb-20 flex-col max-w-304 w-full mx-auto px-6 sm:px-10 md:px-12 lg:px-16 justify-center min-h-[75vh]"
    >
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12 lg:gap-14 w-full">
        {/* Left Column: Text content shifted slightly to the left */}
        <motion.div
          className="flex flex-col flex-1 max-w-xl"
          variants={staggerChildren(0.12)}
          initial={reduceMotion ? false : "hidden"}
          animate="visible"
        >
          {/* Headline: hello, i'm [frame avatar] edgar. */}
          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.7, ease: easeOut }}
            className="text-3xl sm:text-4xl font-bold text-[#302f2d] flex items-baseline flex-wrap gap-y-2"
          >
            {/* Pure text hello, with authentic Borel Regular 400 */}
            <span
              className={`${borel.className} font-normal text-[34px] sm:text-[42px] text-[#302f2d] mr-2.5 leading-none inline-block`}
              style={{ letterSpacing: "normal" }}
            >
              hello,
            </span>
            <span>i&apos;m</span>
            {/* Avatar image in tilted photo frame matching Tayo */}
            <Image
              src="/edgar.jpg"
              alt="edgar"
              width={120}
              height={120}
              priority
              className="size-8 sm:size-9 md:size-10 border-3 border-white rounded-xl shadow-[0px_6px_6px_0px_#00000015] inline-block -rotate-7 mx-2 object-cover overflow-hidden align-baseline translate-y-1 shrink-0"
            />
            <span>edgar.</span>
          </motion.h1>

          {/* Line 2: role */}
          <motion.h2
            variants={fadeUp}
            transition={{ duration: 0.7, ease: easeOut }}
            className="text-3xl sm:text-4xl font-bold text-[#302f2d] mt-2"
          >
            an informatics student and builder.
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.7, ease: easeOut }}
            className="mt-3 text-[#302f2d]/60 text-[15px] font-medium max-w-xl"
          >
            i build things with code — from scalable backend systems to tactile web experiences.
          </motion.p>

          {/* Signature Joke */}
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.7, ease: easeOut }}
            className="mt-2 text-[#302f2d]/40 text-[13px]"
          >
            Built by AI — Anak Indonesia.
          </motion.p>

          {/* Actions */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.7, ease: easeOut }}
            className="flex items-center gap-4 mt-7"
          >
            <Link
              href="#projects"
              className="serif py-3 px-6 min-h-11 rounded-[13px] text-[18px] hover:scale-105 active:scale-95 transition-all duration-300 font-bold cursor-pointer text-white bg-[#302f2d] shadow-lg shadow-black/15 w-fit flex items-center justify-center"
            >
              welcome to my world
            </Link>
            <Link
              href="#boarding-pass"
              className="py-3 px-4 min-h-11 rounded-[13px] text-[14px] font-medium text-base/60 bg-[#f5f5f5] hover:bg-[#eae8e4] hover:text-base transition-all duration-200 flex items-center"
            >
              boarding pass →
            </Link>
          </motion.div>
        </motion.div>

        {/* Right Column: Interactive Pixel Dot Grid */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.25, ease: easeOut }}
          className="shrink-0 w-full lg:w-auto flex justify-center lg:justify-end"
        >
          <PixelDotGrid />
        </motion.div>
      </div>
    </section>
  );
}
