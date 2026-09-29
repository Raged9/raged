import { audio } from "@/lib/audio";

/**
 * Play a micro paper fiber snapping crackle as the perforation tears
 */
export function playFiberSnapSound(intensity = 1.0) {
  audio.playFiberCrackle(intensity);
}

/**
 * Play a rich, satisfying full cardstock paper rip when the stub tears off
 */
export function playFullTearSound() {
  audio.playPaperTearFull();
}

/**
 * Play a smooth paper card slide sound when reattaching
 */
export function playPaperSlideSound() {
  audio.playPaperSlide();
}

