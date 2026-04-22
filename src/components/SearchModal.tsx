"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, FileText, ChevronRight, Hash, Command } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DocIcon, defaultDocIcons } from "@/components/docs/doc-icons";

interface SearchResult {
  title: string;
  description: string;
  url: string;
  emoji?: string;
  icon?: string;
  content?: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [allPages, setAllPages] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch search index
  useEffect(() => {
    if (isOpen) {
      const fetchIndex = async () => {
        try {
          const res = await fetch("/api/search");
          const data = (await res.json()) as SearchResult[];
          setAllPages(data);
        } catch (e) {
          console.error("Failed to fetch search index:", e);
        }
      };
      fetchIndex();
      // Focus input on open
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Search logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = allPages
      .filter((page) => {
        return (
          page.title.toLowerCase().includes(lowerQuery) ||
          page.description.toLowerCase().includes(lowerQuery) ||
          page.url.toLowerCase().includes(lowerQuery) ||
          (page.content && page.content.toLowerCase().includes(lowerQuery))
        );
      })
      .slice(0, 10); // Limit to top 10 results

    setResults(filtered);
    setSelectedIndex(0);
  }, [query, allPages]);

  // Key navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, results.length));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % Math.max(1, results.length));
      }
      if (e.key === "Enter" && results[selectedIndex]) {
        window.location.href = results[selectedIndex].url;
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[110] flex items-start justify-center pt-24 px-4 sm:px-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-[640px] bg-[var(--vp-c-bg-elv)] border border-[var(--vp-c-divider)] rounded-[20px] shadow-2xl overflow-hidden pointer-events-auto"
            >
              {/* Search Header */}
              <div className="relative flex items-center px-4 py-4 border-b border-[var(--vp-c-divider)]/40">
                <Search className="w-5 h-5 text-[var(--vp-c-text-2)] ml-1" strokeWidth={2.5} />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search documentation..."
                  className="flex-1 bg-transparent border-0 outline-none px-4 text-[16px] text-[var(--vp-c-text-1)] placeholder:text-[var(--vp-c-text-3)]"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <div className="flex items-center gap-2 pr-2">
                  {query && (
                    <button
                      onClick={() => setQuery("")}
                      className="p-1 hover:bg-[var(--vp-c-bg-soft)] rounded-md transition-colors"
                    >
                      <X className="w-4 h-4 text-[var(--vp-c-text-3)]" />
                    </button>
                  )}
                  <kbd className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded border border-[var(--vp-c-divider)]/40 bg-[var(--vp-c-bg-soft)] text-[11px] font-medium text-[var(--vp-c-text-3)]">
                    ESC
                  </kbd>
                </div>
              </div>

              {/* Results Area */}
              <div className="max-h-[440px] overflow-y-auto p-2">
                {!query ? (
                  <div className="py-12 flex flex-col items-center justify-center opacity-40">
                    <Search className="w-12 h-12 mb-4" strokeWidth={1} />
                    <p className="text-[14px]">Type to search everything...</p>
                  </div>
                ) : results.length > 0 ? (
                  <div className="space-y-1">
                    {results.map((result, idx) => (
                      <a
                        key={result.url}
                        href={result.url}
                        className={`group flex items-center gap-4 px-4 py-3 rounded-[12px] transition-all ${idx === selectedIndex ? "bg-[var(--vp-c-brand-soft)]" : "hover:bg-[var(--vp-c-bg-soft)]"
                          }`}
                        onClick={onClose}
                        onPointerMove={() => setSelectedIndex(idx)}
                      >
                        <div
                          className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center transition-colors ${idx === selectedIndex ? "bg-[var(--vp-c-brand-1)]/10" : "bg-[var(--vp-c-bg-alt)] group-hover:bg-[var(--vp-c-bg-elv)]"
                            }`}
                        >
                          <DocIcon
                            emoji={result.emoji}
                            icon={result.icon}
                            fallback={defaultDocIcons.page}
                            className={`w-5 h-5 ${idx === selectedIndex ? "text-[var(--vp-c-brand-1)]" : "text-[var(--vp-c-text-1)] group-hover:text-[var(--vp-c-brand-1)]"}`}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div
                            className={`text-[15px] font-semibold truncate ${idx === selectedIndex ? "text-[var(--vp-c-brand-1)]" : "text-[var(--vp-c-text-1)] group-hover:text-[var(--vp-c-brand-1)]"
                              }`}
                          >
                            {result.title}
                          </div>
                          <div
                            className={`text-[13px] truncate mt-0.5 ${idx === selectedIndex ? "text-[var(--vp-c-brand-1)]/70" : "text-[var(--vp-c-text-3)] group-hover:text-[var(--vp-c-brand-1)]/70"
                              }`}
                          >
                            {result.description || result.url}
                          </div>
                        </div>
                        <div
                          className={`shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${idx === selectedIndex ? "text-[var(--vp-c-brand-1)] opacity-100" : "text-[var(--vp-c-text-3)]"
                            }`}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center opacity-40">
                    <p className="text-[14px]">No results found for "{query}"</p>
                  </div>
                )}
              </div>

              {/* Footer Info */}
              <div className="px-4 py-3 border-t border-[var(--vp-c-divider)]/40 bg-[var(--vp-c-bg-soft)]/50 flex items-center gap-4 text-[11px] text-[var(--vp-c-text-3)] uppercase tracking-wider font-semibold">
                <div className="flex items-center gap-1">
                  <kbd className="p-1 rounded bg-[var(--vp-c-bg-elv)] border border-[var(--vp-c-divider)]/60 text-[10px]">ENTER</kbd>
                  <span>Select</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="p-1 rounded bg-[var(--vp-c-bg-elv)] border border-[var(--vp-c-divider)]/60 text-[10px]">↑↓</kbd>
                  <span>Navigate</span>
                </div>
                <div className="ml-auto flex items-center gap-1 opacity-60">
                  <span>Penquin Search</span>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
