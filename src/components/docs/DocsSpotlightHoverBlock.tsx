"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type SpotlightStyle = "under" | "aside";

const EVENT_NAME = "penquin:spotlight";

function isCoarsePointer() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
}

function readEnabledFromHtml() {
  const html = document.documentElement;
  return html.classList.contains("spotlight");
}

function readStyleFromHtml(): SpotlightStyle {
  const html = document.documentElement;
  if (html.classList.contains("spotlight-under")) return "under";
  return "aside";
}

function findChildElementUnderContentRoot(element: HTMLElement | null, contentRoot: HTMLElement) {
  if (element == null) return null;
  if (element.parentElement === contentRoot) return element
  return findChildElementUnderContentRoot(element.parentElement, contentRoot)
}

function isHighlightableTopLevel(el: HTMLElement) {
  if (el.hasAttribute("data-spotlight-block")) return true;
  if (el.classList.contains("custom-block")) return true;
  const tag = el.tagName;
  if (tag === "SECTION" || tag === "P" || tag === "H1" || tag === "H2" || tag === "H3") return true;
  if (tag === "UL" || tag === "OL" || tag === "LI") return true;
  if (tag === "PRE" || tag === "BLOCKQUOTE" || tag === "IMG" || tag === "HR") return true;
  if (tag === "A" || tag === "BUTTON") return true;
  if (tag === "TABLE") return true;
  return false;
}

function findSpotlightTarget(start: HTMLElement | null, vpDocRoot: HTMLElement, contentRoot: HTMLElement): HTMLElement | null {
  if (!start) return null;
  if (!vpDocRoot.contains(start)) return null;

  const tagged = start.closest<HTMLElement>("[data-spotlight-block]");
  if (tagged && vpDocRoot.contains(tagged)) return tagged;

  // Prefer VitePress-style custom blocks (matches your screenshot).
  const custom = start.closest<HTMLElement>(".custom-block");
  if (custom && vpDocRoot.contains(custom)) return custom;

  // Prefer row-level highlight inside tables.
  const tr = start.closest<HTMLElement>("tr");
  if (tr && vpDocRoot.contains(tr)) {
    const inHead = tr.closest("thead");
    if (!inHead) return tr;
  }

  // Prefer item-level highlight inside lists.
  const li = start.closest<HTMLElement>("li");
  if (li && vpDocRoot.contains(li)) return li;

  // Prefer common block containers.
  const section = start.closest<HTMLElement>("section");
  if (section && vpDocRoot.contains(section) && contentRoot.contains(section)) return section;

  const tableWrap = start.closest<HTMLElement>("div[role='table'], div[data-spotlight-block]");
  if (tableWrap && vpDocRoot.contains(tableWrap)) return tableWrap;

  // Otherwise, highlight a safe top-level block under the content root.
  const top = findChildElementUnderContentRoot(start, contentRoot);
  if (!top) return null;

  // Never highlight wrapper DIVs that contain lots of content.
  if (top.tagName === "DIV" && !top.hasAttribute("data-spotlight-block") && !top.classList.contains("custom-block")) return null;

  return isHighlightableTopLevel(top) ? top : null;
}

function isProbablyWholePage(rect: DOMRect) {
  // Guard against accidentally selecting the entire doc wrapper.
  const vw = typeof window !== "undefined" ? window.innerWidth : 0;
  const vh = typeof window !== "undefined" ? window.innerHeight : 0;
  if (!vw || !vh) return false;
  return rect.width > vw * 0.96 && rect.height > vh * 0.85;
}

function computeBoxStyles(rect: DOMRect) {
  const pad = 4;
  const x = rect.left - pad;
  const y = rect.top - pad;
  return {
    width: `${Math.max(0, rect.width) + pad * 2}px`,
    height: `${Math.max(0, rect.height) + pad * 2}px`,
    transform: `translate3d(${x}px, ${y}px, 0)`,
  } as const;
}

