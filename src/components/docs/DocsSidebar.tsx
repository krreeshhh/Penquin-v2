"use client";

import React, { useState } from "react";
import { ChevronRight, BadgeInfo, X, ExternalLink } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { DocIcon, defaultDocIcons } from "@/components/docs/doc-icons";
import type { SidebarNode } from "@/lib/docs";
import { motion, AnimatePresence } from "motion/react";
import { SiteKeyModal } from "@/components/docs/SiteKeyModal";

interface DocsSidebarProps {
  items: SidebarNode[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When true, behaves like the docs layout (visible on desktop). */
  alwaysVisibleOnDesktop?: boolean;
  /** When true, sidebar is fixed to the viewport. */
  fixed?: boolean;
  /** When true, show the dimmed backdrop when open (mobile). */
  overlay?: boolean;
}

function keyForPath(parts: string[]) {
  return parts.join("::");
}

export function DocsSidebar({ items, open, onOpenChange, alwaysVisibleOnDesktop = true, fixed = true, overlay = true }: DocsSidebarProps) {
  const pathname = usePathname() || "/";
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    // Read synchronously to avoid a visible "collapse then expand" on redirects.
    if (typeof window === "undefined") return {};
    try {
      const saved = sessionStorage.getItem("penquin-sidebar-open-groups");
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {};
  });
  const [isSiteKeyOpen, setIsSiteKeyOpen] = useState(false);

  // Persistence: Save to sessionStorage on change
  React.useEffect(() => {
    try {
      sessionStorage.setItem("penquin-sidebar-open-groups", JSON.stringify(openGroups));
    } catch {
      // ignore
    }
  }, [openGroups]);

  // The actual scroll container is the inner <nav> (it has overflow-y-auto).
  const navRef = React.useRef<HTMLElement>(null);

  const restoreSidebarScroll = React.useCallback(() => {
    const el = navRef.current;
    if (!el) return;
    try {
      const saved = sessionStorage.getItem("penquin-sidebar-scrollTop");
      if (!saved) return;
      const value = Number(saved);
      if (Number.isFinite(value)) el.scrollTop = value;
    } catch {
      // ignore
    }
  }, []);

  // Keep sidebar scroll position stable across internal navigations/redirections.
  React.useLayoutEffect(() => {
    restoreSidebarScroll();
  }, [restoreSidebarScroll]);

  // Some navigations can cause the nav contents to reflow and reset scrollTop.
  // Re-apply after the route changes.
  React.useEffect(() => {
    const raf = window.requestAnimationFrame(() => restoreSidebarScroll());
    return () => window.cancelAnimationFrame(raf);
  }, [pathname, restoreSidebarScroll]);

