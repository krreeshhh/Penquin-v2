import type { ReactNode } from "react";

export function IconTooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="IconTooltip" data-tooltip={label}>
      {children}
      <span className="IconTooltipBubble" role="tooltip">
        {label}
      </span>
    </span>
  );
}
