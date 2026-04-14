"use client";

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Search, Moon, Sun, Settings, ChevronDown, Menu, Minus, Plus } from 'lucide-react';
import dynamic from 'next/dynamic';

const ElasticSlider = dynamic(() => import("@/components/ui/ElasticSlider"), { ssr: false });
import { SearchModal } from "@/components/SearchModal";

const DiscordIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    stroke="none"
  >
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.086 2.157 2.419c0 1.334-.947 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.086 2.157 2.419c0 1.334-.946 2.419-2.157 2.419z" />
  </svg>
);

const GitHubIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);

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
  const [navbarWidth, setNavbarWidth] = useState(1152);
  const [contentWidth, setContentWidth] = useState(1152);
  const [docsContentWidth, setDocsContentWidth] = useState(756);
  const [pendingNavbarWidth, setPendingNavbarWidth] = useState(1152);
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
        className={`VPNavBar h-[64px] flex items-center justify-between mx-auto ${isDocs ? 'px-0' : 'px-6'}`}
        style={{
          maxWidth: isDocs ? '100%' : (navbarWidth === 1920 ? '100%' : `${navbarWidth}px`),
          transition: 'max-width 500ms cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Left Area: Logo & Search */}
        <div className="flex items-center h-full">
          {/* Docs mobile menu */}
          {isDocs && (
            <button
              type="button"
              aria-label="Toggle sidebar"
              onClick={onDocsMenuClick}
              className="ml-2 mr-2 p-[8px] rounded-[10px] hover:bg-[var(--vp-c-bg-soft)] transition-colors lg:hidden"
            >
              <Menu className="w-[18px] h-[18px] text-[var(--vp-c-text-2)]" strokeWidth={2.5} />
            </button>
          )}

          {/* Brand Area - Only shown on non-docs pages */}
          {!isDocs && (
            <a href="/" className="flex items-center gap-3 mr-2 sm:mr-4 group cursor-pointer text-[var(--vp-c-text-1)] h-full transition-colors">
              <img className="w-18 h-18 sm:w-19 sm:h-19" src="/v2/PFPs/Transparent/2.png" alt="Logo" />
              <span className="font-semibold text-lg sm:text-xl hidden xs:inline-block">Penquin</span>
            </a>
          )}

          {/* Search Bar */}
          <div className={`${isDocs ? 'lg:pl-[336px]' : ''}`}>
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className={`DocSearch flex items-center justify-center sm:justify-start gap-[8px] px-2 py-[6px] sm:px-3 rounded-[12px] bg-[var(--vp-c-bg-soft)]/50 hover:bg-[var(--vp-c-bg-alt)] border border-[var(--vp-c-divider)]/30 transition-all group ${isDocs ? 'w-10 sm:w-[160px]' : 'w-10 sm:w-[150px]'}`}
            >
              <Search className="w-[15px] h-[15px] text-[var(--vp-c-text-2)] group-hover:text-[var(--vp-c-text-1)] transition-colors" strokeWidth={2} />
              <span className="text-[13.5px] font-medium text-[var(--vp-c-text-2)] group-hover:text-[var(--vp-c-text-1)] transition-colors hidden sm:inline-block">Search</span>
              <kbd className="ml-auto font-sans font-medium text-[11.5px] text-[var(--vp-c-text-2)] px-1.5 py-[2px] rounded-[5px] border border-[var(--vp-c-divider)]/20 bg-[var(--vp-c-bg-elv)]/50 shadow-sm hidden md:flex items-center gap-[4px]">Ctrl K</kbd>
            </button>
          </div>
        </div>

        {/* Right Area: Icons */}
        <div className={`flex items-center justify-end text-[var(--vp-c-text-2)] ${isDocs ? 'pr-6' : ''}`}>
          <div className="flex items-center gap-1 px-2.5 py-1 border border-[var(--vp-c-divider)]/60 rounded-full bg-[var(--vp-c-bg-soft)]/30">
            <button onClick={toggleTheme} className="hover:text-[var(--vp-c-text-1)] transition-colors p-[6px]" aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}>
              {isDark ? (
                <Sun className="w-[16px] h-[16px]" strokeWidth={2} />
              ) : (
                <Moon className="w-[16px] h-[16px]" strokeWidth={2} />
              )}
            </button>
            <a href="https://github.com/krreeshhh/Penquin-v2" className="hover:text-[var(--vp-c-text-1)] transition-colors p-[6px] hidden sm:flex items-center justify-center -mr-0.5" aria-label="GitHub">
              <GitHubIcon className="w-[18px] h-[18px]" />
            </a>
            <a href="https://discord.gg/vShRGx8ZBC" className="hover:text-[var(--vp-c-text-1)] transition-colors p-[6px] hidden sm:flex items-center justify-center -mr-0.5" aria-label="Discord">
              <DiscordIcon className="w-[18px] h-[18px]" />
            </a>
            <div className="relative" ref={dropdownRef}>
              <div
                className="flex items-center hover:text-[var(--vp-c-text-1)] transition-colors p-[6px] cursor-pointer rounded-full hover:bg-[var(--vp-c-bg-soft)]"
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              >
                <Settings className="w-[16px] h-[16px]" strokeWidth={2} />
                <ChevronDown className="w-2.5 h-2.5 ml-0.5 opacity-60" strokeWidth={3} />
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
