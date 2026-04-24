"use client";

import React, { useEffect, useRef } from "react";

function isCoarsePointer() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
}

export function TakodachiFollower({ enabled }: { enabled: boolean }) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const targetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const currentRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const visibleRef = useRef<boolean>(false);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    // Reset when toggled off.
    if (!enabled || isCoarsePointer()) {
      img.style.opacity = "0";
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    // Constant slow speed - pixels per second (time-based for consistent speed)
    const speed = 150; // 140 pixels per second (slightly faster but still slow)
    const offsetX = 12;
    const offsetY = 12;

    const animate = (timestamp: number) => {
      // Calculate delta time in seconds
      const deltaTime = lastTimeRef.current ? (timestamp - lastTimeRef.current) / 1000 : 0;
      lastTimeRef.current = timestamp;

      const targetX = targetRef.current.x + offsetX;
      const targetY = targetRef.current.y + offsetY;

      // Calculate distance to target
      const dx = targetX - currentRef.current.x;
      const dy = targetY - currentRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Move at constant speed based on time, not frames
      if (distance > 0.5 && deltaTime > 0) {
        // Calculate how far to move this frame based on time
        const moveDistance = Math.min(distance, speed * deltaTime);
        const ratio = moveDistance / distance;

        currentRef.current.x += dx * ratio;
        currentRef.current.y += dy * ratio;
      }

      // Update DOM
      if (visibleRef.current) {
        img.style.opacity = "1";
        img.style.left = `${Math.round(currentRef.current.x)}px`;
        img.style.top = `${Math.round(currentRef.current.y)}px`;
      }

      // Continue animation loop
      rafRef.current = window.requestAnimationFrame(animate);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!visibleRef.current) {
        currentRef.current = { x: e.clientX + offsetX, y: e.clientY + offsetY };
      }
      targetRef.current = { x: e.clientX, y: e.clientY };
      visibleRef.current = true;

      // Start animation loop if not already running
      if (rafRef.current === null) {
        lastTimeRef.current = 0;
        rafRef.current = window.requestAnimationFrame(animate);
      }
    };

    const onPointerLeave = () => {
      visibleRef.current = false;
      img.style.opacity = "0";
    };

    // Start the animation loop
    rafRef.current = window.requestAnimationFrame(animate);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("blur", onPointerLeave);
    window.addEventListener("pointerleave", onPointerLeave);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("blur", onPointerLeave);
      window.removeEventListener("pointerleave", onPointerLeave);
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [enabled]);

  return (
    <img
      ref={imgRef}
      id="takodachi"
      src="/v2/PFPs/Transparent/1.png"
      alt="Takodachi"
      aria-hidden="true"
      className="pointer-events-none fixed z-[9999] h-16 w-16 opacity-0 transition-opacity duration-500"
      style={{
        left: "-100px",
        top: "-100px",
      }}
      decoding="async"
      loading="eager"
    />
  );
}
