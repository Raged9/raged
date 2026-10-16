"use client";

import { useEffect, useRef, useState } from "react";

export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const planeRef = useRef<HTMLDivElement>(null);
  const trailsRef = useRef<(HTMLDivElement | null)[]>([]);

  const TRAIL_COUNT = 5;
  const targetPos = useRef({ x: -100, y: -100 });
  const currentPos = useRef({ x: -100, y: -100 });
  const lastMovePos = useRef({ x: -100, y: -100 });

  // Default angle (-45deg = pointing up-right in sticker stance)
  const currentAngle = useRef(-45);
  const targetAngle = useRef(-45);
  const isClicking = useRef(false);
  const isMoving = useRef(false);
  const idleTimer = useRef<NodeJS.Timeout | null>(null);

  const trail = useRef<{ x: number; y: number }[]>(
    Array.from({ length: TRAIL_COUNT }, () => ({ x: -100, y: -100 }))
  );
  const rafRef = useRef<number>(0);

  useEffect(() => {
    // Only enable custom cursor on devices with a fine pointer (mouse / trackpad)
    const mq = window.matchMedia("(pointer: fine)");
    setEnabled(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setEnabled(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const onMove = (e: MouseEvent) => {
      targetPos.current = { x: e.clientX, y: e.clientY };

      const dx = targetPos.current.x - lastMovePos.current.x;
      const dy = targetPos.current.y - lastMovePos.current.y;
      const dist = Math.hypot(dx, dy);

      // Only calculate heading angle if movement is noticeable (avoids micro-jitter)
      if (dist > 2) {
        targetAngle.current = Math.atan2(dy, dx) * (180 / Math.PI);
        lastMovePos.current = { x: targetPos.current.x, y: targetPos.current.y };
        isMoving.current = true;

        if (idleTimer.current) clearTimeout(idleTimer.current);
        idleTimer.current = setTimeout(() => {
          isMoving.current = false;
        }, 150);
      }
    };

    const onMouseDown = () => {
      isClicking.current = true;
    };

    const onMouseUp = () => {
      isClicking.current = false;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);

    const animate = () => {
      // 1. Responsive cursor positioning (direct tracking for zero click latency)
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * 0.88;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * 0.88;

      // 2. Shortest-arc smooth angle rotation
      let diff = targetAngle.current - currentAngle.current;
      while (diff > 180) diff -= 360;
      while (diff < -180) diff += 360;
      currentAngle.current += diff * 0.24;

      // 3. Render Paper Airplane Sticker
      // Transform origin at nose (36px, 16px) ensures the nose is ALWAYS at cursor position (x, y)
      if (planeRef.current) {
        const scale = isClicking.current ? 0.86 : 1.0;
        planeRef.current.style.transform = `translate(${currentPos.current.x - 36}px, ${
          currentPos.current.y - 16
        }px) rotate(${currentAngle.current}deg) scale(${scale})`;
      }

      // 4. Calculate airplane tail position (24px behind nose along heading)
      const rad = (currentAngle.current * Math.PI) / 180;
      const tailX = currentPos.current.x - Math.cos(rad) * 24;
      const tailY = currentPos.current.y - Math.sin(rad) * 24;

      // 5. Shift trailing wind-slip dots
      trail.current[0].x += (tailX - trail.current[0].x) * 0.45;
      trail.current[0].y += (tailY - trail.current[0].y) * 0.45;
      for (let i = TRAIL_COUNT - 1; i > 0; i--) {
        trail.current[i].x += (trail.current[i - 1].x - trail.current[i].x) * 0.38;
        trail.current[i].y += (trail.current[i - 1].y - trail.current[i].y) * 0.38;
      }

      trailsRef.current.forEach((el, i) => {
        if (!el) return;
        el.style.transform = `translate(${trail.current[i].x - 2}px, ${trail.current[i].y - 2}px)`;
        // Fade out trail when not actively moving
        el.style.opacity = isMoving.current
          ? String(Math.max(0, 0.4 - i * 0.08))
          : String(Math.max(0, 0.15 - i * 0.05));
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      cancelAnimationFrame(rafRef.current);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      {/* Flight trail dots behind tail */}
      {Array.from({ length: TRAIL_COUNT }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            trailsRef.current[i] = el;
          }}
          className="fixed top-0 left-0 z-[9998] pointer-events-none rounded-full bg-[#302f2d]"
          style={{
            width: `${Math.max(2, 4.5 - i * 0.7)}px`,
            height: `${Math.max(2, 4.5 - i * 0.7)}px`,
            willChange: "transform, opacity",
            transition: "opacity 0.2s ease-out",
          }}
        />
      ))}

      {/* 3D Paper Airplane Sticker Cursor */}
      <div
        ref={planeRef}
        className="fixed top-0 left-0 z-[9999] pointer-events-none select-none"
        style={{
          width: "40px",
          height: "32px",
          transformOrigin: "36px 16px",
          willChange: "transform",
          filter:
            "drop-shadow(0 3px 6px rgba(0,0,0,0.20)) drop-shadow(0 1px 2px rgba(0,0,0,0.14))",
        }}
      >
        <svg
          width="40"
          height="32"
          viewBox="0 0 40 32"
          className="block overflow-visible"
        >
          {/* 1. White die-cut sticker backing (Timbul Sticker Effect) */}
          <path
            d="M 36 16 L 4 4 L 12 16 L 6 22 L 14 18 L 8 28 Z"
            fill="#FFFFFF"
            stroke="#FFFFFF"
            strokeWidth="5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* 2. Keel under-fold (Shaded fold facet) */}
          <polygon
            points="12,16 6,22 14,18"
            fill="#DDD6C9"
            stroke="#1E1E1E"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* 3. Top Wing (Light cream-gray shaded facet) */}
          <polygon
            points="36,16 4,4 12,16"
            fill="#F5F3EC"
            stroke="#1E1E1E"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* 4. Bottom Wing (Bright crisp white facet) */}
          <polygon
            points="36,16 12,16 8,28"
            fill="#FFFFFF"
            stroke="#1E1E1E"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* 5. Center crease spine line */}
          <line
            x1="36"
            y1="16"
            x2="12"
            y2="16"
            stroke="#1E1E1E"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </>
  );
}
