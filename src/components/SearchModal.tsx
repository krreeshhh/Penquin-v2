"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  X,
  ChevronRight,
  ArrowRight,
  FolderOpen,
  Clock,
  Hash,
  CornerDownLeft,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DocIcon, defaultDocIcons } from "@/components/docs/doc-icons";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  url: string;
  emoji?: string;
  icon?: string;
  content?: string;
  category?: string;
  parentTitle?: string;
  breadcrumbs?: string[];
  priority: number;
  type: "page" | "section" | "heading";
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Calculate match score (0-100)
function calculateMatchScore(query: string, result: SearchResult): number {
  const lowerQuery = query.toLowerCase();
  const lowerTitle = result.title.toLowerCase();
  const lowerDesc = (result.description || "").toLowerCase();
  const lowerContent = (result.content || "").toLowerCase();

  if (lowerTitle === lowerQuery) return 100;
  if (lowerTitle.startsWith(lowerQuery)) return 90;
  if (lowerTitle.includes(lowerQuery)) return 80;
  if (lowerDesc.includes(lowerQuery)) return 50;
  if (lowerContent.includes(lowerQuery)) return 30;

  // Fuzzy matching
  let queryIndex = 0;
  let matches = 0;
  for (let i = 0; i < lowerTitle.length && queryIndex < lowerQuery.length; i++) {
    if (lowerTitle[i] === lowerQuery[queryIndex]) {
      matches++;
      queryIndex++;
    }
  }
  if (matches === lowerQuery.length) {
    return 20 + (matches / lowerTitle.length) * 10;
  }

  return 0;
}

// Highlight matched text
function HighlightedText({
  text,
  query,
  className = "",
}: {
  text: string;
  query: string;
  className?: string;
}) {
  if (!query.trim()) return <span className={className}>{text}</span>;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  let index = lowerText.indexOf(lowerQuery, lastIndex);

  if (index === -1) {
    // Fuzzy character matching
    const positions: number[] = [];
    let queryIndex = 0;
    let textIndex = 0;
    while (queryIndex < lowerQuery.length && textIndex < lowerText.length) {
      if (lowerQuery[queryIndex] === lowerText[textIndex]) {
        positions.push(textIndex);
        queryIndex++;
      }
      textIndex++;
    }

    if (positions.length === lowerQuery.length) {
      for (let i = 0; i < text.length; i++) {
        if (positions.includes(i)) {
          if (i > lastIndex) {
            parts.push(<span key={`t-${i}`}>{text.slice(lastIndex, i)}</span>);
          }
          parts.push(
            <mark
              key={`m-${i}`}
              className="bg-[var(--vp-c-brand-1)]/20 text-[var(--vp-c-brand-1)] rounded px-0.5"
            >
              {text[i]}
            </mark>
          );
          lastIndex = i + 1;
        }
      }
      if (lastIndex < text.length) {
        parts.push(<span key="end">{text.slice(lastIndex)}</span>);
      }
      return <span className={className}>{parts}</span>;
    }
  }

  while (index !== -1 && lastIndex < text.length) {
    if (index > lastIndex) {
      parts.push(<span key={`t-${lastIndex}`}>{text.slice(lastIndex, index)}</span>);
    }
    parts.push(
      <mark
        key={`m-${index}`}
        className="bg-[var(--vp-c-brand-1)]/20 text-[var(--vp-c-brand-1)] rounded px-0.5 font-semibold"
      >
        {text.slice(index, index + query.length)}
      </mark>
    );
    lastIndex = index + query.length;
    index = lowerText.indexOf(lowerQuery, lastIndex);
  }

  if (lastIndex < text.length) {
    parts.push(<span key={`t-${lastIndex}`}>{text.slice(lastIndex)}</span>);
  }

  return <span className={className}>{parts}</span>;
}

