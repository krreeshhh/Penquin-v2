"use client";

import React, { useEffect, useState, type ReactNode } from "react";

import { Navbar } from "@/components/Navbar";
import { DocsSpotlightHoverBlock } from "@/components/docs/DocsSpotlightHoverBlock";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { DocsTOC } from "@/components/docs/DocsTOC";
import type { SidebarNode } from "@/lib/docs";

export function DocsShell({ children, sidebar }: { children: ReactNode; sidebar: SidebarNode[] }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarDesktopVisible, setSidebarDesktopVisible] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setIsDesktop(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
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

        <DocsTOC contentSelector="#doc-content" />
      </div>
    </div>
  );
}
