'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from '@hugeicons/react';
import { Github, Instagram, NewTwitterIcon } from '@hugeicons/core-free-icons';

const navLinks = [
  { href: "/#projects", label: "projects" },
  // { href: "/me", label: "me" },
  { href: "/blog", label: "blog" },
  { href: "/contact", label: "contact" },
];

const socials = [
  { href: "https://x.com", icon: NewTwitterIcon, label: "Twitter" },
  { href: "https://instagram.com", icon: Instagram, label: "Instagram" },
  { href: "https://github.com/Raged9", icon: Github, label: "GitHub" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <motion.nav
        className="flex z-50 fixed left-0 right-0 justify-between max-w-304 w-full mx-auto px-4 md:px-9 py-4 md:py-9 bg-[#FBFAF9]/5 backdrop-blur-sm"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
      >
        <div className="flex items-center gap-4 md:gap-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link href="/" className="inline-flex items-center">
              <span className="font-bold text-[19px] tracking-[-0.6px] text-base hover:opacity-80 transition-opacity leading-none">
                edgar.
              </span>
            </Link>
          </motion.div>

          {/* Desktop nav links */}
          <motion.div
            className="hidden md:flex items-center gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-base/50 hover:text-base transition-colors duration-200 text-sm tracking-[-0.5px]"
              >
                {l.label}
              </Link>
            ))}
          </motion.div>
        </div>

        {/* Desktop socials */}
        <motion.div
          className="hidden md:flex gap-3 items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {socials.map((s) => (
            <motion.a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <HugeiconsIcon
                icon={s.icon}
                size={18}
                strokeWidth={1.7}
                className="text-base/50 hover:text-base transition-all duration-300"
              />
            </motion.a>
          ))}
        </motion.div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col justify-center items-center gap-1.5 min-w-11 min-h-11"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <motion.span
            className="block w-5 h-0.5 bg-base rounded-full origin-center"
            animate={open ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.span
            className="block w-5 h-0.5 bg-base rounded-full"
            animate={open ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
          <motion.span
            className="block w-5 h-0.5 bg-base rounded-full origin-center"
            animate={open ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.2 }}
          />
        </button>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 bg-[#FAFAFA] flex flex-col px-6 pt-24 pb-10 md:hidden"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
          >
            <nav className="flex flex-col gap-6 flex-1">
              {navLinks.map((l, i) => (
                <motion.div
                  key={l.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="text-3xl font-semibold text-base/70 hover:text-base transition-colors"
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="flex gap-2 items-center">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-11 min-h-11 flex items-center justify-center"
                >
                  <HugeiconsIcon icon={s.icon} size={22} strokeWidth={2} className="text-base/60" />
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
