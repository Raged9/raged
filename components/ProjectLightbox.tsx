"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

export interface LightboxProject {
  id?: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string | null;
  images?: string[];
  liveUrl?: string | null;
  projectUrl?: string | null;
}

interface ProjectLightboxProps {
  project: LightboxProject | null;
  initialIndex?: number;
  onClose: () => void;
}

export function normalizeExternalUrl(url?: string | null): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function getProjectImages(project: LightboxProject | null | undefined): string[] {
  if (!project) return [];
  if (Array.isArray(project.images) && project.images.length > 0) {
    return project.images.filter((url) => Boolean(url && url.trim() !== ""));
  }
  if (project.imageUrl && project.imageUrl.trim() !== "") {
    return [project.imageUrl];
  }
  return [];
}

export default function ProjectLightbox({
  project,
  initialIndex = 0,
  onClose,
}: ProjectLightboxProps) {
  const [mounted, setMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const images = getProjectImages(project);
  const total = images.length;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setCurrentIndex(initialIndex >= 0 && initialIndex < total ? initialIndex : 0);
  }, [project, initialIndex, total]);

  const handlePrev = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (total <= 1) return;
      setCurrentIndex((prev) => (prev - 1 + total) % total);
    },
    [total]
  );

  const handleNext = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (total <= 1) return;
      setCurrentIndex((prev) => (prev + 1) % total);
    },
    [total]
  );

  useEffect(() => {
    if (!project) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [project, onClose, handlePrev, handleNext]);

  if (!mounted || !project) return null;

  const liveHref = normalizeExternalUrl(project.liveUrl || project.projectUrl);

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8 cursor-zoom-out animate-fadeIn select-none"
    >
      {/* Top Bar: Counter + Close Button */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed top-4 sm:top-6 left-4 sm:left-8 right-4 sm:right-8 z-[110] flex items-center justify-between pointer-events-none"
      >
        <div className="pointer-events-auto">
          {total > 1 && (
            <span className="px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-xs font-mono font-semibold shadow-lg">
              {currentIndex + 1} / {total}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="pointer-events-auto w-11 h-11 flex items-center justify-center text-white rounded-full bg-white/10 hover:bg-white/25 border border-white/15 backdrop-blur-md transition-all cursor-pointer shadow-lg"
          aria-label="Close zoom view"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Previous Button */}
      {total > 1 && (
        <button
          type="button"
          onClick={handlePrev}
          className="fixed left-3 sm:left-6 top-1/2 -translate-y-1/2 z-[110] w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/25 border border-white/15 backdrop-blur-md text-white flex items-center justify-center transition-all cursor-pointer shadow-xl"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Next Button */}
      {total > 1 && (
        <button
          type="button"
          onClick={handleNext}
          className="fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-[110] w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/25 border border-white/15 backdrop-blur-md text-white flex items-center justify-center transition-all cursor-pointer shadow-xl"
          aria-label="Next image"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Main Content Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex flex-col items-center justify-center max-w-[92vw] max-h-[86vh] cursor-default"
      >
        {total > 0 ? (
          <>
            {/* Clean Zoomed Image — No awkward giant white box */}
            <div className="relative flex items-center justify-center">
              <img
                key={images[currentIndex]}
                src={images[currentIndex]}
                alt={`${project.title} - ${currentIndex + 1}`}
                className="max-h-[70vh] sm:max-h-[74vh] max-w-[90vw] sm:max-w-[82vw] w-auto h-auto rounded-2xl object-contain shadow-[0_25px_70px_rgba(0,0,0,0.85)] border border-white/15 bg-neutral-950/40"
              />
            </div>

            {/* Thumbnail Strip (when project has multiple images) */}
            {total > 1 && (
              <div className="mt-4 flex items-center gap-2 overflow-x-auto max-w-[85vw] px-2 py-1">
                {images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative h-12 sm:h-14 aspect-video rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      idx === currentIndex
                        ? "border-white scale-105 shadow-md opacity-100"
                        : "border-white/20 opacity-50 hover:opacity-85"
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Subtle Caption Pill */}
            <div className="mt-3 px-5 py-2.5 rounded-2xl bg-neutral-900/85 border border-white/10 backdrop-blur-md text-white flex items-center gap-4 max-w-2xl shadow-xl">
              <div className="text-left min-w-0">
                <h3 className="text-sm sm:text-base font-bold tracking-tight truncate">
                  {project.title}
                </h3>
                {(project.subtitle || project.description) && (
                  <p className="text-xs text-white/65 truncate max-w-md">
                    {project.subtitle || project.description}
                  </p>
                )}
              </div>

              {liveHref && (
                <a
                  href={liveHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors shrink-0"
                >
                  <span>Open</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </>
        ) : (
          /* Fallback card when a placeholder project has no uploaded image yet */
          <div className="max-w-md w-full bg-neutral-900 border border-white/15 rounded-3xl p-8 text-center text-white shadow-2xl">
            <h3 className="text-2xl font-bold tracking-tight">{project.title}</h3>
            {project.description && (
              <p className="text-sm text-white/70 mt-2 leading-relaxed">
                {project.description}
              </p>
            )}
            <span className="inline-block px-3.5 py-1.5 mt-5 rounded-full bg-white/10 text-xs font-mono text-white/80">
              Upload project images via /admin CMS
            </span>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
