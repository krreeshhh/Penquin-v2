import type { ReactNode } from "react";

import { DocsShell } from "@/components/docs/DocsShell";
import { getSidebarTree } from "@/lib/docs";

export default function ContentLayout({ children }: { children: ReactNode }) {
  return <DocsShell sidebar={getSidebarTree()}>{children}</DocsShell>;
}
