"use client";

import React, { useEffect, useState, type ReactNode } from "react";

import { Navbar } from "@/components/Navbar";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import type { SidebarNode } from "@/lib/docs";

export function HomeShell({ children, sidebar }: { children: ReactNode; sidebar: SidebarNode[] }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const onResize = () => {
      // If the user opens it on desktop and then resizes,
      // keep it predictable by closing.
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <>
      <Navbar onDocsMenuClick={() => setSidebarOpen((current) => !current)} />
      <DocsSidebar items={sidebar} open={sidebarOpen} onOpenChange={setSidebarOpen} alwaysVisibleOnDesktop={false} fixed={true} overlay={true} />
      {children}
    </>
  );
}
