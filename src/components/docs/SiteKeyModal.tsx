"use client";

import React from "react";
import { X, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import siteDomains from "@/data/site_domains.json";
import { SiteIcon } from "./SiteIcon";

type DomainEntry = { domain: string; icon: string };
type SiteDomainsData = Record<string, DomainEntry[]>;

const data = siteDomains as SiteDomainsData;

interface SiteKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SiteKeyModal({ isOpen, onClose }: SiteKeyModalProps) {
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
            className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-[3px]"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[210] flex items-start justify-center pt-16 px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -16 }}
              transition={{ type: "spring", damping: 26, stiffness: 320 }}
              className="w-full max-w-[680px] max-h-[80vh] flex flex-col bg-[var(--vp-c-bg-elv)] border border-[var(--vp-c-divider)] rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--vp-c-divider)]/60 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-[16px] font-bold text-[var(--vp-c-text-1)]">🔗 Site Key</span>
                  <span className="text-[12px] text-[var(--vp-c-text-3)] bg-[var(--vp-c-bg-soft)] px-2 py-0.5 rounded-full font-medium">
                    {Object.values(data).flat().length} sites
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-[var(--vp-c-text-3)] hover:text-[var(--vp-c-text-1)] hover:bg-[var(--vp-c-bg-soft)] transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable body */}
              <div className="overflow-y-auto flex-1 px-5 py-4 space-y-6 scrollbar-thin">
                {Object.entries(data).map(([category, entries]) => (
                  <div key={category}>
                    {/* Category heading */}
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--vp-c-text-3)] mb-3">
                      {category}
                    </h3>

                    {/* Icon grid */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                      {entries.map((entry) => {
                        return (
                          <a
                            key={entry.domain}
                            href={`https://${entry.domain}`}
                            target="_blank"
                            rel="noreferrer"
                            className="group flex flex-col items-center gap-2 p-3 rounded-xl bg-[var(--vp-c-bg-soft)] hover:bg-[var(--vp-c-brand-soft)] border border-transparent hover:border-[var(--vp-c-brand-1)]/30 transition-all duration-200 hover:-translate-y-0.5"
                          >
                            <div className="w-10 h-10 rounded-lg bg-[var(--vp-c-bg)] flex items-center justify-center transition-colors overflow-hidden p-1.5 border border-[var(--vp-c-divider)]/40 text-[var(--vp-c-text-2)] group-hover:text-[var(--vp-c-brand-1)]">
                              <SiteIcon domain={entry.domain} className="w-5 h-5 transition-colors" />
                            </div>
                            <div className="flex flex-col items-center gap-0.5 w-full">
                              <span className="text-[11px] font-semibold text-[var(--vp-c-text-2)] group-hover:text-[var(--vp-c-text-1)] text-center leading-tight transition-colors truncate w-full text-center">
                                {entry.domain.replace(/^(www\.|blog\.)/, "")}
                              </span>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--vp-c-divider)]/40 bg-[var(--vp-c-bg-soft)]/40 flex-shrink-0">
                <span className="text-[11px] text-[var(--vp-c-text-3)]">Click any site to open in a new tab</span>
                <div className="flex items-center gap-1 text-[11px] text-[var(--vp-c-text-3)]">
                  <ExternalLink className="w-3 h-3" />
                  <span>External links</span>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
