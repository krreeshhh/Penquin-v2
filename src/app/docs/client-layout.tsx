"use client";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { DocsShell } from "@/components/docs/DocsShell";
import { SidebarNode } from "@/lib/docs"; // Need SidebarNode type

export default function ClientLayout({ children, sidebar }: { children: ReactNode, sidebar: SidebarNode[] }) {
  const pathname = usePathname();

  return <DocsShell key={pathname} sidebar={sidebar}>{children}</DocsShell>;
}