// Recent searches key
const RECENT_KEY = "penquin-recent-searches";
const MAX_RECENT = 5;

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [allResults, setAllResults] = useState<SearchResult[]>([]);
  const [filtered, setFiltered] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLAnchorElement>(null);

  // Load recent searches
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      if (stored) setRecent(JSON.parse(stored));
    } catch {}
  }, []);

  // Save recent search
  const saveRecent = useCallback((q: string) => {
    if (!q.trim()) return;
    try {
      const updated = [q, ...recent.filter((s) => s !== q)].slice(0, MAX_RECENT);
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
      setRecent(updated);
    } catch {}
  }, [recent]);

  // Fetch index
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setSelected(0);
      setFiltered([]);
      return;
    }
    setLoading(true);
    fetch("/api/search")
      .then((r) => r.json())
      .then((d) => setAllResults(d))
      .catch(console.error)
      .finally(() => setLoading(false));
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [isOpen]);

  // Search logic
  useEffect(() => {
    if (!query.trim()) {
      setFiltered([]);
      return;
    }
    const scored = allResults
      .map((r) => ({ r, s: calculateMatchScore(query, r) }))
      .filter(({ s }) => s > 0)
      .sort((a, b) => b.s - a.s || a.r.priority - b.r.priority)
      .slice(0, 12)
      .map(({ r }) => r);
    setFiltered(scored);
    setSelected(0);
  }, [query, allResults]);

  // Keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      const list = filtered;
      if (!list.length) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((p) => (p + 1) % list.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((p) => (p - 1 + list.length) % list.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = list[selected];
        if (item) {
          saveRecent(query);
          window.location.href = item.url;
          onClose();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, filtered, selected, onClose, query, saveRecent]);

  // Scroll selected into view
  useEffect(() => {
    if (selectedRef.current && containerRef.current) {
      const c = containerRef.current;
      const s = selectedRef.current;
      const cr = c.getBoundingClientRect();
      const sr = s.getBoundingClientRect();
      if (sr.bottom > cr.bottom) c.scrollTop += sr.bottom - cr.bottom + 8;
      else if (sr.top < cr.top) c.scrollTop -= cr.top - sr.top + 8;
    }
  }, [selected]);

  const onSelect = (item: SearchResult) => {
    saveRecent(query);
    window.location.href = item.url;
    onClose();
  };

  const clearRecent = () => {
    localStorage.removeItem(RECENT_KEY);
    setRecent([]);
  };

  const hasResults = filtered.length > 0;
  const hasQuery = query.trim().length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-[110] flex items-start justify-center pt-24 px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ type: "spring", damping: 25, stiffness: 400 }}
              className="w-full max-w-[640px] bg-[var(--vp-c-bg-elv)] rounded-xl shadow-2xl border border-[var(--vp-c-divider)] overflow-hidden pointer-events-auto flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-4 border-b border-[var(--vp-c-divider)]">
                <Search className="w-5 h-5 text-[var(--vp-c-text-3)]" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search documentation"
                  className="flex-1 bg-transparent outline-none text-base text-[var(--vp-c-text-1)] placeholder:text-[var(--vp-c-text-3)]"
                />
                <div className="flex items-center gap-2">
                  {loading && <Loader2 className="w-4 h-4 animate-spin text-[var(--vp-c-text-3)]" />}
                  {query && (
                    <button
                      onClick={() => {
                        setQuery("");
                        inputRef.current?.focus();
                      }}
                      className="p-1 hover:bg-[var(--vp-c-bg-soft)] rounded"
                    >
                      <X className="w-4 h-4 text-[var(--vp-c-text-3)]" />
                    </button>
                  )}
                  <kbd className="hidden sm:flex px-2 py-1 rounded border border-[var(--vp-c-divider)] bg-[var(--vp-c-bg-soft)] text-[11px] text-[var(--vp-c-text-3)]">
                    ESC
                  </kbd>
                </div>
              </div>

              {/* Results */}
              <div
                ref={containerRef}
                className="max-h-[60vh] overflow-y-auto scrollbar-thin"
              >
                {!hasQuery ? (
                  <div className="py-14 flex flex-col items-center text-[var(--vp-c-text-3)]">
                    <Search className="w-14 h-14 opacity-20 mb-4" />
                    <p className="text-[15px] font-medium">Search documentation</p>
                    <p className="text-[13px] opacity-60 mt-1">
                      Type keywords to find pages, sections, and more
                    </p>
                    <div className="flex items-center gap-4 mt-6">
                      <div className="flex items-center gap-1.5 text-[12px]">
                        <kbd className="px-1.5 py-0.5 rounded border border-[var(--vp-c-divider)] bg-[var(--vp-c-bg-soft)]">↑</kbd>
                        <kbd className="px-1.5 py-0.5 rounded border border-[var(--vp-c-divider)] bg-[var(--vp-c-bg-soft)]">↓</kbd>
                        <span>to navigate</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[12px]">
                        <kbd className="px-1.5 py-0.5 rounded border border-[var(--vp-c-divider)] bg-[var(--vp-c-bg-soft)]">↵</kbd>
                        <span>to select</span>
                      </div>
                    </div>
                  </div>
                ) : hasResults ? (
                  <div className="py-2 px-2">
                    {filtered.map((item, i) => {
                      const isSel = i === selected;
                      return (
                        <a
                          key={item.id}
                          ref={isSel ? selectedRef : null}
                          href={item.url}
                          onClick={(e) => {
                            e.preventDefault();
                            onSelect(item);
                          }}
                          onMouseEnter={() => setSelected(i)}
                          className={`group flex items-start gap-3 px-3 py-3 rounded-xl transition-all ${
                            isSel
                              ? "bg-[var(--vp-c-brand-soft)]"
                              : "hover:bg-[var(--vp-c-bg-soft)]"
                          }`}
                        >
                          {/* Icon */}
                          <div
                            className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center ${
                              isSel ? "bg-[var(--vp-c-brand-1)]/10" : "bg-[var(--vp-c-bg-alt)]"
                            }`}
                          >
                            <DocIcon
                              emoji={item.emoji}
                              icon={item.icon}
                              fallback={defaultDocIcons.page}
                              className={`w-5 h-5 ${
                                isSel ? "text-[var(--vp-c-brand-1)]" : "text-[var(--vp-c-text-2)]"
                              }`}
                            />
                          </div>

                          {/* Content */}
                          <div className="min-w-0 flex-1 pt-0.5">
                            {/* Breadcrumbs */}
                            {item.breadcrumbs && item.breadcrumbs.length > 1 && (
                              <div className="flex items-center gap-1 text-[11px] text-[var(--vp-c-text-3)] mb-1">
                                {item.breadcrumbs.slice(0, -1).map((crumb, idx) => (
                                  <span key={idx} className="flex items-center gap-1">
                                    <span className="truncate max-w-[80px]">{crumb}</span>
                                    {idx < item.breadcrumbs!.slice(0, -1).length - 1 && (
                                      <ChevronRight className="w-3 h-3 shrink-0 opacity-50" />
                                    )}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Title */}
                            <div
                              className={`text-[14px] font-semibold truncate ${
                                isSel ? "text-[var(--vp-c-brand-1)]" : "text-[var(--vp-c-text-1)]"
                              }`}
                            >
                              <HighlightedText text={item.title} query={query} />
                            </div>

                            {/* Description */}
                            {item.description && (
                              <div className="text-[13px] text-[var(--vp-c-text-3)] truncate mt-0.5">
                                <HighlightedText text={item.description} query={query} />
                              </div>
                            )}
                          </div>

                          {/* Arrow */}
                          <div className={`shrink-0 pt-2 transition-opacity ${isSel ? "opacity-100" : "opacity-0"}`}>
                            <ArrowRight className="w-4 h-4 text-[var(--vp-c-brand-1)]" />
                          </div>
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-14 flex flex-col items-center text-[var(--vp-c-text-3)]">
                    <div className="w-14 h-14 rounded-full bg-[var(--vp-c-bg-soft)] flex items-center justify-center">
                      <Search className="w-6 h-6 opacity-40" />
                    </div>
                    <p className="text-[15px] font-medium mt-4">No results found</p>
                    <p className="text-[13px] opacity-60 mt-1 text-center max-w-[280px]">
                      We couldn&apos;t find anything for &quot;{query}&quot;. Try different keywords.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-[var(--vp-c-divider)] bg-[var(--vp-c-bg-soft)]/50 flex items-center justify-between text-[11px] text-[var(--vp-c-text-3)]">
                <div className="flex items-center gap-4">
                  <span className="hidden sm:flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded border border-[var(--vp-c-divider)] bg-[var(--vp-c-bg-elv)]">Enter</kbd>
                    <span>to select</span>
                  </span>
                  <span className="hidden sm:flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded border border-[var(--vp-c-divider)] bg-[var(--vp-c-bg-elv)]">↑</kbd>
                    <kbd className="px-1.5 py-0.5 rounded border border-[var(--vp-c-divider)] bg-[var(--vp-c-bg-elv)]">↓</kbd>
                    <span>to navigate</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {filtered.length > 0 && (
                    <span>
                      {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                    </span>
                  )}
                  <span className="opacity-40">|</span>
                  <span className="opacity-60">Penquin Search</span>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
