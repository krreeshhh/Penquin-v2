"use client";

import React, { useEffect, useState, type ReactNode } from "react";

import { Navbar } from "@/components/Navbar";
import { DocsSpotlightHoverBlock } from "@/components/docs/DocsSpotlightHoverBlock";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { DocsTOC } from "@/components/docs/DocsTOC";
import type { SidebarNode } from "@/lib/docs";

export function DocsShell({ children, sidebar }: { children: ReactNode; sidebar: SidebarNode[] }) {
  // Initialize isDesktop based on window.innerWidth, defaulting to true if window is undefined (SSR)
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true
  );
  // sidebarDesktopVisible should be true by default for desktop
  const [sidebarDesktopVisible, setSidebarDesktopVisible] = useState(isDesktop);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar is initially closed

  useEffect(() => {
    const onResize = () => {
      const currentIsDesktop = window.innerWidth >= 1024;
      setIsDesktop(currentIsDesktop);
      // If resizing to desktop, ensure mobile sidebar is closed
      if (currentIsDesktop) {
        setSidebarOpen(false);
      }
      // Re-evaluate sidebarDesktopVisible on resize if needed, but keep it persistent if set by user
      // For now, let's keep it simple: if it becomes desktop, it should be visible by default unless user toggles it.
      // Or, maintain its last state. For this fix, we assume it should be visible if desktop.
      if (currentIsDesktop && !sidebarDesktopVisible) {
        setSidebarDesktopVisible(true);
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [sidebarDesktopVisible]); // Added sidebarDesktopVisible to dependency array

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

        <DocsTOC contentSelector="#doc-content" />
      </div>
    </div>
  );
}