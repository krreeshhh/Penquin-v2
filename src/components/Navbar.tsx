"use client";

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Search, Moon, Sun, Settings, ChevronDown, Menu, Minus, Plus, TextAlignStart } from 'lucide-react';
import dynamic from 'next/dynamic';
import { FaGithub, FaDiscord } from "react-icons/fa";
import { PiGear } from "react-icons/pi";
import { GoGear } from "react-icons/go";


const ElasticSlider = dynamic(() => import("@/components/ui/ElasticSlider"), { ssr: false });
import { SearchModal } from "@/components/SearchModal";

interface NavbarProps {
  onDocsMenuClick?: () => void;
}

export const Navbar = ({ onDocsMenuClick }: NavbarProps) => {
  const pathname = usePathname() || '/';
  const isDocs = pathname.startsWith('/docs');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  // Navbar & Content widths (persist with localStorage)
  const [navbarWidth, setNavbarWidth] = useState(1920);
  const [contentWidth, setContentWidth] = useState(1152);
  const [docsContentWidth, setDocsContentWidth] = useState(756);
  const [pendingNavbarWidth, setPendingNavbarWidth] = useState(1920);
  const [pendingContentWidth, setPendingContentWidth] = useState(1152);
  const [pendingDocsContentWidth, setPendingDocsContentWidth] = useState(756);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Hydrate from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('penquin-theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme ? savedTheme === 'dark' : prefersDark;
    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle('dark', shouldBeDark);

    const savedNav = localStorage.getItem('penquin-nav-width');
    const savedContent = localStorage.getItem('penquin-content-width');
    const savedDocsContent = localStorage.getItem('penquin-docs-content-width');

    if (savedNav) {
      const v = parseInt(savedNav);
      setNavbarWidth(v);
      setPendingNavbarWidth(v);
    }

    if (isDocs) {
      if (savedDocsContent) {
        const v = parseInt(savedDocsContent);
        setDocsContentWidth(v);
        setPendingDocsContentWidth(v);
        document.documentElement.style.setProperty('--content-max-width', `${v}px`);
      } else {
        document.documentElement.style.setProperty('--content-max-width', `${docsContentWidth}px`);
      }
    } else {
      if (savedContent) {
        const v = parseInt(savedContent);
        setContentWidth(v);
        setPendingContentWidth(v);
        document.documentElement.style.setProperty('--content-max-width', `${v}px`);
      } else {
        document.documentElement.style.setProperty('--content-max-width', `${contentWidth}px`);
      }
    }
  }, [isDocs]);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem('penquin-theme', next ? 'dark' : 'light');
      return next;
    });
  };

  // Update widths in real-time
  // Update widths only when popup closes
  const handleNavbarWidthChange = (v: number) => {
    setPendingNavbarWidth(v);
  };

  const handleContentWidthChange = (v: number) => {
    if (isDocs) {
      setPendingDocsContentWidth(v);
    } else {
      setPendingContentWidth(v);
    }
  };

  // Sync changes when settings closes
  useEffect(() => {
    if (!isSettingsOpen) {
      // Applied values
      setNavbarWidth(pendingNavbarWidth);
      localStorage.setItem('penquin-nav-width', pendingNavbarWidth.toString());

      if (isDocs) {
        setDocsContentWidth(pendingDocsContentWidth);
        localStorage.setItem('penquin-docs-content-width', pendingDocsContentWidth.toString());
        document.documentElement.style.setProperty('--content-max-width', `${pendingDocsContentWidth}px`);
      } else {
        setContentWidth(pendingContentWidth);
        localStorage.setItem('penquin-content-width', pendingContentWidth.toString());
        document.documentElement.style.setProperty('--content-max-width', `${pendingContentWidth}px`);
      }
    }
  }, [isSettingsOpen, isDocs, pendingNavbarWidth, pendingContentWidth, pendingDocsContentWidth]);

  // Global Ctrl K search
  useEffect(() => {
    const handleGlobalK = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleGlobalK);
    return () => window.removeEventListener('keydown', handleGlobalK);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className="VPNav fixed top-0 left-0 right-0 z-[60] w-full transition-all duration-300"
    >
      <div
        className={`VPNavBar h-[64px] flex items-center justify-between mx-auto ${isDocs ? 'px-0' : 'px-6 md:px-16'}`}
        style={{
          maxWidth: isDocs ? '100%' : (navbarWidth === 1920 ? '100%' : `${navbarWidth}px`),
          transition: 'max-width 500ms cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Left Area: Logo & Search */}
        <div className="flex items-center h-full">
          {/* Sidebar menu (docs + Home overlay) */}
          {!!onDocsMenuClick && (
            <button
              type="button"
              aria-label="Toggle docs sidebar"
              onClick={onDocsMenuClick}
              className={`ml-2 mr-0 p-[6px] rounded-[10px] transition-colors ${isDocs ? "lg:hidden" : ""}`}
            >
              <TextAlignStart className="cursor-pointer w-[20px] h-[20px] text-[var(--vp-c-text-2)] hover:text-[var(--vp-c-text-1)] transition duration-300 ease-in-out" strokeWidth={2.5} />
            </button>
          )}

          {/* Brand Area - Only shown on non-docs pages */}
          {!isDocs && (
            <a href="/" className="flex items-center gap-0 -ml-1 mr-1 sm:mr-2 group cursor-pointer text-[var(--vp-c-text-1)] h-full transition-colors">
              <img className="w-14 h-14" src="/v2/PFPs/Transparent/2.png" alt="Logo" />
              <span className="font-semibold text-[18px] mr-2 leading-3">Penquin</span>
            </a>
          )}

          {/* Search Bar */}
          <div className={`${isDocs ? 'lg:pl-[336px]' : ''}`}>
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className={`DocSearch flex items-center justify-center sm:justify-start gap-2 px-3 h-9 rounded-lg bg-[#1e1e20] transition-all group ${isDocs ? 'w-10 sm:w-[160px]' : 'w-10 sm:w-[150px]'}`}
            >
              <Search className="w-4 h-4 text-[#9ca3af] group-hover:text-white transition-colors" strokeWidth={2} />
              <span className="text-[14px] font-medium text-[#9ca3af] hidden sm:inline-block">Search</span>
              <kbd className="ml-auto font-sans font-medium text-[10px] text-[#9ca3af] border border-[#9ca3af]/20 bg-[#9ca3af]/5 px-1.5 py-0.5 rounded-[4px] hidden md:flex items-center">Ctrl K</kbd>
            </button>
          </div>
        </div>

        {/* Right Area: Icons */}
        <div className={`flex items-center justify-end text-[var(--vp-c-text-2)] ${isDocs ? 'pr-6' : ''}`}>
          <div className="flex items-center gap-1 px-2.5 py-1  rounded-full bg-[var(--vp-c-bg-soft)]/30">
            <button onClick={toggleTheme} className="hover:text-[var(--vp-c-text-1)] transition-colors p-[6px]" aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}>
              {isDark ? (
                <Sun className="w-[20px] h-[20px]" strokeWidth={2} />
              ) : (
                <Moon className="w-[20px] h-[20px]" strokeWidth={2} />
              )}
            </button>
            <a href="https://github.com/krreeshhh/Penquin-v2" className="hover:text-[var(--vp-c-text-1)] transition-colors p-[6px] hidden sm:flex items-center justify-center -mr-0.5" aria-label="GitHub">
              <FaGithub className="w-[20px] h-[20px]" />
            </a>
            <a href="https://discord.gg/vShRGx8ZBC" className="hover:text-[var(--vp-c-text-1)] transition-colors p-[6px] hidden sm:flex items-center justify-center -mr-0.5" aria-label="Discord">
              <FaDiscord className="w-[20px] h-[20px]" />
            </a>
            <div className="relative" ref={dropdownRef}>
              <div
                className="flex items-center hover:text-[var(--vp-c-text-1)] transition-colors p-[6px] cursor-pointer rounded-full hover:bg-[var(--vp-c-bg-soft)]"
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              >
                <PiGear className="w-[22px] h-[22px]" strokeWidth={3} />
                <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" strokeWidth={3} />
              </div>

              {isSettingsOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-[var(--vp-c-bg-elv)] border border-[var(--vp-c-divider)] rounded-xl shadow-xl overflow-hidden py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-[var(--vp-c-divider)]/50 pb-3 mb-1">
                    <span className="text-[11px] font-bold text-[var(--vp-c-text-2)] uppercase tracking-wider">Appearance</span>
                  </div>
                  <div className="px-4 pb-3 flex flex-col gap-3">
                    {!isDocs && (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] font-medium text-[var(--vp-c-text-1)]">Navbar Width</span>
                          <span className="text-[11px] font-mono text-[var(--vp-c-text-2)] bg-[var(--vp-c-bg-soft)] px-1.5 py-0.5 rounded">{pendingNavbarWidth}px</span>
                        </div>
                        <ElasticSlider
                          defaultValue={pendingNavbarWidth}
                          startingValue={800}
                          maxValue={1920}
                          isStepped={true}
                          stepSize={10}
                          leftIcon={<Minus className="w-3 h-3" />}
                          rightIcon={<Plus className="w-3 h-3" />}
                          onValueChange={handleNavbarWidthChange}
                          onValueCommit={handleNavbarWidthChange}
                        />
                      </div>
                    )}

                    {/* Content Width */}
                    <div className={`flex flex-col gap-1 pt-2 ${!isDocs ? 'border-t border-[var(--vp-c-divider)]/40' : ''}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-medium text-[var(--vp-c-text-1)]">Content Width</span>
                        <span className="text-[11px] font-mono text-[var(--vp-c-text-2)] bg-[var(--vp-c-bg-soft)] px-1.5 py-0.5 rounded">
                          {isDocs ? pendingDocsContentWidth : pendingContentWidth}px
                        </span>
                      </div>
                      <ElasticSlider
                        defaultValue={isDocs ? pendingDocsContentWidth : pendingContentWidth}
                        startingValue={isDocs ? 600 : 1000}
                        maxValue={isDocs ? 1000 : 1200}
                        isStepped={true}
                        stepSize={10}
                        leftIcon={<Minus className="w-3 h-3" />}
                        rightIcon={<Plus className="w-3 h-3" />}
                        onValueChange={handleContentWidthChange}
                        onValueCommit={handleContentWidthChange}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
};
