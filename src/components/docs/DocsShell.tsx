"use client";

import React, { useEffect, useState, type ReactNode } from "react";

import { Navbar } from "@/components/Navbar";
import { DocsSpotlightHoverBlock } from "@/components/docs/DocsSpotlightHoverBlock";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { DocsTOC } from "@/components/docs/DocsTOC";
import type { SidebarNode } from "@/lib/docs";

export function DocsShell({ children, sidebar }: { children: ReactNode; sidebar: SidebarNode[] }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div id="VPContent" className="VPContent has-sidebar">
      <Navbar onDocsMenuClick={() => setSidebarOpen((current) => !current)} />

      <DocsSpotlightHoverBlock />

      <DocsSidebar items={sidebar} open={sidebarOpen} onOpenChange={setSidebarOpen} />

      <div className="VPDoc has-sidebar has-aside">
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