  React.useEffect(() => {
    const el = navRef.current;
    if (!el) return;

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        try {
          sessionStorage.setItem("penquin-sidebar-scrollTop", String(el.scrollTop));
        } catch {
          // ignore
        }
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  React.useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;

    // Only scroll to hash on pathname change (specifically for navigation from home)
    const timer = setTimeout(() => {
      const hashItem = document.getElementById(hash);
      if (hashItem) {
        hashItem.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [pathname]);

  const isActive = (url: string) => {
    const normalizedPath = pathname.replace(/\/$/, "") || "/";
    const normalizedUrl = url.replace(/\/$/, "") || "/";
    return normalizedPath === normalizedUrl;
  };

  const hasActiveDescendant = (node: SidebarNode): boolean => {
    if (node.url && isActive(node.url)) return true;
    return node.children?.some(hasActiveDescendant) || false;
  };

  const toggleGroup = (key: string) => {
    setOpenGroups((current) => ({ ...current, [key]: !current[key] }));
  };

  const isGroupOpen = (key: string) => {
    return !!openGroups[key];
  };

  const sidebarClasses =
    `VPSidebar ${fixed ? "fixed top-0 left-0 bottom-0" : "absolute top-0 left-0 h-[100dvh]"} z-[70] w-[var(--vp-sidebar-width)] overflow-y-auto transition-transform duration-[600ms] will-change-transform ` +
    (open ? "ease-[cubic-bezier(0.16,1,0.3,1)] " : "ease-[cubic-bezier(0,0,0.2,1)] ") +
    (alwaysVisibleOnDesktop ? "lg:translate-x-0 " : "") +
    (open ? "translate-x-0" : "-translate-x-full");

  const renderNode = (node: SidebarNode, level: number, parts: string[] = []) => {
    const key = keyForPath([...parts, node.title]);

    if (node.type === "divider") {
      const dividerId = node.title.toLowerCase().replace(/\s+/g, "-");
      return (
        <div key={key} id={dividerId} className="px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--vp-c-divider)] opacity-70" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--vp-c-text-3)]">
              {node.title}
            </span>
            <div className="h-px flex-1 bg-[var(--vp-c-divider)] opacity-70" />
          </div>
        </div>
      );
    }

    const isOpen = isGroupOpen(key);
    const active = node.url ? isActive(node.url) : false;
    const hasActive = hasActiveDescendant(node);

    if (node.type === "page") {
      return (
        <SidebarLink
          key={key}
          level={Math.min(level, 2) as 1 | 2}
          node={node}
          active={active}
          onNavigate={() => onOpenChange(false)}
        />
      );
    }

    return (
      <div
        key={key}
        className={
          `VPSidebarItem is-group level-${Math.min(level, 2)} collapsible ` +
          (isOpen ? "is-open " : "collapsed ") +
          (hasActive ? "has-active" : "")
        }
      >
        <div
          className="item group-item"
        >
          <div className="indicator" />
          {node.url ? (
            <Link className="VPLink link link" href={node.url} onClick={() => onOpenChange(false)} scroll={false}>
              {level === 0 ? (
                <div className="text">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center">
                    <DocIcon emoji={node.emoji} icon={node.icon} fallback={defaultDocIcons.group} className="w-[20px] h-[20px]" />
                  </div>
                  {node.title}
                </div>
              ) : (
                <div className="text">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center">
                    <DocIcon emoji={node.emoji} icon={node.icon} fallback={defaultDocIcons.group} className="w-[18px] h-[18px]" />
                  </div>
                  {node.title}
                </div>
              )}
            </Link>
          ) : (
            <div className="flex items-center flex-1">
              {level === 0 ? (
                <div className="text">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center">
                    <DocIcon emoji={node.emoji} icon={node.icon} fallback={defaultDocIcons.group} className="w-[20px] h-[20px]" />
                  </div>
                  {node.title}
                </div>
              ) : (
                <div className="text">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center">
                    <DocIcon emoji={node.emoji} icon={node.icon} fallback={defaultDocIcons.group} className="w-[18px] h-[18px]" />
                  </div>
                  {node.title}
                </div>
              )}
            </div>
          )}

          <div
            className="caret"
            role="button"
            aria-label="toggle section"
            tabIndex={0}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              toggleGroup(key);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                toggleGroup(key);
              }
            }}
          >
            <ChevronRight className="caret-icon" strokeWidth={2.5} />
          </div>
        </div>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0, y: -4 }}
              animate={{ height: "auto", opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -4 }}
              transition={{
                height: {
                  duration: 0.25,
                  ease: [0.32, 0, 0.67, 0],
                },
                opacity: {
                  duration: 0.2,
                },
                y: {
                  duration: 0.25,
                  ease: [0.32, 0, 0.67, 0],
                },
              }}
              className="items overflow-hidden"
            >
              {node.children?.map((child) => renderNode(child, level + 1, [...parts, node.title]))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <>
      <AnimatePresence>
        {open && overlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className={`fixed inset-0 z-[65] bg-black/40 backdrop-blur-[2px] ${alwaysVisibleOnDesktop ? "lg:hidden" : ""}`}
            onClick={() => onOpenChange(false)}
            aria-label="Close sidebar"
          />
        )}
      </AnimatePresence>

      <aside className={sidebarClasses}>
        <div className="pt-3 pb-3 flex items-center justify-between px-4 lg:px-0">
          <Link href="/" className="flex items-center gap-3 px-0 group transition-all duration-300" onClick={() => onOpenChange(false)}>
            <img className="w-12 h-12 rounded-lg ml-1 group-hover:scale-105 transition-transform duration-300" src="/v2/PFPs/Transparent/2.png" alt="Logo" />
            <span className="text-[22px] font-semibold text-[var(--vp-c-text-1)] tracking-tight">Penquin</span>
          </Link>

          <button
            onClick={() => onOpenChange(false)}
            className="p-2 lg:hidden text-[var(--vp-c-text-1)] hover:bg-[var(--vp-c-bg-soft)] rounded-[8px] transition-colors"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav id="VPSidebarNav" className="nav pt-0" aria-label="Sidebar Navigation" ref={navRef}>
          <span className="visually-hidden" id="sidebar-aria-label">wotaku
            Sidebar Navigation
          </span>

          <div className="group border-l-0 pl-0">
            <div className="items">
              {items.map((node) => renderNode(node, 0))}
            </div>
          </div>
          {/* Bottom Artwork Card (Premium) */}
          <div className="mt-8 mb-4">
            <button
              type="button"
              onClick={() => setIsSiteKeyOpen(true)}
              className="w-full text-left bg-[var(--vp-c-bg-soft)] hover:bg-[var(--vp-c-bg-alt)] border border-[var(--vp-c-divider)] transition-all duration-300 overflow-hidden hover:-translate-y-1 rounded-xl group/card"
            >
              <div className="h-24 w-full overflow-hidden">
                <img
                  src="/v2/Banners/1.png"
                  alt="Site Key Banner"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <BadgeInfo className="w-4 h-4 text-[var(--vp-c-brand-1)]" strokeWidth={2.5} />
                  <div className="text-[14px] font-bold text-[var(--vp-c-text-1)]">Site key</div>
                </div>
                <div className="text-[12px] text-[var(--vp-c-text-2)] mt-2 leading-relaxed">
                  Reference guide for all external sites & platforms linked.
                </div>
              </div>
            </button>
          </div>
        </nav>

      </aside>

      {/* Site Key Modal */}
      <SiteKeyModal isOpen={isSiteKeyOpen} onClose={() => setIsSiteKeyOpen(false)} />
    </>
  );
}

function SidebarLink({
  level,
  node,
  active,
  onNavigate,
}: {
  level: 1 | 2;
  node: SidebarNode;
  active: boolean;
  onNavigate: () => void;
}) {
  return (
    <div className={`VPSidebarItem is-page level-${level} is-link ${active ? "is-active has-active" : ""}`.trim()}>
      <div className="item page-item">
        <div className="indicator" />
        {node.external ? (
          <a className="VPLink link link" href={node.url || "#"} onClick={onNavigate} target="_blank" rel="noreferrer">
            <div className="text">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center">
                <DocIcon emoji={node.emoji} icon={node.icon} fallback={defaultDocIcons.page} className="w-[18px] h-[18px]" />
              </div>
              <span className="flex items-center gap-2">
                {node.title}
                <ExternalLink className="h-3.5 w-3.5 text-[var(--vp-c-text-3)]" />
              </span>
            </div>
          </a>
        ) : (
          <Link className="VPLink link link" href={node.url || "#"} onClick={onNavigate} scroll={false}>
            <div className="text">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center">
                <DocIcon emoji={node.emoji} icon={node.icon} fallback={defaultDocIcons.page} className="w-[18px] h-[18px]" />
              </div>
              {node.title}
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