export function DocsSpotlightHoverBlock() {
  const [mounted, setMounted] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [style, setStyle] = useState<SpotlightStyle>("aside");

  type Box = ReturnType<typeof computeBoxStyles> & { opacity: number };
  const [box, setBox] = useState<Box>({
    width: "0px",
    height: "0px",
    transform: "translate3d(0px, 0px, 0)",
    opacity: 0,
  });

  const vpDocRootRef = useRef<HTMLElement | null>(null);
  const contentRootRef = useRef<HTMLElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const className = useMemo(() => {
    const base = "VPNolebaseEnhancedReadabilitiesSpotlightHoverBlock";
    return `${base} ${style === "under" ? `${base}Under` : ""} ${style === "aside" ? `${base}Aside` : ""}`.trim();
  }, [style]);

  useEffect(() => {
    setMounted(true);

    vpDocRootRef.current = document.querySelector<HTMLElement>(".VPDoc main#doc-content") ?? document.querySelector<HTMLElement>("main#doc-content") ?? null;
    // The outer DocsContent wrapper is the first child of #doc-content.
    contentRootRef.current = document.querySelector<HTMLElement>(".VPDoc main#doc-content > div") ?? (vpDocRootRef.current ?? null);

    // Initial sync from current DOM state.
    try {
      setEnabled(readEnabledFromHtml());
      setStyle(readStyleFromHtml());
    } catch {
      // ignore
    }

    // Some routes/layouts can mount this component after Navbar has already
    // applied the spotlight HTML classes; re-check once on the next frame.
    const raf = window.requestAnimationFrame(() => {
      try {
        setEnabled(readEnabledFromHtml());
        setStyle(readStyleFromHtml());
      } catch {
        // ignore
      }
    });

    const onSpotlight = (e: Event) => {
      const ev = e as CustomEvent<{ enabled?: boolean; style?: SpotlightStyle }>;
      if (typeof ev.detail?.enabled === "boolean") setEnabled(ev.detail.enabled);
      if (ev.detail?.style === "under" || ev.detail?.style === "aside") setStyle(ev.detail.style);
    };

    window.addEventListener(EVENT_NAME, onSpotlight as EventListener);
    return () => {
      window.removeEventListener(EVENT_NAME, onSpotlight as EventListener);
      window.cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!enabled) {
      setBox((prev) => ({ ...prev, opacity: 0 }));
      return;
    }
    if (isCoarsePointer()) {
      setBox((prev) => ({ ...prev, opacity: 0 }));
      return;
    }

    const update = () => {
      rafRef.current = null;
      let vpDocRoot = vpDocRootRef.current;
      let contentRoot = contentRootRef.current;
      const point = lastPointRef.current;

      // Docs content can be replaced on navigation; re-query if needed.
      if (!vpDocRoot || !document.documentElement.contains(vpDocRoot)) {
        vpDocRoot = document.querySelector<HTMLElement>(".VPDoc main#doc-content") ?? document.querySelector<HTMLElement>("main#doc-content") ?? null;
        vpDocRootRef.current = vpDocRoot;
      }
      if (!contentRoot || !document.documentElement.contains(contentRoot)) {
        contentRoot = document.querySelector<HTMLElement>(".VPDoc main#doc-content > div") ?? vpDocRoot ?? null;
        contentRootRef.current = contentRoot;
      }

      if (!vpDocRoot || !contentRoot || !point) return;

      // elementFromPoint can return elements from fixed overlays (nav/sidebar).
      // When that happens, temporarily disable their pointer events and re-hit-test.
      let hit: Element | null = document.elementFromPoint(point.x, point.y);
      if (hit instanceof HTMLElement) {
        const overlay = hit.closest<HTMLElement>(".VPNav, .VPSidebar, .VPDocAside");
        if (overlay) {
          const prev = overlay.style.pointerEvents;
          overlay.style.pointerEvents = "none";
          hit = document.elementFromPoint(point.x, point.y);
          overlay.style.pointerEvents = prev;
        }
      }
      const el =
        hit instanceof HTMLElement
          ? hit
          : hit instanceof SVGElement
            ? hit.parentElement
            : null;
      if (!el || !vpDocRoot.contains(el)) {
        setBox((prev) => ({ ...prev, opacity: 0 }));
        return;
      }

      const target = findSpotlightTarget(el, vpDocRoot, contentRoot);
      if (!target) {
        setBox((prev) => ({ ...prev, opacity: 0 }));
        return;
      }

      const rect = target.getBoundingClientRect();
      if (!rect.width || !rect.height) {
        setBox((prev) => ({ ...prev, opacity: 0 }));
        return;
      }

      if (isProbablyWholePage(rect)) {
        setBox((prev) => ({ ...prev, opacity: 0 }));
        return;
      }

      setBox({ ...computeBoxStyles(rect), opacity: 1 });
    };

    const onPointerMove = (e: PointerEvent) => {
      lastPointRef.current = { x: e.clientX, y: e.clientY };
      if (rafRef.current != null) return;
      rafRef.current = window.requestAnimationFrame(update);
    };

    const onScroll = () => {
      // Recompute at the last known pointer position after scroll.
      if (lastPointRef.current == null) return;
      if (rafRef.current != null) return;
      rafRef.current = window.requestAnimationFrame(update);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onScroll, true);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll, true);
      if (rafRef.current != null) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [mounted, enabled]);

  if (!mounted) return null;
  return createPortal(
    <div
      aria-hidden="true"
      className={className}
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 40,
        pointerEvents: "none",
        willChange: "transform, width, height, opacity",
        transition: "transform 420ms cubic-bezier(0.16, 1, 0.3, 1), width 420ms cubic-bezier(0.16, 1, 0.3, 1), height 420ms cubic-bezier(0.16, 1, 0.3, 1), opacity 160ms ease-out, border-radius 420ms cubic-bezier(0.16, 1, 0.3, 1)",
        borderRadius: "0.5rem", // rounded-lg equivalent
        ...box,
      }}
    />,
    document.body
  );
}
