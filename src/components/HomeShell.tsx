"use client";

import React, { useEffect, useState, type ReactNode } from "react";

import { Navbar } from "@/components/Navbar";
import { TakodachiFollower } from "@/components/TakodachiFollower";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import type { SidebarNode } from "@/lib/docs";

export function HomeShell({ children, sidebar }: { children: ReactNode; sidebar: SidebarNode[] }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isTakodachiOn, setIsTakodachiOn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Load takodachi preference from localStorage
    try {
      const stored = localStorage.getItem("preference-takodachi");
      setIsTakodachiOn(stored ? stored === "true" : false);
    } catch {
      setIsTakodachiOn(false);
    }
  }, []);

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
      {isMounted && <TakodachiFollower enabled={isTakodachiOn} />}
      <Navbar onDocsMenuClick={() => setSidebarOpen((current) => !current)} />
      <DocsSidebar items={sidebar} open={sidebarOpen} onOpenChange={setSidebarOpen} alwaysVisibleOnDesktop={false} />
      {children}
    </>
  );
}
