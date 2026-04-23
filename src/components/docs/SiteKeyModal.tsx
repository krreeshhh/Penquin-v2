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

          {/* Modal Container for Page Scroll */}
          <div className="fixed inset-0 z-[210] flex items-start justify-center pt-10 sm:pt-16 pb-10 sm:pb-16 px-3 sm:px-4 overflow-y-auto pointer-events-none scrollbar-thin">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -16 }}
              transition={{ type: "spring", damping: 26, stiffness: 320 }}
              className="w-full max-w-[860px] flex flex-col bg-[#161618] border border-white/5 rounded-lg shadow-2xl pointer-events-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-white/5 flex-shrink-0">
                <div className="flex items-center gap-2 text-[var(--vp-c-text-1)]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] opacity-80"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                  <span className="text-[15px] font-bold">Site key</span>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 rounded-md text-[var(--vp-c-text-3)] hover:text-[var(--vp-c-text-1)] hover:bg-white/5 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-[18px] h-[18px]" />
                </button>
              </div>

              {/* Body (No internal scroll) */}
              <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-5 sm:space-y-6">
                {Object.entries(data).map(([category, entries]) => (
                  <div key={category}>
                    {/* Category heading */}
                    <h3 className="text-[14px] font-bold text-[var(--vp-c-text-1)] mb-4">
                      {category}
                    </h3>

                    {/* Icon grid */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                      {entries.map((entry) => {
                        return (
                          <a
                            key={entry.domain}
                            href={`https://${entry.domain}`}
                            target="_blank"
                            rel="noreferrer"
                            className="group flex flex-col items-center justify-center gap-2 h-[72px] p-2 rounded-lg bg-[#0e0e0e] hover:bg-[#1f1f22] border border-transparent transition-colors"
                          >
                            <div className="flex items-center justify-center text-white/80 group-hover:text-white transition-colors">
                              <SiteIcon domain={entry.domain} className="w-[22px] h-[22px]" />
                            </div>
                            <span className="text-[11px] font-medium text-white/80 group-hover:text-white text-center leading-tight truncate w-full px-1 transition-colors">
                              {entry.domain.replace(/^(www\.|blog\.)/, "")}
                            </span>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
