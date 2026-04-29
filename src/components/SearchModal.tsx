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
  TextAlignStart,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [allResults, setAllResults] = useState<SearchResult[]>([]);
  const [filtered, setFiltered] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [groupResults, setGroupResults] = useState(true);
  const [showTips, setShowTips] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLAnchorElement>(null);

  const navigateTo = useCallback(
    (url: string) => {
      // Keep internal navigation client-side to avoid page refresh flashing.
      if (/^https?:\/\//.test(url)) {
        window.open(url, "_blank", "noopener,noreferrer");
        return;
      }
      router.push(url);
    },
    [router]
  );

  // Load recent searches
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      if (stored) setRecent(JSON.parse(stored));
    } catch { }
  }, []);

  // Save recent search
  const saveRecent = useCallback((q: string) => {
    if (!q.trim()) return;
    try {
      const updated = [q, ...recent.filter((s) => s !== q)].slice(0, MAX_RECENT);
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
      setRecent(updated);
    } catch { }
  }, [recent]);

  // Fetch index
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setSelected(0);
      setFiltered([]);
      setShowTips(false);
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
          navigateTo(item.url);
          onClose();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, filtered, selected, onClose, query, saveRecent, navigateTo]);

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
    navigateTo(item.url);
    onClose();
  };

  const clearRecent = () => {
    localStorage.removeItem(RECENT_KEY);
    setRecent([]);
  };

  const hasResults = filtered.length > 0;
  const hasQuery = query.trim().length > 0;

  const grouped = React.useMemo(() => {
    const map = new Map<string, SearchResult[]>();
    for (const item of filtered) {
      const key = item.category || "Other";
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  const indexById = React.useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((item, index) => map.set(item.id, index));
    return map;
  }, [filtered]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[var(--search-backdrop)]"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-[110] flex items-start justify-center pt-24 px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ type: "spring", damping: 25, stiffness: 400 }}
              className="w-full max-w-[760px] bg-[var(--search-modal-bg)] rounded-lg shadow-2xl border border-[var(--search-modal-border)] overflow-hidden pointer-events-auto flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--search-sep)]">
                <Search className="w-5 h-5 text-[var(--search-text-3)]" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search"
                  className="flex-1 bg-transparent outline-none text-[15px] text-[var(--search-text-1)] placeholder:text-[var(--search-text-3)]"
                />
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    aria-label={groupResults ? "Ungroup results" : "Group results"}
                    aria-pressed={groupResults}
                    onClick={() => setGroupResults((value) => !value)}
                    className={
                      "p-2 rounded-lg hover:bg-[var(--search-row-hover)] transition-colors " +
                      (groupResults ? "text-[var(--search-chip-text)]" : "text-[var(--search-text-3)]")
                    }
                  >
                    <TextAlignStart className="w-[18px] h-[18px]" />
                  </button>
                  <button
                    type="button"
                    aria-label={showTips ? "Hide search tips" : "Show search tips"}
                    aria-pressed={showTips}
                    onClick={() => setShowTips((value) => !value)}
                    className={
                      "p-2 rounded-lg hover:bg-[var(--search-row-hover)] transition-colors " +
                      (showTips ? "text-[var(--search-chip-text)]" : "text-[var(--search-chip-text)]")
                    }
                  >
                  </button>
                  {loading && <Loader2 className="w-4 h-4 animate-spin text-[var(--search-text-3)] mx-1" />}
                  {query && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        inputRef.current?.focus();
                      }}
                      className="p-2 rounded-lg text-[var(--search-text-3)] hover:bg-[var(--search-row-hover)] transition-colors"
                      aria-label="Clear search"
                    >
                      <X className="w-[18px] h-[18px]" />
                    </button>
                  )}
                </div>
              </div>

              {/* Results */}
              <div
                ref={containerRef}
                className="max-h-[62vh] overflow-y-auto scrollbar-thin"
              >
                {showTips && (
                  <div className="px-4 pt-4">
                    <div className="rounded-xl border border-[var(--search-sep)] bg-[var(--search-row-hover)] px-4 py-3">
                      <div className="text-[12px] font-semibold text-[var(--search-text-2)]">Tips</div>
                      <div className="mt-2 text-[12px] text-[var(--search-text-2)] leading-5">
                        Search matches titles first, then descriptions and page text.
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {["recon", "jwt", "xss", "subdomain takeover", "burp"].map((tip) => (
                          <button
                            key={tip}
                            type="button"
                            onClick={() => {
                              setQuery(tip);
                              setTimeout(() => inputRef.current?.focus(), 0);
                            }}
                            className="rounded-lg border border-[var(--search-sep)] bg-[var(--search-modal-bg)] px-2.5 py-1 text-[12px] text-[var(--search-chip-text)] hover:bg-[var(--search-row-hover)] transition-colors"
                          >
                            {tip}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {!hasQuery ? (
                  <div className="py-10 px-6 flex flex-col items-center text-[var(--search-text-2)]">
                    <img
                      src="/v2/search-illustration.png"
                      alt=""
                      className="w-[120px] h-auto opacity-95 select-none"
                      draggable={false}
                    />
                    <p className="mt-5 text-[14px] font-semibold text-[var(--search-text-2)]">Looking for something?</p>
                  </div>
                ) : hasResults ? (
                  groupResults ? (
                    <div className="py-3 px-4">
                      {grouped.map(([category, list]) => (
                        <div key={category} className="mb-6 last:mb-2">
                          <div className="flex items-center gap-2 px-1 mb-2 text-[13px] font-semibold text-[var(--search-text-2)]">
                            <Hash className="w-4 h-4 opacity-80" />
                            <span className="inline-flex items-center rounded-md bg-[var(--search-chip-bg)] text-[var(--search-chip-text)] px-2 py-0.5">
                              {category}
                            </span>
                          </div>
                          <div className="rounded-xl border border-[var(--search-sep)] bg-transparent overflow-hidden">
                            {list.map((item) => {
                              const i = indexById.get(item.id) ?? 0;
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
                                  className={
                                    "group grid grid-cols-[1fr_auto] gap-3 px-4 py-3 border-t border-[var(--search-sep)] first:border-t-0 transition-colors " +
                                    (isSel ? "bg-[var(--search-row-active)]" : "hover:bg-[var(--search-row-hover)]")
                                  }
                                >
                                  <div className="min-w-0 flex items-start gap-3">
                                    <div className="mt-0.5 w-9 h-9 shrink-0 rounded-lg bg-[var(--search-modal-bg)] border border-[var(--search-sep)] flex items-center justify-center">
                                      <DocIcon
                                        emoji={item.emoji}
                                        icon={item.icon}
                                        fallback={defaultDocIcons.page}
                                        className={
                                          "w-[18px] h-[18px] " +
                                          (isSel ? "text-[var(--search-chip-text)]" : "text-[var(--search-text-2)]")
                                        }
                                      />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="text-[14px] font-semibold text-[var(--search-text-1)] truncate">
                                        <HighlightedText text={item.title} query={query} />
                                      </div>
                                      {item.parentTitle && (
                                        <div className="mt-0.5 text-[12px] text-[var(--search-text-2)] truncate">
                                          {item.parentTitle}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="hidden sm:inline-flex items-center rounded-md border border-[var(--search-sep)] bg-[var(--search-modal-bg)] px-2 py-0.5 text-[11px] text-[var(--search-text-2)]">
                                      {item.type}
                                    </span>
                                    <ArrowRight
                                      className={
                                        "w-4 h-4 transition-opacity " +
                                        (isSel ? "opacity-100" : "opacity-0") +
                                        " text-[var(--search-chip-text)]"
                                      }
                                    />
                                  </div>
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-3 px-4">
                      <div className="space-y-1">
                        {filtered.map((item, i) => {
                          const isSel = i === selected;
                          const crumbs = Array.isArray(item.breadcrumbs) && item.breadcrumbs.length
                            ? item.breadcrumbs
                            : [item.category, item.parentTitle, item.title].filter((v): v is string => typeof v === "string" && v.trim().length > 0);

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
                              className={
                                "block rounded-xl px-4 py-3 transition-colors " +
                                (isSel ? "bg-[var(--search-row-active)]" : "hover:bg-[var(--search-row-hover)]")
                              }
                            >
                              <div className="flex items-center gap-2 text-[14px] font-semibold text-[var(--search-text-1)] min-w-0">
                                <span className="text-[var(--search-text-3)]">#</span>
                                <div className="min-w-0 flex items-center gap-2 flex-wrap">
                                  {crumbs.map((crumb, idx) => (
                                    <React.Fragment key={`${item.id}-c-${idx}`}
                                    >
                                      <span className="max-w-[260px] truncate">
                                        <HighlightedText text={crumb} query={query} />
                                      </span>
                                      {idx < crumbs.length - 1 ? (
                                        <span className="text-[var(--search-text-3)]">→</span>
                                      ) : null}
                                    </React.Fragment>
                                  ))}
                                </div>
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )
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
              <div className="px-5 py-3 border-t border-[var(--search-sep)] bg-[var(--search-row-hover)] flex items-center justify-between text-[12px] text-[var(--search-text-2)]">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-2">
                    <kbd className="px-2 py-0.5 rounded-md border border-[var(--search-sep)] bg-[var(--search-modal-bg)]">↑</kbd>
                    <kbd className="px-2 py-0.5 rounded-md border border-[var(--search-sep)] bg-[var(--search-modal-bg)]">↓</kbd>
                    <span className="hidden sm:inline">to navigate</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <kbd className="px-2 py-0.5 rounded-md border border-[var(--search-sep)] bg-[var(--search-modal-bg)]">↵</kbd>
                    <span className="hidden sm:inline">to select</span>
                  </span>
                  <span className="hidden sm:flex items-center gap-2">
                    <kbd className="px-2 py-0.5 rounded-md border border-[var(--search-sep)] bg-[var(--search-modal-bg)]">esc</kbd>
                    <span>to close</span>
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  {filtered.length > 0 && (
                    <span>
                      {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
