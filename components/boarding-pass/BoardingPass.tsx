"use client";

import {
  useId,
  useMemo,
  useRef,
  useState,
  useEffect,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { motion } from "motion/react";
import {
  bodyClip,
  bridgePath,
  brokenBridges,
  fiberOverlap,
  passHeight,
  pdf417Path,
  stubClip,
  tearProfile,
} from "./tear";
import { playFiberSnapSound, playFullTearSound, playPaperSlideSound } from "./tearSound";
import { audio } from "@/lib/audio";
import "./boarding-pass.css";

export type BoardingPassProps = {
  progress: number;
  detach: number;
  onTear: (progress: number) => void;
  onRelease: () => void;
  onKeyboardTear?: (delta: number) => void;
  onReattach: () => void;
  reducedMotion?: boolean;
};

const restOffset = { x: 42, y: 18, angle: 5 };

function Field({
  label,
  value,
  className,
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className={className ? `pass-field ${className}` : "pass-field"}>
      <span className="pass-label">{label}</span>
      <span className="pass-value">{value}</span>
    </div>
  );
}

function RouteArrow() {
  return (
    <svg
      className="pass-route-arrow"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="12" fill="#302f2d" />
      <path
        d="M6 12h10.5M12.5 7.5 17 12l-4.5 4.5"
        fill="none"
        stroke="#FBFAF9"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BoardingPass({
  progress,
  detach,
  onTear,
  onRelease,
  onKeyboardTear,
  onReattach,
  reducedMotion = false,
}: BoardingPassProps) {
  const statusId = useId();
  const profile = useMemo(() => tearProfile(42), []);
  const pdf417 = useMemo(
    () => pdf417Path("RAGED/EDGAR/IT1030/01A/26SEP/CGK-YOU", 160, 56, 14),
    []
  );

  const [hand, setHand] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const gesture = useRef<
    | {
        startX: number;
        startY: number;
        startProgress: number;
        peak: number;
        scale: number;
        anchorX?: number;
        anchorY?: number;
      }
    | undefined
  >(undefined);

  const torn = progress >= 1;
  const release = detach;
  const angle =
    Math.min(4, 4) * progress * (1 - release) + restOffset.angle * release;
  const lift = progress * 0.2 + release * 0.3;
  const settle = { type: "spring", duration: 0.28, bounce: 0 } as const;
  const immediate = { duration: 0 };

  // Sound effects: fiber snapping as perforation tears
  const prevBrokenRef = useRef(0);
  useEffect(() => {
    const currentBroken = brokenBridges(progress);
    if (currentBroken > prevBrokenRef.current && progress < 1) {
      const delta = currentBroken - prevBrokenRef.current;
      playFiberSnapSound(Math.min(2.5, 0.9 + delta * 0.2));
    }
    prevBrokenRef.current = currentBroken;
  }, [progress]);

  // Full rip sound when stub is detached completely
  useEffect(() => {
    if (detach >= 1) {
      playFullTearSound();
    }
  }, [detach]);

  function move(event: PointerEvent<HTMLButtonElement>) {
    const state = gesture.current;
    if (!state) return;
    const dx = (event.clientX - state.startX) / state.scale;
    const dy = (event.clientY - state.startY) / state.scale;

    if (state.anchorX === undefined || state.anchorY === undefined) {
      const distance = Math.max(0, dx * 0.65 + dy * 0.75);
      const next = Math.min(
        1,
        Math.max(state.peak, state.startProgress + distance / 120)
      );
      if (next > progress) {
        playFiberSnapSound(Math.min(2.5, (next - progress) * 8));
      }
      state.peak = next;
      if (next !== progress) onTear(next);
      if (next >= 1) {
        playFullTearSound();
        state.anchorX = event.clientX;
        state.anchorY = event.clientY;
      }
      return;
    }
    setHand({
      x: (event.clientX - state.anchorX) / state.scale,
      y: (event.clientY - state.anchorY) / state.scale,
    });
  }

  function begin(event: PointerEvent<HTMLButtonElement>) {
    audio.resumeAudio();
    if (event.button !== 0 || gesture.current) return;
    const layout = event.currentTarget.closest(".boarding-pass-layout");
    if (!(layout instanceof HTMLElement)) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    gesture.current = {
      startX: event.clientX,
      startY: event.clientY,
      startProgress: progress,
      peak: progress,
      scale: layout.getBoundingClientRect().width / layout.offsetWidth || 1,
      anchorX: torn ? event.clientX : undefined,
      anchorY: torn ? event.clientY : undefined,
    };
    setDragging(true);
  }

  function end(event: PointerEvent<HTMLButtonElement>) {
    if (!gesture.current) return;
    const completed = gesture.current.peak >= 1;
    gesture.current = undefined;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragging(false);
    setHand({ x: 0, y: 0 });
    onRelease();
  }

  const stepTear = (delta = 0.15) => {
    if (torn) return;
    const next = Math.min(1, progress + delta);
    if (next >= 1) {
      playFullTearSound();
    } else {
      playFiberSnapSound(Math.min(2.5, delta * 10));
    }
    onTear(next);
    if (onKeyboardTear) onKeyboardTear(delta);
  };

  function keyboard(event: KeyboardEvent<HTMLButtonElement>) {
    audio.resumeAudio();
    if (
      event.key === "ArrowRight" ||
      event.key === "ArrowDown" ||
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      stepTear(0.15);
    }
  }

  const amplitude = 1.8;
  const status = torn
    ? detach >= 1
      ? "Stub torn off"
      : "Stub coming free"
    : progress > 0
    ? `Stub ${Math.round(progress * 100)}% torn`
    : "Stub attached";

  function EdgarBrandLogo({ isStub = false }: { isStub?: boolean }) {
    return (
      <div className={`flex items-center gap-2 text-[#302f2d] select-none ${isStub ? "scale-90 origin-left" : ""}`}>
        <svg viewBox="0 0 24 24" width={isStub ? "18" : "20"} height={isStub ? "18" : "20"} fill="currentColor">
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
        </svg>
        <span className="font-bold tracking-widest text-[12px] uppercase font-mono leading-none">
          {isStub ? "EDGAR" : "EDGAR AIR"}
        </span>
      </div>
    );
  }

  const face = (
    <div className="pass-stub-face">
      <div className="pass-stub-brand" data-face="pass-stub-brand">
        <EdgarBrandLogo isStub />
      </div>
      <div className="pass-stub-name" data-face="pass-stub-name">
        <span className="pass-value">RAGED / EDGAR</span>
        <span className="pass-label">26 SEP</span>
      </div>
      <div className="pass-stub-route" data-face="pass-stub-route">
        <span className="pass-label">Flight IT-1030</span>
        <span className="pass-code">CGK</span>
        <span className="pass-label pass-city">JAKARTA</span>
        <RouteArrow />
        <span className="pass-code pass-code-end">YOU</span>
        <span className="pass-label pass-city pass-city-end">PORTFOLIO</span>
      </div>
      <div className="pass-stub-fields" data-face="pass-stub-fields">
        <Field label="Seat" value="01A" />
        <Field label="Gate" value="G07" />
        <Field
          label="Group"
          value="PRI"
          className="pass-field-end pass-field-low"
        />
      </div>
      <span className="pass-perforation pass-perforation-stub" aria-hidden="true" />
    </div>
  );

  return (
    <div
      className="boarding-pass"
      data-broken-bridges={brokenBridges(progress)}
      data-tear-progress={progress.toFixed(2)}
      data-detached={detach >= 1}
      data-reduced-motion={reducedMotion}
    >
      <div
        className="boarding-pass-layout"
        style={
          {
            "--pass-radius": "16px",
            "--stub-lift": lift,
          } as CSSProperties
        }
      >
        {/* Main Ticket Body (Left 515px) */}
        <div className="pass-piece pass-body-shadow">
          <div
            className="pass-body"
            style={{ clipPath: bodyClip(profile, progress, amplitude) }}
          >
            <div data-pass-region="pass-brand">
              <div className="pass-brand">
                <EdgarBrandLogo />
              </div>
            </div>

            {/* Title */}
            <div data-pass-region="pass-title">
              <div className="pass-title">
                <span className="pass-label">Boarding Pass</span>
              </div>
            </div>

            {/* Barcode Column */}
            <div data-pass-region="pass-barcode">
              <div className="pass-barcode-column">
                <span className="pass-label">PRIORITY</span>
                <svg
                  className="pass-barcode"
                  viewBox="0 0 160 56"
                  width="160"
                  height="56"
                  role="img"
                  aria-label="Boarding barcode"
                >
                  <path d={pdf417} />
                </svg>
              </div>
            </div>

            {/* Passenger & Date */}
            <div data-pass-region="pass-passenger">
              <div className="pass-passenger">
                <Field label="Passenger" value="RAGED / EDGAR" />
                <Field label="Date" value="26 SEP" />
              </div>
            </div>

            {/* Gate, Group, Seat */}
            <div data-pass-region="pass-fields">
              <div className="pass-fields">
                <Field label="Gate" value="G07" />
                <Field label="Group" value="PRI" />
                <Field label="Seat" value="01A" className="pass-field-end" />
              </div>
            </div>

            {/* Route */}
            <div data-pass-region="pass-route">
              <div className="pass-route">
                <span className="pass-label">Flight IT-1030</span>
                <span className="pass-code">CGK</span>
                <RouteArrow />
                <span className="pass-code">YOU</span>
                <span className="pass-label pass-city">JAKARTA</span>
                <span className="pass-label pass-city pass-city-end">
                  PORTFOLIO EXPEDITION
                </span>
              </div>
            </div>

            {/* Flight Times */}
            <div data-pass-region="pass-times">
              <div className="pass-times">
                <Field label="Boarding" value="10:00" />
                <span className="pass-times-arrow" aria-hidden="true">→</span>
                <Field label="Doors close" value="10:20" />
                <span className="pass-times-arrow" aria-hidden="true">→</span>
                <Field label="Departs" value="10:30" />
                <span className="pass-times-arrow" aria-hidden="true">→</span>
                <Field label="Arrives" value="NOW" />
              </div>
            </div>

            {/* Footer */}
            <div data-pass-region="pass-footer">
              <div className="pass-footer">
                <span className="pass-label">Subject to clearance</span>
                <span className="pass-label">
                  Seq 001 · IT1030/26SEP/CGK-YOU
                </span>
              </div>
            </div>

            {/* Perforation Slits and Rules */}
            <span className="pass-rule pass-rule-1" aria-hidden="true" />
            <span className="pass-rule pass-rule-2" aria-hidden="true" />
            <span className="pass-rule pass-rule-3" aria-hidden="true" />
            <span className="pass-perforation pass-perforation-body" aria-hidden="true" />
          </div>
        </div>

        {/* Paper Bridges (tearing fiber connections) */}
        <svg
          className="pass-bridges"
          viewBox="0 0 672 280"
          width="672"
          height="280"
          aria-hidden="true"
        >
          <path d={bridgePath(progress, angle)} />
        </svg>

        {/* Interactive Tearable Stub (Right 163px) */}
        <motion.div
          className="pass-hand"
          data-dragging={dragging}
          initial={false}
          animate={{ x: hand.x, y: hand.y }}
          transition={dragging || reducedMotion ? immediate : settle}
        >
          <div className="pass-piece pass-stub-shadow">
            <button
              type="button"
              className="pass-stub"
              aria-label="Tear off stub (drag down or press Enter)"
              aria-describedby={statusId}
              data-torn={torn}
              style={{
                transform: `translate(${restOffset.x * release}px, ${
                  restOffset.y * release
                }px) rotate(${angle}deg)`,
                transformOrigin: `${fiberOverlap}px ${passHeight}px`,
              }}
              onPointerDown={begin}
              onPointerMove={move}
              onPointerUp={end}
              onPointerCancel={end}
              onLostPointerCapture={end}
              onKeyDown={keyboard}
              onClick={(e) => {
                // Do NOT tear on mouse click! Mouse users must drag/pull down the stub.
                // If triggered by accessibility keyboard click (detail === 0), step incrementally.
                if (e.detail === 0 && !torn) {
                  stepTear(0.15);
                }
              }}
            >
              <div
                className="pass-stub-paper"
                style={{ clipPath: stubClip(profile, progress, amplitude) }}
              >
                {face}
              </div>
            </button>
          </div>
        </motion.div>

        {/* Accessibility Status */}
        <p id={statusId} className="pass-status" aria-live="polite">
          {status}
        </p>

        {/* Reattach Action */}
        <div data-pass-region="pass-actions">
          <div className="pass-actions">
            {detach >= 1 && (
              <span className="pass-status-pill">
                Ticket Detached (2 Parts)
              </span>
            )}
            <button
              className="pass-reset"
              type="button"
              onClick={() => {
                playPaperSlideSound();
                onReattach();
              }}
              disabled={progress === 0 && detach === 0}
              aria-label="Reattach ticket stub"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 10a9 9 0 1 1 2 8M3 4v6h6" />
              </svg>
              <span>Reattach Ticket</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
