import type { Transition, Variants } from "framer-motion";

/** Primary site ease — soft deceleration */
export const easeOut = [0.21, 0.47, 0.32, 0.98] as const;

/** Slightly snappier for micro-interactions */
export const easeSoft = [0.25, 0.1, 0.25, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const staggerChildren = (stagger = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

export const sectionTransition = (delay = 0): Transition => ({
  duration: 0.7,
  delay,
  ease: easeOut,
});

export const hoverTap = {
  whileHover: { scale: 1.02, opacity: 0.9 },
  whileTap: { scale: 0.98 },
  transition: { duration: 0.2, ease: easeSoft },
};

export const viewportOnce = { once: true, margin: "-80px" as const };
