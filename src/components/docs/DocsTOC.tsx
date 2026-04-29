"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

type TocItem = {
  id: string;
  text: string;
  level: number;
};

function normalizeHeadingText(value: string) {
  return value
    .replace(/\s+#$/, "")
    .replace(/#$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function readHeadingText(element: HTMLElement) {
  const clone = element.cloneNode(true) as HTMLElement;
  // Drop permalink anchors and any embedded icons.
  clone.querySelectorAll("a.header-anchor, a[aria-label^='Permalink'], svg").forEach((node) => node.remove());
  return normalizeHeadingText((clone.textContent || "").trim());
}

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function DocsTOC({ contentSelector }: { contentSelector: string }) {
  const pathname = usePathname();
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [tocVersion, setTocVersion] = useState(0);

  useEffect(() => {
    const root = document.querySelector(contentSelector);
    if (!root) return;

    const variant = root.querySelector("[data-doc-variant]")?.getAttribute("data-doc-variant");
    const isGitBook = variant === "gitbook";

    const headings = Array.from(root.querySelectorAll<HTMLElement>(isGitBook ? "h2" : "h2, h3"));
    const next: TocItem[] = [];
    const seen = new Map<string, number>();
    const seenTextByLevel = new Set<string>();

    const totalH2 = root.querySelectorAll("h2").length;
    const totalH3 = root.querySelectorAll("h3").length;
    const allowH3 = !isGitBook && totalH3 > 0 && totalH3 <= 10 && totalH2 <= 16;

    for (const h of headings) {
      if (h.classList.contains("sr-only") || h.classList.contains("visually-hidden") || (h.offsetWidth === 0 && h.offsetHeight === 0)) {
        continue;
      }

      const level = h.tagName === "H2" ? 2 : 3;
      if (level === 3 && !allowH3) {
        continue;
      }

      const text = readHeadingText(h);
      if (!text) continue;

      const textKey = `${level}:${text.toLowerCase()}`;
      if (seenTextByLevel.has(textKey)) {
        continue;
      }
      seenTextByLevel.add(textKey);

      if (!h.id) {
        const base = slugify(text);
        const count = (seen.get(base) ?? 0) + 1;
        seen.set(base, count);
        h.id = count > 1 ? `${base}-${count}` : base;
      }

      next.push({ id: h.id, text, level });
    }

    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setItems(next);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0px -80% 0px", threshold: 0 }
    );

    const onScroll = () => {
      if (window.scrollY < 100 && next.length > 0) {
        setActiveId(next[0].id);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    for (const h of headings) observer.observe(h);

    return () => {
      cancelled = true;
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [contentSelector, pathname]);

  const hasItems = items.length > 0;
  const grouped = useMemo(() => {
    const roots: Array<TocItem & { children: TocItem[] }> = [];
    let current: (TocItem & { children: TocItem[] }) | null = null;

    for (const item of items) {
      if (item.level === 2) {
        current = { ...item, children: [] };
        roots.push(current);
        continue;
      }

      if (current) {
        current.children.push(item);
      } else {
        roots.push({ ...item, children: [] });
      }
    }

    return roots;
  }, [items]);

  useEffect(() => {
    const nav = document.querySelector<HTMLElement>(".VPDocAsideOutline .content");
    const activeLink = activeId
      ? document.querySelector<HTMLElement>(`.VPDocAsideOutline a[href="#${CSS.escape(activeId)}"]`)
      : document.querySelector<HTMLElement>(".VPDocAsideOutline a");

    if (!nav || !activeLink) return;

    const navRect = nav.getBoundingClientRect();
    const activeRect = activeLink.getBoundingClientRect();
    const top = activeRect.top - navRect.top;

    nav.style.setProperty("--toc-marker-top", `${Math.round(top)}px`);
    nav.style.setProperty("--toc-marker-height", `${Math.round(activeRect.height)}px`);
  }, [activeId, grouped, tocVersion]);

  useEffect(() => {
    const onResize = () => setTocVersion((value) => value + 1);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (!hasItems) return null;

  return (
    <aside className="VPDocAside fixed right-8 top-[88px] bottom-0 w-[224px] hidden xl:block">
      <nav className="VPDocAsideOutline sticky top-[88px] max-h-[calc(100vh-88px)] overflow-y-auto py-0">
        <div className="content">
          <div className="outline-marker" aria-hidden />
          <div className="outline-title flex items-center gap-2 mb-3">
            <div className="flex h-5 w-5 items-center justify-center text-[var(--vp-c-text-2)] opacity-80">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-list"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
            </div>
            <span className="text-[13px] font-bold text-[var(--vp-c-text-1)]">On this page</span>
          </div>
          <ul className="VPDocOutlineItem root">
            {grouped.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={`outline-link ${activeId === item.id ? "active" : ""}`}
                >
                  {item.text}
                </a>
                {item.children.length ? (
                  <ul className="VPDocOutlineItem nested">
                    {item.children.map((child) => (
                      <li key={child.id}>
                        <a
                          href={`#${child.id}`}
                          className={`outline-link ${activeId === child.id ? "active" : ""}`}
                        >
                          {child.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </aside>
  );
}
