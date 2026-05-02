"use client";

import React, { startTransition, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { Search, Moon, Sun, ChevronDown, Minus, Plus, TextAlignStart, Maximize, Maximize2, Layout, Shrink, HelpCircle, MousePointer2, AlignLeft, AlignLeftIcon, Columns, Square, PanelLeft, PanelBottom, Airplay, ArrowLeftRight, Zap } from "lucide-react";
import { FaDiscord, FaGithub } from "react-icons/fa";
import { PiGear } from "react-icons/pi";
import { motion, AnimatePresence } from "motion/react";

import { SearchModal } from "@/components/SearchModal";
import { TakodachiFollower } from "@/components/TakodachiFollower";
import { button } from "framer-motion/client";

const ElasticSlider = dynamic(() => import("@/components/ui/ElasticSlider"), { ssr: false });

interface NavbarProps {
  onDocsMenuClick?: () => void;
}

type LayoutMode = "original" | "expandAll" | "expandSidebar" | "expandAllAdjustable";
type SpotlightStyle = "under" | "aside";
type Appearance = "auto" | "light" | "dark";

const LS = {
  appearance: "vitepress-theme-appearance",
  legacyTheme: "wotaku-theme",

  layoutMode: "vitepress-nolebase-enhanced-readabilities-layout-switch-mode",
  spotlightMode: "vitepress-nolebase-enhanced-readabilities-spotlight-mode",
  spotlightStyles: "vitepress-nolebase-enhanced-readabilities-spotlight-styles",
  pageMaxWidth: "vitepress-nolebase-enhanced-readabilities-page-layout-max-width",
  contentMaxWidth: "vitepress-nolebase-enhanced-readabilities-content-layout-max-width",
  docsContentMaxWidth: "penquin-docs-content-max-width",
  takodachi: "preference-takodachi",

  // Legacy app keys
  legacyLayoutMode: "penquin-layout-mode",
  legacySpotlight: "penquin-spotlight",
  legacyNavWidth: "penquin-nav-width",
  legacyContentWidth: "penquin-content-width",
  legacyDocsContentWidth: "penquin-docs-content-width",
} as const;

function parseLayoutMode(raw: string | null): LayoutMode | null {
  if (!raw) return null;
  if (raw === "1") return "expandAll";
  if (raw === "3") return "original";
  if (raw === "4") return "expandSidebar";
  if (raw === "5") return "expandAllAdjustable";
  if (raw === "original" || raw === "expandAll" || raw === "expandSidebar" || raw === "expandAllAdjustable") return raw;
  return null;
}

function layoutModeToWotakuValue(mode: LayoutMode): "1" | "3" | "4" | "5" {
  if (mode === "expandAll") return "1";
  if (mode === "expandSidebar") return "4";
  if (mode === "expandAllAdjustable") return "5";
  return "3";
}

function readAppearance(): Appearance {
  const storedAppearance = localStorage.getItem(LS.appearance);
  if (storedAppearance === "auto" || storedAppearance === "light" || storedAppearance === "dark") return storedAppearance;

  const legacyTheme = localStorage.getItem(LS.legacyTheme);
  if (legacyTheme === "light" || legacyTheme === "dark") return legacyTheme;

  return "auto";
}

function effectiveIsDark(appearance: Appearance): boolean {
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const effective = appearance === "auto" ? (prefersDark ? "dark" : "light") : appearance;
  return effective === "dark";
}

export const Navbar = ({ onDocsMenuClick }: NavbarProps) => {
  const pathname = usePathname() || "/";
  // Most of the site content is rendered through the docs shell.
  // Treat any non-home route as "docs" for layout settings.
  const isDocs = pathname !== "/" && !pathname.startsWith("/api");

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isTakodachiHelpOpen, setIsTakodachiHelpOpen] = useState(false);

  const [isDark, setIsDark] = useState(false);
  const [currentLayoutMode, setCurrentLayoutMode] = useState<LayoutMode>("expandAll");
  const [isSpotlightOn, setIsSpotlightOn] = useState(false);
  const [spotlightStyle, setSpotlightStyle] = useState<SpotlightStyle>("aside");
  const [isTakodachiOn, setIsTakodachiOn] = useState(false);
  const [pageMaxWidth, setPageMaxWidth] = useState(1200);
  const [contentWidth, setContentWidth] = useState(1152);
  const [docsContentWidth, setDocsContentWidth] = useState(756);

  // Pending states for settings (only applied when popup closes)
  const [pendingLayoutMode, setPendingLayoutMode] = useState<LayoutMode>("expandAll");
  const [pendingSpotlightOn, setPendingSpotlightOn] = useState(false);
  const [pendingSpotlightStyle, setPendingSpotlightStyle] = useState<SpotlightStyle>("aside");
  const [pendingTakodachiOn, setPendingTakodachiOn] = useState(false);
  const [pendingPageMaxWidth, setPendingPageMaxWidth] = useState(1200);
  const [pendingContentWidth, setPendingContentWidth] = useState(1152);
  const [pendingDocsContentWidth, setPendingDocsContentWidth] = useState(756);

  // Hydration-safe initialization: load from localStorage after mount
  useEffect(() => {
    try {
      setIsDark(effectiveIsDark(readAppearance()));
      setCurrentLayoutMode(parseLayoutMode(localStorage.getItem(LS.layoutMode) ?? localStorage.getItem(LS.legacyLayoutMode)) ?? "expandAll");

      // Spotlight should start OFF on fresh loads (even if previously enabled).
      // Users can re-enable it from the navbar settings.
      setIsSpotlightOn(false);
      setSpotlightStyle(localStorage.getItem(LS.spotlightStyles) === "1" ? "under" : "aside");

      // Takodachi should start OFF on fresh loads (even if previously enabled).
      setIsTakodachiOn(false);

      const pageMax = localStorage.getItem(LS.pageMaxWidth) ?? localStorage.getItem(LS.legacyNavWidth);
      if (pageMax) setPageMaxWidth(Math.min(1200, Math.max(600, parseInt(pageMax) || 1200)));

      const contWidth = localStorage.getItem(LS.contentMaxWidth) ?? localStorage.getItem(LS.legacyContentWidth);
      if (contWidth) setContentWidth(Math.min(1200, Math.max(600, parseInt(contWidth) || 1152)));

      const docsContWidth =
        localStorage.getItem(LS.docsContentMaxWidth) ??
        // Older builds stored docs width in contentMaxWidth.
        localStorage.getItem(LS.contentMaxWidth) ??
        localStorage.getItem(LS.legacyDocsContentWidth);
      if (docsContWidth) setDocsContentWidth(Math.min(1200, Math.max(600, parseInt(docsContWidth) || 756)));

      setIsMounted(true);
    } catch (e) {
      console.error("Failed to load settings from localStorage", e);
      setIsMounted(true);
    }
  }, []);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const effectiveDocsContentWidth =
    currentLayoutMode === "expandAll" ? 1200 :
      currentLayoutMode === "original" ? 756 :
        docsContentWidth;

  const effectiveContentWidth =
    currentLayoutMode === "expandAll" ? 1200 :
      currentLayoutMode === "original" ? 1200 :
        contentWidth;

  const effectiveNavMaxWidth = isDocs
    ? "100%"
    : (currentLayoutMode === "expandAll" || currentLayoutMode === "expandSidebar")
      ? "100%"
      : currentLayoutMode === "original"
        ? "1200px"
        : `${pageMaxWidth}px`;

  // Apply theme class whenever it changes.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  // Apply spotlight classes immediately.
  useEffect(() => {
    document.documentElement.classList.toggle("spotlight", isSpotlightOn);
    document.documentElement.classList.toggle("spotlight-under", isSpotlightOn && spotlightStyle === "under");
    document.documentElement.classList.toggle("spotlight-aside", isSpotlightOn && spotlightStyle === "aside");

    // Let docs-only UI (hover block) react immediately.
    window.dispatchEvent(
      new CustomEvent("penquin:spotlight", {
        detail: {
          enabled: isSpotlightOn,
          style: spotlightStyle,
        },
      })
    );
  }, [isSpotlightOn, spotlightStyle]);

  // Spotlight pointer tracking (for background effect)
  useEffect(() => {
    if (!isSpotlightOn) return;
    const onMove = (e: PointerEvent) => {
      document.documentElement.style.setProperty("--app-spotlight-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--app-spotlight-y", `${e.clientY}px`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [isSpotlightOn]);

  // Apply content width based on page type.
  useEffect(() => {
    const v = isDocs ? effectiveDocsContentWidth : effectiveContentWidth;
    document.documentElement.style.setProperty("--content-max-width", `${v}px`);
  }, [isDocs, effectiveDocsContentWidth, effectiveContentWidth]);

  // Persist settings changes.
  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem(LS.layoutMode, layoutModeToWotakuValue(currentLayoutMode));
    localStorage.setItem(LS.spotlightMode, isSpotlightOn ? "true" : "false");
    localStorage.setItem(LS.spotlightStyles, spotlightStyle === "under" ? "1" : "2");
    localStorage.setItem(LS.takodachi, isTakodachiOn ? "true" : "false");

    localStorage.setItem(LS.pageMaxWidth, String(pageMaxWidth));
    // Persist the raw slider values so switching layout modes doesn't destroy preferences.
    localStorage.setItem(LS.contentMaxWidth, String(contentWidth));
    localStorage.setItem(LS.docsContentMaxWidth, String(docsContentWidth));

    // Keep legacy keys for now.
    localStorage.setItem(LS.legacyLayoutMode, currentLayoutMode);
    localStorage.setItem(LS.legacySpotlight, isSpotlightOn ? "on" : "off");
    localStorage.setItem(LS.legacyNavWidth, String(pageMaxWidth));
    localStorage.setItem(LS.legacyContentWidth, String(contentWidth));
    localStorage.setItem(LS.legacyDocsContentWidth, String(docsContentWidth));
  }, [currentLayoutMode, isSpotlightOn, spotlightStyle, isTakodachiOn, pageMaxWidth, contentWidth, docsContentWidth, isDocs, effectiveDocsContentWidth, effectiveContentWidth]);

  const toggleTheme = () => {
    const nextAppearance: Exclude<Appearance, "auto"> = isDark ? "light" : "dark";
    setIsDark(nextAppearance === "dark");
    localStorage.setItem(LS.appearance, nextAppearance);
    localStorage.setItem(LS.legacyTheme, nextAppearance);
  };

  const applySettings = () => {
    // These settings change layout measurements; keep updates batched/low-priority
    // so the resulting CSS transitions feel smooth instead of jumpy.
    startTransition(() => {
      setCurrentLayoutMode(pendingLayoutMode);
      setIsSpotlightOn(pendingSpotlightOn);
      setSpotlightStyle(pendingSpotlightStyle);
      setIsTakodachiOn(pendingTakodachiOn);
      setPageMaxWidth(pendingPageMaxWidth);
      setContentWidth(pendingContentWidth);
      setDocsContentWidth(pendingDocsContentWidth);
    });
  };

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      if (!isSettingsOpen) {
        setPendingLayoutMode(currentLayoutMode);
        setPendingSpotlightOn(isSpotlightOn);
        setPendingSpotlightStyle(spotlightStyle);
        setPendingTakodachiOn(isTakodachiOn);
        setPendingPageMaxWidth(pageMaxWidth);
        setPendingContentWidth(contentWidth);
        setPendingDocsContentWidth(docsContentWidth);
        setIsSettingsOpen(true);
      }
    }, 250);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      if (isSettingsOpen) {
        applySettings();
        setIsSettingsOpen(false);
        setIsTakodachiHelpOpen(false);
      }
    }, 300);
  };

  // Global Ctrl K search
  useEffect(() => {
    const handleGlobalK = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleGlobalK);
    return () => window.removeEventListener("keydown", handleGlobalK);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (isSettingsOpen) {
          applySettings();
        }
        setIsSettingsOpen(false);
        setIsTakodachiHelpOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSettingsOpen, pendingLayoutMode, pendingSpotlightOn, pendingSpotlightStyle, pendingTakodachiOn, pendingPageMaxWidth, pendingContentWidth, pendingDocsContentWidth]);

  return (
    <>
      {isMounted && <TakodachiFollower enabled={isTakodachiOn} />}

      <header className="VPNav fixed top-0 left-0 right-0 z-[60] w-full transition-all duration-[460ms]">
        <div
          className={`VPNavBar h-[64px] flex items-center justify-between mx-auto ${isDocs ? "px-6" : "px-4 sm:px-8"}`}
          style={{
            maxWidth: isMounted ? effectiveNavMaxWidth : (isDocs ? "100%" : "1920px"),
            transition: "max-width 700ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div className="flex items-center h-full">
            {!!onDocsMenuClick && (
              <button
                type="button"
                aria-label="Toggle docs sidebar"
                onClick={onDocsMenuClick}
                className={`ml-2 mr-0 p-[6px] rounded-[10px] transition-colors ${isDocs ? "lg:hidden" : ""}`}
              >
                <TextAlignStart
                  className="cursor-pointer w-[20px] h-[20px] text-[var(--vp-c-text-2)] hover:text-[var(--vp-c-text-1)] transition duration-300 ease-in-out"
                  strokeWidth={2.5}
                />
              </button>
            )}

            <Link
              href="/"
              className={`flex items-center gap-2 -ml-1 mr-1 sm:mr-2 group cursor-pointer text-[var(--vp-c-text-1)] h-full transition-colors ${isDocs ? "lg:hidden" : ""}`}
            >
              <img className="w-10 h-10" src="/v2/PFPs/Transparent/2.png" alt="Logo" />
              <span className="font-bold text-[18px] tracking-tight hidden sm:block">Penquin</span>
            </Link>

            <div className={`transition-all duration-[460ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${isDocs ? "lg:pl-[320px]" : ""}`}>
              <button
                type="button"
                aria-label="Search"
                aria-keyshortcuts="/ control+k meta+k"
                onClick={() => setIsSearchOpen(true)}
                className={`DocSearch DocSearch-Button ${isDocs ? "w-10 sm:w-[160px]" : "w-10 sm:w-[150px]"}`}
              >
                <span className="DocSearch-Button-Container">
                  <Search
                    className="lucide lucide-search-icon lucide-search inline -translate-y-0.25 scale-125 sm:scale-100"
                    strokeWidth={1.375}
                    width={15}
                    height={15}
                  />
                  <span className="DocSearch-Button-Placeholder">Search</span>
                </span>
                <span className="DocSearch-Button-Keys" aria-hidden>
                  <kbd className="DocSearch-Button-Key">Ctrl K</kbd>
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end text-[var(--vp-c-text-2)]">
            <div className="flex items-center gap-0.5 px-2 py-1 rounded-3xl bg-[var(--vp-c-bg-soft)]/50">
              <button
                onClick={toggleTheme}
                className="hover:text-[var(--vp-c-text-1)] transition-colors p-[6px]"
                aria-label={isMounted ? (isDark ? "Switch to light theme" : "Switch to dark theme") : "Toggle theme"}
              >
                {isMounted && (isDark ? <Sun className="w-[20px] h-[20px]" strokeWidth={2} /> : <Moon className="w-[20px] h-[20px]" strokeWidth={2} />)}
                {!isMounted && <Sun className="w-[20px] h-[20px]" strokeWidth={2} />}
              </button>

              <a
                href="https://github.com/xibhi/penquin"
                className="hover:text-[var(--vp-c-text-1)] transition-colors p-[6px] hidden sm:flex items-center justify-center"
                aria-label="GitHub"
              >
                <FaGithub className="w-[20px] h-[20px]" />
              </a>
              <a
                href="https://discord.gg/2VPHHpf3Ds"
                className="hover:text-[var(--vp-c-text-1)] transition-colors p-[6px] hidden sm:flex items-center justify-center"
                aria-label="Discord"
              >
                <FaDiscord className="w-[20px] h-[20px]" />
              </a>

              <div
                className="relative"
                ref={dropdownRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  className="flex items-center hover:text-[var(--vp-c-text-1)] transition-colors p-[6px] cursor-pointer rounded-full hover:bg-[var(--vp-c-bg-soft)]"
                  aria-label="Enhanced Readability"
                  onClick={() => {
                    if (isSettingsOpen) {
                      applySettings();
                      setIsSettingsOpen(false);
                    } else {
                      // Sync pending state with current when opening
                      setPendingLayoutMode(currentLayoutMode);
                      setPendingSpotlightOn(isSpotlightOn);
                      setPendingSpotlightStyle(spotlightStyle);
                      setPendingTakodachiOn(isTakodachiOn);
                      setPendingPageMaxWidth(pageMaxWidth);
                      setPendingContentWidth(contentWidth);
                      setPendingDocsContentWidth(docsContentWidth);
                      setIsSettingsOpen(true);
                    }
                  }}
                >
                  <PiGear className="w-[22px] h-[22px]" strokeWidth={3} />
                  <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" strokeWidth={3} />
                </button>

                <AnimatePresence>
                  {isSettingsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute right-0 top-full mt-2 w-[320px] max-w-[calc(100vw-24px)] max-h-[85vh] overflow-y-auto bg-[var(--vp-c-bg-elv)] border border-[var(--vp-c-divider)] rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] overflow-hidden p-5 z-50"
                    >
                      <div className="flex flex-col gap-6">
                        {/* Layout Switch */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="flex items-center gap-2 text-[15px] font-bold text-[var(--vp-c-text-1)]">
                              <Layout className="w-5 h-5 opacity-80" />
                              Layout Switch
                            </h3>
                            <HelpCircle className="w-[14px] h-[14px] opacity-40 hover:opacity-100 transition-opacity cursor-help" />
                          </div>
                          <div className="relative grid grid-cols-4 gap-1.5">
                            {[
                              { id: "expandAll", icon: Maximize, title: "Expand all" },
                              { id: "expandSidebar", icon: Layout, title: "Expand sidebar" },
                              { id: "expandAllAdjustable", icon: Maximize2, title: "Expand all adjustable" },
                              { id: "original", icon: Shrink, title: "Original width" },
                            ].map((item) => (
                              <button
                                key={item.id}
                                title={item.title}
                                className={`relative flex items-center justify-center h-11 rounded-xl transition-colors duration-200 z-10 ${pendingLayoutMode === item.id ? "text-black" : "text-[#9ca3af] hover:text-[var(--vp-c-text-1)]"}`}
                                onClick={() => setPendingLayoutMode(item.id as LayoutMode)}
                              >
                                {pendingLayoutMode === item.id && (
                                  <motion.div
                                    layoutId="layout-active"
                                    className="absolute inset-0 bg-[#eeeee9] shadow-[0_2px_10px_rgba(0,0,0,0.1)] rounded-xl"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                  />
                                )}
                                <item.icon className="w-5 h-5 relative z-20" />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Content Max Width */}
                        <AnimatePresence>
                          {(pendingLayoutMode === "expandSidebar" || pendingLayoutMode === "expandAllAdjustable") && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="space-y-3 overflow-hidden"
                            >
                              <div className="flex items-center justify-between">
                                <h3 className="flex items-center gap-2 text-[15px] font-bold text-[var(--vp-c-text-1)]">
                                  <ArrowLeftRight className="w-5 h-5 opacity-80" />
                                  Page Layout Max Width
                                </h3>
                                <HelpCircle className="w-[14px] h-[14px] opacity-40 hover:opacity-100 transition-opacity cursor-help" />
                              </div>
                              <div className="max-w-[260px] mx-auto w-full">
                                <ElasticSlider
                                  defaultValue={isDocs ? pendingDocsContentWidth : pendingContentWidth}
                                  startingValue={600}
                                  maxValue={1200}
                                  isStepped={true}
                                  stepSize={50}
                                  onValueChange={(v) => (isDocs ? setPendingDocsContentWidth(v) : setPendingContentWidth(v))}
                                  onValueCommit={(v) => (isDocs ? setPendingDocsContentWidth(v) : setPendingContentWidth(v))}
                                />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Page Max Width - only show when relevant */}
                        <AnimatePresence>
                          {(!isDocs && pendingLayoutMode === "expandAllAdjustable") && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="space-y-3 overflow-hidden"
                            >
                              <div className="flex items-center justify-between">
                                <h3 className="flex items-center gap-2 text-[15px] font-bold text-[var(--vp-c-text-1)]">
                                  <ArrowLeftRight className="w-5 h-5 opacity-80" />
                                  Navbar Width
                                </h3>
                                <span className="text-[11px] font-mono text-[var(--vp-c-text-3)]">{pendingPageMaxWidth}px</span>
                              </div>
                              <div className="max-w-[260px] mx-auto w-full">
                                <ElasticSlider
                                  defaultValue={pendingPageMaxWidth}
                                  startingValue={600}
                                  maxValue={1980}
                                  isStepped={true}
                                  stepSize={50}
                                  onValueChange={setPendingPageMaxWidth}
                                  onValueCommit={setPendingPageMaxWidth}
                                />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>


                        {/* Spotlight */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="flex items-center gap-2 text-[15px] font-bold text-[var(--vp-c-text-1)]">
                              <MousePointer2 className="w-5 h-5 opacity-80" />
                              Spotlight
                            </h3>
                            <HelpCircle className="w-[14px] h-[14px] opacity-40 hover:opacity-100 transition-opacity cursor-help" />
                          </div>
                          <div className="relative flex gap-1.5">
                            {[
                              { id: true, label: "ON" },
                              { id: false, label: "OFF" },
                            ].map((item) => (
                              <button
                                key={String(item.id)}
                                className={`relative flex-1 flex items-center justify-center h-11 rounded-xl text-[13px] font-bold transition-colors duration-200 z-10 ${pendingSpotlightOn === item.id ? "text-black" : "text-[#9ca3af] hover:text-[var(--vp-c-text-1)]"}`}
                                onClick={() => setPendingSpotlightOn(item.id)}
                              >
                                {pendingSpotlightOn === item.id && (
                                  <motion.div
                                    layoutId="spotlight-active"
                                    className="absolute inset-0 bg-[#eeeee9] shadow-[0_2px_10px_rgba(0,0,0,0.1)] rounded-xl"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                  />
                                )}
                                <span className="relative z-20">{item.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Spotlight Styles */}
                        <AnimatePresence>
                          {pendingSpotlightOn && (
                            <motion.div
                              initial={{ opacity: 0, height: 0, marginTop: -10 }}
                              animate={{ opacity: 1, height: "auto", marginTop: 0 }}
                              exit={{ opacity: 0, height: 0, marginTop: -10 }}
                              transition={{ duration: 0.2 }}
                              className="space-y-3 overflow-hidden"
                            >
                              <div className="flex items-center justify-between">
                                <h3 className="flex items-center gap-2 text-[15px] font-bold text-[var(--vp-c-text-1)]">
                                  <Zap className="w-5 h-5 opacity-80" />
                                  Spotlight Styles
                                </h3>
                                <HelpCircle className="w-[14px] h-[14px] opacity-40 hover:opacity-100 transition-opacity cursor-help" />
                              </div>
                              <div className="relative flex gap-1.5">
                                {[
                                  { id: "under", icon: PanelBottom, title: "Under" },
                                  { id: "aside", icon: PanelLeft, title: "Aside" },
                                ].map((item) => (
                                  <button
                                    key={item.id}
                                    title={item.title}
                                    className={`relative flex-1 flex items-center justify-center h-11 rounded-xl transition-colors duration-200 z-10 ${pendingSpotlightStyle === item.id ? "text-black" : "text-[#9ca3af] hover:text-[var(--vp-c-text-1)]"}`}
                                    onClick={() => setPendingSpotlightStyle(item.id as SpotlightStyle)}
                                  >
                                    {pendingSpotlightStyle === item.id && (
                                      <motion.div
                                        layoutId="style-active"
                                        className="absolute inset-0 bg-[#eeeee9] shadow-[0_2px_10px_rgba(0,0,0,0.1)] rounded-xl"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                      />
                                    )}
                                    <item.icon className="w-5 h-5 relative z-20" />
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Takodachi */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="flex items-center gap-2 text-[15px] font-bold text-[var(--vp-c-text-1)]">
                              <img src="/v2/PFPs/Transparent/1.png" alt="Takodachi" className="w-5 h-5" aria-hidden="true" />
                              Takodachi
                            </h3>
                            <div className="relative">
                              <button
                                type="button"
                                aria-label="Takodachi help"
                                aria-expanded={isTakodachiHelpOpen}
                                onClick={() => setIsTakodachiHelpOpen((v) => !v)}
                                className="p-1 rounded-md hover:bg-[var(--vp-c-divider)]/10"
                              >
                                <HelpCircle className="w-[14px] h-[14px] opacity-40 hover:opacity-100 transition-opacity cursor-help" />
                              </button>
                              {isTakodachiHelpOpen && (
                                <div
                                  role="dialog"
                                  aria-label="Takodachi help"
                                  className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-[var(--vp-c-divider)] bg-[var(--vp-c-bg-elv)] shadow-xl p-3 z-50"
                                >
                                  <div className="text-[14px] font-bold text-[var(--vp-c-text-1)]">Takodachi</div>
                                  <div className="mt-1 text-[12.5px] leading-5 text-[var(--vp-c-text-2)]">
                                    Gives you a cool takodachi following your cursor.
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div
                            className={`relative flex gap-1.5 ${isTakodachiHelpOpen ? "ring-2 ring-[var(--vp-c-brand-1)]/25 rounded-xl" : ""}`}
                          >
                            {[
                              { id: true, label: "ON" },
                              { id: false, label: "OFF" },
                            ].map((item) => (
                              <button
                                key={String(item.id)}
                                className={`relative flex-1 flex items-center justify-center h-11 rounded-xl text-[13px] font-bold transition-colors duration-200 z-10 ${pendingTakodachiOn === item.id ? "text-black" : "text-[#9ca3af] hover:text-[var(--vp-c-text-1)]"}`}
                                onClick={() => setPendingTakodachiOn(item.id)}
                              >
                                {pendingTakodachiOn === item.id && (
                                  <motion.div
                                    layoutId="takodachi-active"
                                    className="absolute inset-0 bg-[#eeeee9] shadow-[0_2px_10px_rgba(0,0,0,0.1)] rounded-xl"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                  />
                                )}
                                <span className="relative z-20">{item.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>


                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      </header>
    </>
  );
};
