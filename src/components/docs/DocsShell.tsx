"use client";

import React, { useEffect, useState, type ReactNode } from "react";

import { Navbar } from "@/components/Navbar";
import { DocsSpotlightHoverBlock } from "@/components/docs/DocsSpotlightHoverBlock";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { DocsTOC } from "@/components/docs/DocsTOC";
import type { SidebarNode } from "@/lib/docs";

export function DocsShell({ children, sidebar }: { children: ReactNode; sidebar: SidebarNode[] }) {
  // Initialize isDesktop to true to match SSR and prevent hydration mismatches
  const [isDesktop, setIsDesktop] = useState(true);
  // sidebarDesktopVisible should be true by default to match SSR
  const [sidebarDesktopVisible, setSidebarDesktopVisible] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar is initially closed
  const [hasTOCItems, setHasTOCItems] = useState(false); // Default to false to avoid space reserved for empty TOC

  useEffect(() => {
    // Sync state with actual viewport on mount
    const initialIsDesktop = window.innerWidth >= 1024;
    setIsDesktop(initialIsDesktop);
    if (!initialIsDesktop) {
      setSidebarDesktopVisible(false);
    }

    const onResize = () => {
      const currentIsDesktop = window.innerWidth >= 1024;
      setIsDesktop(currentIsDesktop);
      // If resizing to desktop, ensure mobile sidebar is closed
      if (currentIsDesktop) {
        setSidebarOpen(false);
      }
      // Re-evaluate sidebarDesktopVisible on resize if needed
      setSidebarDesktopVisible((prev) => {
        if (currentIsDesktop && !prev) return true;
        if (!currentIsDesktop && prev) return false;
        return prev;
      });
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div id="VPContent" className={`VPContent ${sidebarDesktopVisible ? "has-sidebar" : ""}`.trim()}>
      <Navbar
        onDocsMenuClick={() => {
          // Desktop: toggle persistent sidebar visibility.
          if (isDesktop) {
            setSidebarDesktopVisible((v) => !v);
            setSidebarOpen(false);
            return;
          }
          // Mobile/tablet: toggle slide-in drawer.
          setSidebarOpen((current) => !current);
        }}
      />

      <DocsSpotlightHoverBlock />

      <DocsSidebar
        items={sidebar}
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        alwaysVisibleOnDesktop={sidebarDesktopVisible}
        overlay={!isDesktop}
      />

      <div className={`VPDoc ${sidebarDesktopVisible ? "has-sidebar" : ""} has-aside`.trim()}>
        <div className="container">
          <div className="content">
            <div
              className="content-container"
              style={{
                maxWidth: "var(--content-max-width)",
              }}
            >
              <main className="main" id="doc-content">
                {children}
              </main>
            </div>
          </div>
        </div>

        <DocsTOC contentSelector="#doc-content" onHasItemsChange={setHasTOCItems} />
      </div>
    </div>
  );
}